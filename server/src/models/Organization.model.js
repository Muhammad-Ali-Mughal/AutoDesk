import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxlength: [100, "Organization name cannot exceed 100 characters"],
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin is required"],
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("Organization", organizationSchema);
