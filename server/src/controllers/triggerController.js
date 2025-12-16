import Workflow from "../models/Workflow.model.js";
import Webhook from "../models/Webhook.model.js";
import { executeWorkflow } from "../services/workflowEngine.js";
import crypto from "crypto";
import { log } from "console";

/**
 * Public webhook trigger
 * ALL METHODS /public/:workflowId/:secret
 */
export const publicWebhookTrigger = async (req, res) => {
  try {
    const { workflowId, secret } = req.params;
    const payload = req.body;

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    const webhook = await Webhook.findOne({
      workflowId,
      secret,
      status: "active",
    });

    if (!webhook) {
      return res.status(403).json({ error: "Invalid webhook secret" });
    }

    // 🚨 Enforce HTTP method
    if (req.method !== webhook.requestMethod) {
      return res.status(405).json({
        error: "Invalid request method",
        allowedMethod: webhook.requestMethod,
      });
    }

    if (workflow.status !== "active") {
      return res.status(400).json({ error: "Workflow is not active" });
    }

    const context = {
      ...payload,
      _workflowId: workflow._id,
      _triggeredAt: new Date().toISOString(),
      _source: "public_webhook",
      _httpMethod: req.method,
    };

    await executeWorkflow(workflow, context, {
      executedBy: workflow.organizationId,
      organizationId: workflow.organizationId,
    });

    return res.json({
      message: "Workflow triggered",
      workflowId: workflow._id,
    });
  } catch (err) {
    console.error("Public webhook trigger error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Protected manual trigger
 * POST /:workflowId/webhook
 */
export const triggerWebhook = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const payload = req.body;
    const user = req.user;
    console.log(payload);
    const workflow = await Workflow.findOne({
      _id: workflowId,
      $or: [{ organizationId: user.organizationId }, { userId: user._id }],
    });

    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    if (workflow.status !== "active") {
      return res.status(400).json({ error: "Workflow is not active" });
    }

    const webhook = await Webhook.findOne({ workflowId, status: "active" });
    if (!webhook) {
      return res
        .status(400)
        .json({ error: "Webhook not configured for this workflow" });
    }

    const context = {
      ...payload,
      _workflowId: workflow._id,
      _triggeredBy: user._id,
      _organizationId: user.organizationId,
      _triggeredAt: new Date().toISOString(),
      _source: "manual_trigger",
    };

    await executeWorkflow(workflow, context, {
      executedBy: user._id,
      organizationId: user.organizationId,
    });

    return res.json({
      message: "Workflow triggered",
      workflowId: workflow._id,
    });
  } catch (err) {
    console.error("Trigger error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update or create webhook
 * PUT /:workflowId/update-trigger
 */
export const updateWorkflowWebhook = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { url, event, requestMethod, secret: clientSecret } = req.body;
    const user = req.user;

    const workflow = await Workflow.findOne({
      _id: workflowId,
      $or: [{ organizationId: user.organizationId }, { userId: user._id }],
    });

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    const secret = clientSecret || crypto.randomUUID();

    let webhook = await Webhook.findOne({ workflowId });

    if (webhook) {
      webhook.secret = secret;
      webhook.url = url || webhook.url;
      webhook.event = event || webhook.event;
      webhook.requestMethod = requestMethod || webhook.requestMethod;
      webhook.status = "active";
      await webhook.save();
    } else {
      webhook = await Webhook.create({
        workflowId,
        userId: user._id,
        organizationId: user.organizationId,
        secret,
        url,
        event,
        requestMethod,
        status: "active",
      });
    }

    return res.json({
      message: "Webhook updated",
      webhook,
    });
  } catch (err) {
    console.error("Update webhook error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/triggers/:workflowId/trigger-secret
export const getTriggerSecret = async (req, res) => {
  try {
    const { workflowId } = req.params;

    const webhook = await Webhook.findOne({ workflowId, status: "active" });
    if (webhook) {
      return res.json({
        secret: webhook.secret,
        requestMethod: webhook.requestMethod,
      });
    }

    return res.json({
      secret: null,
      message: "No webhook configured for this workflow",
    });
  } catch (err) {
    console.error("Error fetching webhook secret:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
