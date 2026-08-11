import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/superadmin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(userId);
      await api.delete(`/superadmin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
          Create User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-500">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Organization</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="py-3">{u.name}</td>
                  <td className="py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="py-3 text-sm">{u.roleId?.name}</td>
                  <td className="py-3 text-sm">
                    {u.organizationId?.name || "—"}
                  </td>
                  <td className="py-3 text-sm">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 border">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        disabled={deletingId === u._id}
                        className="px-3 py-1 rounded bg-red-50 text-red-600 border disabled:opacity-50"
                      >
                        {deletingId === u._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
