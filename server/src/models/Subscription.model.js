import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      uppercase: true,
      enum: ["USD", "EUR", "GBP", "PKR"],
      default: "USD",
    },
    features: {
      workflowLimit: {
        type: Number,
        required: true,
        min: 0,
      },
      aiRequestLimit: {
        type: Number,
        required: true,
        min: 0,
      },
      premiumIntegrations: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("Subscription", subscriptionSchema);
