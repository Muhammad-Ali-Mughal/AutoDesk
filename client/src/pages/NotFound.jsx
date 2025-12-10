import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaRobot } from "react-icons/fa";

export default function NotFound({ isDarkMode }) {
  return (
    <div
      className={`max-h-screen flex flex-col items-center justify-center text-center px-4 py-30 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Background gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-[#642c8f]/10 to-[#642c8f]/20"
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg"
      >
        <FaRobot
          className={`mx-auto mb-6 h-16 w-16 ${
            isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
          }`}
        />
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p
          className={`mb-8 text-lg ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/"
            className={`inline-block px-8 py-4 rounded-lg text-lg font-semibold shadow-lg ${
              isDarkMode
                ? "bg-[#9b6cbf] text-white hover:bg-[#9b6cbf]/90"
                : "bg-[#642c8f] text-white hover:bg-[#642c8f]/90"
            }`}
          >
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
