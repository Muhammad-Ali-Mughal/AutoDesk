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

  await checkAndConsumeCredit(user._id);

  const context = buildInitialContext({
    webhookPayload,
    workflow,
  });

  const triggerNode =
    workflow.nodes.find((n) => n.data?.actionType === "webhook") ||
    workflow.nodes[0];

  try {
    await executeNode(triggerNode.id, workflow, context, log);
    log.status = "success";
  } catch (err) {
    log.status = "failed";
    log.errorMessage = err.message;
  } finally {
    log.finishedAt = new Date();
    await log.save();
  }
}
