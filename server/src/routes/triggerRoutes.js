import express from "express";
import { triggerWebhook } from "../controllers/triggerController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:workflowId/webhook", protect, triggerWebhook);

export default router;
