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
  const auth = await getAuthorizedClient(userId);
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: query,
    fields: "files(id, name, webViewLink)",
  });
  return res.data.files;
}
