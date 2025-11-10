import User from "../models/User.model.js";
import bcrypt from "bcryptjs";

/**
 * @desc Get current user's settings
 * @route GET /api/settings
 * @access Private
 */
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      profile: {
        name: user.name,
        email: user.email,
      },
      subscription: {
        plan: user.plan || "Free",
        credits: user.credits || 0,
        renewDate: user.renewDate || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update profile settings (name, email)
 * @route PUT /api/settings/profile
 * @access Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Change password
 * @route PUT /api/settings/password
 * @access Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get subscription details
 * @route GET /api/settings/subscription
 * @access Private
 */
export const getSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      plan: user.plan || "Free",
      credits: user.credits || 0,
      renewDate: user.renewDate || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
