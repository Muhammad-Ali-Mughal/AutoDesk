import { FaPlus, FaDatabase, FaSlack, FaCode } from "react-icons/fa";
import { useState } from "react";

export default function Workflows() {
  // Example workflows
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: "Lead Sync",
      description: "Sync new leads from website to CRM",
      modules: [<FaDatabase key="db" />, <FaSlack key="slack" />],
      active: true,
    },
    {
      id: 2,
      name: "Error Monitor",
      description: "Send alerts to Slack on server errors",
      modules: [<FaCode key="code" />, <FaSlack key="slack" />],
      active: false,
    },
  ]);

  const toggleWorkflow = (id) => {
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, active: !wf.active } : wf))
    );
  };

  return (
    <div className="flex-1 p-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Workflows</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#642c8f] text-white cursor-pointer rounded-lg shadow hover:bg-[#7a3bb3] transition">
          <FaPlus /> New Workflow
        </button>
      </div>

      {/* Workflow List */}
      <div className="space-y-4">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="flex justify-between items-center p-4 rounded-lg border shadow-sm bg-white hover:shadow-md transition"
          >
            {/* Left Section */}
            <div>
              <div className="flex gap-2 mt-2 text-[2rem] text-[#642c8f]">
                {wf.modules.map((icon) => icon)}
              </div>
              <h2 className="text-lg font-medium">{wf.name}</h2>
              <p className="text-gray-500 text-sm">{wf.description}</p>
            </div>

            {/* Right Section - Toggle */}
            <button
              onClick={() => toggleWorkflow(wf.id)}
              className={`w-14 h-7 flex items-center rounded-full p-1 transition ${
                wf.active ? "bg-[#642c8f]" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
                  wf.active ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
