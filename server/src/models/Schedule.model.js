import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: [true, "Workflow is required"],
    },
    cron: {
      type: String,
      required: [true, "Cron expression is required"],
      match: [
        /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([01]?\d|2[0-9]|3[01])) (\*|([1-9]|1[0-2])) (\*|[0-6])$/,
        "Invalid cron expression",
      ],
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "failed"],
      default: "active",
    },
    lastRun: {
      type: Date,
    },
    nextRun: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

export default mongoose.model("Schedule", scheduleSchema);
