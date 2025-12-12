import Organization from "../models/Organization.model.js";
import User from "../models/User.model.js";
import Team from "../models/Team.model.js";

// 📌 Create organization manually (Superadmin)
export const createOrganization = async (req, res) => {
  try {
    const { name, adminId } = req.body;

    const admin = await User.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const org = await Organization.create({
      name,
      adminId,
      users: [adminId],
    });

    res.status(201).json({ success: true, org });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get my organization (Admin)
export const getMyOrganization = async (req, res) => {
  try {
    console.log(req.user);
    const org = await Organization.findById(req.user.organizationId)
      .populate("users", "name email roleId")
      .populate("adminId", "name email");
    if (!org) res.status(404).json({ message: "Not found." });
    res.json(org);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Add user to organization
export const addUserToOrganization = async (req, res) => {
  try {
    const { userId } = req.body;

    const org = await Organization.findById(req.user.organizationId);
    if (!org)
      return res.status(404).json({ message: "Organization not found" });

    if (!org.users.includes(userId)) {
      org.users.push(userId);
      await org.save();
    }

    await User.findByIdAndUpdate(userId, {
      organizationId: org._id,
    });

    res.json({ success: true, message: "User added to organization" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get all organizations (Superadmin)
export const getAllOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find().populate("adminId", "name email");
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
