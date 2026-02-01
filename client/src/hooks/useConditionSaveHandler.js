import { useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

/**
 * Hook for handling condition node save/load
 * Manages condition configuration persistence
 */
export const useConditionSaveHandler = () => {
  const saveConditionConfig = useCallback(
    async (workflowId, condition, nodeId) => {
      try {
        // Validate that we have required fields
        if (!condition.config || !condition.config.rules) {
          throw new Error("Invalid condition configuration");
        }

        if (condition.config.rules.length === 0) {
          throw new Error("At least one rule is required");
        }

        // Save to backend
        const response = await api.put(`/workflows/${workflowId}`, {
          actions: [
            {
              nodeId,
              type: "condition",
              service: "condition",
              config: condition.config,
            },
          ],
        });

        if (response.data.success) {
          toast.success("Condition saved successfully!");
          return response.data.workflow;
        } else {
          throw new Error(response.data.message || "Failed to save condition");
        }
      } catch (err) {
        console.error("Error saving condition:", err);
        toast.error(err.message || "Failed to save condition");
        throw err;
      }
    },
    [],
  );

  const loadConditionConfig = useCallback((action) => {
    // Load condition config from action object
    if (!action || !action.config) {
      return {
        mode: "all",
        rules: [],
        name: "Condition",
      };
    }

    return {
      mode: action.config.mode || "all",
      rules: action.config.rules || [],
      name: action.config.name || "Condition",
    };
  }, []);

  return {
    saveConditionConfig,
    loadConditionConfig,
  };
};
