import React, { useState, useRef } from "react";
import { actionStyles } from "../../utils/actionStyles";

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

  return (
    <div
      ref={panelRef}
      style={{
        width: 240,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 6px 14px rgba(0,0,0,0.1)",
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
          fontWeight: "600",
          marginBottom: 12,
          textAlign: "center",
          background: "#f3f0f7",
          padding: "8px",
          borderRadius: 8,
          color: "#642c8f",
        }}
      >
        Modules
      </div>

      {/* Module Items (from actionStyles) */}
      <div className="space-y-3">
        {Object.entries(actionStyles)
        .filter(([type]) => type !== "custom")
        .map(([type, style]) => {
          const Icon = style.icon;
          return (
            <div
              key={type}
              draggable
              onDragStart={(event) =>
                event.dataTransfer.setData("application/reactflow", type)
              }
              className="flex items-center gap-3 p-2 rounded-lg cursor-grab transition hover:scale-[1.02]"
              style={{
                border: style.border,
                background: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              <span
                className="w-10 h-10 flex items-center justify-center rounded-full text-white"
                style={{
                  background: style.gradient,
                }}
              >
                <Icon size={18} />
              </span>
              <span className="font-medium text-gray-700">{style.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ModulesPanel;
