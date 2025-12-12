import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.model.js"; // adjust path

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Connected! Fixing invalid credits...");

  const users = await User.find();

  for (const user of users) {
    // If credits is not an object → replace it with defaults
    if (
      typeof user.credits !== "object" ||
      user.credits === null ||
      Array.isArray(user.credits)
    ) {
      console.log("Fixing user:", user.email);

      user.credits = {
        totalCredits: 100,
        usedCredits: 0,
        remainingCredits: 100,
        lastReset: new Date(),
        nextReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      await user.save();
    }
  }

  console.log("Done!");
  process.exit(0);
})();
