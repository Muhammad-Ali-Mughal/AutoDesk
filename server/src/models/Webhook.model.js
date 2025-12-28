import mongoose from "mongoose";

const webhookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },

    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },

    secret: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    requestMethod: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      default: "POST",
    },

    event: {
      type: String,
      enum: [
        "workflow.started",
        "workflow.completed",
        "workflow.failed",
        "payment.success",
        "payment.failed",
        "custom",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "failed"],
      default: "active",
    },

    /**
     * 🧠 Webhook payload detection (Make/Zapier style)
     */
    isListening: {
      type: Boolean,
      default: false,
    },

    listeningStartedAt: {
      type: Date,
    },

    samplePayload: {
      type: Object,
      default: null,
    },

    parsedFields: [
      {
        key: String,
        type: {
          type: String,
        },
      },
    ],

    detectedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Webhook", webhookSchema);
