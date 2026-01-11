import React, { useState, useEffect, useMemo } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useVariableDrop } from "../hooks/useVariableDrop";

function GoogleSheetsConfig({ node, workflowId, onChange, onSave }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [sheetTabs, setSheetTabs] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(false);

  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [range, setRange] = useState("");
  const [rangeMode, setRangeMode] = useState("guided");
  const [sheetName, setSheetName] = useState("");
  const [useCustomSheet, setUseCustomSheet] = useState(false);
  const [startColumn, setStartColumn] = useState("A");
  const [startRow, setStartRow] = useState(1);
  const [endColumn, setEndColumn] = useState("");
  const [endRow, setEndRow] = useState("");
  const [valuesList, setValuesList] = useState([""]);

  const { allowDrop, onVariableDrop } = useVariableDrop();
  const sheetOptions = useMemo(
    () => files.filter((f) => f.mimeType?.includes("spreadsheet")),
    [files]
  );

  const parseRange = (rangeValue) => {
    if (!rangeValue || !rangeValue.includes("!")) return null;
    const [sheet, cells] = rangeValue.split("!");
    if (!cells) return null;
    const [start, end] = cells.split(":");
    const startMatch = start?.match(/^([A-Z]+)(\d+)$/i);
    const endMatch = end?.match(/^([A-Z]+)(\d+)$/i);

    return {
      sheet: sheet || "",
      startColumn: startMatch?.[1]?.toUpperCase() || "",
      startRow: startMatch?.[2] ? Number(startMatch[2]) : "",
      endColumn: endMatch?.[1]?.toUpperCase() || "",
      endRow: endMatch?.[2] ? Number(endMatch[2]) : "",
    };
  };

  // 🟢 Load config from DB on mount
  useEffect(() => {
    const fetchNodeConfig = async () => {
      try {
        const res = await api.get(`/google/sheets/${workflowId}/${node.id}`);
        if (res.data?.config) {
          setSpreadsheetId(res.data.config.spreadsheetId || "");
          setRange(res.data.config.range || "");
          const rawValues = res.data.config.values || "";
          const parsedValues = rawValues
            ? rawValues.split(",").map((v) => v.trim())
            : [""];
          setValuesList(parsedValues.length ? parsedValues : [""]);

          const parsedRange = parseRange(res.data.config.range || "");
          if (parsedRange) {
            setSheetName(parsedRange.sheet);
            setStartColumn(parsedRange.startColumn || "A");
            setStartRow(parsedRange.startRow || 1);
            setEndColumn(parsedRange.endColumn || "");
            setEndRow(parsedRange.endRow || "");
          }
        } else {
          // fallback to node data (if local unsaved config exists)
          setSpreadsheetId(node?.data?.config?.spreadsheetId || "");
          setRange(node?.data?.config?.range || "");
          const rawValues = node?.data?.config?.values || "";
          const parsedValues = rawValues
            ? rawValues.split(",").map((v) => v.trim())
            : [""];
          setValuesList(parsedValues.length ? parsedValues : [""]);

          const parsedRange = parseRange(node?.data?.config?.range || "");
          if (parsedRange) {
            setSheetName(parsedRange.sheet);
            setStartColumn(parsedRange.startColumn || "A");
            setStartRow(parsedRange.startRow || 1);
            setEndColumn(parsedRange.endColumn || "");
            setEndRow(parsedRange.endRow || "");
          }
        }
      } catch (err) {
        console.error("❌ Failed to load node config:", err);
        // fallback if API fails
        setSpreadsheetId(node?.data?.config?.spreadsheetId || "");
        setRange(node?.data?.config?.range || "");
        const rawValues = node?.data?.config?.values || "";
        const parsedValues = rawValues
          ? rawValues.split(",").map((v) => v.trim())
          : [""];
        setValuesList(parsedValues.length ? parsedValues : [""]);

        const parsedRange = parseRange(node?.data?.config?.range || "");
        if (parsedRange) {
          setSheetName(parsedRange.sheet);
          setStartColumn(parsedRange.startColumn || "A");
          setStartRow(parsedRange.startRow || 1);
          setEndColumn(parsedRange.endColumn || "");
          setEndRow(parsedRange.endRow || "");
        }
      }
    };

    fetchNodeConfig();
  }, [workflowId, node?.id]);

  useEffect(() => {
    if (rangeMode !== "guided") return;
    if (!sheetName || !startColumn || !startRow) return;

    const endCell =
      endColumn && endRow ? `${endColumn}${endRow}` : undefined;
    const nextRange = `${sheetName}!${startColumn}${startRow}${
      endCell ? `:${endCell}` : ""
    }`;
    setRange(nextRange);
  }, [rangeMode, sheetName, startColumn, startRow, endColumn, endRow]);

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

  useEffect(() => {
    let mounted = true;
    const loadTabs = async () => {
      if (!spreadsheetId || !workflowId) {
        setSheetTabs([]);
        return;
      }
      try {
        setLoadingTabs(true);
        const res = await api.get(
          `/google/sheets/${workflowId}/tabs?spreadsheetId=${spreadsheetId}`
        );
        if (mounted) {
          setSheetTabs(res.data.tabs || []);
        }
      } catch (err) {
        if (mounted) setSheetTabs([]);
      } finally {
        if (mounted) setLoadingTabs(false);
      }
    };

    loadTabs();
    return () => {
      mounted = false;
    };
  }, [spreadsheetId, workflowId]);

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

    const values = valuesList.join(", ");
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
    <div className="p-4 max-h-[70vh] overflow-y-auto pr-1 space-y-5">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Destination
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium">
            Spreadsheet file
          </label>
          <select
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">-- Select File --</option>
            {sheetOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">
            Target range
          </label>
          <div className="flex gap-2">
            {["guided", "manual"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setRangeMode(mode)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  rangeMode === mode
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                {mode === "guided" ? "Guided" : "Manual"}
              </button>
            ))}
          </div>
        </div>

        {rangeMode === "guided" ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">
                Sheet name
              </label>
              {sheetTabs.length > 0 && !useCustomSheet ? (
                <div className="space-y-2">
                  <select
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="">
                      {loadingTabs ? "Loading tabs..." : "-- Select tab --"}
                    </option>
                    {sheetTabs.map((tab) => (
                      <option key={tab} value={tab}>
                        {tab}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setUseCustomSheet(true)}
                    className="text-xs text-teal-700 hover:text-teal-800"
                  >
                    Use custom sheet name
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Sheet1"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                  {sheetTabs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUseCustomSheet(false)}
                      className="text-xs text-gray-500 hover:text-gray-600"
                    >
                      Select from detected tabs
                    </button>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Start column
              </label>
              <input
                type="text"
                value={startColumn}
                onChange={(e) => setStartColumn(e.target.value.toUpperCase())}
                placeholder="A"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Start row
              </label>
              <input
                type="number"
                min={1}
                value={startRow}
                onChange={(e) => setStartRow(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                End column
              </label>
              <input
                type="text"
                value={endColumn}
                onChange={(e) => setEndColumn(e.target.value.toUpperCase())}
                placeholder="D"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                End row
              </label>
              <input
                type="number"
                min={1}
                value={endRow}
                onChange={(e) => setEndRow(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Range (e.g. Sheet1!A1:D1)
            </label>
            <input
              type="text"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              onDrop={onVariableDrop(setRange, range)}
              onDragOver={allowDrop}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        )}

        <div className="text-xs text-gray-500">
          Preview: <span className="font-mono">{range || "--"}</span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <div className="text-sm font-semibold text-gray-700">Row values</div>
        <div className="space-y-2">
          {valuesList.map((value, index) => (
            <div key={`row-${index}`} className="flex items-center gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const next = [...valuesList];
                  next[index] = e.target.value;
                  setValuesList(next);
                }}
                onDrop={onVariableDrop(
                  (nextValue) => {
                    const next = [...valuesList];
                    next[index] = nextValue;
                    setValuesList(next);
                  },
                  value
                )}
                onDragOver={allowDrop}
                placeholder={`Value ${index + 1}`}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
              {valuesList.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = valuesList.filter((_, i) => i !== index);
                    setValuesList(next.length ? next : [""]);
                  }}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setValuesList([...valuesList, ""])}
          className="text-xs text-teal-700 hover:text-teal-800"
        >
          + Add value
        </button>
        <p className="text-xs text-gray-500">
          Tip: Drag webhook fields into any value input.
        </p>
        <div className="rounded-lg border border-dashed border-gray-200 p-3">
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
            Preview row
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {valuesList.map((value, index) => (
              <div
                key={`preview-${index}`}
                className="rounded-md bg-gray-50 px-2 py-1 text-gray-600"
              >
                {value || `Value ${index + 1}`}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-700"
      >
        Save Config
      </button>
    </div>
  );
}

export default GoogleSheetsConfig;
