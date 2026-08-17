import WorkflowLog from "../models/WorkflowLog.model.js";
import { sendEmail } from "./mailer.js";
import { resolveAction } from "../resolvers/actionResolver.js";
import { appendRowForUser, readSheetForUser } from "./googleSheetsService.js";
import { uploadFileForUser, listFilesForUser } from "./googleDriveService.js";
import GoogleSheets from "../models/GoogleSheets.model.js";
import WorkflowModel from "../models/Workflow.model.js";
import { checkAndConsumeCredit } from "../utils/creditManager.js";
import UserModel from "../models/User.model.js";

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

    condition: async (action, context, log) => {
        return await conditionHandler(action, context, log);
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
    console.log("🔥🔥🔥 EXECUTE WORKFLOW CALLED 🔥🔥🔥");
    console.log("Workflow ID:", workflow?._id);
    console.log("Organization ID:", organizationId);
    console.log("Executed By:", executedBy);

    const log = new WorkflowLog({
        executionId: workflow._id,
        workflowId: workflow._id,
        organizationId,
        executedBy,
        executionSteps: [],
        status: "running",
        startedAt: new Date(),
    });
    console.log("🔥 Before log.save()");
    // IMPORTANT: execution ko start mein hi DB mein save karo
    await log.save();

    console.log("📝 Execution log created:", log._id);
    console.log("🔥 AFTER log.save()");
    console.log("🔥 LOG ID:", log._id);
    let context = inputData;

    try {
        const user = await UserModel.findById(workflow.userId);

        if (!user) {
            throw new Error("User not found for this workflow");
        }

        await checkAndConsumeCredit(user._id);

        console.log(
            `💳 Credit deducted for ${user.email}. Remaining: ${user.credits}`
        );

        let triggerNode = workflow.nodes.find(
            (n) =>
                n.type === "trigger" ||
                n.data?.label === "webhook" ||
                n.data?.actionType === "webhook"
        );

        if (!triggerNode) {
            console.warn("⚠️ No trigger node found, using first node instead");
            triggerNode = workflow.nodes[0];
        }

        if (!triggerNode) {
            throw new Error("Workflow has no nodes");
        }

        console.log("▶ Starting from node:", triggerNode.data?.label);

        await executeNode(triggerNode.id, workflow, context, log);

        const steps = log.executionSteps;

        const hasFailed = steps.some((s) => s.status === "failed");
        const hasSucceeded = steps.some((s) => s.status === "success");

        if (hasFailed && hasSucceeded) {
            log.status = "partial";
        } else if (hasFailed && !hasSucceeded) {
            log.status = "failed";
        } else {
            log.status = "success";
        }
    } catch (err) {
        console.error("❌ Workflow execution failed:", err.message);

        log.status = "failed";
        log.errorMessage = err.message;
    } finally {
        log.finishedAt = new Date();

        // Final DB update
        await log.save();

        console.log("💾 Execution log saved:", log._id);
    }
}
async function executeNode(nodeId, workflow, context, log, visited = new Set()) {
    if (visited.has(nodeId)) {
        console.warn(`⚠️ Cycle detected at node ${nodeId}`);
        return;
    }

    visited.add(nodeId);

    const node = workflow.nodes.find((n) => n.id === nodeId);

    if (!node) {
        console.warn(`⚠️ Node ${nodeId} not found`);
        return;
    }

    console.log("▶ Executing node:", node.data?.label);

    let action = workflow.actions.find(
        (a) => a.nodeId === node.id
    );

    action = await resolveAction(action, node, workflow._id);

    if (action?.toObject) {
        action = action.toObject();
    } else if (action?._doc) {
        action = {
            ...action._doc,
            config: action.config,
        };
    }

    console.log("RAW ACTION:", action);

    const actionType =
        action?.type ||
        node.data?.actionType ||
        node.data?.label?.toLowerCase();

    console.log("ACTION TYPE:", actionType);

    const step = {
        nodeId: node.id,
        stepName: node.data?.label,
        action: actionType || "unknown",
        status: "running",
        startedAt: new Date(),
    };

    try {
        if (!action) {
            step.status = "skipped";
            step.completedAt = new Date();

            log.executionSteps.push(step);
            await log.save();

            return;
        }

        const handler = actionHandlers[actionType];

        if (!handler) {
            step.status = "failed";
            step.errorMessage =
                `No handler registered for action type: ${actionType}`;
            step.completedAt = new Date();

            log.executionSteps.push(step);
            await log.save();

            return;
        }

        console.log(`➡ Forwarding to ${actionType} handler`);

        const output = await handler(action, context);

        console.log("✅ Handler output:", output);

        step.status = "success";
        step.output = output;
        step.completedAt = new Date();

        log.executionSteps.push(step);

        // Save after every step
        await log.save();

        context = output;

        // Find next nodes
        const nextEdges = workflow.edges.filter(
            (e) => e.source === node.id
        );

        console.log(
            `📍 Node ${node.id}: Found ${nextEdges.length} outgoing edges`
        );

        for (const edge of nextEdges) {
            console.log(`↪️ Following edge to ${edge.target}`);

            await executeNode(
                edge.target,
                workflow,
                context,
                log,
                visited
            );
        }
    } catch (err) {
        console.error(
            `❌ Node ${nodeId} failed:`,
            err.message
        );

        step.status = "failed";
        step.errorMessage = err.message;
        step.completedAt = new Date();

        log.executionSteps.push(step);

        // Save failed step immediately
        await log.save();

        throw err;
    }
}