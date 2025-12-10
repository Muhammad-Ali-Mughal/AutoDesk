import Workflow from "../models/Workflow.model.js";
import EmailAction from "../models/Email.model.js";

export const addEmailAction = async (req, res) => {
  try {
    // console.log(req.body);
    const { workflowId, nodeId, type, service, to, subject, body } = req.body;
    if (!workflowId) {
      return res.status(400).json({ error: "Workflow ID is required" });
    }
    if (!to || !body) {
      return res
        .status(400)
        .json({ error: "Recipient (to) and body are required" });
    }
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }
    const emailAction = new EmailAction({
      workflowId,
      nodeId,
      type,
      service,
      to,
      subject,
      body,
    });
    await emailAction.save();
    res.status(201).json({
      message: "Email action created successfully",
      emailAction,
    });
  } catch (err) {
    console.error("❌ Error adding email action:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/email/:workflowId/node/:nodeId
 * Return saved email config (or null)
 */
export const getEmailConfig = async (req, res) => {
  try {
    const { workflowId, nodeId } = req.params;

    if (!workflowId || !nodeId)
      return res.status(400).json({ error: "workflowId and nodeId required" });

    const emailAction = await EmailAction.findOne({ workflowId, nodeId });

    return res.json({ emailAction: emailAction || null });
  } catch (err) {
    console.error("❌ Error fetching email config:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * PUT /api/email/:workflowId/node/:nodeId
 */
export const updateEmailAction = async (req, res) => {
  try {
    const { workflowId, nodeId } = req.params;
    const { to, subject, body } = req.body || {};

    const emailAction = await EmailAction.findOneAndUpdate(
      { workflowId, nodeId },
      { to, subject, body },
      { new: true }
    );

    if (!emailAction) return res.status(404).json({ error: "Not found" });

    return res.json({ message: "Updated", emailAction });
  } catch (err) {
    console.error("❌ Error updating email config:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * DELETE /api/email/:workflowId/node/:nodeId
 */
export const deleteEmailAction = async (req, res) => {
  try {
    const { workflowId, nodeId } = req.params;
    const removed = await EmailAction.findOneAndDelete({ workflowId, nodeId });
    if (!removed) return res.status(404).json({ error: "Not found" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("❌ Error deleting email config:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
