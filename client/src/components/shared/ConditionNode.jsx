import { Handle, Position, useReactFlow } from "@xyflow/react";
import { actionStyles } from "../../utils/actionStyles";

function ConditionNode({ data, id }) {
  const { getEdges } = useReactFlow();

  const actionType = data?.actionType || "condition";
  const styleConfig = actionStyles[actionType] || actionStyles.custom;
  const Icon = styleConfig.icon;

  const isValidSource = (connection) => {
    if (!data.allowMultipleOutgoing) {
      const edges = getEdges().filter((e) => e.source === id);
      return edges.length === 0;
    }
    return true;
  };

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
        border: styleConfig.border,
        borderRadius: "12px",
        width: 150,
        minHeight: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: styleConfig.gradient,
        color: "white",
        boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "12px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        position: "relative",
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
      {/* Top Icon - Consistent with CustomNode */}
      <div
        style={{
          background: "rgba(255,255,255,0.2)",
          borderRadius: "8px",
          padding: "6px 10px",
          marginBottom: "8px",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {Icon ? <Icon size={20} /> : "⚡"}
      </div>

      {/* Module Name - Consistent with CustomNode */}
      <strong style={{ fontSize: "15px" }}>
        {data.label || styleConfig.label}
      </strong>

      {/* Connection Handles - Input on left, outputs on right with labels */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        isValidConnection={isValidTarget}
      />

      {/* True branch output - top right */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "-35px",
          fontSize: "11px",
          fontWeight: "bold",
          color: "#10b981",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        TRUE
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-true`}
        style={{ top: "20%" }}
        isValidConnection={isValidSource}
      />

      {/* False branch output - bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "-35px",
          fontSize: "11px",
          fontWeight: "bold",
          color: "#ef4444",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        FALSE
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-false`}
        style={{ bottom: "20%" }}
        isValidConnection={isValidSource}
      />
    </div>
  );
}

export default ConditionNode;
