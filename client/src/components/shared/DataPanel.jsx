import React, { useState, useRef } from "react";
import WebhookTree from "./WebhookTree";

function DataPanel({ webhook }) {
  const [position, setPosition] = useState({
    x: window.innerWidth - 300,
    y: 120,
  });
  const panelRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const startDrag = (e) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const onDrag = (e) => {
    if (!dragging.current) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const stopDrag = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  const onDragStart = (e, path) => {
    e.dataTransfer.setData("application/variable", `{{webhook.${path}}}`);
  };

  return (
    <div
      ref={panelRef}
      style={{
        width: 260,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 6px 14px rgba(0,0,0,0.1)",
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 1000,
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div
        onMouseDown={startDrag}
        style={{
          cursor: "move",
          fontWeight: 600,
          marginBottom: 12,
          textAlign: "center",
          background: "#f3f0f7",
          padding: "8px",
          borderRadius: 8,
          color: "#642c8f",
        }}
      >
        Webhook Data
      </div>
      {webhook?.payload ? (
        <div className="max-h-[300px] overflow-auto text-sm">
          <WebhookTree data={webhook.payload} onDrag={onDragStart} />
        </div>
      ) : (
        <div className="text-xs text-gray-500 text-center">
          Trigger webhook once to detect structure
        </div>
      )}
    </div>
  );
}

export default DataPanel;
