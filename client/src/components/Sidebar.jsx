import {
  FaTachometerAlt,
  FaProjectDiagram,
  FaPlug,
  FaChartBar,
  FaCog,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Sidebar() {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const location = useLocation();
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    {
      name: "Workflows",
      path: "/dashboard/workflows",
      icon: <FaProjectDiagram />,
    },
    { name: "Integrations", path: "/dashboard/integrations", icon: <FaPlug /> },
    { name: "Analytics", path: "/dashboard/analytics", icon: <FaChartBar /> },
    { name: "Settings", path: "/dashboard/settings", icon: <FaCog /> },
  ];

  return (
    <aside
      className={`w-64 min-h-screen flex flex-col p-4 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      } shadow-lg`}
    >
      {/* Logo */}
      <div className="flex items-center mb-8">
        <div
          className={`text-2xl font-bold ${
            isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
          }`}
        >
          AutoDesk
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? isDarkMode
                      ? "bg-[#9b6cbf] text-white"
                      : "bg-[#642c8f] text-white"
                    : isDarkMode
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
