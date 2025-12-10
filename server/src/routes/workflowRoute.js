import express from "express";
import {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
} from "../controllers/workflowController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createWorkflow);
router.get("/", protect, getWorkflows);
router.get("/:id", protect, getWorkflowById);
router.put("/:id", protect, updateWorkflow);
router.delete("/:id", protect, deleteWorkflow);

export default router;
