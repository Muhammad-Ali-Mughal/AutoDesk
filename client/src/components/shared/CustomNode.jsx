import { Handle, Position, useReactFlow } from "@xyflow/react";

function CustomNode({ data, id }) {
  const { getEdges } = useReactFlow();

  // live validation for outgoing
  const isValidSource = (connection) => {
    if (!data.allowMultipleOutgoing) {
      const edges = getEdges().filter((e) => e.source === id);
      return edges.length === 0;
    }
    return true;
  };

  // live validation for incoming
  const isValidTarget = (connection) => {
    if (!data.allowMultipleIncoming) {
      const edges = getEdges().filter((e) => e.target === id);
      return edges.length === 0;
    }
    return true;
  };

  return (
    <div
      style={{
        border: "2px solid #e11cffff",
        borderRadius: "12px",
        width: 140,
        minHeight: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6c63ff, #e11cffff)",
        color: "white",
        boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "10px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
      }}
      onClick={data.onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.15)";
      }}
    >
      {/* Top Icon */}
      <div
        style={{
          background: "rgba(255,255,255,0.2)",
          borderRadius: "8px",
          padding: "6px 10px",
          marginBottom: "8px",
          fontSize: "20px",
        }}
      >
        {data.icon || "⚡"}
      </div>

      {/* Module Name */}
      <strong style={{ fontSize: "16px" }}>{data.label}</strong>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        isValidConnection={isValidTarget}
      />
      <Handle
        type="source"
        position={Position.Right}
        isValidConnection={isValidSource}
      />
    </div>
  );
}

export default CustomNode;
