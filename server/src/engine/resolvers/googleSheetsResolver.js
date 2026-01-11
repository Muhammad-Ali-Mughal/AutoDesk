import GoogleSheets from "../../models/GoogleSheets.model.js";

export async function googleSheetsResolver(action, node, workflowId) {
  const sheetConfig = await GoogleSheets.findOne({
    workflowId,
    nodeId: node.id,
  });

  if (!sheetConfig) return action;

  return {
    ...action,
    config: {
      spreadsheetId: sheetConfig.spreadsheetId,
      range: sheetConfig.range,
      values: sheetConfig.values || "",
    },
  };
}
