import express from "express";
import {
  createTeam,
  getMyTeams,
  addUserToTeam,
  removeUserFromTeam,
} from "../controllers/teamController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleBasedAccessControl.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("Admin"), createTeam);
router.get("/", protect, getMyTeams);
router.post("/add-user", protect, authorizeRoles("Admin"), addUserToTeam);
router.post(
  "/remove-user",
  protect,
  authorizeRoles("Admin"),
  removeUserFromTeam
);

export default router;
