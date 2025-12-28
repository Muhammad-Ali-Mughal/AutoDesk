import express from "express";
import {
  triggerWebhook,
  updateWorkflowWebhook,
  publicWebhookTrigger,
  getTriggerSecret,
  startWebhookListening,
  stopWebhookListening,
} from "../controllers/triggerController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:workflowId/trigger-secret", protect, getTriggerSecret);
router.post("/:workflowId/webhook", protect, triggerWebhook);
router.put("/:workflowId/update-trigger", protect, updateWorkflowWebhook);

// Webhook listening lifecycle
router.post("/:workflowId/webhook/listen", protect, startWebhookListening);
router.post("/:workflowId/webhook/stop-listen", protect, stopWebhookListening);

// Public webhook
router.all("/public/:workflowId/:secret", publicWebhookTrigger);

export default router;
