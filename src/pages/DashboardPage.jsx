import { createElement, useMemo, useState } from "react";
import {
  Users,
  Activity,
  Database,
  Clock3,
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart,
  CalendarRange,
  Flame,
  RefreshCw,
  ArrowRight,
  Search,
  MapPinned,
} from "lucide-react";
import { LogDetailModal } from "../components/LogDetailModal";

const formatFullDateTime = (value) =>
  new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const percent = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0);

const maxValue = (items, accessor) => Math.max(1, ...items.map((item) => accessor(item)));

export const DashboardPage = ({
  users,
  loading,
  loggedInAdmin,
  overview,
  overviewLoading,
  onLoadLogs,
}) => {
  const [selectedLog, setSelectedLog] = useState(null);
  const isBusy = loading || overviewLoading;

  const safeOverview = overview || {
    totalCustomers: users.length,
    totalActivityLogs: 0,
    activeTodayCustomers: 0,
    activeTodayLogs: 0,
    dailySeries: [],
    hourlySeries: [],
    userTotals: [],
    templateBreakdown: [],
    statusBreakdown: [],
    recentEvents: [],
    recentLogs: [],
    generatedAt: null,
    hourlyPeak: 0,
  };

  const coverage = useMemo(() => percent(safeOverview.activeTodayCustomers, safeOverview.totalCustomers), [safeOverview.activeTodayCustomers, safeOverview.totalCustomers]);

  const metrics = useMemo(() => [
    {
      label: "Total Customers",
      value: safeOverview.totalCustomers,
      hint: "Registered workspace users",
      icon: Users,
    },
    {
      label: "Aggregate Logs",
      value: safeOverview.totalActivityLogs,
      hint: "Cross-account activity volume",
      icon: Database,
    },
    {
      label: "Active Today",
      value: safeOverview.activeTodayCustomers,
      hint: `${safeOverview.activeTodayLogs} log${safeOverview.activeTodayLogs === 1 ? "" : "s"} today`,
      icon: Activity,
    },
    {
      label: "Live Coverage",
      value: `${coverage}%`,
      hint: "Customers active today",
      icon: TrendingUp,
    },
  ], [coverage, safeOverview.activeTodayCustomers, safeOverview.activeTodayLogs, safeOverview.totalActivityLogs, safeOverview.totalCustomers]);

  const recentLogs = safeOverview.recentLogs || [];

  return (
    <div className="px-8 py-8 pb-14 space-y-8 min-h-[180vh] anim-fade-up">
      <section className="rounded-[2rem] p-7 md:p-9 overflow-hidden shadow-xl relative anim-pop" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(79,70,229,0.9))", border: "1px solid var(--border)" }}>
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 28%)" }} />
        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-5 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 w-fit backdrop-blur">
              <Sparkles size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.28em]">Real-time overview</span>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.35em]" style={{ color: "rgba(224,231,255,0.75)" }}>
                Activity Dashboard
              </p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.02]">
                A live command center for customer activity and log health.
              </h1>
              <p className="max-w-2xl text-sm md:text-base leading-7" style={{ color: "rgba(224,231,255,0.78)" }}>
                Monitor customers, total logs, usage patterns, and live activity trends across the entire workspace from a single scrollable dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge icon={RefreshCw} label={isBusy ? "Syncing data" : "Live sync"} />
              <Badge icon={CalendarRange} label={safeOverview.generatedAt ? `Updated ${new Date(safeOverview.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Waiting for data"} />
              <Badge icon={MapPinned} label={loggedInAdmin || "Administrator"} />
            </div>
          </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full xl:w-[380px] anim-float-gentle">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-3xl p-4 md:p-5 text-white" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(14px)" }}>
                {createElement(metric.icon, { size: 18, className: "mb-4", style: { color: "rgba(224,231,255,0.85)" } })}
                <p className="text-3xl font-black tracking-tight">{metric.value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] mt-1" style={{ color: "rgba(224,231,255,0.78)" }}>
                  {metric.label}
                </p>
                <p className="text-[11px] font-medium mt-2" style={{ color: "rgba(224,231,255,0.72)" }}>
                  {metric.hint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 stagger-children">
        <div className="xl:col-span-8 card p-6 anim-pop">
          <ChartHeader
            icon={TrendingUp}
            title="Activity Trend"
            subtitle="Seven-day volume across all customers"
          />
          <div className="mt-6">
            <LineAreaChart series={safeOverview.dailySeries} />
          </div>
        </div>

        <div className="xl:col-span-4 card p-6 anim-pop">
          <ChartHeader
            icon={PieChart}
            title="Status Mix"
            subtitle="Open, closed, and in-progress sessions"
          />
          <div className="mt-6">
            <DonutChart segments={safeOverview.statusBreakdown} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 stagger-children">
        <div className="xl:col-span-6 card p-6 anim-pop">
          <ChartHeader
            icon={BarChart3}
            title="Top Customers"
            subtitle="Users driving the most activity"
          />
          <div className="mt-6">
            <HorizontalBarChart items={safeOverview.userTotals} />
          </div>
        </div>

        <div className="xl:col-span-6 card p-6 anim-pop">
          <ChartHeader
            icon={Flame}
            title="Hourly Heatmap"
            subtitle="Activity intensity across the day"
          />
          <div className="mt-6">
            <HeatmapChart series={safeOverview.hourlySeries} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 stagger-children">
        <div className="xl:col-span-5 card p-6 anim-pop">
          <ChartHeader
            icon={Activity}
            title="Template Mix"
            subtitle="Most common app or template activity"
          />
          <div className="mt-6">
            <StackedList items={safeOverview.templateBreakdown} />
          </div>
        </div>

        <div className="xl:col-span-7 card p-6 anim-pop">
          <ChartHeader
            icon={Clock3}
            title="Live Activity Feed"
            subtitle="Latest events across all customers"
          />
          <div className="mt-6 space-y-3">
            {recentLogs.length === 0 ? (
              <EmptyState label="No recent activity available yet." />
            ) : (
              recentLogs.slice(0, 8).map((log) => {
                const timestamp = log.timestamp;
                return (
                  <button
                    key={`${log.username}-${timestamp}-${log.activity || ""}`}
                    onClick={() => setSelectedLog(log)}
                    className="w-full text-left rounded-2xl px-4 py-4 transition-all hover:translate-y-[-1px]"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                          {log.username}
                        </p>
                        <p className="mt-1 text-sm font-black truncate" style={{ color: "var(--text-primary)" }}>
                          {log.activityName}
                        </p>
                        <p className="mt-1 text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                          {formatFullDateTime(timestamp)}
                        </p>
                      </div>
                      <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 stagger-children">
        <div className="xl:col-span-7 card p-6 anim-pop">
          <ChartHeader
            icon={Users}
            title="Customer Leaderboard"
            subtitle="Quick jump into user activity logs"
          />
          <div className="mt-6 space-y-2">
            {safeOverview.userTotals.length === 0 ? (
              <EmptyState label="No customer data yet." />
            ) : (
              safeOverview.userTotals.map((entry) => {
                return (
                  <button
                    key={entry.username}
                    onClick={() => onLoadLogs(entry.username)}
                    className="w-full flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition-all hover:translate-y-[-1px]"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black truncate" style={{ color: "var(--text-primary)" }}>
                        {entry.username}
                      </p>
                      <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {entry.total} total logs
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="badge-accent">{percent(entry.total, safeOverview.totalActivityLogs || 1)}%</span>
                      <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="xl:col-span-5 card p-6 anim-pop">
          <ChartHeader
            icon={Search}
            title="Template Ranking"
            subtitle="Top repeated templates or app events"
          />
          <div className="mt-6">
            <HorizontalBarChart items={safeOverview.templateBreakdown} compact />
          </div>
        </div>
      </section>

      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

const Badge = ({ icon, label }) => (
  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.1)" }}>
    {createElement(icon, { size: 13 })}
    <span className="text-[10px] font-black uppercase tracking-[0.26em]">{label}</span>
  </div>
);

const MetricCard = ({ metric }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.26em]" style={{ color: "var(--text-muted)" }}>
          {metric.label}
        </p>
        <p className="mt-3 text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          {metric.value}
        </p>
      </div>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-light)", color: "var(--accent-text)" }}>
        {createElement(metric.icon, { size: 18 })}
      </div>
    </div>
    <p className="mt-4 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
      {metric.hint}
    </p>
  </div>
);

const ChartHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "var(--accent-light)", color: "var(--accent-text)" }}>
        {createElement(icon, { size: 13 })}
        <span className="text-[10px] font-black uppercase tracking-[0.24em]">{title}</span>
      </div>
      <p className="mt-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        {subtitle}
      </p>
    </div>
  </div>
);

const EmptyState = ({ label }) => (
  <div className="rounded-2xl px-4 py-10 text-center" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
    <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
      {label}
    </p>
  </div>
);

const LineAreaChart = ({ series }) => {
  const width = 760;
  const height = 280;
  const padding = 28;
  const highest = maxValue(series, (item) => item.count);
  const step = series.length > 1 ? (width - padding * 2) / (series.length - 1) : 0;

  const points = series.map((item, index) => {
    const x = padding + index * step;
    const y = height - padding - ((item.count / highest) * (height - padding * 2));
    return { x, y, label: item.label, count: item.count };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = [
    `M ${points[0]?.x || padding} ${height - padding}`,
    ...points.map((point, index) => `${index === 0 ? "L" : "L"} ${point.x} ${point.y}`),
    `L ${points[points.length - 1]?.x || width - padding} ${height - padding}`,
    "Z",
  ].join(" ");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {series.map((item) => (
          <span key={item.label} className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
            {item.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[280px] overflow-visible">
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.36" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((tick) => {
          const y = padding + (height - padding * 2) * tick;
          return <line key={tick} x1={padding} x2={width - padding} y1={y} y2={y} stroke="var(--border)" strokeDasharray="4 6" />;
        })}

        <path d={areaPath} fill="url(#trendFill)" />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="6" fill="var(--accent)" opacity="0.18" />
            <circle cx={point.x} cy={point.y} r="3.5" fill="var(--accent)" />
            <text x={point.x} y={height - 7} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontWeight="700">
              {point.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
        {points.map((point) => (
          <div key={point.label} className="rounded-2xl px-3 py-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {point.label}
            </p>
            <p className="mt-2 text-lg font-black" style={{ color: "var(--text-primary)" }}>
              {point.count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const DonutChart = ({ segments }) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const palette = ["#4f46e5", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr] items-center">
      <div className="relative mx-auto w-[200px] h-[200px]">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--surface-2)" strokeWidth="20" />
          {segments.length === 0 ? (
            <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--accent)" strokeWidth="20" strokeDasharray={circumference} strokeDashoffset="0" />
          ) : (
            segments.map((segment, index) => {
              const dash = total > 0 ? (segment.value / total) * circumference : 0;
              const dashArray = `${dash} ${circumference - dash}`;
              const stroke = palette[index % palette.length];
              const circle = (
                <circle
                  key={segment.label}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="20"
                  strokeDasharray={dashArray}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                />
              );
              offset += dash;
              return circle;
            })
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>
            Total
          </p>
          <p className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
            {total}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {segments.length === 0 ? (
          <EmptyState label="No status data yet." />
        ) : (
          segments.map((segment, index) => (
            <div key={segment.label} className="rounded-2xl px-4 py-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ background: palette[index % palette.length] }} />
                  <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                    {segment.label}
                  </p>
                </div>
                <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                  {segment.value}
                </p>
              </div>
              <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.12)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${total > 0 ? (segment.value / total) * 100 : 0}%`, background: palette[index % palette.length] }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const HorizontalBarChart = ({ items, compact = false }) => {
  const max = maxValue(items, (item) => item.total || item.value || 0);
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <EmptyState label="No rankings available yet." />
      ) : (
        items.map((item, index) => {
          const value = item.total || item.value || 0;
          const width = `${(value / max) * 100}%`;
          return (
            <div key={item.username || item.label} className={`rounded-2xl ${compact ? "px-3 py-3" : "px-4 py-4"}`} style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-black truncate" style={{ color: "var(--text-primary)" }}>
                    {item.username || item.label}
                  </p>
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {item.total ? `${item.total} total logs` : `${value} events`}
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  #{index + 1}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.12)" }}>
                <div className="h-full rounded-full" style={{ width, background: "linear-gradient(90deg, var(--accent), #0ea5e9)" }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

const HeatmapChart = ({ series }) => {
  const max = maxValue(series, (item) => item.count);
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2">
      {series.map((item) => {
        const intensity = max > 0 ? item.count / max : 0;
        return (
          <div
            key={item.hour}
            className="rounded-xl px-2 py-3 text-center"
            style={{
              background: `rgba(79,70,229,${0.08 + intensity * 0.45})`,
              border: "1px solid var(--border)",
            }}
            title={`${item.label} - ${item.count} activities`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {item.label}
            </p>
            <p className="mt-2 text-sm font-black" style={{ color: "var(--text-primary)" }}>
              {item.count}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const StackedList = ({ items }) => (
  <div className="space-y-3">
    {items.length === 0 ? (
      <EmptyState label="No template data yet." />
    ) : (
      items.map((item, index) => (
        <div key={item.label} className="rounded-2xl px-4 py-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-black truncate" style={{ color: "var(--text-primary)" }}>
                {item.label}
              </p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
                {item.value} events
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {index + 1}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(148,163,184,0.12)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(10, percent(item.value, maxValue(items, (entry) => entry.value || 0)))}%`, background: "linear-gradient(90deg, #8b5cf6, var(--accent))" }}
            />
          </div>
        </div>
      ))
    )}
  </div>
);
