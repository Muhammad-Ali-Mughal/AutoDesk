import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";

const QUICK_TIMES = ["08:00", "09:00", "12:00", "18:00"];
const QUICK_MINUTES = [0, 5, 15, 30, 45];
const WEEK_DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const getTimezoneOptions = () => {
  if (typeof Intl?.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }
  return [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Dubai",
    "Asia/Karachi",
    "Asia/Tokyo",
  ];
};

const buildCronPreview = ({
  frequency,
  time,
  dayOfWeek,
  dayOfMonth,
  cron,
  minute,
  runOnce,
  runAt,
}) => {
  if (runOnce) {
    if (!runAt || !time) return "";
    const date = new Date(runAt);
    const [hour, min] = time.split(":");
    return `${min} ${hour} ${date.getDate()} ${date.getMonth() + 1} *`;
  }
  if (frequency === "custom") return cron || "";
  if (frequency === "hourly") {
    const minuteValue =
      typeof minute === "number" ? minute : Number(minute) || 0;
    return `${minuteValue} * * * *`;
  }
  if (!time) return "";

  const [hour, minuteValue] = time.split(":");
  if (frequency === "daily") return `${minuteValue} ${hour} * * *`;
  if (frequency === "weekly") {
    const day = dayOfWeek ?? 1;
    return `${minuteValue} ${hour} * * ${day}`;
  }
  if (frequency === "monthly") {
    const day = dayOfMonth ?? 1;
    return `${minuteValue} ${hour} ${day} * *`;
  }
  return "";
};

const getSummaryText = ({
  frequency,
  time,
  dayOfWeek,
  dayOfMonth,
  timezone,
  runOnce,
  runAt,
  minute,
}) => {
  if (runOnce) {
    return `Runs once on ${runAt || "selected date"} at ${time} (${timezone}).`;
  }
  if (frequency === "hourly") {
    const minuteValue =
      typeof minute === "number" ? minute : Number(minute) || 0;
    return `Runs every hour at minute ${minuteValue} (${timezone}).`;
  }
  if (frequency === "daily") {
    return `Runs daily at ${time} (${timezone}).`;
  }
  if (frequency === "weekly") {
    const day = WEEK_DAYS.find((d) => d.value === dayOfWeek)?.label || "Monday";
    return `Runs weekly on ${day} at ${time} (${timezone}).`;
  }
  if (frequency === "monthly") {
    return `Runs monthly on day ${dayOfMonth} at ${time} (${timezone}).`;
  }
  if (frequency === "custom") {
    return "Runs on a custom cron schedule.";
  }
  return "Schedule not configured.";
};

function SchedulerConfig({ node, workflowId }) {
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("09:00"); // (HH:mm)
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [runOnce, setRunOnce] = useState(false);
  const [runAt, setRunAt] = useState("");
  const [minute, setMinute] = useState(0);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [cron, setCron] = useState("");
  const timezones = useMemo(getTimezoneOptions, []);
  const cronPreview = useMemo(
    () =>
      buildCronPreview({
        frequency,
        time,
        dayOfWeek,
        dayOfMonth,
        cron,
        minute,
        runOnce,
        runAt,
      }),
    [frequency, time, dayOfWeek, dayOfMonth, cron, minute, runOnce, runAt]
  );
  const summaryText = useMemo(
    () =>
      getSummaryText({
        frequency,
        time,
        dayOfWeek,
        dayOfMonth,
        timezone,
        runOnce,
        runAt,
        minute,
      }),
    [frequency, time, dayOfWeek, dayOfMonth, timezone, runOnce, runAt, minute]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadSchedule = async () => {
      try {
        if (!workflowId) return;
        const res = await api.get(`/schedules/${workflowId}`);
        const schedule = res.data?.schedules?.[0];
        if (!mounted || !schedule) return;

        setFrequency(schedule.frequency || "daily");
        setTime(schedule.time || "09:00");
        setRunOnce(!!schedule.runOnce);
        setRunAt(
          schedule.runAt
            ? new Date(schedule.runAt).toISOString().slice(0, 10)
            : ""
        );
        setMinute(typeof schedule.minute === "number" ? schedule.minute : 0);
        setTimezone(
          schedule.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        );
        setDayOfWeek(
          typeof schedule.dayOfWeek === "number" ? schedule.dayOfWeek : 1
        );
        setDayOfMonth(
          typeof schedule.dayOfMonth === "number" ? schedule.dayOfMonth : 1
        );
        setCron(schedule.cron || "");
      } catch (err) {
        console.warn("Failed to load schedule config:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSchedule();
    return () => {
      mounted = false;
    };
  }, [workflowId]);

  useEffect(() => {
    if (!node?.data) return;
    setFrequency(node.data.frequency || "daily");
    setTime(node.data.time || "09:00");
    setRunOnce(!!node.data.runOnce);
    setRunAt(node.data.runAt || "");
    setMinute(typeof node.data.minute === "number" ? node.data.minute : 0);
    setTimezone(
      node.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    setDayOfWeek(
      typeof node.data.dayOfWeek === "number" ? node.data.dayOfWeek : 1
    );
    setDayOfMonth(
      typeof node.data.dayOfMonth === "number" ? node.data.dayOfMonth : 1
    );
    setCron(node.data.cron || "");
  }, [node?.id]);

  const handleUpdateNode = () => {
    node.data = {
      ...node.data,
      frequency,
      time,
      timezone,
      runOnce,
      runAt,
      minute,
      dayOfWeek,
      dayOfMonth,
      cron,
    };
    toast.success("Schedule updated (not yet saved)");
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading schedule...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Schedule Summary
        </div>
        <div className="mt-2 text-sm text-gray-700">{summaryText}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-white px-3 py-1 text-gray-600">
            Timezone: {timezone}
          </span>
          <span className="rounded-full bg-white px-3 py-1 font-mono text-gray-600">
            Cron: {cronPreview || "--"}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Schedule type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Repeat", value: false },
            { label: "One-time", value: true },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setRunOnce(option.value)}
              className={`px-3 py-2 rounded-lg border text-sm font-semibold transition ${
                runOnce === option.value
                  ? "border-teal-600 bg-teal-50 text-teal-700 shadow-sm"
                  : "border-gray-200 text-gray-600 hover:border-teal-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {!runOnce && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Frequency
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["hourly", "daily", "weekly", "monthly", "custom"].map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFrequency(option)}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold transition ${
                    frequency === option
                      ? "border-teal-600 bg-teal-50 text-teal-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-teal-300"
                  }`}
                >
                  {option === "custom" ? "Custom" : option}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {runOnce && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-700">Run once</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={runAt}
                onChange={(e) => setRunAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
        </div>
      )}

      {!runOnce && frequency !== "custom" && frequency !== "hourly" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Time of day
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_TIMES.map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setTime(quick)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  time === quick
                    ? "border-teal-600 text-teal-700 bg-teal-50"
                    : "border-gray-200 text-gray-500 bg-white"
                }`}
              >
                {quick}
              </button>
            ))}
          </div>
        </div>
      )}

      {!runOnce && frequency === "hourly" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Minute of the hour
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={59}
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="w-28 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_MINUTES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMinute(value)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    minute === value
                      ? "border-teal-600 text-teal-700 bg-teal-50"
                      : "border-gray-200 text-gray-500 bg-white"
                  }`}
                >
                  :{String(value).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!runOnce && frequency === "weekly" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Day of week
          </label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          >
            {WEEK_DAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {!runOnce && frequency === "monthly" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Day of month
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>
      )}

      {!runOnce && frequency === "custom" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cron expression
          </label>
          <input
            type="text"
            value={cron}
            onChange={(e) => setCron(e.target.value)}
            placeholder="0 9 * * *"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
          <p className="text-xs text-gray-500 mt-2">
            Example: 0 9 * * * = every day at 09:00
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleUpdateNode}
        className="w-full px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-sm"
      >
        Apply Schedule
      </button>
    </div>
  );
}

export default SchedulerConfig;
