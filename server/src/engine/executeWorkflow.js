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

  const user = await UserModel.findById(workflow.userId);
  if (!user) throw new Error("User not found");

  const context = buildInitialContext({
    webhookPayload,
    workflow,
  });

  const triggerNode =
    workflow.nodes.find((n) =>
      ["webhook", "schedule"].includes(n.data?.actionType)
    ) || workflow.nodes[0];

  try {
    await checkAndConsumeCredit(user._id);
    await executeNode(triggerNode.id, workflow, context, log);

    // Decide overall status based on how individual steps actually went —
    // this is what lets us distinguish "success" from "partial" (some steps
    // failed but others completed) instead of only success/failed.
    const steps = log.executionSteps;
    const hasFailed = steps.some((s) => s.status === "failed");
    const hasSucceeded = steps.some((s) => s.status === "success");

    if (hasFailed && hasSucceeded) {
      log.status = "partial";
      console.log("⚠️ Workflow execution finished partially (some steps failed)");
    } else if (hasFailed && !hasSucceeded) {
      log.status = "failed";
      console.log("❌ Workflow execution failed (no step succeeded)");
    } else {
      log.status = "success";
      console.log("✅ Workflow execution finished successfully");
    }
  } catch (err) {
    // Only truly unexpected/system-level errors land here now
    // (per-node handler errors are caught inside executeNode itself)
    console.error("❌ Workflow execution failed:", err.message);
    console.error(err.stack);
    log.status = "failed";
    log.errorMessage = err.message;
  } finally {
    log.finishedAt = new Date();
    await log.save();
  }
}
