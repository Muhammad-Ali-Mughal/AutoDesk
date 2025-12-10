import { useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export const useEmailSaveHandler = (workflowId) => {
  const handleSaveEmail = useCallback(
    async (node, onSuccess) => {
      try {
        if (!workflowId) {
          toast.error("No workflow ID provided");
          return;
        }

        const payload = {
          nodeId: node.id,
          workflowId,
          type: "email",
          service: "email",
          to: node.data?.to || "",
          subject: node.data?.subject || "",
          body: node.data?.body || "",
        };

        // 🔍 First check if email action already exists
        const res = await api.get(`/email/${workflowId}/node/${node.id}`);
        const existing = res.data?.emailAction;

        if (existing) {
          // ✅ Update existing
          await api.put(`/email/${workflowId}/node/${node.id}`, payload);
          toast.success("Email configuration updated");
        } else {
          // ✅ Create new
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
