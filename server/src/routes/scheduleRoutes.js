import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedule,
  listSchedules,
} from "../controllers/scheduleController.js";

const router = express.Router();

router.post("/:workflowId", protect, createSchedule);
router.put("/:workflowId/:scheduleId", protect, updateSchedule);
router.delete("/:workflowId/:scheduleId", protect, deleteSchedule);
router.get("/:workflowId/:scheduleId", protect, getSchedule);
router.get("/:workflowId", protect, listSchedules);

export default router;
