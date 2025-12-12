import React from "react";
import SuperadminSidebar from "../components/SuperadminSidebar";

export default function SuperadminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperadminSidebar />
      <main className="ml-64 p-6 md:p-10">{children}</main>
    </div>
  );
}
