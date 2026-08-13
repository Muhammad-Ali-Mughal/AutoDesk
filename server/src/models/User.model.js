import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // Relations
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },

    // Subscription & plan details
    subscription: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
      },
      planName: {
        type: String,
        default: "Free",
      },
      tier: {
        type: String,
        enum: ["free", "basic", "pro", "enterprise"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled", "expired"],
        default: "inactive",
      },
      startedAt: {
        type: Date,
      },
      expiresAt: {
        type: Date,
      },
      renewsAt: {
        type: Date,
      },
      paymentId: {
        type: String,
      },
    },

    // Credit tracking
    credits: {
      type: {
        totalCredits: { type: Number, default: 100 },
        usedCredits: { type: Number, default: 0 },
        remainingCredits: { type: Number, default: 100 },
        lastReset: { type: Date, default: Date.now },
        nextReset: { type: Date, default: Date.now },
      },
      default: () => ({
        totalCredits: 100,
        usedCredits: 0,
        remainingCredits: 100,
        lastReset: Date.now(),
        nextReset: Date.now(),
      }),
    },

    // Usage tracking
    usage: {
      workflowRun: {
        type: Number,
        default: 0,
      },
      aiRequests: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.useCredits = function (amount) {
  if (this.credits.remainingCredits < amount) {
    throw new Error("Not enough credits");
  }
  this.credits.usedCredits += amount;
  this.credits.remainingCredits -= amount;
  return this.save();
};

userSchema.methods.resetCredits = function (
  amount = this.credits.totalCredits
) {
  this.credits.usedCredits = 0;
  this.credits.remainingCredits = amount;
  this.credits.lastReset = new Date();
  this.credits.nextReset = new Date(
    new Date().setMonth(new Date().getMonth() + 1)
  );
  return this.save();
};

export default mongoose.model("User", userSchema);
