import mongoose from "mongoose";

const EmailActionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
      index: true,
    },
    nodeId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      default: "email",
    },
    service: {
      type: String,
      default: "email",
    },
    to: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      default: "No Subject",
    },
    body: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("EmailAction", EmailActionSchema);
