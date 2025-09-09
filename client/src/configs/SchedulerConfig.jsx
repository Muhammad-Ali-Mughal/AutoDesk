import { useState, useEffect } from "react";
import toast from "react-hot-toast";

function SchedulerConfig({ node }) {
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("09:00"); // (HH:mm)
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    if (node?.data) {
      setFrequency(node.data.frequency || "daily");
      setTime(node.data.time || "09:00");
      setTimezone(node.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [node]);

  const handleUpdateNode = () => {
    node.data = {
      ...node.data,
      frequency,
      time,
      timezone,
    };
    toast.success("Schedule updated (not yet saved)");
  };

  return (
    <div className="space-y-4">
      {/* Frequency Selection */}
      <div>
        <label className="block text-sm font-medium mb-1">Frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom (Cron Expression)</option>
        </select>
      </div>

      {/* Time Selection (only if not custom) */}
      {frequency !== "custom" && (
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      )}

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium mb-1">Timezone</label>
        <input
          type="text"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* Save to Node (local, before actual Save handler persists it) */}
      <button
        onClick={handleUpdateNode}
        className="px-4 py-2 rounded bg-teal-600 text-white font-semibold hover:bg-teal-700"
      >
        Apply Schedule
      </button>
    </div>
  );
}

export default SchedulerConfig;
