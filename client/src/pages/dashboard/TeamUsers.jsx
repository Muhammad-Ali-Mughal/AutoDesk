import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { FaUserCircle } from "react-icons/fa";
import { useParams } from "react-router-dom";

export default function TeamUsers() {
  const { orgId, teamId } = useParams();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(
          `/organizations/${orgId}/teams/${teamId}/users`
        );
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [orgId, teamId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">
          Team Members
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white shadow rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition cursor-pointer"
            >
              <FaUserCircle className="text-gray-400 text-3xl" />
              <div>
                <div className="font-semibold text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-sm text-gray-400">{user.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
