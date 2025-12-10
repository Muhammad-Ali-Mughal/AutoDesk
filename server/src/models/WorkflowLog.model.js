import mongoose from "mongoose";

const executionStepSchema = new mongoose.Schema(
  {
    nodeId: { type: String, required: true },
    stepName: { type: String, required: true },
    action: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "running", "success", "failed", "skipped"],
      default: "pending",
    },
    startedAt: Date,
    completedAt: Date,
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    errorMessage: String,
  },
  { _id: false }
);

const workflowLogSchema = new mongoose.Schema(
  {
    executionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Execution",
      required: [true, "Execution is required"],
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: [true, "Workflow is required"],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
    },
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Executed by user is required"],
    },
    triggeredAt: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ["running", "success", "failed"],
      default: "running",
    },
    startedAt: { type: Date, default: Date.now },
    finishedAt: Date,

    executionSteps: [executionStepSchema],
  },
  { timestamps: true }
);

export default mongoose.model("WorkflowLog", workflowLogSchema);
