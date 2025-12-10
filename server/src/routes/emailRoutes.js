import express from "express";
import {
  addEmailAction,
  getEmailConfig,
  updateEmailAction,
  deleteEmailAction,
} from "../controllers/emailController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create or upsert email config for a node
router.post("/:workflowId", protect, addEmailAction);

// Read config for a specific node
router.get("/:workflowId/node/:nodeId", protect, getEmailConfig);

// Optional: update existing
router.put("/:workflowId/node/:nodeId", protect, updateEmailAction);

// Optional: delete
router.delete("/:workflowId/node/:nodeId", protect, deleteEmailAction);

export default router;
