import mongoose from "mongoose";

const executionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: [true, "Workflow is required"],
    },
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
    status: {
      type: String,
      enum: ["running", "completed", "failed", "cancelled"],
      default: "running",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    log: {
      type: String,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: false,
  }
);

export default mongoose.model("Execution", executionSchema);
