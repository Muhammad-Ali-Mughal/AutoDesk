import express from "express";
import {
  getAllUsers,
  createUser,
  updateUserRole,
  moveUserToOrganization,
  deactivateUser,
  deleteUser,
  getAllTeams,
  deleteTeam,
  moveTeamToOrganization,
  platformStats,
} from "../controllers/superadminController.js";

import { protect, isSuperadmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// USER MANAGEMENT
router.get("/users", protect, isSuperadmin, getAllUsers);
router.post("/users", protect, isSuperadmin, createUser);
router.put("/users/:id/role", protect, isSuperadmin, updateUserRole);
router.put("/users/:id/move", protect, isSuperadmin, moveUserToOrganization);
router.put("/users/:id/deactivate", protect, isSuperadmin, deactivateUser);
router.delete("/users/:id", protect, isSuperadmin, deleteUser);

// TEAM MANAGEMENT
router.get("/teams", protect, isSuperadmin, getAllTeams);
router.delete("/teams/:id", protect, isSuperadmin, deleteTeam);
router.put("/teams/:id/move", protect, isSuperadmin, moveTeamToOrganization);

// PLATFORM STATS
router.get("/stats", protect, isSuperadmin, platformStats);

export default router;
