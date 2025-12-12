import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("roleId");

    if (!user) return res.status(401).json({ message: "User not found" });

    // Attach the full user object (with role) to req.user
    req.user = {
      _id: user._id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.roleId, // populated role object
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};

export const isSuperadmin = (req, res, next) => {
  if (!req.user.role || req.user.role.name !== "Superadmin") {
    return res.status(403).json({ message: "Superadmin access required" });
  }
  next();
};
