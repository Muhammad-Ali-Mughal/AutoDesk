import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import NotFound from "./pages/NotFound.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import Settings from "./pages/dashboard/Settings.jsx";

function App() {
  const location = useLocation();
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
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Dashboard routes with persistent sidebar */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default App;
