// services/googleSheetsService.js
import { google } from "googleapis";
import { getAuthorizedClient } from "./googleClient.js";

export async function appendRowForUser(userId, spreadsheetId, range, values) {
  console.log("Appending Row for user:", userId);
  const auth = await getAuthorizedClient(userId);
  if (!auth) {
    console.warn(
      `User ${userId} has no connected Google account, skipping row append`
    );
    return { error: "Google account not connected" };
  }

  const sheets = google.sheets({ version: "v4", auth });

  // Convert comma-separated string to array
  const rowValues = values.split(",").map((v) => v.trim());

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range, // e.g. "Sheet1!A1"
    valueInputOption: "RAW",
    requestBody: { values: [rowValues] }, // ✅ 2D array
  });

  return res.data;
}

export async function readSheetForUser(userId, spreadsheetId, range) {
  const auth = await getAuthorizedClient(userId);
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return res.data.values;
}

export async function listSheetTabsForUser(userId, spreadsheetId) {
  const auth = await getAuthorizedClient(userId);
  if (!auth) {
    return { error: "not_connected" };
  }

  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(title))",
  });

  const tabs =
    res.data.sheets?.map((sheet) => sheet.properties?.title).filter(Boolean) ||
    [];

  return { tabs };
}
