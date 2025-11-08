import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

function GoogleSheetsConfig({ node, workflowId, onChange, onSave }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);

  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [range, setRange] = useState("");
  const [values, setValues] = useState("");

  // 🟢 Load config from DB on mount
  useEffect(() => {
    const fetchNodeConfig = async () => {
      try {
        const res = await api.get(`/google/sheets/${workflowId}/${node.id}`);
        if (res.data?.config) {
          setSpreadsheetId(res.data.config.spreadsheetId || "");
          setRange(res.data.config.range || "");
          setValues(res.data.config.values || "");
        } else {
          // fallback to node data (if local unsaved config exists)
          setSpreadsheetId(node?.data?.config?.spreadsheetId || "");
          setRange(node?.data?.config?.range || "");
          setValues(node?.data?.config?.values || "");
        }
      } catch (err) {
        console.error("❌ Failed to load node config:", err);
        // fallback if API fails
        setSpreadsheetId(node?.data?.config?.spreadsheetId || "");
        setRange(node?.data?.config?.range || "");
        setValues(node?.data?.config?.values || "");
      }
    };

    fetchNodeConfig();
  }, [workflowId, node?.id]);

  // 🟢 Handle Google connection and file listing
  useEffect(() => {
    let isMounted = true;

    const fetchGoogleData = async () => {
      try {
        setLoading(true);
        const statusRes = await api.get(`/google/status/${workflowId}`);
        if (!isMounted) return;

        if (statusRes.data.connected) {
          setConnected(true);
          const filesRes = await api.get(`/google/drive/${workflowId}/list`);
          if (isMounted) setFiles(filesRes.data.files || []);
        } else {
          setConnected(false);
          setFiles([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch Google data:", err);
        if (isMounted) {
          setConnected(false);
          setFiles([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGoogleData();

    // Handle auth success messages
    const handleMessage = async (event) => {
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        toast.success("✅ Google account connected!");
        setConnected(true);
        try {
          const filesRes = await api.get(`/google/drive/${workflowId}/list`);
          if (isMounted) setFiles(filesRes.data.files || []);
        } catch (err) {
          console.error("❌ Failed to fetch files after auth:", err);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      isMounted = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [workflowId]);

  const connectGoogle = () => {
    const authUrl = `${import.meta.env.VITE_SERVER_URI}/api/google/auth`;
    const width = 600;
    const height = 500;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const newWindow = window.open(
      authUrl,
      "GoogleAuth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const timer = setInterval(() => {
      if (newWindow.closed) {
        clearInterval(timer);
        api.get(`/google/status/${workflowId}`).then((res) => {
          if (res.data.connected) {
            toast.success("Google account connected!");
            setConnected(true);
            api.get(`/google/drive/${workflowId}/list`).then((filesRes) => {
              setFiles(filesRes.data.files || []);
            });
          } else {
            toast.error("Failed to connect Google account");
          }
        });
      }
    }, 1000);
  };

  const handleSave = async () => {
    if (!spreadsheetId || !range) {
      toast.error("Spreadsheet and range are required.");
      return;
    }

    const newConfig = { spreadsheetId, range, values };

    // Update local state and parent node
    onChange({
      ...node,
      data: { ...node.data, config: newConfig },
    });

    try {
      await api.post(`/google/sheets/${workflowId}/save`, {
        nodeId: node.id,
        config: newConfig,
      });
      toast.success("Google Sheets config saved!");
      if (onSave) onSave();
    } catch (err) {
      console.error("❌ Failed to save Google Sheets config:", err);
      toast.error("Failed to save Google Sheets config.");
    }
  };

  if (loading) return <p>Checking Google connection...</p>;

  if (!connected) {
    return (
      <div className="p-4">
        <p className="mb-2">
          You need to connect your Google Account to continue.
        </p>
        <button
          onClick={connectGoogle}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Connect Google Account
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium">Select Spreadsheet</label>
        <select
          value={spreadsheetId}
          onChange={(e) => setSpreadsheetId(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Select File --</option>
          {files
            .filter((f) => f.mimeType?.includes("spreadsheet"))
            .map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Range (e.g. Sheet1!A1:D1)
        </label>
        <input
          type="text"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Values (comma separated)
        </label>
        <input
          type="text"
          value={values}
          onChange={(e) => setValues(e.target.value)}
          placeholder="John, Doe, john@example.com"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save Config
      </button>
    </div>
  );
}

export default GoogleSheetsConfig;
