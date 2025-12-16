import express from "express";
import {
  triggerWebhook,
  updateWorkflowWebhook,
  publicWebhookTrigger,
  getTriggerSecret,
} from "../controllers/triggerController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:workflowId/trigger-secret", protect, getTriggerSecret);

router.post("/:workflowId/webhook", protect, triggerWebhook);

router.put("/:workflowId/update-trigger", protect, updateWorkflowWebhook);

router.all("/public/:workflowId/:secret", publicWebhookTrigger);

export default router;
