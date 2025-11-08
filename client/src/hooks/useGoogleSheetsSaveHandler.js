import toast from "react-hot-toast";
import api from "../utils/api";
import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";

export const useGoogleSheetsSaveHandler = (workflowId) => {
  const { setNodes } = useReactFlow();

  const handleSaveGoogleSheets = useCallback(
    async (node, onClose) => {
      try {
        await api.post(`/google/sheets/${workflowId}/save`, {
          nodeId: node.id,
          config: node.data.config,
        });

        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id ? { ...n, data: { ...node.data } } : n
          )
        );

        toast.success("✅ Google Sheets saved!");
        if (onClose) onClose();
      } catch (err) {
        console.error("❌ Failed to save Google Sheets node:", err);
        toast.error("Failed to save Google Sheets node.");
      }
    },
    [workflowId, setNodes]
  );

  return { handleSaveGoogleSheets };
};
