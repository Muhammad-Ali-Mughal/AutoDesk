import mongoose from "mongoose";
import Workflow from "../models/Workflow.model.js";
import WorkflowLog from "../models/WorkflowLog.model.js";
import User from "../models/User.model.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const orgId = new mongoose.Types.ObjectId(req.user.organizationId);

    // Fetch user info for credits
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Extract credit info
    const credits =
      user.credits && typeof user.credits === "object"
        ? user.credits
        : {
            totalCredits: 100,
            usedCredits: 0,
            remainingCredits: 100,
          };

    // Fetch workflows owned by the user/org
    const workflows = await Workflow.find({
      $or: [{ userId }, { organizationId: orgId }],
    })
      .select("_id name")
      .lean();

    // Fetch workflow logs for this org
    const logs = await WorkflowLog.find({ organizationId: orgId })
      .sort({ startedAt: -1 })
      .limit(50)
      .lean();

    const totalWorkflows = workflows.length;
    const totalRuns = logs.length;
    const successCount = logs.filter((l) => l.status === "success").length;
    const successRate = totalRuns ? (successCount / totalRuns) * 100 : 0;

    // Build "recentExecutions" array
    const recentExecutions = logs.slice(0, 10).map((log) => ({
      workflowName:
        workflows.find((w) => w._id.toString() === log.workflowId.toString())
          ?.name || "Unnamed Workflow",
      executedAt: log.startedAt || log.createdAt,
      status: log.status,
    }));

    // Build "topWorkflows" array (based on execution count)
    const workflowRunCounts = {};
    logs.forEach((l) => {
      const id = l.workflowId?.toString();
      if (!id) return;
      workflowRunCounts[id] = (workflowRunCounts[id] || 0) + 1;
    });

    const topWorkflows = Object.entries(workflowRunCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, executions]) => {
        const wf = workflows.find((w) => w._id.toString() === id);
        return {
          _id: id,
          name: wf?.name || "Unnamed Workflow",
          executions,
        };
      });

    // Final JSON response
    res.json({
      credits: credits.remainingCredits || 0,
      creditLimit: credits.totalCredits || 100,
      totalWorkflows,
      totalRuns,
      successRate,
      recentExecutions,
      topWorkflows,
    });
  } catch (err) {
    console.error("⚠️ Dashboard fetch error:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};
