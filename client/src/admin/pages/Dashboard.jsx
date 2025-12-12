import React, { useEffect, useState } from "react";
import api from "../../utils/api"; // your axios instance

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orgCount: 0,
    userCount: 0,
    teamCount: 0,
    workflowCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/superadmin/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Superadmin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            System-wide overview and platform controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Stat title="Organizations" value={stats.orgCount} loading={loading} />
        <Stat title="Users" value={stats.userCount} loading={loading} />
        <Stat title="Teams" value={stats.teamCount} loading={loading} />
        <Stat title="Workflows" value={stats.workflowCount} loading={loading} />
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/superadmin/users"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
          >
            Manage Users
          </a>
          <a
            href="/superadmin/organizations"
            className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 border"
          >
            Manage Organizations
          </a>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, loading }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">
          {loading ? "—" : value}
        </p>
      </div>
    </div>
  );
}
