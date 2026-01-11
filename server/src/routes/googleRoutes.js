import express from "express";
import {
  appendRow,
  readSheet,
  uploadFile,
  listFiles,
  listSheetTabs,
  saveGoogleSheetsConfig,
  getGoogleSheetConfig,
} from "../controllers/googleController.js";
import {
  googleAuth,
  googleCallback,
  checkGoogleStatus,
} from "../controllers/googleAuthController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Google connection status
router.get("/status/:workflowId", protect, checkGoogleStatus);

// Google OAuth
router.get("/auth", protect, googleAuth);
router.get("/callback", googleCallback);

// Sheets
router.post("/sheets/:workflowId/append", protect, appendRow);
router.get("/sheets/:workflowId/read", protect, readSheet);
router.get("/sheets/:workflowId/tabs", protect, listSheetTabs);
router.post("/sheets/:workflowId/save", protect, saveGoogleSheetsConfig);
router.get("/sheets/:workflowId/:nodeId", protect, getGoogleSheetConfig);

// Drive
router.post("/drive/:workflowId/upload", protect, uploadFile);
router.get("/drive/:workflowId/list", protect, listFiles);

export default router;
