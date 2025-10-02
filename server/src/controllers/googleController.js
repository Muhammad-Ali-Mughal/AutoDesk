import {
  appendRowForUser,
  readSheetForUser,
} from "../services/googleSheetsService.js";
import {
  uploadFileForUser,
  listFilesForUser,
} from "../services/googleDriveService.js";

export const checkGoogleStatus = async (req, res) => {
  try {
    const user = req.user;
    const connected = !!user?.googleTokens;
    res.json({ connected });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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

    const files = await listFilesForUser(userId);

    res.json({ success: true, files });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
