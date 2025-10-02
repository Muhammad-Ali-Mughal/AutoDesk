import mongoose from "mongoose";

const googleAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Google’s unique ID for the account (helps if user connects multiple Gmail accounts)
    googleId: { type: String, required: true },

    email: { type: String },
    name: { type: String },
    picture: { type: String },

    accessToken: String,
    refreshToken: String,
    expiryDate: Date,

    scopes: [String], // what permissions app has
  },
  { timestamps: true }
);

export default mongoose.model("GoogleAccount", googleAccountSchema);
