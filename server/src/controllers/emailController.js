import Workflow from "../models/Workflow.model.js";

export const addEmailAction = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { to, subject, body } = req.body;

    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    const emailAction = {
      type: "email",
      service: "email",
      config: { to, subject, body },
    };

    workflow.actions.push(emailAction);
    await workflow.save();

    res.status(200).json({
      message: "Email action added successfully",
      workflow,
    });
  } catch (err) {
    console.error("Error adding email action:", err);
    res.status(500).json({ error: "Server error" });
  }
};
