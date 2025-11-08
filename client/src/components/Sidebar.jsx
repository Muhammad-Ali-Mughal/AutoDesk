import {
  FaTachometerAlt,
  FaProjectDiagram,
  FaPlug,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice.js";

export default function Sidebar() {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 flex flex-col p-4 shadow-lg z-50 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
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
      <nav className="flex-1 overflow-y-auto">
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

      {/* Logout button at bottom */}
      <button
        onClick={handleLogout}
        className="flex items-center cursor-pointer gap-3 px-4 py-2 mt-6 rounded-lg text-red-600 hover:bg-red-950 transition"
      >
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </aside>
  );
}
