import express from "express";
import { publicWebhookTrigger } from "../controllers/triggerController.js";

const router = express.Router();

router.post("/:workflowId/:secret", publicWebhookTrigger);

export default router;
