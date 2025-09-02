import React, { useState, useRef } from "react";

function ModulesPanel() {
  const [position, setPosition] = useState({ x: 20, y: 20 });
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

  const modules = ["HTTP Request", "Google Sheets", "Slack", "Email"];

  return (
    <div
      ref={panelRef}
      style={{
        width: 200,
        background: "#f8f9fa",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        position: "absolute",
        top: position.y,
        left: position.x,
        zIndex: 1000,
        userSelect: "none",
      }}
    >
      {/* Header (drag handle) */}
      <div
        onMouseDown={startDrag}
        style={{
          cursor: "move",
          fontWeight: "bold",
          marginBottom: 12,
          textAlign: "center",
          background: "#e9ecef",
          padding: "6px",
          borderRadius: 4,
        }}
      >
        Modules
      </div>

      {/* Module Items */}
      {modules.map((name) => (
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
    </div>
  );
}

export default ModulesPanel;
