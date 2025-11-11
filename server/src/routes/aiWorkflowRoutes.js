import express from "express";
import { generateAIWorkflow } from "../controllers/aiWorkflowController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/ai/generate-workflow
router.post("/generate-workflow", protect, generateAIWorkflow);

export default router;
