import { google } from "googleapis";
import GoogleAccount from "../models/GoogleAccount.model.js";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export function createOAuthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export async function getAuthorizedClient(userId) {
  const account = await GoogleAccount.findOne({ userId });
  if (!account) throw new Error("Google account not connected");
  const client = createOAuthClient();
  client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
    expiry_date: account.expiryDate?.getTime(),
  });
  client.on("tokens", async (tokens) => {
    try {
      if (tokens.refresh_token) account.refreshToken = tokens.refresh_token;
      if (tokens.access_token) account.accessToken = tokens.access_token;
      if (tokens.expiry_date) account.expiryDate = new Date(tokens.expiry_date);
      await account.save();
      console.log("🔄 Google tokens refreshed and saved for user:", userId);
    } catch (err) {
      console.error("⚠️ Failed to save refreshed tokens:", err);
    }
  });

  try {
    await client.getAccessToken();
    return client;
  } catch (err) {
    if (err.message.includes("invalid_grant")) {
      console.warn(
        "❌ Invalid or expired Google refresh token. Removing account:",
        userId
      );
      await GoogleAccount.deleteMany({ userId });
      return null;
    }
    console.error("⚠️ Failed to create authorized Google client:", err);
    throw err;
  }
}
