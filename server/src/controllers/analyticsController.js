import mongoose from "mongoose";
import WorkflowLog from "../models/WorkflowLog.model.js";

export const getAnalytics = async (req, res) => {
  try {
    const orgId = new mongoose.Types.ObjectId(req.user.organizationId);

    // --- Extract query params ---
    const { status, start, end } = req.query;

    // --- Build filter object ---
    const filter = { organizationId: orgId };
    if (status) filter.status = status; // only include if status is provided
    if (start || end) {
      filter.startedAt = {};
      if (start) filter.startedAt.$gte = new Date(start);
      if (end) filter.startedAt.$lte = new Date(end);
    }

    // ✅ Fetch logs with filters
    const logs = await WorkflowLog.find(filter).lean();

    if (!logs.length) {
      return res.json({
        totalExecutions: 0,
        successRate: 0,
        avgDuration: 0,
        failedExecutions: 0,
        executionsOverTime: [],
        workflowStats: [],
        actionStats: [],
      });
    }

    // --- BASIC METRICS ---
    const total = logs.length;
    const success = logs.filter((l) => l.status === "success").length;
    const avgDuration =
      logs.reduce((sum, l) => {
        if (l.startedAt && l.finishedAt) {
          return sum + (new Date(l.finishedAt) - new Date(l.startedAt));
        }
        return sum;
      }, 0) / (total || 1);

    // --- EXECUTIONS OVER TIME ---
    const executionsOverTime = await WorkflowLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          count: { $sum: 1 },
        },
      },
      { $project: { date: "$_id", count: 1, _id: 0 } },
      { $sort: { date: 1 } },
    ]);

    // --- WORKFLOW-LEVEL STATS ---
    const workflowStats = await WorkflowLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$workflowId",
          executions: { $sum: 1 },
          successes: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
          avgDuration: {
            $avg: { $subtract: ["$finishedAt", "$startedAt"] },
          },
        },
      },
      {
        $lookup: {
          from: "workflows",
          localField: "_id",
          foreignField: "_id",
          as: "workflowInfo",
        },
      },
      {
        $project: {
          workflowId: "$_id",
          workflowName: {
            $ifNull: [{ $arrayElemAt: ["$workflowInfo.name", 0] }, "Unnamed"],
          },
          executions: 1,
          successRate: {
            $round: [
              { $multiply: [{ $divide: ["$successes", "$executions"] }, 100] },
              1,
            ],
          },
          avgDuration: { $round: [{ $divide: ["$avgDuration", 1000] }, 2] },
          _id: 0,
        },
      },
      { $sort: { executions: -1 } },
      { $limit: 10 },
    ]);

    // --- ACTION-LEVEL STATS ---
    const actionStats = await WorkflowLog.aggregate([
      { $match: filter },
      { $unwind: "$executionSteps" },
      { $match: { "executionSteps.action": { $ne: null } } },
      {
        $group: {
          _id: "$executionSteps.action",
          totalRuns: { $sum: 1 },
          successes: {
            $sum: {
              $cond: [{ $eq: ["$executionSteps.status", "success"] }, 1, 0],
            },
          },
          avgStepDuration: {
            $avg: {
              $subtract: [
                "$executionSteps.completedAt",
                "$executionSteps.startedAt",
              ],
            },
          },
        },
      },
      {
        $project: {
          action: "$_id",
          totalRuns: 1,
          successRate: {
            $round: [
              { $multiply: [{ $divide: ["$successes", "$totalRuns"] }, 100] },
              1,
            ],
          },
          avgStepDuration: {
            $round: [{ $divide: ["$avgStepDuration", 1000] }, 2],
          },
          _id: 0,
        },
      },
      { $sort: { totalRuns: -1 } },
      { $limit: 10 },
    ]);

    // --- FINAL RESPONSE ---
    res.json({
      totalExecutions: total,
      successRate: Math.round((success / total) * 100) || 0,
      avgDuration: (avgDuration / 1000).toFixed(1),
      failedExecutions: total - success,
      executionsOverTime,
      workflowStats,
      actionStats,
    });
  } catch (err) {
    console.error("⚠️ Analytics fetch error:", err);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};
