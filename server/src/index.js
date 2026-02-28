import dotenv from "dotenv";
import mongoose from "mongoose";
import { loadSchedules } from "./services/scheduler.js";

// Load environment variables
dotenv.config();
const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB Atlas");
    await loadSchedules();
    app.listen(PORT, () => {
      console.log(`Server running on PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
