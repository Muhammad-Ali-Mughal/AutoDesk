import express from "express";
import {
  createOrganization,
  getMyOrganization,
  addUserToOrganization,
  getAllOrganizations,
} from "../controllers/organizationController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleBasedAccessControl.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("Superadmin"), createOrganization);
router.get("/me", protect, getMyOrganization);
router.post(
  "/add-user",
  protect,
  authorizeRoles("Admin"),
  addUserToOrganization
);
router.get("/all", protect, authorizeRoles("Superadmin"), getAllOrganizations);

export default router;
