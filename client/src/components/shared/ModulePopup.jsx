import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMaximize2, FiHelpCircle } from "react-icons/fi";

function ModulePopup({
  isOpen,
  onClose,
  onSave,
  headerColor = "purple",
  children,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-lg shadow-lg w-[500px] max-w-full z-10 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ backgroundColor: headerColor, color: "white" }}
            >
              <h2 className="font-semibold">Google Sheets</h2>
              <div className="flex items-center gap-2">
                <FiHelpCircle size={18} className="cursor-pointer" />
                <FiMaximize2 size={18} className="cursor-pointer" />
                <FiX size={18} className="cursor-pointer" onClick={onClose} />
              </div>
            </div>

            {/* Content (children passed here) */}
            <div className="p-4">{children}</div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t px-4 py-3 bg-gray-50">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                style={{ backgroundColor: headerColor }}
                className="px-4 py-2 rounded text-white font-semibold hover:opacity-90"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ModulePopup;
