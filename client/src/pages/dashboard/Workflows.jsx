import { FaPlus, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
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

  // 🔹 Fetch workflows on mount
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
      }
    };

    fetchWorkflows();
  }, []);

  // 🔹 Toggle active/draft
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

  // 🔹 Create workflow
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

  // 🔹 Delete workflow
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

  return (
    <div className="flex-1 p-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Workflows</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#642c8f] text-white cursor-pointer rounded-lg shadow hover:bg-[#7a3bb3] transition"
        >
          <FaPlus /> New Workflow
        </button>
      </div>

      {/* Workflow List */}
      <div className="space-y-4">
        {workflows.map((wf) => (
          <div
            key={wf._id}
            className="flex justify-between items-center p-4 rounded-lg border shadow-sm bg-white hover:shadow-md transition"
          >
            {/* Left Section */}
            <div>
              <Link to={`/dashboard/workflows/editor/${wf._id}`}>
                <div className="flex gap-2 mt-2 text-[2rem]">
                  {wf.actions?.length > 0 ? (
                    wf.actions.map((action, index) => {
                      const style =
                        actionStyles[action.type] || actionStyles.custom;
                      const Icon = style.icon;

                      return (
                        <span
                          key={index}
                          className="p-2 rounded-full"
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
                <h2 className="text-lg font-medium">{wf.name}</h2>
                <p className="text-gray-500 text-sm">{wf.description}</p>
              </Link>
            </div>

            {/* Right Section - Toggle + Delete */}
            <div className="flex items-center gap-3">
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

              {/* Delete Button */}
              <button
                onClick={() => setDeleteTarget(wf)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition shadow-sm"
                title="Delete workflow"
              >
                <FaTrash className="text-sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleCreateWorkflow} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Workflow Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#642c8f]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#642c8f]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#642c8f] text-white py-2 rounded-lg hover:bg-[#7a3bb3] transition"
          >
            Create Workflow
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Delete Workflow
          </h2>
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deleteTarget?.name}</span>? This
            action cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
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
    </div>
  );
}
