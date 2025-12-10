import express from "express";
import {
  getSettings,
  updateProfile,
  changePassword,
  getSubscription,
} from "../controllers/settingsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getSettings);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.get("/subscription", protect, getSubscription);

export default router;
