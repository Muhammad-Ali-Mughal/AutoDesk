import mongoose from "mongoose";

const webhookSchema = new mongoose.Schema(
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
    secret: {
      type: String,
      required: [true, "Webhook secret is required"],
      unique: true, // ensure uniqueness
      index: true,  // faster lookups
    },
    url: {
      type: String,
      required: [true, "Webhook URL is required"],
      trim: true,
      match: [/^https?:\/\/.+/, "Please enter a valid URL"],
    },
    event: {
      type: String,
      required: [true, "Event is required"],
      enum: [
        "workflow.started",
        "workflow.completed",
        "workflow.failed",
        "payment.success",
        "payment.failed",
        "custom",
      ],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "failed"],
      default: "active",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

export default mongoose.model("Webhook", webhookSchema);
