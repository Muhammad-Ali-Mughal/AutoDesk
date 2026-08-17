import WorkflowLog from "../models/WorkflowLog.model.js";
import { buildInitialContext } from "./contextBuilder.js";
import { executeNode } from "./executeNode.js";
import { checkAndConsumeCredit } from "../utils/creditManager.js";
import UserModel from "../models/User.model.js";

export async function executeWorkflow(
  workflow,
  webhookPayload,
  { executedBy, organizationId }
) {
  console.log("starting execution...");

  const log = new WorkflowLog({
    workflowId: workflow._id,
    executionId: workflow._id,
    organizationId,
    executedBy,
    executionSteps: [],
    status: "running",
  });

  // ✅ Create execution document immediately
  await log.save();

  console.log("📝 Execution log created:", log._id);

  const user = await UserModel.findById(workflow.userId);
  if (!user) throw new Error("User not found");

  const context = buildInitialContext({
    webhookPayload,
    workflow,
  });

  const triggerNode = workflow.nodes.find((n) => {
    const actionType = n.data?.actionType || n.data?.label;
    return ["webhook", "schedule"].includes(actionType);
  });

  if (!triggerNode) {
    throw new Error("No webhook or schedule trigger node found");
  };

  try {
    await checkAndConsumeCredit(user._id);

    await executeNode(
      triggerNode.id,
      workflow,
      context,
      log
    );

    const steps = log.executionSteps;

    const hasFailed = steps.some(
      (s) => s.status === "failed"
    );

    const hasSucceeded = steps.some(
      (s) => s.status === "success"
    );

    if (hasFailed && hasSucceeded) {
      log.status = "partial";
    } else if (hasFailed && !hasSucceeded) {
      log.status = "failed";
    } else {
      log.status = "success";
    }
  } catch (err) {
    console.error(
      "❌ Workflow execution failed:",
      err.message
    );

    log.status = "failed";
    log.errorMessage = err.message;
  } finally {
    log.finishedAt = new Date();

    // ✅ Save final execution result
    await log.save();

    console.log("💾 Execution log updated:", log._id);
  }
}