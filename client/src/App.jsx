import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import Header from "./components/Header";
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import NotFound from "./pages/NotFound.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import Workflows from "./pages/dashboard/Workflows.jsx";
import Integrations from "./pages/dashboard/Integrations.jsx";
import Analytics from "./pages/dashboard/Analytics.jsx";
import Settings from "./pages/dashboard/Settings.jsx";
import WorkflowEditor from "./pages/dashboard/WorkflowEditor.jsx";
import Plans from "./pages/dashboard/Plans.jsx";
import { getCurrentUser } from "./store/slices/authSlice.js";
import PageLoader from "./components/shared/PageLoader.jsx";
import CreateAIWorkflow from "./pages/dashboard/CreateAIWorkflow.jsx";

// ProtectedRoute wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  if (loading) {
    return <PageLoader />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Run checkAuth on app mount (validates cookie/token)
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const hideHeaderFooter =
    location.pathname.startsWith("/dashboard") ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <>
      {!hideHeaderFooter && <Header />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="create-ai-workflow" element={<CreateAIWorkflow />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="plans" element={<Plans />} />
        </Route>

        <Route
          path="/dashboard/workflows/editor/:id"
          element={
            <ProtectedRoute>
              <WorkflowEditor />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default App;
