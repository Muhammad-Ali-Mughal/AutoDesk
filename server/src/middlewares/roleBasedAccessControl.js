import User from "../models/User.model.js";
import Role from "../models/Role.model.js";

export const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate("roleId");

      if (!user) return res.status(404).json({ message: "User not found" });

      const userRole = user.roleId?.name;

      if (!roles.includes(userRole)) {
        return res
          .status(403)
          .json({ message: "Access denied: insufficient role" });
      }

      next();
    } catch (err) {
      console.error("Role check error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
