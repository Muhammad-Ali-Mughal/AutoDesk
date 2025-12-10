import mongoose from "mongoose";

const GoogleSheetsSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    nodeId: {
      type: String,
      required: true,
    },
    spreadsheetId: {
      type: String,
      required: true,
    },
    range: {
      type: String,
      required: true,
    },
    values: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("GoogleSheets", GoogleSheetsSchema);
