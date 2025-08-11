import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const SignUp = () => {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
      toast.error("Name is required");
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      toast.error("Name must be at least 3 characters");
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      toast.error("Email is required");
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
      toast.error("Please enter a valid email");
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      toast.error("Password is required");
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      toast.error("Password must be at least 6 characters");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      toast.error("Please confirm your password");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      toast.error("Passwords do not match");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      toast
        .promise(
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1500);
          }),
          {
            loading: "Creating your account...",
            success: "Account created successfully!",
            error: "Failed to create account",
          }
        )
        .finally(() => {
          setIsLoading(false);
          console.log("Form submitted:", formData);
        });
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex items-center justify-center p-4 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-[#642c8f]/10 to-[#642c8f]/20"
      }`}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode ? "bg-[#642c8f]/20" : "bg-[#642c8f]/10"
          }`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
            isDarkMode ? "bg-[#642c8f]/20" : "bg-[#642c8f]/10"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl ${
            isDarkMode ? "bg-[#642c8f]/10" : "bg-[#642c8f]/5"
          }`}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.6, -0.05, 0.01, 0.99],
        }}
        className="w-full max-w-md relative z-10"
      >
        <div
          className={`${
            isDarkMode
              ? "bg-gray-800/80 text-gray-100"
              : "bg-white/80 text-gray-800"
          } backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border ${
            isDarkMode ? "border-gray-700" : "border-[#642c8f]/10"
          }`}
        >
          <div className="px-8 py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.6,
                ease: [0.6, -0.05, 0.01, 0.99],
              }}
              className="text-center mb-8"
            >
              <h2
                className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-[#642c8f]"
                }`}
              >
                Create Account
              </h2>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Join us and get started
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: 0.3,
                  duration: 0.6,
                  ease: [0.6, -0.05, 0.01, 0.99],
                }}
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser
                      className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                        isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.name
                        ? "border-red-500"
                        : isDarkMode
                        ? "border-gray-700"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#642c8f] focus:border-transparent transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gray-700/50 text-white placeholder-gray-400"
                        : "bg-white text-gray-800"
                    }`}
                    placeholder="Full Name"
                  />
                </div>
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: 0.4,
                  duration: 0.6,
                  ease: [0.6, -0.05, 0.01, 0.99],
                }}
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope
                      className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                        isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                      }`}
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.email
                        ? "border-red-500"
                        : isDarkMode
                        ? "border-gray-700"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#642c8f] focus:border-transparent transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gray-700/50 text-white placeholder-gray-400"
                        : "bg-white text-gray-800"
                    }`}
                    placeholder="Email address"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: 0.5,
                  duration: 0.6,
                  ease: [0.6, -0.05, 0.01, 0.99],
                }}
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock
                      className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                        isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                      }`}
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                      errors.password
                        ? "border-red-500"
                        : isDarkMode
                        ? "border-gray-700"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#642c8f] focus:border-transparent transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gray-700/50 text-white placeholder-gray-400"
                        : "bg-white text-gray-800"
                    }`}
                    placeholder="Password"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showPassword ? (
                      <FaEyeSlash
                        className={`h-5 w-5 ${
                          isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                        }`}
                      />
                    ) : (
                      <FaEye
                        className={`h-5 w-5 ${
                          isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                        }`}
                      />
                    )}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: 0.6,
                  duration: 0.6,
                  ease: [0.6, -0.05, 0.01, 0.99],
                }}
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock
                      className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                        isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                      }`}
                    />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : isDarkMode
                        ? "border-gray-700"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#642c8f] focus:border-transparent transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gray-700/50 text-white placeholder-gray-400"
                        : "bg-white text-gray-800"
                    }`}
                    placeholder="Confirm Password"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash
                        className={`h-5 w-5 ${
                          isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                        }`}
                      />
                    ) : (
                      <FaEye
                        className={`h-5 w-5 ${
                          isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                        }`}
                      />
                    )}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.7,
                  duration: 0.6,
                  ease: [0.6, -0.05, 0.01, 0.99],
                }}
              >
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden ${
                    isDarkMode
                      ? "bg-[#9b6cbf] hover:bg-[#9b6cbf]/90"
                      : "bg-[#642c8f] hover:bg-[#642c8f]/90"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }}
                    animate={{ x: isLoading ? "100%" : "-100%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    "Sign Up"
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.8,
                duration: 0.6,
                ease: [0.6, -0.05, 0.01, 0.99],
              }}
              className="mt-6 text-center"
            >
              <div className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className={`font-semibold ${
                    isDarkMode
                      ? "text-[#9b6cbf] hover:text-[#9b6cbf]/80"
                      : "text-[#642c8f] hover:text-[#642c8f]/80"
                  }`}
                >
                  Sign in
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
