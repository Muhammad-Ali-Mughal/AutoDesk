import React, { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "../../components/shared/CustomNode";
import ModulesPanel from "../../components/shared/ModulesPanel";
import ModulePopup from "../../components/shared/ModulePopup";
import ContextMenu from "../../components/shared/ContextMenu";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { moduleRules } from "../../utils/moduleRules";
import { actionStyles } from "../../utils/actionStyles";
import WebhookConfig from "../../configs/WebhookConfig";
import DefaultConfig from "../../configs/DefaultConfig";
import EmailConfig from "../../configs/EmailConfig";
import SchedulerConfig from "../../configs/SchedulerConfig";
import { useModuleSaveHandler } from "../../hooks/useWebhookSaveHandler";
import { useSchedulerSaveHandler } from "../../hooks/useSchedulerSaveHandler";
import { useEmailSaveHandler } from "../../hooks/useEmailSaveHandler";

const nodeTypes = { custom: CustomNode };

const getActionType = (label = "") => {
  const normalized = label.toLowerCase().trim().replace(/\s+/g, "_");

  if (normalized.includes("webhook")) return "webhook";
  if (normalized.includes("schedule")) return "schedule";
  if (normalized.includes("email")) return "email";
  if (normalized.includes("slack")) return "slack";
  if (normalized.includes("google_sheets")) return "google_sheets";
  if (normalized.includes("discord")) return "discord";
  if (normalized.includes("condition")) return "condition";
  if (normalized.includes("delay")) return "delay";
  if (normalized.includes("ai")) return "ai_prompt";

  return "custom";
};

function WorkflowEditorInner() {
  const { id: workflowId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { handleSaveModule } = useModuleSaveHandler(workflowId);
  const { handleSaveScheduler } = useSchedulerSaveHandler(workflowId);
  const { handleSaveEmail } = useEmailSaveHandler(workflowId);

  // ✅ Load workflow when editor opens
  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!workflowId) return;

      try {
        const res = await api.get(`/workflows/${workflowId}`);
        const wf = res.data.workflow;

        const decoratedNodes = (wf.nodes || []).map((n) => {
          const actionType = n.data?.actionType || getActionType(n.data?.label);
          const secret =
            actionType === "webhook" && wf.triggers?.type === "webhook"
              ? wf.triggers.webhookSecret
              : undefined;

          return {
            ...n,
            data: {
              ...n.data,
              actionType,
              service: n.data?.service || n.data?.label || "Custom",
              secret,
              // 🔑 normalize config here
              config: n.data?.config || n.config || {},
            },
          };
        });

        setNodes(decoratedNodes);
        setEdges(wf.edges || []);
      } catch (err) {
        console.error(
          "Error loading workflow:",
          err.response?.data || err.message
        );
        toast.error("Failed to load workflow");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [workflowId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const sourceNode = nodes.find((n) => n.id === params.source);
        const targetNode = nodes.find((n) => n.id === params.target);

        if (!sourceNode || !targetNode) return eds;

        if (!sourceNode.data.allowMultipleOutgoing) {
          const existingOut = eds.filter((e) => e.source === sourceNode.id);
          if (existingOut.length > 0) {
            toast.error(
              `${sourceNode.data.label} can only connect to one node.`
            );
            return eds;
          }
        }

        if (!targetNode.data.allowMultipleIncoming) {
          const existingIn = eds.filter((e) => e.target === targetNode.id);
          if (existingIn.length > 0) {
            toast.error(
              `${targetNode.data.label} accepts only one incoming connection.`
            );
            return eds;
          }
        }

        return addEdge(params, eds);
      });
    },
    [nodes, setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const moduleName = event.dataTransfer.getData("application/reactflow");
      if (!moduleName) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const rules = moduleRules[moduleName] || {
        allowMultipleOutgoing: true,
        allowMultipleIncoming: true,
      };

      const actionType = getActionType(moduleName);
      const workflowWebhookSecret =
        actionType === "webhook"
          ? nodes.find((n) => n.data?.actionType === "webhook")?.data?.secret
          : undefined;

      const newNode = {
        id: `${+new Date()}`,
        type: "custom",
        position,
        data: {
          label: moduleName,
          actionType,
          service: moduleName,
          ...rules,
          onClick: () => {
            setActiveNode(newNode);
            setPopupOpen(true);
          },
        },
        config: {},
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, screenToFlowPosition, nodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, node });
  }, []);

  const handleMenuAction = (action) => {
    if (!contextMenu?.node) return;
    const nodeId = contextMenu.node.id;

    switch (action) {
      case "edit":
        setActiveNode({
          ...contextMenu.node.data,
          id: contextMenu.node.id,
        });
        setPopupOpen(true);
        break;
      case "duplicate":
        const duplicateNode = {
          ...contextMenu.node,
          id: `${+new Date()}`,
          position: {
            x: contextMenu.node.position.x + 50,
            y: contextMenu.node.position.y + 50,
          },
        };
        setNodes((nds) => [...nds, duplicateNode]);
        break;
      case "delete":
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) =>
          eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
        );
        break;
      default:
        break;
    }
  };

  const handleSaveWorkflow = async () => {
    if (!workflowId) {
      toast.error("No workflow ID found.");
      return;
    }

    try {
      setSaving(true);

      const webhookNode = nodes.find((n) => n.data?.actionType === "webhook");
      const actions = nodes.map((n) => {
        const { actionType, service, config } = n.data;
        return {
          nodeId: n.id,
          type: actionType,
          service: service || actionType,
          config: config || {},
        };
      });
      const payload = {
        nodes: nodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            secret: n.data?.secret,
          },
        })),
        edges,
        actions, // ✅ includes service now
        triggers: webhookNode
          ? {
              type: "webhook",
              webhookSecret: webhookNode.data.secret,
            }
          : null,
      };

      await api.put(`/workflows/${workflowId}`, payload);

      toast.success("Workflow saved successfully!");
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to save workflow");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          {/* <p className="text-gray-500">Loading workflow...</p> */}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeContextMenu={onNodeContextMenu}
        fitView
        nodeTypes={nodeTypes}
      >
        <MiniMap />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      <ModulesPanel />

      <ModulePopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSave={() => {
          if (activeNode?.actionType === "schedule") {
            handleSaveScheduler(activeNode, () => setPopupOpen(false));
          } else if (activeNode?.actionType === "email") {
            handleSaveEmail(activeNode, () => setPopupOpen(false));
          } else {
            handleSaveModule(activeNode, () => setPopupOpen(false));
          }
        }}
        title={activeNode?.label || "Module"}
        headerColor={actionStyles[activeNode?.actionType]?.color || "#444"}
      >
        {activeNode?.actionType === "schedule" ? (
          <SchedulerConfig node={activeNode} workflowId={workflowId} />
        ) : activeNode?.actionType === "webhook" ? (
          <WebhookConfig node={activeNode} workflowId={workflowId} />
        ) : activeNode?.actionType === "email" ? (
          <EmailConfig
            node={activeNode}
            workflowId={workflowId}
            onChange={(updatedNode) => {
              setActiveNode(updatedNode);
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === updatedNode.id
                    ? { ...n, data: { ...updatedNode } }
                    : n
                )
              );
            }}
          />
        ) : (
          <DefaultConfig node={activeNode} />
        )}
      </ModulePopup>

      <button
        onClick={handleSaveWorkflow}
        disabled={saving}
        className={`fixed top-6 right-6 px-5 py-3 rounded-full cursor-pointer shadow-lg transition font-semibold ${
          saving
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-purple-600 text-white hover:bg-purple-700"
        }`}
      >
        {saving ? "Saving..." : "Save Workflow"}
      </button>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={handleMenuAction}
        />
      )}
    </div>
  );
}

function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner />
    </ReactFlowProvider>
  );
}

export default WorkflowEditor;
