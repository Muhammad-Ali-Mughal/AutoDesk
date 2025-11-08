import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { actionStyles } from "../../utils/actionStyles";
import api from "../../utils/api";

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    targetId: null,
  });

  // Fetch integrations from backend
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const res = await api.get("/integrations");
        const data = res.data.integrations || [];

        // Map userData to a consistent 'account' property for frontend
        const formatted = data.map((integration) => {
          let accounts = [];
          if (integration.userData && integration.userData.length > 0) {
            accounts = integration.userData.map((u) => {
              if (integration.type === "google_sheets") return u.email;
              if (integration.type === "webhook") return u.url;
              return u.account || u.email || u.id;
            });
          }

          return {
            id: integration.id,
            type: integration.type,
            label: integration.label,
            account: accounts.join(", ") || null,
          };
        });

        setIntegrations(formatted);
      } catch (err) {
        console.error("Failed to fetch integrations:", err);
      }
    };

    fetchIntegrations();
  }, []);

  const handleContextMenu = (e, id) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, targetId: id });
  };

  const handleCloseMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleAction = (action) => {
    console.log(`Action: ${action} on integration ID: ${contextMenu.targetId}`);
    // Map Edit/Delete functionality here later
    handleCloseMenu();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl mb-8 md:text-3xl font-semibold text-gray-800 flex items-center gap-2">
          Integrations
          <span className="text-gray-400 text-sm">•</span>
        </h1>

        {/* Integrations list */}
        <div className="space-y-4">
          {integrations.map((integration) => {
            const style = actionStyles[integration.type] || actionStyles.custom;
            const Icon = style.icon;

            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: integration.id * 0.1 }}
                className="bg-white shadow rounded-lg p-4 flex items-center justify-between hover:shadow-lg transition relative"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg flex items-center justify-center"
                    style={{ background: style.gradient }}
                  >
                    <Icon className="text-white text-xl" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {style.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {integration.account || "No accounts connected"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative">
                  <button className="px-3 py-1 text-sm rounded-lg border border-violet-600 text-violet-600 hover:bg-violet-50 transition">
                    Reauthorize
                  </button>
                  <button className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                    Verify
                  </button>

                  {/* 3-dots menu button */}
                  <button
                    className="px-2 py-1 text-sm rounded-lg hover:bg-gray-100 transition"
                    onClick={(e) => handleContextMenu(e, integration.id)}
                  >
                    ⋮
                  </button>

                  {/* Simple Context Menu */}
                  {contextMenu.visible &&
                    contextMenu.targetId === integration.id && (
                      <ul
                        className="absolute bg-white border rounded-lg shadow-lg py-1 w-32 z-50 right-0 top-full mt-1"
                        onMouseLeave={handleCloseMenu}
                      >
                        <li
                          className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-gray-100 transition"
                          onClick={() => handleAction("edit")}
                        >
                          Edit
                        </li>
                        <li
                          className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-gray-100 transition"
                          onClick={() => handleAction("delete")}
                        >
                          Delete
                        </li>
                      </ul>
                    )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
