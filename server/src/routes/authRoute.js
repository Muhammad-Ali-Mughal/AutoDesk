import express from "express";
import { body } from "express-validator";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

const signupValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/signup", signupValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.post("/logout", logoutUser);

router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
