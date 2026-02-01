import React, { useState } from "react";
import { MdAdd, MdDelete } from "react-icons/md";

function ConditionConfig({ selectedNode, onSave }) {
  const [mode, setMode] = useState(selectedNode?.data?.config?.mode || "all");
  const [rules, setRules] = useState(selectedNode?.data?.config?.rules || []);
  const [nodeName, setNodeName] = useState(
    selectedNode?.data?.config?.name || "Condition",
  );

  const addRule = () => {
    setRules([
      ...rules,
      {
        left: "{{context.",
        operator: "eq",
        right: "",
        rightType: "string",
      },
    ]);
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index, field, value) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
  };

  const handleSave = () => {
    const config = {
      name: nodeName,
      mode,
      rules,
    };

    onSave({
      config,
      nodeId: selectedNode.id,
      type: "condition",
      service: "condition",
    });
  };

  const operators = [
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "contains",
    "not_contains",
    "starts_with",
    "ends_with",
    "exists",
    "not_exists",
    "regex",
  ];

  const rightTypes = ["string", "number", "boolean", "json", "null"];

  return (
    <div className="space-y-5">
      {/* Node Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Condition Name
        </label>
        <input
          type="text"
          value={nodeName}
          onChange={(e) => setNodeName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Check if user is premium"
        />
      </div>

      {/* Mode Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Evaluation Mode
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="mode"
              value="all"
              checked={mode === "all"}
              onChange={(e) => setMode(e.target.value)}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              ALL (AND) - All rules must be true
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="mode"
              value="any"
              checked={mode === "any"}
              onChange={(e) => setMode(e.target.value)}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              ANY (OR) - At least one rule must be true
            </span>
          </label>
        </div>
      </div>

      {/* Rules */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Rules</h3>
          <button
            onClick={addRule}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition"
          >
            <MdAdd size={16} /> Add Rule
          </button>
        </div>

        {rules.length === 0 ? (
          <div className="p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-600 text-sm text-center">
            No rules yet. Click "Add Rule" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-600">
                    Rule {index + 1}
                  </span>
                  <button
                    onClick={() => removeRule(index)}
                    className="text-red-500 hover:text-red-700 text-lg transition"
                  >
                    <MdDelete />
                  </button>
                </div>

                {/* Left field */}
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Left Value
                  </label>
                  <input
                    type="text"
                    value={rule.left}
                    onChange={(e) => updateRule(index, "left", e.target.value)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.backgroundColor = "#e8f4f8";
                      e.currentTarget.style.borderColor = "#3b82f6";
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.borderColor = "";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.borderColor = "";
                      const data = e.dataTransfer.getData(
                        "application/variable",
                      );
                      if (data) {
                        updateRule(index, "left", data);
                      }
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="e.g., {{context.payload.user.plan}} or drag from webhook data"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    💡 Use variables like: {"{"}
                    {"{"}context.payload.email{"}"}
                    {"}"} or drag-drop from webhook data panel
                  </div>
                </div>

                {/* Operator */}
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Operator
                  </label>
                  <select
                    value={rule.operator}
                    onChange={(e) =>
                      updateRule(index, "operator", e.target.value)
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {operators.map((op) => (
                      <option key={op} value={op}>
                        {op.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Right field and type */}
                {!["exists", "not_exists"].includes(rule.operator) && (
                  <>
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        Right Value
                      </label>
                      <input
                        type="text"
                        value={rule.right}
                        onChange={(e) =>
                          updateRule(index, "right", e.target.value)
                        }
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.backgroundColor = "#e8f4f8";
                          e.currentTarget.style.borderColor = "#3b82f6";
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "";
                          e.currentTarget.style.borderColor = "";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.backgroundColor = "";
                          e.currentTarget.style.borderColor = "";
                          const data = e.dataTransfer.getData(
                            "application/variable",
                          );
                          if (data) {
                            updateRule(index, "right", data);
                          }
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder='e.g., "premium" or "100" or drag from webhook data'
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        Value Type
                      </label>
                      <select
                        value={rule.rightType}
                        onChange={(e) =>
                          updateRule(index, "rightType", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {rightTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-900">
        <strong>📖 Help:</strong>
        <ul className="mt-2 ml-5 space-y-1">
          <li>
            • Use {"{"}
            {"{"} and {"}"}
            {"}"} to reference data from context
          </li>
          <li>
            • Examples: {"{"}
            {"{"}context.payload.email{"}"}
            {"}"}, {"{"}
            {"{"}context.payload.user.plan{"}"}
            {"}"}
          </li>
          <li>
            • ALL mode: all rules must be true • ANY mode: at least one must be
            true
          </li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition"
        >
          Save Condition
        </button>
      </div>
    </div>
  );
}

export default ConditionConfig;
