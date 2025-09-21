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
