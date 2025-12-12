import Role from "../models/Role.model.js";

// 📌 Create new role
export const createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    const role = await Role.create({ name, permissions });

    res.status(201).json({ success: true, role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Update permission
export const updateRolePermissions = async (req, res) => {
  try {
    const { roleId, permissions } = req.body;

    const role = await Role.findByIdAndUpdate(
      roleId,
      { permissions },
      { new: true }
    );

    res.json({ success: true, role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a role
export const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await Role.findById(roleId);
    if (!role) return res.status(404).json({ message: "Role not found" });
    if (role.name === "Superadmin") {
      return res.status(403).json({ message: "Cannot delete Superadmin role" });
    }
    await role.deleteOne();
    res.json({ success: true, message: "Role deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
