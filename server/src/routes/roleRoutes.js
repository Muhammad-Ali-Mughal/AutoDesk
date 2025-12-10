import express from "express";
import {
  createRole,
  getAllRoles,
  updateRolePermissions,
} from "../controllers/roleController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleBasedAccessControl.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("Superadmin"), createRole);
router.get("/", protect, authorizeRoles("Superadmin"), getAllRoles);
router.put("/", protect, authorizeRoles("Superadmin"), updateRolePermissions);

export default router;
