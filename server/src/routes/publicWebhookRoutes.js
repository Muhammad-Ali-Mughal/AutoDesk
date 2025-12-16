import express from "express";
import { publicWebhookTrigger } from "../controllers/triggerController.js";

const router = express.Router();

router.all("/:workflowId/:secret", publicWebhookTrigger);

export default router;
