import WorkflowLog from "../models/WorkflowLog.model.js";
import { sendEmail } from "./mailer.js";
import { resolveAction } from "../resolvers/actionResolver.js";
import { appendRowForUser, readSheetForUser } from "./googleSheetsService.js";
import { uploadFileForUser, listFilesForUser } from "./googleDriveService.js";
import GoogleSheets from "../models/GoogleSheets.model.js";
import WorkflowModel from "../models/Workflow.model.js";

const actionHandlers = {
  webhook: async (action, context) => {
    console.log("Running webhook action");
    const url = action.config?.url;
    if (!url) {
      console.warn("⚠️ No webhook URL configured, skipping");
      return context;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });
    try {
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  delay: async (action, context) => {
    const ms = action?.config?.ms || 1000;
    console.log(`⏳ Delay for ${ms}ms`);
    await new Promise((r) => setTimeout(r, ms));
    return context;
  },

  email: async (action, context) => {
    const emailData = {
      to: action.config?.to || "muhammadaliapple3@gmail.com",
      subject: action.config?.subject || "Error occurred with Email Data",
      body: action.config?.body || "Hello from Gmail SMTP!",
    };
    const result = await sendEmail(emailData);
    return { ...context, emailResult: result };
  },

  condition: async (action, context) => {
    const result = action.filters.every((f) => applyFilter(f, context));
    console.log(`🔀 Condition evaluated: ${result}`);
    return result ? context : null;
  },

  google_sheets: async (action, context) => {
    console.log("📊 Running Google Sheets action");
    try {
      const workflowId = action.workflowId || context._workflowId;
      const { nodeId } = action;
      const workflow = await WorkflowModel.findById(workflowId);
      const userId = workflow.userId;
      if (!userId) {
        console.error("❌ No user associated with this workflow");
        return { error: "No user associated with this workflow" };
      }
      console.log("🔍 Looking for Google Sheets config with:", {
        workflowId,
        nodeId,
      });
      if (!workflowId || !nodeId) {
        throw new Error("Missing workflowId or nodeId");
      }
      const sheetData = await GoogleSheets.findOne({ workflowId, nodeId });
      if (!sheetData) {
        console.error("❌ No Google Sheet config found for this node");
        return { error: "Google Sheets config not found" };
      }
      const { spreadsheetId, range, values } = sheetData;
      // console.log("✅ Loaded Google Sheets config:", {
      //   spreadsheetId,
      //   range,
      //   values,
      // });
      const result = await appendRowForUser(
        userId,
        spreadsheetId,
        range,
        values
      );
      console.log("✅ Google Sheets append result:", result);
      return result;
    } catch (error) {
      console.error("❌ Error running Google Sheets action:", error);
      return { error: error.message || "Google Sheets action failed" };
    }
  },

  google_drive: async (action, context) => {
    console.log("📁 Running Google Drive action");
    if (action.config?.operation === "upload") {
      const { userId, fileName, mimeType, data } = action.config;
      return await uploadFileForUser(userId, fileName, mimeType, data);
    } else if (action.config?.operation === "list") {
      const { userId, query } = action.config;
      return await listFilesForUser(userId, query);
    }
    return context;
  },
};

function applyFilter(filter, context) {
  const value = context[filter.field];
  switch (filter.condition) {
    case "equals":
      return value === filter.value;
    case "not_equals":
      return value !== filter.value;
    case "greater_than":
      return value > filter.value;
    case "less_than":
      return value < filter.value;
    case "contains":
      return String(value).includes(filter.value);
    case "not_contains":
      return !String(value).includes(filter.value);
    case "starts_with":
      return String(value).startsWith(filter.value);
    case "ends_with":
      return String(value).endsWith(filter.value);
    default:
      return false;
  }
}

export async function executeWorkflow(
  workflow,
  inputData,
  { executedBy, organizationId }
) {
  console.log("🚀 Executing workflow:", workflow.name);

  const log = new WorkflowLog({
    executionId: workflow._id,
    workflowId: workflow._id,
    organizationId,
    executedBy,
    executionSteps: [],
  });

  let context = inputData;

  let triggerNode = workflow.nodes.find(
    (n) => n.type === "trigger" || n.data.label === "webhook"
  );
  // console.log(workflow.nodes);
  if (!triggerNode) {
    console.warn("⚠️ No trigger node found, using first node instead");
    triggerNode = workflow.nodes[0];
  }
  if (!triggerNode) throw new Error("Workflow has no nodes");

  try {
    await executeNode(triggerNode.id, workflow, context, log);
    log.status = "success";
  } catch (err) {
    console.error("❌ Workflow execution failed:", err);
    log.status = "failed";
    log.errorMessage = err.message;
  } finally {
    log.finishedAt = new Date();
    await log.save();
  }
}

async function executeNode(nodeId, workflow, context, log) {
  const node = workflow.nodes.find((n) => n.id === nodeId);
  if (!node) return;
  let action = workflow.actions.find((a) => a.nodeId === node.id);
  action = await resolveAction(action, node, workflow._id);
  if (action?.toObject) {
    action = action.toObject();
  } else if (action?._doc) {
    action = { ...action._doc, config: action.config };
  }
  // console.log("Raw action:", action);
  // console.log("Action type direct:", action.type);
  // console.log("Action type from _doc:", action._doc?.type);
  // console.log(action);
  const step = {
    nodeId: node.id,
    stepName: node.data.label,
    action: action?.type || "unknown",
    status: "running",
    startedAt: new Date(),
  };

  try {
    if (action) {
      const handler = actionHandlers[action.type];
      if (handler) {
        const output = await handler(action, context);
        step.status = "success";
        step.completedAt = new Date();
        step.output = output;
        context = output;
      } else {
        step.status = "skipped";
      }
    } else {
      step.status = "skipped";
    }
  } catch (err) {
    step.status = "failed";
    step.completedAt = new Date();
    step.errorMessage = err.message;
    log.executionSteps.push(step);
    throw err;
  }
  log.executionSteps.push(step);
  // Traverse to next nodes
  const nextEdges = workflow.edges.filter((e) => e.source === node.id);
  // console.log("Edges from this node:", nextEdges);
  for (let edge of nextEdges) {
    await executeNode(edge.target, workflow, context, log);
  }
}
