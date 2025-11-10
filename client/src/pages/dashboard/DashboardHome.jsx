import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaBolt,
  FaPlayCircle,
  FaChartPie,
  FaPlus,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../../utils/api.js";

export default function Dashboard() {
  const [stats, setStats] = useState({
    credits: 0,
    creditLimit: 0,
    totalWorkflows: 0,
    totalRuns: 0,
    successRate: 0,
    recentExecutions: [],
    topWorkflows: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const percentUsed = Math.min(
    (stats.credits / (stats.creditLimit || 1)) * 100,
    100
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back! Here's your automation activity overview.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl shadow-md"
          >
            <FaPlus /> New Workflow
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Workflows"
            value={stats.totalWorkflows}
            icon={<FaChartPie />}
            color="bg-indigo-100 text-indigo-600"
          />
          <StatCard
            title="Total Executions"
            value={stats.totalRuns}
            icon={<FaPlayCircle />}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate?.toFixed(1) ?? 0}%`}
            icon={<FaCheckCircle />}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Credits Remaining"
            value={`${stats.credits}/${stats.creditLimit}`}
            icon={<FaBolt />}
            color="bg-yellow-100 text-yellow-600"
          />
        </div>

        {/* Credit Progress Bar */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Credit Usage</span>
            <span>{percentUsed.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <motion.div
              className="h-3 bg-violet-600"
              initial={{ width: 0 }}
              animate={{ width: `${percentUsed}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            You can upgrade your plan for more monthly credits.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recent Executions */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-2xl shadow p-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Executions
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-100 h-10 rounded-md"
                  />
                ))}
              </div>
            ) : stats.recentExecutions.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent workflow runs.</p>
            ) : (
              <ul className="divide-y">
                {stats.recentExecutions.map((exec, i) => (
                  <li
                    key={i}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {exec.workflowName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(exec.executedAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        exec.status === "success"
                          ? "bg-green-100 text-green-700"
                          : exec.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {exec.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Right: Top Workflows */}
          <motion.div
            className="bg-white rounded-2xl shadow p-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Top Workflows
            </h3>
            {stats.topWorkflows.length === 0 ? (
              <p className="text-gray-500 text-sm">No workflows yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.topWorkflows.map((wf, i) => (
                  <motion.div
                    key={wf._id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 200, damping: 16 }}
                    className="flex justify-between items-center bg-violet-50 hover:bg-violet-100 p-3 rounded-xl cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-semibold text-violet-700">
                        {wf.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {wf.executions} runs
                      </p>
                    </div>
                    <FaPlayCircle className="text-violet-600" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* System Health Widget */}
        <motion.div
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div>
            <h4 className="text-gray-800 font-semibold">System Health</h4>
            <p className="text-sm text-gray-500">
              All automation services are operational.
            </p>
          </div>
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <FaCheckCircle /> Operational
          </div>
        </motion.div>

        {/* Floating Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 bg-violet-600 hover:bg-violet-700 text-white p-5 rounded-full shadow-xl"
        >
          <FaPlus className="text-xl" />
        </motion.button>
      </div>
    </div>
  );
}

/* ---------- Small Card Component ---------- */
function StatCard({ title, value, icon, color }) {
  return (
    <motion.div
      className={`bg-white rounded-2xl shadow p-5 flex items-center justify-between`}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 200, damping: 16 }}
    >
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">
          {value ?? 0}
        </p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    </motion.div>
  );
}
