import express from "express";
import { addEmailAction } from "../controllers/emailController.js";

const router = express.Router();

// POST /workflows/:id/actions/email
router.post("/:workflowId", addEmailAction);

export default router;
