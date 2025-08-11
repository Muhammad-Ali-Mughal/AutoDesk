import mongoose from "mongoose";

const executionStepSchema = new mongoose.Schema(
  {
    stepName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "skipped"],
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
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
    triggeredAt: {
      type: Date,
      default: Date.now,
    },
    executionSteps: [executionStepSchema],
  },
  {
    timestamps: false,
  }
);

export default mongoose.model("WorkflowLog", workflowLogSchema);
