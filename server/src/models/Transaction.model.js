import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
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
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: [true, "Plan is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      uppercase: true,
      enum: ["USD", "EUR", "GBP", "PKR"],
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentProvider: {
      type: String,
      required: [true, "Payment provider is required"],
      enum: ["stripe", "paypal", "razorpay", "manual"],
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("Transaction", transactionSchema);
