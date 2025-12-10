import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div>
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="ml-64 p-5">
        <Outlet />
      </div>
    </div>
  );
}
