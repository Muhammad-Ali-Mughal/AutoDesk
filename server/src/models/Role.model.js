import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
      unique: true,
    },
    permissions: [
      {
        module: {
          type: String,
          required: true,
        },
        access: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("Role", roleSchema);
