import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

const REQUEST_METHODS = ["POST", "GET", "PUT", "PATCH", "DELETE"];

function WebhookConfig({ node, workflowId }) {
  const [secret, setSecret] = useState("");
  const [requestMethod, setRequestMethod] = useState("POST");
  const [loading, setLoading] = useState(true);

  // Generate a new secret (local only)
  const generateSecret = () =>
    (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
    Math.random().toString(36).substring(2, 15);

  // Initialize webhook config
  const initializeWebhook = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/triggers/${workflowId}/trigger-secret`);
      const { secret: workflowSecret, requestMethod: dbMethod } =
        res.data || {};

      if (workflowSecret) {
        setSecret(workflowSecret);
        setRequestMethod(dbMethod || "POST");

        node.data = {
          ...node.data,
          secret: workflowSecret,
          requestMethod: dbMethod || "POST",
        };
      } else {
        const newSecret = generateSecret();
        setSecret(newSecret);

        node.data = {
          ...node.data,
          secret: newSecret,
          requestMethod: "POST",
        };
      }
    } catch (err) {
      console.error("Failed to fetch webhook config:", err);
      toast.error("Failed to load webhook");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workflowId && node) {
      initializeWebhook();
    }
  }, [workflowId, node]);

  const webhookUrl = secret
    ? `${
        import.meta.env.VITE_SERVER_URI
      }/api/triggers/public/${workflowId}/${secret}`
    : "";

  const copyToClipboard = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied!");
  };

  const testWebhook = async () => {
    try {
      await api.request({
        url: `/triggers/public/${workflowId}/${secret}`,
        method: requestMethod,
        data: {
          test: true,
          source: "UI Test",
        },
      });

      toast.success("Webhook Test Success!");
    } catch (err) {
      console.error(err);
      toast.error(
        "Webhook Test Failed: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const regenerateWebhook = () => {
    const newSecret = generateSecret();
    setSecret(newSecret);

    node.data = {
      ...node.data,
      secret: newSecret,
    };

    toast.success("New webhook URL generated (not saved)!");
  };

  const onMethodChange = (e) => {
    const value = e.target.value;
    setRequestMethod(value);

    node.data = {
      ...node.data,
      requestMethod: value,
    };
  };

  if (loading) return <div>Loading webhook...</div>;

  return (
    <div className="space-y-5">
      {/* Webhook Endpoint */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Webhook Endpoint
        </label>

        <div className="flex items-stretch rounded-lg overflow-hidden shadow-sm border border-teal-600">
          {/* Request Method */}
          <select
            value={requestMethod}
            onChange={onMethodChange}
            className="px-4 py-2 bg-teal-600 text-white font-semibold text-sm 
                     focus:outline-none cursor-pointer border-r border-teal-700"
          >
            {REQUEST_METHODS.map((method) => (
              <option key={method} value={method} className="text-black">
                {method}
              </option>
            ))}
          </select>

          {/* Webhook URL */}
          <input
            type="text"
            value={webhookUrl}
            readOnly
            className="flex-1 px-4 py-2 bg-grey-200 text-gray-500 text-sm 
                     placeholder-white/70 focus:outline-none"
          />

          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="px-4 bg-teal-700 hover:bg-teal-800 
                     text-white text-sm font-medium transition"
          >
            Copy
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Only <span className="font-semibold">{requestMethod}</span> requests
          will trigger this workflow
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={testWebhook}
          className="px-5 py-2 rounded-lg bg-teal-600 text-white 
                   font-semibold hover:bg-teal-700 transition"
        >
          Send Test Webhook
        </button>

        <button
          onClick={regenerateWebhook}
          className="px-5 py-2 rounded-lg bg-red-600 text-white 
                   font-semibold hover:bg-red-700 transition"
        >
          Regenerate URL
        </button>
      </div>
    </div>
  );
}

export default WebhookConfig;
