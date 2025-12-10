import { FaEdit, FaCopy, FaTrash } from "react-icons/fa";

export default function ContextMenu({ x, y, onClose, onAction }) {
  const menuItems = [
    {
      label: "Edit",
      action: "edit",
      icon: <FaEdit className="text-dark-600" />,
    },
    {
      label: "Duplicate",
      action: "duplicate",
      icon: <FaCopy className="text-dark-600" />,
    },
    {
      label: "Delete",
      action: "delete",
      icon: <FaTrash className="text-dark-600" />,
    },
  ];

  return (
    <ul
      className="absolute bg-white border rounded-lg shadow-lg py-1 w-35 z-50"
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      {menuItems.map((item) => (
        <li
          key={item.action}
          className="flex items-center gap-3 px-3 py-1 cursor-pointer hover:bg-gray-100 transition"
          onClick={() => {
            onAction(item.action);
            onClose();
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
