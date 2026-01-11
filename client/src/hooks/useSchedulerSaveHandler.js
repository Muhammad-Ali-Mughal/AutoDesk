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

        const {
          frequency,
          time,
          timezone,
          dayOfWeek,
          dayOfMonth,
          cron,
          minute,
          runOnce,
          runAt,
        } = node.data || {};
        if (!frequency && !runOnce) {
          toast.error("Scheduler configuration is incomplete.");
          return;
        }

        // Build cron based on frequency
        let derivedCron = cron;
        if (runOnce) {
          if (!runAt || !time) {
            toast.error("Please select a date and time.");
            return;
          }
          const date = new Date(runAt);
          const [hour, min] = time.split(":");
          derivedCron = `${min} ${hour} ${date.getDate()} ${
            date.getMonth() + 1
          } *`;
        } else if (frequency === "custom") {
          if (!derivedCron) {
            toast.error("Please provide a cron expression.");
            return;
          }
        } else if (frequency === "hourly") {
          const minuteValue =
            typeof minute === "number" ? minute : Number(minute) || 0;
          derivedCron = `${minuteValue} * * * *`;
        } else {
          if (!time) {
            toast.error("Please select a time.");
            return;
          }

          const [hour, minute] = time.split(":");
          if (frequency === "daily") {
            derivedCron = `${minute} ${hour} * * *`;
          } else if (frequency === "weekly") {
            const day = dayOfWeek ?? 1;
            derivedCron = `${minute} ${hour} * * ${day}`;
          } else if (frequency === "monthly") {
            const day = dayOfMonth ?? 1;
            derivedCron = `${minute} ${hour} ${day} * *`;
          } else {
            toast.error("Invalid frequency selected.");
            return;
          }
        }

        // Build payload
        const payload = {
          workflowId,
          frequency: runOnce ? "once" : frequency,
          time,
          cron: derivedCron,
          dayOfWeek,
          dayOfMonth,
          minute,
          timezone,
          runOnce: !!runOnce,
          runAt: runAt || null,
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
