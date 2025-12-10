import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: [
        "info",
        "success",
        "warning",
        "error",
        "workflow",
        "billing",
        "system",
      ],
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("Notification", notificationSchema);
