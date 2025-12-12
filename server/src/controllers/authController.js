import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Organization from "../models/Organization.model.js";
import Role from "../models/Role.model.js";
import Team from "../models/Team.model.js";
import { validationResult } from "express-validator";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password, organizationName, teamName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Default role
    const defaultRole = await Role.findOne({ name: "Admin" });
    if (!defaultRole)
      return res
        .status(500)
        .json({ message: "Default role not found. Please seed roles." });

    // 1️⃣ Create User
    const user = new User({
      name,
      email,
      password,
      roleId: defaultRole._id,
    });
    await user.save();

    // 2️⃣ Create Organization
    const organization = new Organization({
      name: organizationName || `${name}'s Organization`,
      adminId: user._id,
      users: [user._id],
    });
    await organization.save();

    // 3️⃣ Create Default Team
    const team = new Team({
      name: teamName || "Default Team",
      organizationId: organization._id,
      users: [user._id],
    });
    await team.save();

    // 4️⃣ Update User with org & team
    user.organizationId = organization._id;
    user.teamId = team._id;
    await user.save();

    // 5️⃣ Generate JWT Token
    const token = generateToken(user._id);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          organizationId: user.organizationId,
          teamId: user.teamId,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Match password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Token
    const token = generateToken(user._id);
    const isProd = process.env.NODE_ENV === "production";
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: isProd, // only true on HTTPS (prod)
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          organizationId: user.organizationId,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Logout User

export const logoutUser = (req, res) => {
  res
    .clearCookie("token")
    .status(200)
    .json({ message: "Logged out successfully" });
};
