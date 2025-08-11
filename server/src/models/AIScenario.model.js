import mongoose from "mongoose";

const aiScenarioSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, "AI Scenario name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    prompt: {
      type: String,
      required: [true, "Prompt is required"],
      maxlength: [5000, "Prompt cannot exceed 5000 characters"],
    },
    response: {
      type: String,
      maxlength: [10000, "Response cannot exceed 10000 characters"],
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      enum: [
        "gpt-3.5-turbo",
        "gpt-4",
        "gpt-4-turbo",
        "claude-3-haiku",
        "claude-3-sonnet",
        "claude-3-opus",
      ],
    },
    status: {
      type: String,
      enum: ["draft", "completed", "failed", "processing"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AIScenario", aiScenarioSchema);
