import { useState } from "react";
import { motion } from "framer-motion";
import { FaRobot, FaPaperPlane, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function CreateAIWorkflow() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error("Please enter a prompt");
    setLoading(true);
    setGenerated(null);

    try {
      const res = await api.post("/ai/generate-workflow", { prompt });
      setGenerated(res.data.workflow);
      console.log(generated);
      toast.success("Workflow generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to generate workflow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-800">
          Generate Workflow with AI
        </h1>
        <p className="text-gray-500 mt-2">
          Describe your automation — we’ll build it for you!
        </p>
      </motion.div>

      {/* Chat-style Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-xl rounded-2xl w-full max-w-3xl flex flex-col overflow-hidden border border-gray-200"
      >
        <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Default empty state */}
          {!generated && !loading && (
            <div className="text-center text-gray-400 italic mt-10">
              <FaRobot className="mx-auto text-4xl mb-3 text-[#642c8f]" />
              <p>Describe your workflow idea to get started...</p>
            </div>
          )}

          {/* Loading animation */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <FaSpinner className="text-4xl text-[#642c8f] animate-spin mb-3" />
              <p className="text-gray-600">Generating your workflow...</p>
            </motion.div>
          )}

          {/* Generated workflow result */}
          {generated && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaRobot className="text-[#642c8f]" /> {generated.name}
              </h2>
              <p className="text-gray-600">{generated.description}</p>

              <div className="space-y-3">
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <strong className="text-[#642c8f]">Trigger:</strong>{" "}
                  {generated.triggers?.type}
                  {/* –{" "} */}
                  {/* {generated.triggers?.event ||
                    generated.triggers?.config?.event} */}
                </div>
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <strong className="text-[#642c8f]">Actions:</strong>
                  <ul className="list-disc list-inside text-gray-700 mt-1">
                    {generated.actions?.map((action) => (
                      <li key={action.nodeId}>
                        {action.service || action.type}
                        {/* — */} {/* {action.config?.action || action.type} */}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  (window.location.href = `/dashboard/workflows/editor/${generated._id}`)
                }
                className="mt-3 bg-[#642c8f] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#7a3bb3] transition"
              >
                Open in Workflow Editor
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Input Bar (like ChatGPT) */}
        <div className="border-t bg-white p-4 flex items-center gap-3">
          <textarea
            rows="1"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your workflow... (e.g. 'When a new row is added in sheets, mail me')"
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#642c8f] focus:outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            disabled={loading}
            className="bg-[#642c8f] text-white p-3 rounded-xl shadow hover:bg-[#7a3bb3] transition disabled:opacity-60"
          >
            <FaPaperPlane />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
