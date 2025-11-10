import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCrown,
  FaCreditCard,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { Link } from "react-router-dom";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [credits, setCredits] = useState({ usedCredits: 0, totalCredits: 0 });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        const profile = res.data.profile || {};
        const subscriptionData = res.data.subscription || {};
        setUser(profile);
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          password: "",
          confirmPassword: "",
        });

        setSubscription(subscriptionData);

        setCredits({
          usedCredits: subscriptionData.credits?.usedCredits || 0,
          totalCredits: subscriptionData.credits?.totalCredits || 0,
        });
      } catch (err) {
        console.error("Error fetching settings:", err);
        toast.error(err.response?.data?.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Save profile changes
  const handleSaveChanges = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      return toast.error("Name and email are required");
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
      };
      if (formData.password) payload.password = formData.password;

      const res = await api.put("/settings/profile", payload);
      toast.success("Profile updated successfully!");
      setUser(res.data.user);
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="loader border-t-[#642c8f] border-4 w-10 h-10 rounded-full animate-spin"></div>
      </div>
    );
  }

  const usedPercent =
    credits.totalCredits > 0
      ? Math.round((credits.usedCredits / credits.totalCredits) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto space-y-10"
      >
        {/* ---------- Page Header ---------- */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your profile, security, and subscription preferences.
          </p>
        </div>

        {/* ---------- Profile Settings ---------- */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white shadow-md rounded-2xl p-6 md:p-8 space-y-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaUser className="text-[#642c8f]" />
            <h2 className="text-xl font-semibold text-gray-800">
              Profile Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#642c8f] focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#642c8f] focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                New Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#642c8f] focus:outline-none"
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#642c8f] focus:outline-none"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              onClick={handleSaveChanges}
              className="bg-[#642c8f] text-white px-5 py-2.5 rounded-lg shadow hover:bg-[#7a3bb3] transition disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </motion.section>

        {/* ---------- Subscription Section ---------- */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white shadow-md rounded-2xl p-6 md:p-8 space-y-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <FaCrown className="text-[#642c8f]" />
            <h2 className="text-xl font-semibold text-gray-800">
              Subscription
            </h2>
          </div>

          <div className="bg-gradient-to-r from-[#642c8f] to-[#7a3bb3] text-white p-6 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">
                {subscription?.name || "Free Plan"}
              </h3>
              <p className="text-sm opacity-90">
                Status: {subscription?.status || "inactive"}
              </p>
            </div>
            <Link to={"/dashboard/plans"}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#642c8f] px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-100 transition"
              >
                Manage Plan
              </motion.button>
            </Link>
          </div>

          <div className="bg-gray-50 border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FaCreditCard className="text-[#642c8f]" />
                <span className="text-gray-700 font-medium">
                  Available Credits
                </span>
              </div>
              <span className="text-[#642c8f] font-semibold text-lg">
                {credits.totalCredits - credits.usedCredits}
              </span>
            </div>

            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#642c8f] rounded-full transition-all"
                style={{ width: `${usedPercent}%` }}
              ></div>
            </div>
            <p className="text-gray-500 text-sm">
              You’ve used{" "}
              <span className="text-[#642c8f] font-medium">{usedPercent}%</span>{" "}
              of your monthly credits.
            </p>
          </div>

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-[#642c8f] text-white px-5 py-2.5 rounded-lg shadow hover:bg-[#7a3bb3] transition"
            >
              Upgrade Plan
            </motion.button>
          </div>
        </motion.section>

        {/* ---------- Future Settings Placeholder ---------- */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white shadow-md rounded-2xl p-6 md:p-8 text-center text-gray-500"
        >
          <p>More settings coming soon…</p>
        </motion.section>
      </motion.div>
    </div>
  );
}
