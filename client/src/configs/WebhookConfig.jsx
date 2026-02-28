import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

const REQUEST_METHODS = ["POST", "GET", "PUT", "PATCH", "DELETE"];
const LISTEN_TIMEOUT = 60000;

function WebhookConfig({ node, workflowId, onContextUpdate }) {
  const [secret, setSecret] = useState("");
  const [requestMethod, setRequestMethod] = useState("POST");
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [parsedFields, setParsedFields] = useState([]);

  const pollingRef = useRef(null);
  const timeoutRef = useRef(null);
  const hasNotifiedPayloadRef = useRef(false);
  const listenSessionRef = useRef(0);
  const activeSessionRef = useRef(0);
  const isListeningRef = useRef(false);

  const setListeningState = (value) => {
    isListeningRef.current = value;
    setIsListening(value);
  };

  /* ----------------------------- Utilities ----------------------------- */

  const generateSecret = () =>
    crypto?.randomUUID?.() || Math.random().toString(36).substring(2, 15);

  const ensureWebhookExists = async (override = {}) => {
    let effectiveSecret = override.secret || secret;

    if (!effectiveSecret) {
      effectiveSecret = generateSecret();
      setSecret(effectiveSecret);
      node.data = { ...node.data, secret: effectiveSecret };
    }

    await api.put(`/triggers/${workflowId}/update-trigger`, {
      url: `${
        import.meta.env.VITE_SERVER_URI
      }/api/triggers/public/${workflowId}/${effectiveSecret}`,
      event: "workflow.started",
      secret: effectiveSecret,
      requestMethod: override.requestMethod || requestMethod,
      status: "active",
    });
  };

  /* --------------------------- Initialization -------------------------- */

  const initializeWebhook = async () => {
    try {
      setLoading(true);
      setSecret("");
      setRequestMethod("POST");
      setParsedFields([]);
      setListeningState(false);

      const res = await api.get(`/triggers/${workflowId}/trigger-secret`);
      const {
        secret: dbSecret,
        requestMethod: dbMethod,
        parsedFields,
        samplePayload,
        isListening,
      } = res.data || {};

      /**
       * If webhook already exists in DB → hydrate UI
       */
      if (dbSecret) {
        setSecret(dbSecret);
        setRequestMethod(dbMethod || "POST");
        setParsedFields(parsedFields || []);
        setListeningState(isListening || false);

        node.data = {
          ...node.data,
          secret: dbSecret,
          requestMethod: dbMethod || "POST",
        };

        onContextUpdate?.({
          parsedFields: parsedFields || [],
          samplePayload: samplePayload || null,
        });
      } else {
        const newSecret = generateSecret();
        setSecret(newSecret);

        node.data = {
          ...node.data,
          secret: newSecret,
          requestMethod: "POST",
        };

        await ensureWebhookExists({
          secret: newSecret,
          requestMethod: "POST",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workflowId && node) initializeWebhook();
    return cleanupListening;
  }, [workflowId]);

  /* ----------------------------- Webhook URL ---------------------------- */

  const webhookUrl = secret
    ? `${
        import.meta.env.VITE_SERVER_URI
      }/api/triggers/public/${workflowId}/${secret}`
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied");
  };

  /* ----------------------------- Config Actions -------------------------- */

  const onMethodChange = async (e) => {
    const value = e.target.value;
    setRequestMethod(value);

    node.data = { ...node.data, requestMethod: value };

    // 🔥 UPDATE DB IMMEDIATELY
    await ensureWebhookExists({ requestMethod: value });
  };

  const regenerateWebhook = async () => {
    const newSecret = generateSecret();
    setSecret(newSecret);

    node.data = { ...node.data, secret: newSecret };

    // 🔥 UPDATE DB IMMEDIATELY
    await ensureWebhookExists({ secret: newSecret });

    toast.success("New webhook URL generated");
  };

  const testWebhook = async () => {
    try {
      await api.request({
        url: `/triggers/public/${workflowId}/${secret}`,
        method: requestMethod,
        data: { test: true },
      });
      toast.success("Webhook test successful");
    } catch (err) {
      toast.error(err.response?.data?.error || "Webhook test failed");
    }
  };

  /* ----------------------------- Listening ------------------------------ */

  const startListening = async () => {
    if (isListening) return;

    try {
      await ensureWebhookExists();

      const sessionId = ++listenSessionRef.current;
      activeSessionRef.current = sessionId;
      hasNotifiedPayloadRef.current = false;

      setListeningState(true);
      setParsedFields([]);

      await api.post(`/triggers/${workflowId}/webhook/listen`);
      toast.success("Listening for incoming webhook");

      clearInterval(pollingRef.current);
      clearTimeout(timeoutRef.current);
      pollingRef.current = setInterval(() => fetchWebhookData(sessionId), 2500);
      timeoutRef.current = setTimeout(() => {
        toast("Listening timed out");
        stopListening();
      }, LISTEN_TIMEOUT);
    } catch {
      setListeningState(false);
      toast.error("Failed to start listening");
    }
  };

  const stopListening = async () => {
    try {
      await api.post(`/triggers/${workflowId}/webhook/stop-listen`);
    } finally {
      cleanupListening();
    }
  };

  const cleanupListening = () => {
    setListeningState(false);
    activeSessionRef.current = 0;
    clearInterval(pollingRef.current);
    clearTimeout(timeoutRef.current);
    pollingRef.current = null;
    timeoutRef.current = null;
  };

  const fetchWebhookData = async (sessionId) => {
    try {
      if (!isListeningRef.current || activeSessionRef.current !== sessionId) {
        return;
      }

      const res = await api.get(`/triggers/${workflowId}/trigger-secret`);
      const { parsedFields, samplePayload } = res.data || {};

      if (parsedFields?.length) setParsedFields(parsedFields);

      if (samplePayload) {
        if (activeSessionRef.current !== sessionId) return;

        onContextUpdate?.({
          parsedFields: parsedFields || [],
          samplePayload,
        });

        if (!hasNotifiedPayloadRef.current) {
          hasNotifiedPayloadRef.current = true;
          toast.success("Payload received");
        }
        cleanupListening();
      }
    } catch {
      return;
    }
  };

  /* ------------------------------- Render ------------------------------- */

  if (loading) {
    return <div className="animate-pulse text-gray-500">Loading webhook…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Endpoint */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Webhook Endpoint
        </label>

        <div className="flex items-stretch rounded-lg overflow-hidden border border-teal-600">
          <select
            value={requestMethod}
            onChange={onMethodChange}
            className="px-4 py-2 bg-teal-600 text-white font-semibold text-sm"
          >
            {REQUEST_METHODS.map((method) => (
              <option key={method} value={method} className="text-black">
                {method}
              </option>
            ))}
          </select>

          <input
            readOnly
            value={webhookUrl}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-500 text-sm"
          />

          <button
            onClick={copyToClipboard}
            className="px-4 bg-teal-700 text-white"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Listening */}
      <div className="space-y-2">
        {!isListening && (
          <button
            onClick={startListening}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
          >
            {parsedFields.length ? "Re-listen" : "Start Listening"}
          </button>
        )}

        {isListening && (
          <div className="flex items-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
            <span className="font-semibold text-indigo-700">
              Listening for webhook…
            </span>
            <button
              onClick={stopListening}
              className="text-sm text-red-600 underline"
            >
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Variables */}
      {parsedFields.length > 0 && (
        <div className="border rounded-lg bg-gray-50 p-4">
          <h4 className="font-semibold mb-3 text-gray-700">
            Detected Variables
          </h4>
          <ul className="space-y-2 text-sm">
            {parsedFields.map((f) => (
              <li
                key={f.key}
                className="flex justify-between bg-white p-2 border rounded"
              >
                <span className="font-mono text-indigo-600">{f.key}</span>
                <span className="text-gray-500">{f.type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={testWebhook}
          className="px-5 py-2 bg-teal-600 text-white rounded-lg"
        >
          Send Test
        </button>

        <button
          onClick={regenerateWebhook}
          className="px-5 py-2 bg-red-600 text-white rounded-lg"
        >
          Regenerate URL
        </button>
      </div>
    </div>
  );
}

export default WebhookConfig;
