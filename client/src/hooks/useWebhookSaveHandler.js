import { useCallback } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

export function useModuleSaveHandler(workflowId, userId, organizationId) {
  const handleSaveModule = useCallback(
    async (node) => {
      try {
        if (!node) {
          toast.error("No module selected");
          return;
        }

        const actionType = node.data?.actionType || node.actionType;

        /**
         * ==========================
         * WEBHOOK MODULE SAVE
         * ==========================
         */
        if (actionType === "webhook") {
          const secret = node.data?.secret;
          const requestMethod = node.data?.requestMethod || "POST";

          if (!secret) {
            toast.error(
              "No webhook secret found. Open the webhook config first."
            );
            return;
          }

          // Build webhook payload
          const payload = {
            userId,
            organizationId,
            workflowId,
            url: `${
              import.meta.env.VITE_SERVER_URI
            }/api/triggers/public/${workflowId}/${secret}`,
            event: "workflow.started",
            status: "active",
            secret,
            requestMethod, // ✅ SAVE REQUEST METHOD
          };

          await api.put(`/triggers/${workflowId}/update-trigger`, payload);
          toast.success("Webhook saved successfully.");
        }

        /**
         * TODO:
         * - Add handling for other modules (email, slack, delay, etc.)
         */
      } catch (err) {
        console.error("handleSaveModule error:", err);

        const status = err.response?.status;
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unknown error occurred";

        switch (status) {
          case 400:
            toast.error(`Bad request: ${message}`);
            break;
          case 401:
            toast.error("You are not authorized. Please log in again.");
            break;
          case 403:
            toast.error("You do not have permission to update this workflow.");
            break;
          case 404:
            toast.error("Workflow not found or does not exist.");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(`Failed to save module: ${message}`);
        }
      }
    },
    [workflowId, userId, organizationId]
  );

  return { handleSaveModule };
}
