import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema(
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
    service: {
      type: String,
      required: [true, "Service is required"],
      enum: [
        "gmail",
        "slack",
        "discord",
        "github",
        "trello",
        "notion",
        "zapier",
        "webhook",
        "custom",
      ],
    },
    apiKey: {
      type: String,
      required: [true, "API Key is required"],
      select: false, // Don't return API key by default
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired", "invalid"],
      default: "inactive",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Integration", integrationSchema);
