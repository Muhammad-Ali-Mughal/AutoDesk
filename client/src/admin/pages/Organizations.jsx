import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/organizations");
        setOrgs(res.data);
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
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
          Create Organization
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
                <th className="py-2">Owner</th>
                <th className="py-2">Users</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o._id} className="border-t">
                  <td className="py-3">{o.name}</td>
                  <td className="py-3 text-sm">{o.ownerId?.name || "—"}</td>
                  <td className="py-3 text-sm">{(o.users || []).length}</td>
                  <td className="py-3 text-sm">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 border">
                        View
                      </button>
                      <button className="px-3 py-1 rounded bg-red-50 text-red-600 border">
                        Delete
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
