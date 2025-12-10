import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

function GoogleDriveConfig({ node, workflowId, onChange }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [fileId, setFileId] = useState(node?.data?.config?.fileId || "");
  const [fileName, setFileName] = useState(node?.data?.config?.fileName || "");
  const [mimeType, setMimeType] = useState(
    node?.data?.config?.mimeType || "application/pdf"
  );

  // 1. Check Google connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await api.get(`/google/status/${workflowId}`);
        setConnected(res.data.connected);
        if (res.data.connected) {
          const filesRes = await api.get(`/google/drive/${workflowId}/list`);
          setFiles(filesRes.data.files || []);
        }
      } catch (err) {
        console.error("Connection check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkConnection();
  }, [workflowId]);

  const handleSave = () => {
    if (!fileId && !fileName) {
      toast.error("Select or provide a file.");
      return;
    }
    onChange({
      ...node,
      data: {
        ...node.data,
        config: { fileId, fileName, mimeType },
      },
    });
    toast.success("Google Drive config updated!");
  };

  if (loading) return <p>Checking Google connection...</p>;

  if (!connected) {
    return (
      <div className="p-4">
        <p className="mb-2">
          You need to connect your Google Account to continue.
        </p>
        <a
          href={`${import.meta.env.VITE_SERVER_URI}/google/auth`}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Connect Google Account
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium">
          Select File from Drive
        </label>
        <select
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Select File --</option>
          {files.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Or provide new file name
        </label>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="example.txt"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">MIME Type</label>
        <input
          type="text"
          value={mimeType}
          onChange={(e) => setMimeType(e.target.value)}
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

export default GoogleDriveConfig;
