import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { FaUsers, FaChevronRight, FaBuilding } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Organizations() {
  const [organization, setOrganization] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await api.get("/organizations/me");
        setOrganization(res.data);
      } catch (err) {
        console.error("Failed to fetch organization:", err);
      }
    };
    fetchOrg();
  }, []);

  const goToOrganizationTeams = () => {
    if (!organization?.teams?.length) {
      return alert("No teams found for this organization.");
    }
    const firstTeam = organization.teams[0];
    navigate(`/organizations/${organization._id}/teams/${firstTeam._id}/users`);
  };

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading organization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8 flex items-center gap-2">
          Organizations
          <span className="text-gray-400 text-sm">•</span>
        </h1>

        {/* Organization Card (Clickable) */}
        <motion.div
          onClick={goToOrganizationTeams}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer border border-gray-100 p-6 mb-8"
        >
          <div className="flex items-center gap-5">
            {/* Icon */}
            <div
              className="p-4 rounded-xl text-white text-2xl shadow-md"
              style={{
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              }}
            >
              <FaBuilding />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {organization.name}
              </h2>
              <p className="text-gray-500 mt-1">
                {organization.teams?.length || 0} Teams
              </p>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex justify-end mt-3">
            <FaChevronRight className="text-gray-400 text-lg" />
          </div>
        </motion.div>

        {/* Teams Section */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Teams in this Organization
        </h3>

        <div className="space-y-3">
          {organization.teams?.map((team, index) => (
            <motion.div
              key={team._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() =>
                navigate(
                  `/organizations/${organization._id}/teams/${team._id}/users`
                )
              }
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                  <FaUsers />
                </div>
                <span className="font-medium text-gray-700">{team.name}</span>
              </div>
              <FaChevronRight className="text-gray-400" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
