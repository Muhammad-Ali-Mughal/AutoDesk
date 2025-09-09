import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

function WebhookConfig({ node, workflowId }) {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(true);

  // Generate a new secret (local only)
  const generateSecret = () =>
    (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
    Math.random().toString(36).substring(2, 15);

  // Initialize webhook secret
  const initializeSecret = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/triggers/${workflowId}/trigger-secret`);
      const workflowSecret = res.data?.secret;

      if (workflowSecret) {
        // ✅ Trust DB if it exists
        setSecret(workflowSecret);
        node.data = { ...node.data, secret: workflowSecret };
      } else {
        // ✅ Only generate if none exists in DB
        const newSecret = generateSecret();
        setSecret(newSecret);
        node.data = { ...node.data, secret: newSecret };
      }
    } catch (err) {
      console.error("Failed to fetch webhook secret:", err);
      toast.error("Failed to load webhook");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workflowId && node) {
      initializeSecret();
    }
  }, [workflowId, node]);

  const webhookUrl = secret
    ? `${import.meta.env.VITE_SERVER_URI}/api/triggers/public/${workflowId}/${secret}`
    : "";

  const copyToClipboard = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied!");
  };

  const testWebhook = async () => {
    try {
      await api.post(`/triggers/public/${workflowId}/${secret}`, {
        test: true,
        source: "UI Test",
      });
      toast.success("Webhook Test Success!");
    } catch (err) {
      console.error(err);
      toast.error(
        "Webhook Test Failed: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const regenerateWebhook = () => {
    const newSecret = generateSecret();
    setSecret(newSecret);

    // Update node with new secret (not saved to DB here)
    node.data = {
      ...node.data,
      secret: newSecret,
    };

    toast.success("New webhook URL generated (not saved)!");
  };

  if (loading) return <div>Loading webhook...</div>;

  return (
    <div className="space-y-4">
      {/* Webhook URL */}
      <div>
        <label className="block text-sm font-medium mb-1">Webhook URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={webhookUrl}
            readOnly
            className="flex-1 px-3 py-2 border rounded bg-gray-100"
          />
          <button
            onClick={copyToClipboard}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={testWebhook}
          className="px-4 py-2 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700"
        >
          Send Test Webhook
        </button>

        <button
          onClick={regenerateWebhook}
          className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
        >
          Regenerate URL
        </button>
      </div>
    </div>
  );
}

export default WebhookConfig;
