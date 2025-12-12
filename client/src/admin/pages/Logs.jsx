import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/superadmin/activity");
        setLogs(res.data);
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
      <h1 className="text-2xl font-semibold">Activity Logs</h1>
      <div className="bg-white rounded-2xl shadow p-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-2">
            {logs.map((l) => (
              <li key={l._id} className="p-3 border rounded-lg">
                <div className="text-sm text-gray-700">{l.action}</div>
                <div className="text-xs text-gray-400">
                  {new Date(l.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
