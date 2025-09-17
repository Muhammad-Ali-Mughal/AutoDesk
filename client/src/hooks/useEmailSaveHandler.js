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
          config: {
            to: node.data?.to,
            subject: node.data?.subject,
            body: node.data?.body,
          },
        };

        await api.post(`/email/${workflowId}`, payload);

        toast.success("Email configuration saved");
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
