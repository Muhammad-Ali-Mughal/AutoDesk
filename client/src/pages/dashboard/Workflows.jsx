import { FaPlus, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Modal from "../../components/shared/Modal";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { actionStyles } from "../../utils/actionStyles";

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const res = await api.get("/workflows");
        setWorkflows(res.data.workflows || []);
      } catch (err) {
        console.error(
          "Error fetching workflows:",
          err.response?.data || err.message
        );
        toast.error(err.response?.data?.message || "Failed to fetch workflows");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  const toggleWorkflow = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active";
      const res = await api.put(`/workflows/${id}`, { status: newStatus });
      setWorkflows((prev) =>
        prev.map((wf) =>
          wf._id === id ? { ...wf, status: res.data.workflow.status } : wf
        )
      );
      toast.success(
        `Workflow ${
          newStatus === "active" ? "activated" : "paused"
        } successfully`
      );
    } catch (err) {
      console.error(
        "Error updating workflow:",
        err.response?.data || err.message
      );
      toast.error(err.response?.data?.message || "Failed to update workflow");
    }
  };

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newDescription.trim()) {
      toast.error("Name and description are required");
      return;
    }
    try {
      const res = await api.post("/workflows", {
        name: newName,
        description: newDescription,
        triggers: { type: "manual" },
      });
      setWorkflows((prev) => [...prev, res.data.workflow]);
      toast.success("Workflow created successfully");
      setNewName("");
      setNewDescription("");
      setIsModalOpen(false);
    } catch (err) {
      console.error(
        "Error creating workflow:",
        err.response?.data || err.message
      );
      toast.error(err.response?.data?.message || "Failed to create workflow");
    }
  };

  const handleDeleteWorkflow = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/workflows/${deleteTarget._id}`);
      setWorkflows((prev) => prev.filter((wf) => wf._id !== deleteTarget._id));
      toast.success("Workflow deleted successfully");
    } catch (err) {
      console.error(
        "Error deleting workflow:",
        err.response?.data || err.message
      );
      toast.error(err.response?.data?.message || "Failed to delete workflow");
    } finally {
      setDeleteTarget(null);
    }
  };

  // --------------------
  // Loading Skeleton
  // --------------------
  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-5xl space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-white shadow rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-14 h-7 rounded-full bg-gray-300"></div>
                <div className="w-9 h-9 rounded-full bg-gray-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --------------------
  // Main Render
  // --------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-2">
            WorkFlows
            <span className="text-gray-400 text-sm">•</span>
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#642c8f] text-white cursor-pointer rounded-lg shadow hover:bg-[#7a3bb3] transition"
          >
            <FaPlus /> New Workflow
          </button>
        </div>

        {/* Workflows List */}
        <div className="space-y-4">
          {workflows.map((wf, index) => (
            <motion.div
              key={wf._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white shadow rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition"
            >
              {/* Left Section */}
              <Link
                to={`/dashboard/workflows/editor/${wf._id}`}
                className="flex-1 flex flex-col gap-2"
              >
                <div className="flex gap-2 mt-1 text-[2rem]">
                  {/* Webhook Trigger Icon */}
                  {wf.triggers?.type === "webhook" && (
                    <span
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{
                        background: actionStyles.webhook.gradient,
                        color: "#fff",
                      }}
                    >
                      {actionStyles.webhook.icon && (
                        <actionStyles.webhook.icon />
                      )}
                    </span>
                  )}

                  {/* Action Icons */}
                  {wf.actions?.length > 0 ? (
                    wf.actions.map((action, idx) => {
                      const rawType = (action.type || "")
                        .toString()
                        .toLowerCase()
                        .trim();
                      let typeKey = rawType.replace(/\s+/g, "_");
                      if (typeKey === "schedule") typeKey = "schedule";
                      if (typeKey === "webhook") typeKey = "webhook";

                      const style =
                        actionStyles[typeKey] || actionStyles.custom;
                      const Icon = style.icon;

                      return (
                        <span
                          key={idx}
                          className="p-2 rounded-full flex items-center justify-center"
                          style={{
                            background: style.gradient,
                            color: "#fff",
                          }}
                        >
                          <Icon />
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-400 text-sm">
                      No actions yet
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-medium text-gray-800">{wf.name}</h2>
                <p className="text-gray-500 text-sm">{wf.description}</p>
              </Link>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                {/* Toggle */}
                <button
                  onClick={() => toggleWorkflow(wf._id, wf.status)}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition ${
                    wf.status === "active" ? "bg-[#642c8f]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
                      wf.status === "active" ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(wf)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition shadow-sm"
                  title="Delete workflow"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modals (Create + Delete) */}
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="p-6 bg-white rounded-xl w-full max-w-md mx-auto shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Create New Workflow
              </h2>

              <form onSubmit={handleCreateWorkflow} className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#642c8f]"
                    placeholder="Enter workflow name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Description
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#642c8f]"
                    placeholder="Enter workflow description"
                    rows="3"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#642c8f] text-white hover:bg-[#7a3bb3] transition"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {deleteTarget && (
          <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
            <div className="p-6 bg-white rounded-xl w-full max-w-md mx-auto shadow-lg text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Delete Workflow
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteTarget.name}</span>?
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWorkflow}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
