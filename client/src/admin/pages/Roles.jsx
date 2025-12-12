import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import Modal from "../../components/shared/Modal";
import { FaCheck, FaTrash, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

const MODULES = ["organizations", "teams", "roles", "users", "workflows"];

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const [editRole, setEditRole] = useState(null); // role being edited
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles");
      setRoles(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  // ---------- CREATE ROLE ----------
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return toast.warn("Role name is required");
    try {
      const res = await api.post("/roles", {
        name: newRoleName,
        permissions: MODULES.map((m) => ({ module: m, access: false })),
      });
      setRoles((prev) => [...prev, res.data.role]);
      setNewRoleName("");
      setIsCreateModalOpen(false);
      toast.success("Role created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create role");
    }
  };

  // ---------- DELETE ROLE ----------
  const confirmDeleteRole = (role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      await api.delete(`/roles/${roleToDelete._id}`);
      setRoles((prev) => prev.filter((r) => r._id !== roleToDelete._id));
      toast.success("Role deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete role");
    } finally {
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  // ---------- EDIT ROLE ----------
  const startEditRole = (role) => {
    setEditRole({ ...role });
  };

  const togglePermission = (module) => {
    if (!editRole) return;
    const updatedPermissions = editRole.permissions.map((p) =>
      p.module === module ? { ...p, access: !p.access } : p
    );
    setEditRole({ ...editRole, permissions: updatedPermissions });
  };

  const saveEditRole = async () => {
    try {
      const res = await api.put("/roles", {
        roleId: editRole._id,
        permissions: editRole.permissions,
      });
      setRoles((prev) =>
        prev.map((r) => (r._id === editRole._id ? res.data.role : r))
      );
      setEditRole(null);
      toast.success("Role updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
        <button
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Role
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                  Role
                </th>
                {MODULES.map((m) => (
                  <th
                    key={m}
                    className="px-4 py-2 text-center text-sm font-medium text-gray-500"
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </th>
                ))}
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {roles.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-2 font-medium">{r.name}</td>

                  {MODULES.map((m) => {
                    const isEditing = editRole?._id === r._id;
                    const perm = isEditing
                      ? editRole.permissions.find((p) => p.module === m)
                      : r.permissions.find((p) => p.module === m);
                    const checked = perm?.access || false;

                    return (
                      <td key={m} className="px-4 py-2 text-center">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(m)}
                            className="w-4 h-4"
                          />
                        ) : (
                          checked && (
                            <FaCheck className="mx-auto text-green-600" />
                          )
                        )}
                      </td>
                    );
                  })}

                  <td className="px-4 py-2 text-center flex justify-center gap-2">
                    {editRole?._id === r._id ? (
                      <>
                        <button
                          className="px-3 py-1 rounded bg-green-50 text-green-700 border"
                          onClick={saveEditRole}
                        >
                          Save
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-gray-50 text-gray-700 border"
                          onClick={() => setEditRole(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 border flex items-center gap-1"
                          onClick={() => startEditRole(r)}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-red-50 text-red-600 border flex items-center gap-1"
                          onClick={() => confirmDeleteRole(r)}
                        >
                          <FaTrash /> Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ---------- Create Role Modal ---------- */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Role</h2>
          <input
            type="text"
            placeholder="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRole}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      {/* ---------- Delete Role Modal ---------- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
          <p className="mb-4">
            Are you sure you want to delete role{" "}
            <strong>{roleToDelete?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteRole}
              className="px-4 py-2 rounded-lg bg-red-600 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
