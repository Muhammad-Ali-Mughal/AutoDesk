import cron from "node-cron";
import Schedule from "../models/Schedule.model.js";
import Workflow from "../models/Workflow.model.js";
import { executeWorkflow } from "../engine/executeWorkflow.js";

const jobs = new Map();

/**
 * Register a job with cron
 */
export const registerJob = (schedule) => {
  try {
    if (!schedule || schedule.status !== "active") return;
    if (schedule.runOnce && schedule.runAt) {
      const runAt = new Date(schedule.runAt);
      if (runAt < new Date()) {
        schedule.status = "inactive";
        schedule.save().catch(() => {});
        return;
      }
    }

    // Stop old job if it already exists (avoid duplicates)
    if (jobs.has(schedule._id.toString())) {
      unregisterJob(schedule._id.toString());
    }

    // Validate cron expression before scheduling
    if (!cron.validate(schedule.cron)) {
      console.error(
        `❌ Invalid cron expression for schedule ${schedule._id}: ${schedule.cron}`
      );
      return;
    }

    const job = cron.schedule(
      schedule.cron,
      async () => {
        try {
          const workflow = await Workflow.findById(schedule.workflowId);
          if (!workflow || workflow.status !== "active") return;

          const payload = {
            schedule: {
              workflowId: workflow._id.toString(),
              triggeredAt: new Date().toISOString(),
            },
            _source: "schedule",
          };

          await executeWorkflow(workflow, payload, {
            executedBy: workflow.userId,
            organizationId: workflow.organizationId,
          });

          schedule.lastRun = new Date();
          if (schedule.runOnce) {
            schedule.status = "inactive";
            await schedule.save();
            unregisterJob(schedule._id.toString());
            return;
          }
          await schedule.save();

          console.log(
            `✅ Executed scheduled workflow ${
              workflow._id
            } at ${new Date().toISOString()}`
          );
        } catch (err) {
          console.error("❌ Scheduled job execution error:", err);
        }
      },
      { timezone: schedule.timezone || "UTC" }
    );

    jobs.set(schedule._id.toString(), job);
    // console.log(
    //   `🕒 Registered schedule ${schedule._id} for workflow ${schedule.workflowId}`
    // );
  } catch (err) {
    console.error("❌ Error registering job:", err);
  }
};

/**
 * Unregister a job
 */
export const unregisterJob = (scheduleId) => {
  const job = jobs.get(scheduleId);
  if (job) {
    job.stop();
    jobs.delete(scheduleId);
    console.log(`🛑 Unregistered schedule ${scheduleId}`);
  }
};

/**
 * Load all schedules on server start
 */
export const loadSchedules = async () => {
  try {
    const schedules = await Schedule.find({ status: "active" });
    schedules.forEach(registerJob);
    console.log(`🔄 Loaded ${schedules.length} active schedules.`);
  } catch (err) {
    console.error("❌ Error loading schedules:", err);
  }
};
