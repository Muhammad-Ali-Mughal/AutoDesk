import { google } from "googleapis";
import GoogleAccount from "../models/GoogleAccount.model.js";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export function createOAuthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

// Utility
function maybeDecrypt(value) {
  return value; // replace with decrypt(value) if you add encryption
}
function maybeEncrypt(value) {
  return value; // replace with encrypt(value) if you add encryption
}

export async function getAuthorizedClient(userId) {
  const account = await GoogleAccount.findOne({ userId });
  if (!account) throw new Error("Google account not connected");

  const client = createOAuthClient();
  client.setCredentials({
    access_token: maybeDecrypt(account.accessToken),
    refresh_token: maybeDecrypt(account.refreshToken),
    expiry_date: account.expiryDate?.getTime(),
  });

  // Auto-refresh token if expired or near expiry (within 2 minutes)
  const expiresSoon =
    !account.expiryDate ||
    Date.now() >= account.expiryDate.getTime() - 2 * 60 * 1000;

  if (expiresSoon) {
    try {
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);

      account.accessToken = maybeEncrypt(credentials.access_token);
      account.expiryDate = new Date(credentials.expiry_date);
      if (credentials.refresh_token)
        account.refreshToken = maybeEncrypt(credentials.refresh_token);
      await account.save();

      console.log("🔄 Token refreshed for user:", userId);
    } catch (err) {
      if (err.message.includes("invalid_grant")) {
        console.warn(
          "❌ Invalid or revoked Google refresh token. Removing account:",
          userId
        );
        await GoogleAccount.deleteMany({ userId });
        return null;
      }
      console.error("⚠️ Failed to refresh Google token:", err);
      throw err;
    }
  }

  // Update tokens whenever Google automatically issues new ones
  client.on("tokens", async (tokens) => {
    try {
      if (tokens.refresh_token)
        account.refreshToken = maybeEncrypt(tokens.refresh_token);
      if (tokens.access_token)
        account.accessToken = maybeEncrypt(tokens.access_token);
      if (tokens.expiry_date) account.expiryDate = new Date(tokens.expiry_date);
      await account.save();
      console.log("🧩 Tokens auto-saved for user:", userId);
    } catch (err) {
      console.error("⚠️ Failed to persist new tokens:", err);
    }
  });

  return client;
}
