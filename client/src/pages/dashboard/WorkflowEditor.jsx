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

const nodeTypes = { custom: CustomNode };

    const moduleRules = {
  "Google Sheets": { allowMultipleOutgoing: false, allowMultipleIncoming: true },
  "Webhook": { allowMultipleOutgoing: true, allowMultipleIncoming: true },
  "Condition": { allowMultipleOutgoing: true, allowMultipleIncoming: true },
};

function WorkflowEditorInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeNode, setActiveNode] = useState(null);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        const sourceNode = nodes.find((n) => n.id === params.source);
        const targetNode = nodes.find((n) => n.id === params.target);

        if (!sourceNode || !targetNode) return eds;

        // check outgoing restriction
        if (!sourceNode.data.allowMultipleOutgoing) {
          const existingOut = eds.filter((e) => e.source === sourceNode.id);
          if (existingOut.length > 0) {
            alert(`${sourceNode.data.label} can only connect to one node.`);
            return eds;
          }
        }

        // check incoming restriction
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

      // fetch rules for this module, fallback to allowing multiple
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
