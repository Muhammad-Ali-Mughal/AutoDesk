import { motion } from "framer-motion";

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1.2,
      ease: "easeInOut",
    },
  },
};

const textVariants = {
  animate: {
    opacity: [0, 1, 0],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut",
    },
  },
};

export default function PageLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white text-purple-600 z-50">
      {/* Spinner Circle */}
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className="w-16 h-16 border-4 border-t-transparent border-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)]"
      />

      {/* Soft glowing ring */}
      <motion.div
        initial={{ opacity: 0.4, scale: 1 }}
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute w-32 h-32 rounded-full bg-purple-400/10 blur-3xl"
      />

      {/* Animated Text */}
      <motion.p
        variants={textVariants}
        animate="animate"
        className="mt-8 text-lg tracking-wide font-medium text-purple-600"
      >
        Loading your workspace...
      </motion.p>
    </div>
  );
}
