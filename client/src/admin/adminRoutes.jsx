import React from "react";
import { Routes, Route } from "react-router-dom";
import SuperadminLayout from "./layouts/SuperadminLayout";
import AdminDashboard from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import OrganizationsPage from "./pages/Organizations";
import TeamsPage from "./pages/Teams";
import RolesPage from "./pages/Roles";
import LogsPage from "./pages/Logs";
import SettingsPage from "./pages/Settings";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <SuperadminLayout>
            <AdminDashboard />
          </SuperadminLayout>
        }
      />
      <Route
        path="/users"
        element={
          <SuperadminLayout>
            <UsersPage />
          </SuperadminLayout>
        }
      />
      <Route
        path="/organizations"
        element={
          <SuperadminLayout>
            <OrganizationsPage />
          </SuperadminLayout>
        }
      />
      <Route
        path="/teams"
        element={
          <SuperadminLayout>
            <TeamsPage />
          </SuperadminLayout>
        }
      />
      <Route
        path="/roles"
        element={
          <SuperadminLayout>
            <RolesPage />
          </SuperadminLayout>
        }
      />
      <Route
        path="/logs"
        element={
          <SuperadminLayout>
            <LogsPage />
          </SuperadminLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <SuperadminLayout>
            <SettingsPage />
          </SuperadminLayout>
        }
      />
    </Routes>
  );
}
