import { google } from "googleapis";
import fs from "fs";
import { getAuthorizedClient } from "./googleClient.js";

export async function uploadFileForUser(userId, name, mimeType, filePath) {
  const auth = await getAuthorizedClient(userId);
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.create({
    requestBody: { name, mimeType },
    media: { mimeType, body: fs.createReadStream(filePath) },
    fields: "id, name, webViewLink",
  });

  return res.data;
}

export async function listFilesForUser(userId, query = "trashed=false") {
  try {
    const auth = await getAuthorizedClient(userId);
    if (!auth) {
      console.warn(
        "⚠️ Google account not connected or token expired for user:",
        userId
      );
      return { error: "not_connected", files: [] };
    }
    const drive = google.drive({ version: "v3", auth });
    const res = await drive.files.list({
      q: query,
      pageSize: 10,
      fields: "files(id, name, webViewLink, mimeType)",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });
    // console.log("Drive API files:", res.data.files);
    return { files: res.data.files || [], error: null };
  } catch (err) {
    console.error("❌ Google Drive API error:", err);
    if (err.message.includes("invalid_grant")) {
      console.warn(
        "⚠️ Google refresh token invalid. Removing account:",
        userId
      );
      await GoogleAccount.deleteMany({ userId });
    }
    return [];
  }
}
