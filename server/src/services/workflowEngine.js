import WorkflowLog from "../models/WorkflowLog.model.js";
import { sendDummyEmail } from "./dummyEmailService.js";

const actionHandlers = {
  webhook: async (action, context) => {
    const res = await fetch(action.service, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });
    return await res.json();
  },

  delay: async (action, context) => {
    const ms = action?.config?.ms || 1000;
    console.log(`⏳ Delay for ${ms}ms`);
    await new Promise((r) => setTimeout(r, ms));
    return context;
  },

  email: async (action, context) => {
    // ✅ Use the dummy email service
    const emailData = {
      to: action.config?.to || "test@example.com",
      subject: action.config?.subject || "No Subject",
      body: action.config?.body || "Hello from Dummy Email!",
    };

    const result = await sendDummyEmail(emailData);

    return { ...context, emailResult: result };
  },

  condition: async (action, context) => {
    const result = action.filters.every((f) => applyFilter(f, context));
    console.log(`🔀 Condition evaluated: ${result}`);
    return result ? context : null;
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
  console.log("executing workflow", workflow.name);

  const log = new WorkflowLog({
    executionId: workflow._id,
    workflowId: workflow._id,
    organizationId,
    executedBy,
    executionSteps: [],
  });

  let context = inputData;
  // console.log(workflow);

  let triggerNode = workflow.nodes.find((n) => n.type === "trigger");
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

  const action = workflow.actions.find((a) => a.service === node.data.label);

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
  for (let edge of nextEdges) {
    await executeNode(edge.target, workflow, context, log);
  }
}
