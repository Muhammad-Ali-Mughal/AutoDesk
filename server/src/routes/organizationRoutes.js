import express from "express";
import {
  createOrganization,
  getMyOrganization,
  addUserToOrganization,
  getAllOrganizations,
} from "../controllers/organizationController.js";
import { protect, isSuperadmin } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleBasedAccessControl.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("Admin"),
  isSuperadmin,
  createOrganization
);
router.get("/me", protect, getMyOrganization);
router.post(
  "/add-user",
  protect,
  authorizeRoles("Admin"),
  isSuperadmin,
  addUserToOrganization
);
router.get(
  "/",
  protect,
  // authorizeRoles("Superadmin"),
  isSuperadmin,
  getAllOrganizations
);

export default router;
