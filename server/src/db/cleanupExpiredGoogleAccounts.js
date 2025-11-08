import cron from "node-cron";
import GoogleAccount from "../models/GoogleAccount.js";

cron.schedule("0 0 * * *", async () => {
  const now = new Date();
  const result = await GoogleAccount.deleteMany({
    expiryDate: { $lte: now },
  });
  console.log(`🧹 Removed ${result.deletedCount} expired Google accounts`);
});
