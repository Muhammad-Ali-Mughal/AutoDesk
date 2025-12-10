import {
  appendRowForUser,
  readSheetForUser,
} from "../services/googleSheetsService.js";
import {
  uploadFileForUser,
  listFilesForUser,
} from "../services/googleDriveService.js";
import GoogleSheets from "../models/GoogleSheets.model.js";

export const checkGoogleStatus = async (req, res) => {
  try {
    const user = req.user;
    const connected = !!user?.googleTokens;
    // console.log(connected);
    res.json({ connected });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const saveGoogleSheetsConfig = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { nodeId, config } = req.body;
    const userId = req.user?._id;

    if (!workflowId || !nodeId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing workflowId or nodeId" });
    }

    const existing = await GoogleSheets.findOne({ workflowId, nodeId });

    if (existing) {
      existing.spreadsheetId = config.spreadsheetId;
      existing.range = config.range;
      existing.values = config.values;
      await existing.save();
    } else {
      await GoogleSheets.create({
        workflowId,
        nodeId,
        spreadsheetId: config.spreadsheetId,
        range: config.range,
        values: config.values,
        createdBy: userId,
      });
    }

    res.json({
      success: true,
      message: "Google Sheets config saved successfully",
    });
  } catch (err) {
    console.error("❌ Error saving Google Sheets config:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getGoogleSheetConfig = async (req, res) => {
  try {
    const { workflowId, nodeId } = req.params;
    const sheetConfig = await GoogleSheets.findOne({ workflowId, nodeId });
    if (!sheetConfig) {
      return res.status(404).json({ message: "Config not found" });
    }
    const config = {
      spreadsheetId: sheetConfig.spreadsheetId || "",
      range: sheetConfig.range || "",
      values: sheetConfig.values || "",
    };
    res.status(200).json({ success: true, config });
  } catch (error) {
    console.error("❌ Error fetching Google Sheets config:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const appendRow = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new Error("Unauthorized");

    const { spreadsheetId, range, values } = req.body;
    const data = await appendRowForUser(userId, spreadsheetId, range, values);

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const readSheet = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new Error("Unauthorized");

    const { spreadsheetId, range } = req.query;
    const data = await readSheetForUser(userId, spreadsheetId, range);

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new Error("Unauthorized");

    const { name, mimeType, filePath } = req.body;
    const data = await uploadFileForUser(userId, name, mimeType, filePath);

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const listFiles = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new Error("Unauthorized");
    // console.log("listing files for user");
    const { files, error } = await listFilesForUser(userId);
    if (error === "not_connected") {
      return res
        .status(401)
        .json({ message: "Google account disconnected. Please reconnect." });
    }
    // console.log("Sending files to frontend:", files?.length);
    res.json({ success: true, files: files || [] });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
