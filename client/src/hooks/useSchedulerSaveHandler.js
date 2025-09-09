import { useCallback } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

export function useSchedulerSaveHandler(workflowId) {
  const handleSaveScheduler = useCallback(
    async (node, closePopup) => {
      try {
        if (!node) {
          toast.error("No module selected");
          return;
        }

        const actionType = node.data?.actionType || node.actionType;
        if (actionType !== "schedule") return;

        const { frequency, time } = node.data || {};
        if (!frequency || !time) {
          toast.error("Scheduler configuration is incomplete.");
          return;
        }

        // Extract hours/minutes
        const [hour, minute] = time.split(":");

        // Build cron based on frequency
        let cron;
        if (frequency === "daily") {
          cron = `${minute} ${hour} * * *`; // every day at HH:MM
        } else if (frequency === "weekly") {
          cron = `${minute} ${hour} * * 0`; // every Sunday at HH:MM
        } else if (frequency === "hourly") {
          cron = `0 * * * *`; // every hour on the hour
        } else {
          toast.error("Invalid frequency selected.");
          return;
        }

        // Build payload
        const payload = {
          workflowId,
          frequency,
          time,
          cron,
          status: "active",
        };

        console.log(payload);
        

        // Send to backend
        await api.post(`/schedules/${workflowId}`, payload);

        toast.success("Scheduler saved successfully.");
        if (typeof closePopup === "function") closePopup();
      } catch (err) {
        console.error("handleSaveScheduler error:", err);

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
            toast.error("Unauthorized. Please log in again.");
            break;
          case 403:
            toast.error("You do not have permission to update this workflow.");
            break;
          case 404:
            toast.error("Workflow or schedule not found.");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(`Failed to save scheduler: ${message}`);
        }
      }
    },
    [workflowId]
  );

  return { handleSaveScheduler };
}
