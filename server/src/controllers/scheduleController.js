import Schedule from "../models/Schedule.model.js";
import Workflow from "../models/Workflow.model.js";
import { registerJob, unregisterJob } from "../services/scheduler.js";

/**
 * Create a schedule for a workflow
 */
export const createSchedule = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { cron, timezone } = req.body;
    const user = req.user;

    const workflow = await Workflow.findOne({
      _id: workflowId,
      $or: [{ organizationId: user.organizationId }, { userId: user._id }],
    });
    if (!workflow) return res.status(404).json({ message: "Workflow not found" });

    const schedule = await Schedule.create({
      userId: user._id,
      organizationId: user.organizationId,
      workflowId,
      cron,
      timezone: timezone || "UTC",
    });

    // Register with scheduler service
    registerJob(schedule);

    res.status(201).json({ message: "Schedule created", schedule });
  } catch (err) {
    console.error("Create schedule error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update an existing schedule
 */
export const updateSchedule = async (req, res) => {
  try {
    const { workflowId, scheduleId } = req.params;
    const { cron, timezone, status } = req.body;
    const user = req.user;

    let schedule = await Schedule.findOne({
      _id: scheduleId,
      workflowId,
      $or: [{ organizationId: user.organizationId }, { userId: user._id }],
    });
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    schedule.cron = cron || schedule.cron;
    schedule.timezone = timezone || schedule.timezone;
    if (status) schedule.status = status;

    await schedule.save();

    // Re-register job
    unregisterJob(schedule._id.toString());
    if (schedule.status === "active") registerJob(schedule);

    res.json({ message: "Schedule updated", schedule });
  } catch (err) {
    console.error("Update schedule error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete schedule
 */
export const deleteSchedule = async (req, res) => {
  try {
    const { workflowId, scheduleId } = req.params;
    const user = req.user;

    const schedule = await Schedule.findOneAndDelete({
      _id: scheduleId,
      workflowId,
      $or: [{ organizationId: user.organizationId }, { userId: user._id }],
    });
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    unregisterJob(schedule._id.toString());

    res.json({ message: "Schedule deleted" });
  } catch (err) {
    console.error("Delete schedule error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a single schedule
 */
export const getSchedule = async (req, res) => {
  try {
    const { workflowId, scheduleId } = req.params;
    const user = req.user;

    const schedule = await Schedule.findOne({
      _id: scheduleId,
      workflowId,
      $or: [{ organizationId: user.organizationId }, { userId: user._id }],
    });
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    res.json({ schedule });
  } catch (err) {
    console.error("Get schedule error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * List schedules for a workflow
 */
export const listSchedules = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const user = req.user;

    const schedules = await Schedule.find({
      workflowId,
      $or: [{ organizationId: user.organizationId }, { userId: user._id }],
    });

    res.json({ schedules });
  } catch (err) {
    console.error("List schedules error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
