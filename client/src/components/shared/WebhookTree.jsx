import { useState } from "react";

function WebhookTree({ data, path = "", onDrag, level = 0 }) {
  const [open, setOpen] = useState(true);

  // If it's not an object, return leaf node with badge-like design
  if (typeof data !== "object" || data === null) {
    return (
      <div
        draggable
        onDragStart={(e) => onDrag(e, path)}
        className="ml-6 my-3 text-s cursor-grab flex gap-2 items-center py-1 px-3 rounded-full bg-purple-100 text-purple-700 font-mono shadow-md"
      >
        <span className="text-purple-700">{path}</span>
        <span className="text-gray-400">{typeof data}</span>
      </div>
    );
  }

  return (
    <div className="ml-2">
      {/* Vertical line and toggle button */}
      <div
        className="flex items-center space-x-2"
        style={{ marginLeft: `${level * 20}px` }} // Indentation based on level
      >
        {/* Draw a vertical line */}
        <div
          className={`h-full border-l-2 border-dashed ${
            level > 0 ? "border-gray-300" : ""
          }`}
          style={{ marginLeft: "-10px", marginTop: "-10px" }}
        />
        <div
          onClick={() => setOpen(!open)}
          className="cursor-pointer text-s font-semibold text-gray-700 py-1 px-3 rounded-full hover:bg-gray-200 transition-all"
        >
          {open ? "▼" : "▶"} {path || "webhook"}
        </div>
      </div>

      {/* Render children if open */}
      {open &&
        Object.entries(data).map(([key, value]) => (
          <WebhookTree
            key={key}
            data={value}
            path={path ? `${path}.${key}` : key}
            onDrag={onDrag}
            level={level + 1} // Increase level for indentation
          />
        ))}
    </div>
  );
}

export default WebhookTree;
