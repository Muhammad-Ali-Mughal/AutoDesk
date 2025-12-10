import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getUserIntegrations } from "../controllers/integrationController.js";

const router = express.Router();

router.get("/", protect, getUserIntegrations);

export default router;
