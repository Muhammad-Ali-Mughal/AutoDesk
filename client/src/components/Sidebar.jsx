import {
  FaTachometerAlt,
  FaProjectDiagram,
  FaPlug,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaLayerGroup,
  FaStarOfLife,
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
    {
      name: "Make with AI",
      path: "/dashboard/create-ai-workflow",
      icon: <FaStarOfLife />,
    },
    { name: "Integrations", path: "/dashboard/integrations", icon: <FaPlug /> },
    { name: "Analytics", path: "/dashboard/analytics", icon: <FaChartBar /> },
    { name: "Plans", path: "/dashboard/plans", icon: <FaLayerGroup /> },
    { name: "Settings", path: "/dashboard/settings", icon: <FaCog /> },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/");
  };

  const wrapperClasses = isDarkMode
    ? "bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-900/85 text-gray-100"
    : "bg-gradient-to-b from-white to-white/90 text-gray-900";

  const activeClasses = isDarkMode
    ? "bg-gradient-to-r from-[#9b6cbf] via-[#8143a6] to-[#642c8f] text-white shadow-lg shadow-[#642c8f]/30"
    : "bg-gradient-to-r from-[#f6ecff] via-[#ebd7ff] to-[#e0c0ff] text-[#3b1d50] shadow-inner";

  const idleHoverClasses = isDarkMode
    ? "hover:bg-gray-800/70"
    : "hover:bg-gray-100";

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 flex flex-col p-6 pb-8 border-r border-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 z-50 ${wrapperClasses}`}
    >
      <div className="mb-10">
        <div
          className={`text-3xl font-semibold tracking-tight ${
            isDarkMode ? "text-[#c2a1dd]" : "text-[#642c8f]"
          }`}
        >
          AutoDesk
        </div>
        <p
          className={`text-sm mt-1 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Automate every workflow effortlessly
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto pr-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl border border-transparent transition-all duration-200 ease-out ${
                isActive ? activeClasses : idleHoverClasses
              }`}
            >
              <span
                className={`text-lg transition-transform duration-200 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
              >
                {item.icon}
              </span>
              <span className="font-medium">{item.name}</span>
              <span
                className={`absolute left-2 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-full transition-opacity duration-200 ${
                  isActive
                    ? "opacity-100 bg-white/90"
                    : "opacity-0 group-hover:opacity-50 bg-[#9b6cbf]"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-3 px-4 py-2.5 mt-8 rounded-xl text-red-500 border border-red-500/40 hover:bg-red-500/10 transition-all duration-200"
      >
        <FaSignOutAlt />
        <span className="font-semibold">Logout</span>
      </button>
    </aside>
  );
}
