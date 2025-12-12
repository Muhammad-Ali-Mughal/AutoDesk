import express from "express";
import {
  createRole,
  getAllRoles,
  updateRolePermissions,
  deleteRole,
} from "../controllers/roleController.js";
import { protect, isSuperadmin } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleBasedAccessControl.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("Superadmin"), createRole);
router.get("/", protect, authorizeRoles("Superadmin"), getAllRoles);
router.put("/", protect, authorizeRoles("Superadmin"), updateRolePermissions);
router.delete("/:roleId", protect, isSuperadmin, deleteRole);

export default router;
