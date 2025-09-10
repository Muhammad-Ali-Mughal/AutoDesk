import mongoose from "mongoose";

const filterSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
      enum: [
        "equals",
        "not_equals",
        "greater_than",
        "less_than",
        "contains",
        "not_contains",
        "starts_with",
        "ends_with",
      ],
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const actionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "email",
        "webhook",
        "schedule",
        "delay",
        "condition",
        "ai_prompt",
        "slack",
        "google_sheets",
        "discord",
        "custom",
      ],
    },
    service: {
      type: String,
      required: true,
    },
    to: String,
    subject: String,
    body: String,
    filters: [filterSchema],
  },
  { _id: false }
);

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    data: {
      label: { type: String, required: true },
      config: { type: mongoose.Schema.Types.Mixed },
    },
  },
  { _id: false }
);

const edgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    label: { type: String },
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    name: {
      type: String,
      required: [true, "Workflow name is required"],
      trim: true,
      maxlength: [100, "Workflow name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    triggers: {
      type: {
        type: String,
        enum: ["webhook", "scheduled", "manual", "external_api"],
      },
      cron: {
        type: String,
        required: function () {
          return this.type === "scheduled";
        },
      },
      webhookSecret: {
        type: String,
        required: function () {
          return this.type === "webhook";
        },
      },
    },

    nodes: [nodeSchema],
    edges: [edgeSchema],
    actions: [actionSchema],

    status: {
      type: String,
      enum: ["draft", "active", "paused", "archived"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Workflow", workflowSchema);
