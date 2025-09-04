import React, { useCallback, useState } from "react";
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

const nodeTypes = { custom: CustomNode };

const moduleRules = {
  "Google Sheets": { allowMultipleOutgoing: false, allowMultipleIncoming: true },
  Webhook: { allowMultipleOutgoing: true, allowMultipleIncoming: true },
  Condition: { allowMultipleOutgoing: true, allowMultipleIncoming: true },
};

function WorkflowEditorInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const sourceNode = nodes.find((n) => n.id === params.source);
        const targetNode = nodes.find((n) => n.id === params.target);

        if (!sourceNode || !targetNode) return eds;

        if (!sourceNode.data.allowMultipleOutgoing) {
          const existingOut = eds.filter((e) => e.source === sourceNode.id);
          if (existingOut.length > 0) {
            alert(`${sourceNode.data.label} can only connect to one node.`);
            return eds;
          }
        }

        if (!targetNode.data.allowMultipleIncoming) {
          const existingIn = eds.filter((e) => e.target === targetNode.id);
          if (existingIn.length > 0) {
            alert(`${targetNode.data.label} accepts only one incoming connection.`);
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

      const newNode = {
        id: `${+new Date()}`,
        type: "custom",
        position,
        data: {
          label: moduleName,
          ...rules,
          onClick: () => {
            setActiveNode({ label: moduleName });
            setPopupOpen(true);
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, screenToFlowPosition]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // ✅ Handle right-click on nodes
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, node });
  }, []);

  // ✅ Handle context menu actions
  const handleMenuAction = (action) => {
    if (!contextMenu?.node) return;
    const nodeId = contextMenu.node.id;

    switch (action) {
      case "edit":
        setActiveNode(contextMenu.node.data);
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
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        break;
      default:
        break;
    }
  };

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
        onNodeContextMenu={onNodeContextMenu} // ✅ right-click handler
        fitView
        nodeTypes={nodeTypes}
      >
        <MiniMap />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>

      {/* Floating draggable modules panel */}
      <ModulesPanel />

      {/* Popup shown when clicking a node */}
      <ModulePopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSave={() => {
          alert(`Saved ${activeNode?.label}!`);
          setPopupOpen(false);
        }}
        headerColor="#2ecc71"
      >
        <div>
          <h3 className="font-semibold mb-2">{activeNode?.label}</h3>
          <p className="text-sm text-gray-600">
            Configure settings for {activeNode?.label}.
          </p>
        </div>
      </ModulePopup>

      {/* ✅ Fixed Save button */}
      <button
        onClick={() => alert("Workflow saved!")}
        className="fixed top-6 right-6 bg-purple-600 text-white px-5 py-3 rounded-full cursor-pointer shadow-lg hover:bg-purple-700 transition font-semibold"
      >
        Save Workflow
      </button>

      {/* ✅ Context menu */}
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
