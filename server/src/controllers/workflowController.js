import Workflow from "../models/Workflow.model.js";

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

// ✅ Update workflow (Step 2 + 3)
export const updateWorkflow = async (req, res) => {
  try {
    const { triggers, actions, status, name, description } = req.body;

    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { triggers, actions, status, name, description },
      { new: true, runValidators: true }
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
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);

    if (!workflow) {
      return res
        .status(404)
        .json({ success: false, message: "Workflow not found" });
    }

    res.status(200).json({ success: true, message: "Workflow deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
