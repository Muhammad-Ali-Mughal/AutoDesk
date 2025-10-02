// services/googleSheetsService.js
import { google } from "googleapis";
import { getAuthorizedClient } from "./googleClient.js";

export async function appendRowForUser(userId, spreadsheetId, range, values) {
  const auth = await getAuthorizedClient(userId);
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range, // e.g. "Sheet1!A1"
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });

  return res.data;
}

export async function readSheetForUser(userId, spreadsheetId, range) {
  const auth = await getAuthorizedClient(userId);
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return res.data.values;
}
