import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

function GoogleSheetsConfig({ node, workflowId, onChange }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [spreadsheetId, setSpreadsheetId] = useState(
    node?.data?.config?.spreadsheetId || ""
  );
  const [range, setRange] = useState(node?.data?.config?.range || "");
  const [values, setValues] = useState(node?.data?.config?.values || "");

  useEffect(() => {
    // 1. Check connection status on mount
    api
      .get(`/google/status/${workflowId}`)
      .then((res) => {
        if (res.data.connected) {
          setConnected(true);
          // preload files if connected
          api
            .get(`/google/drive/${workflowId}/list`)
            .then((filesRes) => setFiles(filesRes.data.files || []))
            .catch((err) => console.error("Failed to fetch files", err));
        }
      })
      .catch((err) => console.error("Failed to check Google status", err))
      .finally(() => setLoading(false));

    // 2. Handle postMessage from popup
    const handleMessage = (event) => {
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        toast.success("✅ Google account connected!");
        setConnected(true);
        api
          .get(`/google/drive/${workflowId}/list`)
          .then((res) => setFiles(res.data.files || []))
          .catch((err) => console.error("Failed to fetch files", err));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [workflowId]);

  const connectGoogle = () => {
    const authUrl = `${import.meta.env.VITE_SERVER_URI}/api/google/auth`;

    const width = 500;
    const height = 900;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const newWindow = window.open(
      authUrl,
      "GoogleAuth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Poll until window closes
    const timer = setInterval(() => {
      if (newWindow.closed) {
        clearInterval(timer);
        // re-check status
        api.get(`/google/status/${workflowId}`).then((res) => {
          if (res.data.connected) {
            toast.success("Google account connected!");
            setConnected(true);
            // fetch files
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

  const handleSave = () => {
    if (!spreadsheetId || !range) {
      toast.error("Spreadsheet and range are required.");
      return;
    }
    onChange({
      ...node,
      data: {
        ...node.data,
        config: { spreadsheetId, range, values },
      },
    });
    toast.success("Google Sheets config updated!");
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
            .filter((f) => f.mimeType.includes("spreadsheet"))
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
