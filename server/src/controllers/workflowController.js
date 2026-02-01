import mongoose from "mongoose";
import Workflow from "../models/Workflow.model.js";
import Webhook from "../models/Webhook.model.js";
import Schedule from "../models/Schedule.model.js";
import GoogleSheetsModel from "../models/GoogleSheets.model.js";
import EmailModel from "../models/Email.model.js";
import WorkflowLogModel from "../models/WorkflowLog.model.js";
import ExecutionModel from "../models/Execution.model.js";
import { validateConditionConfig } from "../engine/resolvers/conditionEvaluator.js";

/**
 * Validate workflow nodes and actions
 * Checks condition node configs for correctness
 */
function validateWorkflowConfig(nodes, actions) {
  if (!nodes || !Array.isArray(nodes)) {
    return { valid: true }; // Empty workflow is okay
  }

  // Find all condition nodes
  const conditionNodes = nodes.filter(
    (n) => n.data?.actionType === "condition" || n.type === "condition",
  );

  for (const node of conditionNodes) {
    // Find corresponding action
    const action = actions?.find((a) => a.nodeId === node.id);

    if (!action) {
      return {
        valid: false,
        error: `Condition node "${node.data?.label}" has no configuration`,
      };
    }

    // Validate condition config
    const validation = validateConditionConfig(action.config);
    if (!validation.valid) {
      return {
        valid: false,
        error: `Condition node "${node.data?.label}": ${validation.error}`,
      };
    }
  }

  return { valid: true };
}

// ✅ Create workflow
export const createWorkflow = async (req, res) => {
  try {
    const { name, description, triggers } = req.body;

    if (!req.user || !req.user.organizationId) {
      return res
        .status(400)
        .json({ success: false, message: "User or organization missing" });
    }

    const workflow = await Workflow.create({
      organizationId: req.user.organizationId,
      userId: req.user._id,
      name,
      description,
      triggers,
      status: "draft",
    });

    res.status(201).json({ success: true, workflow });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ Get all workflows for a user/org
export const getWorkflows = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const workflows = await Workflow.find({
      organizationId: req.user.organizationId,
      userId: req.user._id,
    });

    res.status(200).json({ success: true, workflows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get single workflow
export const getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);

    if (!workflow) {
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });
    }

    res.status(200).json({ success: true, workflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update workflow
export const updateWorkflow = async (req, res) => {
  try {
    const { triggers, actions, status, name, description, nodes, edges } =
      req.body;

    // Validate workflow config (especially condition nodes)
    const validation = validateWorkflowConfig(nodes, actions);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      {
        triggers,
        actions,
        nodes,
        edges,
        status,
        name,
        description,
      },
      { new: true, runValidators: true },
    );

    if (!workflow) {
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });
    }

    res.status(200).json({ success: true, workflow });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ Delete workflow
export const deleteWorkflow = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workflowId = req.params.id;

    const workflow = await Workflow.findById(workflowId).session(session);

    if (!workflow) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });
    }

    // 🔥 CASCADE DELETE ALL MODULE DATA
    await Promise.all([
      Webhook.deleteMany({ workflowId }).session(session),
      EmailModel.deleteMany({ workflowId }).session(session),
      Schedule.deleteMany({ workflowId }).session(session),
      GoogleSheetsModel.deleteMany({ workflowId }).session(session),
      WorkflowLogModel.deleteMany({ workflowId }).session(session),
      ExecutionModel.deleteMany({ workflowId }).session(session),
    ]);

    // 🔥 DELETE WORKFLOW LAST
    await Workflow.deleteOne({ _id: workflowId }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Workflow and all related data deleted",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
