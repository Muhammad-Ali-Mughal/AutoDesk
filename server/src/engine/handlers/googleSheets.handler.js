import { appendRowForUser } from "../../services/googleSheetsService.js";
import { resolveTemplate } from "../resolvers/resolveTemplate.js";

export default async function googleSheetsHandler(action, context) {
  const userId = context?.meta?.userId;
  if (!userId) {
    throw new Error("Missing userId in workflow context");
  }

  const config = action?.config || {};
  const spreadsheetId = resolveTemplate(config.spreadsheetId, context);
  const range = resolveTemplate(config.range, context);
  const values = resolveTemplate(config.values, context);

  if (!spreadsheetId || !range) {
    throw new Error("Google Sheets config is missing spreadsheetId or range");
  }

  return await appendRowForUser(userId, spreadsheetId, range, values || "");
}
