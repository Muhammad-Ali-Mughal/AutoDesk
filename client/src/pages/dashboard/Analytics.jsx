import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCircle,
  FaSearch,
  FaRegClock,
  FaRegCalendarAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { actionStyles } from "../../utils/actionStyles.js";
import api from "../../utils/api.js";

const PALE_BG = "bg-gray-50";
const CARD = "bg-white rounded-2xl shadow px-6 py-5";
const ACCENT = "text-violet-600";

const PRESETS = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

function formatDateISO(d) {
  return new Date(d).toISOString();
}

function dateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n + 1); // inclusive
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Analytics() {
  const [status, setStatus] = useState("all");
  const [preset, setPreset] = useState(PRESETS[0].id); // last 7 days
  const [customRange, setCustomRange] = useState(null); // {start, end} optional
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalExecutions: 0,
    successRate: 0,
    avgDuration: 0,
    failedExecutions: 0,
    executionsOverTime: [],
    workflowStats: [],
    actionStats: [],
  });
  const [error, setError] = useState(null);

  // compute start/end from preset or customRange
  const dateRange = useMemo(() => {
    if (customRange) return customRange;
    const p = PRESETS.find((x) => x.id === preset) || PRESETS[0];
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = dateNDaysAgo(p.days);
    return { start, end };
  }, [preset, customRange]);

  // fetch analytics
  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          start: formatDateISO(dateRange.start),
          end: formatDateISO(dateRange.end),
          ...(status !== "all" && { status }),
        };

        const res = await api.get("/analytics", { params });

        if (!mounted) return;

        setStats({
          totalExecutions: res.data.totalExecutions ?? 0,
          successRate: res.data.successRate ?? 0,
          avgDuration: res.data.avgDuration ?? 0,
          failedExecutions: res.data.failedExecutions ?? 0,
          executionsOverTime: res.data.executionsOverTime ?? [],
          workflowStats: res.data.workflowStats ?? [],
          actionStats: res.data.actionStats ?? [],
        });
      } catch (err) {
        console.error("Failed to load analytics", err);
        setError("Failed to load analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, [status, dateRange.start, dateRange.end]);

  // Derived data for pie
  const pieData = [
    { name: "Success", value: stats.successRate },
    { name: "Failed", value: Math.max(0, 100 - stats.successRate) },
  ];
  const PIE_COLORS = ["#7c3aed", "#e9d5ff"]; // violet vs pale

  return (
    <div className={`${PALE_BG} min-h-screen p-6 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Top bar: title + filters */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center gap-2">
              Analytics
              <span className="text-gray-400 text-sm">•</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of operations, scenarios and errors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status dropdown */}
            <div className={`${CARD} flex items-center gap-2`}>
              <label className="text-xs text-gray-500 mr-2">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="text-sm outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option value={o.value} key={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date preset */}
            <div className={`${CARD} flex items-center gap-3`}>
              <FaRegCalendarAlt className="text-gray-400" />
              <div className="flex items-center gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPreset(p.id);
                      setCustomRange(null);
                    }}
                    className={`text-sm px-3 py-1 rounded-lg transition ${
                      preset === p.id
                        ? "bg-violet-50 text-violet-700 font-semibold"
                        : "text-gray-600 hover:text-violet-600"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom range small UI (start/end) */}
            <div className={`${CARD} flex items-center gap-2`}>
              <FaRegClock className="text-gray-400" />
              <div className="text-sm text-gray-600">
                {new Date(dateRange.start).toLocaleDateString()} —{" "}
                {new Date(dateRange.end).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Top row: pie + summary cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Left: Operations by team (pie) - matches screenshot layout */}
            <div className="lg:col-span-4">
              <div className={`${CARD} h-full`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Operations by team
                  </h3>
                  <button className="text-xs text-gray-400 hover:text-gray-600">
                    ⋯
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div style={{ width: 150, height: 120 }}>
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "No teams",
                              value: stats.totalExecutions || 1,
                            },
                          ]}
                          dataKey="value"
                          innerRadius={36}
                          outerRadius={52}
                          startAngle={90}
                          endAngle={450}
                        >
                          <Cell fill="#c4b5fd" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-2">
                      Total operations used
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.totalExecutions ?? 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Change vs previous: -
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ background: "#7c3aed" }}
                        />
                        <span>No team (1)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right top summary cards */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard
                title="Total operations used"
                value={stats.totalExecutions}
                subtitle="+4%"
              />
              <SummaryCard
                title="Scenario executions"
                value={stats.totalExecutions}
                subtitle="+1%"
              />
              <SummaryCard
                title="Total errors"
                value={
                  /* approximate from failed count */ stats.failedExecutions
                }
                subtitle="-"
              />
              <SummaryCard
                title="Error rate"
                value={`${
                  stats.successRate ? (100 - stats.successRate).toFixed(1) : 0
                }%`}
                subtitle=""
              />
            </div>
          </div>

          {/* Middle: table + charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: table list of scenarios (top workflows) */}
            <div className="lg:col-span-8">
              <div className={`${CARD}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Scenario
                  </h3>
                  <div className="text-sm text-gray-500">Operations used ↓</div>
                </div>

                {/* Table header */}
                <div className="hidden md:flex items-center text-xs text-gray-400 uppercase border-b pb-2 mb-2">
                  <div className="w-1/2">Scenario</div>
                  <div className="w-1/6">Operations used</div>
                  <div className="w-1/6">Usage change</div>
                  <div className="w-1/6">Errors</div>
                  <div className="w-1/6">Error rate</div>
                </div>

                {/* Table rows */}
                <div>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="animate-pulse bg-gray-100 h-12 rounded-md"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stats.workflowStats.length === 0 && (
                        <div className="py-8 text-center text-gray-500">
                          No scenarios yet
                        </div>
                      )}
                      {stats.workflowStats.map((wf, idx) => (
                        <div
                          key={wf.workflowId ?? idx}
                          className="flex items-center gap-3 py-3 border-b last:border-b-0"
                        >
                          <div className="w-1/2 flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                background:
                                  idx % 2 === 0 ? "#7c3aed" : "#a78bfa",
                              }}
                            />
                            <div>
                              <div className="text-sm text-violet-700 font-semibold">
                                {wf.workflowName || "Unnamed"}
                              </div>
                              <div className="text-xs text-gray-400">
                                {/* optionally show last run */}
                              </div>
                            </div>
                          </div>

                          <div className="w-1/6 text-sm font-semibold">
                            {wf.executions}
                          </div>
                          <div className="w-1/6 text-sm text-gray-500">-</div>
                          <div className="w-1/6 text-sm text-red-500">
                            {Math.round(100 - (wf.successRate ?? 100) || 0)}%
                          </div>
                          <div className="w-1/6 text-sm">
                            {(100 - (wf.successRate ?? 100)).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: charts (executions over time + success vs failed) */}
            <div className="lg:col-span-4 space-y-4">
              <div className={`${CARD}`}>
                <h4 className="text-sm font-medium mb-3">
                  Executions Over Time
                </h4>
                <div style={{ width: "100%", height: 180 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={stats.executionsOverTime}>
                      <defs>
                        <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="#7c3aed"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="95%"
                            stopColor="#7c3aed"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#7c3aed"
                        fill="url(#gradA)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`${CARD}`}>
                <h4 className="text-sm font-medium mb-3">Success vs Failed</h4>
                <div style={{ width: "100%", height: 180 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        innerRadius={36}
                        outerRadius={72}
                        label
                      >
                        {pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: top actions */}
          <div className="mt-6">
            <div className={`${CARD}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Top Actions
                </h3>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-400">
                    Showing top actions
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-gray-100 h-20 rounded-md"
                    />
                  ))
                ) : stats.actionStats.length === 0 ? (
                  <div className="col-span-6 text-center py-6 text-gray-500">
                    No action data yet
                  </div>
                ) : (
                  stats.actionStats.map((act) => {
                    const style =
                      actionStyles[act.action] || actionStyles.custom;
                    const Icon = style.icon;
                    return (
                      <motion.div
                        key={act.action}
                        whileHover={{ y: -3 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 16,
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                      >
                        <div
                          className="p-2 rounded-md"
                          style={{ background: style.gradient }}
                        >
                          <Icon className="text-white text-lg" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">
                            {style.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {act.totalRuns} runs
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Floating help button */}
          <div className="fixed bottom-6 right-6">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition">
              <FaQuestionCircle />
              <span className="text-sm">Search for help</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Small components ---------- */

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className={`${CARD} flex flex-col justify-between`}>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="flex items-center justify-between mt-3">
        <div>
          <div className="text-2xl font-bold text-gray-900">{value ?? 0}</div>
          <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
        </div>
        <div className="p-3 rounded-full bg-violet-50">
          <FaRegClock className="text-violet-600" />
        </div>
      </div>
    </div>
  );
}
