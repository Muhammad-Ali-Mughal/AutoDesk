import Workflow from "../models/workflow.js";
import { executeWorkflow } from "../services/workflowEngine.js";


/**
 * POST /public/webhooks/:workflowId/:secret
 */
export const publicWebhookTrigger = async (req, res) => {
  try {
    const { workflowId, secret } = req.params;
    const payload = req.body;

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    if (!workflow.triggers || workflow.triggers.type !== "webhook") {
      return res.status(400).json({ error: "Workflow is not a webhook trigger" });
    }

    if (workflow.triggers.webhookSecret !== secret) {
      return res.status(403).json({ error: "Invalid webhook secret" });
    }

    if (workflow.status !== "active") {
      return res.status(400).json({ error: "Workflow is not active" });
    }

    const context = {
      ...payload,
      _workflowId: workflow._id,
      _triggeredAt: new Date().toISOString(),
      _source: "public_webhook",
    };

    // Execute asynchronously
    executeWorkflow(workflow, context)
      .then(() => console.log(`Public webhook triggered workflow ${workflow._id}`))
      .catch(err => console.error("Workflow execution error:", err));

    return res.json({ message: "Workflow triggered", workflowId: workflow._id });
  } catch (err) {
    console.error("Public webhook trigger error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/triggers/:workflowId/webhook
 */
export const triggerWebhook = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const payload = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const workflow = await Workflow.findOne({
      _id: workflowId,
      $or: [{ organizationId: user.organizationId }, { userId: user._id }],
    });

    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found or access denied" });
    }

    if (workflow.status !== "active") {
      return res.status(400).json({ error: "Workflow is not active" });
    }

    if (!workflow.triggers || workflow.triggers.type !== "webhook") {
      return res
        .status(400)
        .json({ error: "This workflow is not configured with a webhook trigger" });
    }

    const context = {
      ...payload,
      _triggeredBy: user._id,
      _organizationId: user.organizationId,
      _workflowId: workflow._id,
      _triggeredAt: new Date().toISOString(),
    };

    executeWorkflow(workflow, context)
      .then(() => {
        console.log(`Workflow ${workflow._id} executed (triggered by ${user._id})`);
      })
      .catch(err => {
        console.error(`Execution error for workflow ${workflow._id}:`, err);
      });

    return res.json({ message: "Workflow triggered", workflowId: workflow._id });
  } catch (err) {
    console.error("Trigger error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


