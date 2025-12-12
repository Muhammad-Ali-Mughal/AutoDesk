import React from "react";
import {
  FaUsers,
  FaTags,
  FaProjectDiagram,
  FaChartBar,
  FaCogs,
  FaFileAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { GoOrganization } from "react-icons/go";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice.js"; // adjust path if needed

export default function SuperadminSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Overview", path: "/superadmin", icon: <FaChartBar /> },
    { name: "Users", path: "/superadmin/users", icon: <FaUsers /> },
    {
      name: "Organizations",
      path: "/superadmin/organizations",
      icon: <GoOrganization />,
    },
    { name: "Teams", path: "/superadmin/teams", icon: <FaProjectDiagram /> },
    { name: "Roles", path: "/superadmin/roles", icon: <FaTags /> },
    // COMPLETE THESE TWO LATER
    // { name: "Activity Logs", path: "/superadmin/logs", icon: <FaFileAlt /> },
    // { name: "Settings", path: "/superadmin/settings", icon: <FaCogs /> },
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/");
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 p-6 border-r bg-white text-gray-900 z-40">
      <div className="mb-8">
        <div className="text-2xl font-semibold text-indigo-700">AutoDesk</div>
        <p className="text-sm text-gray-500">Super Admin Control Panel</p>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full mt-6 flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 border border-red-100 hover:bg-red-50"
      >
        <FaSignOutAlt />
        <span className="font-semibold">Logout</span>
      </button>
    </aside>
  );
}
