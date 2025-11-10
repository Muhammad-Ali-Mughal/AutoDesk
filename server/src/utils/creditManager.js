import User from "../models/User.model.js";

export async function checkAndConsumeCredit(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const credits = user.credits || {};
  const remaining = Number(credits.remainingCredits) || 0;

  if (remaining <= 0) {
    throw new Error("Credit limit reached. Please upgrade your plan.");
  }

  credits.remainingCredits = remaining - 1;
  credits.usedCredits = Number(credits.usedCredits) + 1 || 1;

  user.credits = credits;
  await user.save();

  return credits.remainingCredits;
}
