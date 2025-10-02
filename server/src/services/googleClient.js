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

  // auto-refresh token if expired
  client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) account.refreshToken = tokens.refresh_token;
    if (tokens.access_token) account.accessToken = tokens.access_token;
    if (tokens.expiry_date) account.expiryDate = new Date(tokens.expiry_date);
    await account.save();
  });

  return client;
}
