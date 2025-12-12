import React, { useEffect, useState } from "react";
import api from "../../utils/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    allowSignups: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/superadmin/settings");
        setSettings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggle = async (key) => {
    const payload = { ...settings, [key]: !settings[key] };
    try {
      await api.put("/superadmin/settings", payload);
      setSettings(payload);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Global Settings</h1>
      <div className="bg-white rounded-2xl shadow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Allow New Signups</p>
            <p className="text-sm text-gray-500">
              Toggle whether new organizations/users can sign up.
            </p>
          </div>
          <button
            onClick={() => toggle("allowSignups")}
            className={`px-4 py-2 rounded ${
              settings.allowSignups ? "bg-green-600 text-white" : "bg-gray-100"
            }`}
          >
            {settings.allowSignups ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Maintenance Mode</p>
            <p className="text-sm text-gray-500">
              Put the platform into maintenance mode to block actions.
            </p>
          </div>
          <button
            onClick={() => toggle("maintenanceMode")}
            className={`px-4 py-2 rounded ${
              settings.maintenanceMode ? "bg-red-600 text-white" : "bg-gray-100"
            }`}
          >
            {settings.maintenanceMode ? "On" : "Off"}
          </button>
        </div>
      </div>
    </div>
  );
}
