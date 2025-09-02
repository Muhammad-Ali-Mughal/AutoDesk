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

function WorkflowEditorInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();

  // 👇 Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeNode, setActiveNode] = useState(null);

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const moduleName = event.dataTransfer.getData("application/reactflow");
      if (!moduleName) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${+new Date()}`,
        type: "custom",
        position,
        data: {
          label: moduleName,
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

// ✅ Wrap the inner editor with ReactFlowProvider
function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner />
    </ReactFlowProvider>
  );
}

export default WorkflowEditor;
