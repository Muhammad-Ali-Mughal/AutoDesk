import React, { useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "../../components/shared/CustomNode";

const nodeTypes = { custom: CustomNode };

function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  // Handle drop from sidebar
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const moduleName = event.dataTransfer.getData("application/reactflow");
      if (!moduleName) return;

      const position = { x: event.clientX - 250, y: event.clientY - 50 }; // adjust offsets
      const newNode = {
        id: `${+new Date()}`,
        type: "custom",
        position,
        data: { label: moduleName },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 200,
          background: "#f8f9fa",
          borderRight: "1px solid #ddd",
          padding: 16,
        }}
      >
        <h4>Modules</h4>
        {["HTTP Request", "Google Sheets", "Slack", "Email"].map((name) => (
          <div
            key={name}
            style={{
              padding: "8px 12px",
              marginBottom: 8,
              border: "1px solid #ccc",
              borderRadius: 6,
              cursor: "grab",
              background: "white",
            }}
            draggable
            onDragStart={(event) =>
              event.dataTransfer.setData("application/reactflow", name)
            }
          >
            {name}
          </div>
        ))}
      </aside>

      {/* Canvas */}
      <div style={{ flexGrow: 1 }}>
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
      </div>
    </div>
  );
}

export default WorkflowEditor;
