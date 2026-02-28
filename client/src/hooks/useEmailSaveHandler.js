import { useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export const useEmailSaveHandler = (workflowId) => {
  const normalizeEmailPayload = (payload) => ({
    to: (payload?.to || "").trim(),
    subject: (payload?.subject || "").trim(),
    body: payload?.body || "",
  });

  const handleSaveEmail = useCallback(
    async (node, onSuccess) => {
      try {
        if (!workflowId) {
          toast.error("No workflow ID provided");
          return;
        }

        const normalized = normalizeEmailPayload({
          to: node.data?.to,
          subject: node.data?.subject,
          body: node.data?.body,
        });

        if (!normalized.to || !normalized.body) {
          toast.error("Recipient and body are required");
          return;
        }

        const payload = {
          nodeId: node.id,
          workflowId,
          type: "email",
          service: "email",
          to: normalized.to,
          subject: normalized.subject,
          body: normalized.body,
        };

        const res = await api.get(`/email/${workflowId}/node/${node.id}`);
        const existing = res.data?.emailAction;

        if (existing) {
          const existingNormalized = normalizeEmailPayload(existing);
          const isUnchanged =
            existingNormalized.to === normalized.to &&
            existingNormalized.subject === normalized.subject &&
            existingNormalized.body === normalized.body;

          if (isUnchanged) {
            toast("Email config already saved");
            onSuccess?.();
            return;
          }

          await api.put(`/email/${workflowId}/node/${node.id}`, payload);
          toast.success("Email configuration updated");
        } else {
          await api.post(`/email/${workflowId}`, payload);
          toast.success("Email configuration saved");
        }

        onSuccess?.();
      } catch (err) {
        console.error("Failed to save email config:", err);
        toast.error(
          err.response?.data?.message || "Failed to save email config"
        );
      }
    },
    [workflowId]
  );

  return { handleSaveEmail };
};
