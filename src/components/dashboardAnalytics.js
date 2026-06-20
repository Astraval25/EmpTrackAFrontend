import { parseLogEntry } from "./logUtils";

const getDayKey = (value) => new Date(value).toDateString();

const formatDayLabel = (date) =>
  date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

const getStartOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const getRecentDayKeys = (span = 7) => {
  const today = getStartOfDay(new Date());
  return Array.from({ length: span }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (span - 1 - index));
    return day;
  });
};

const getHourLabel = (hour) => `${String(hour).padStart(2, "0")}:00`;

export const buildDashboardOverview = ({ users = [], userSnapshots = [] } = {}) => {
  const mergedLogs = [];

  for (const snapshot of userSnapshots) {
    for (const log of snapshot.logs || []) {
      mergedLogs.push({
        ...log,
        username: snapshot.username,
      });
    }
  }

  mergedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalActivityLogs = userSnapshots.reduce((sum, snapshot) => sum + (Number(snapshot.total) || 0), 0);
  const totalCustomers = users.length;

  const recentWindow = mergedLogs.slice(0, 250);
  const recentEvents = recentWindow.slice(0, 10).map((log) => {
    const { activityName, timestamp } = parseLogEntry(log);
    return {
      username: log.username,
      activityName,
      timestamp,
      template: log.template || log?.payload?.template || "",
    };
  });

  const todayKey = getDayKey(new Date());
  const activeTodayLogs = mergedLogs.filter((log) => getDayKey(log.timestamp) === todayKey);
  const activeTodayCustomers = new Set(activeTodayLogs.map((log) => log.username)).size;

  const dailyBuckets = getRecentDayKeys(7).map((day) => ({
    key: day.toDateString(),
    label: formatDayLabel(day),
    count: 0,
  }));
  const dayLookup = new Map(dailyBuckets.map((bucket) => [bucket.key, bucket]));
  for (const log of recentWindow) {
    const key = getDayKey(log.timestamp);
    if (dayLookup.has(key)) {
      dayLookup.get(key).count += 1;
    }
  }

  const hourlyBuckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: getHourLabel(hour),
    count: 0,
  }));
  for (const log of activeTodayLogs.length ? activeTodayLogs : recentWindow) {
    const hour = new Date(log.timestamp).getHours();
    if (hourlyBuckets[hour]) hourlyBuckets[hour].count += 1;
  }

  const userTotals = userSnapshots
    .map((snapshot) => ({
      username: snapshot.username,
      total: Number(snapshot.total) || 0,
      latest: snapshot.logs?.[0]?.timestamp || null,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const templateMap = new Map();
  const statusMap = new Map();
  for (const log of recentWindow) {
    const { activityName, payload } = parseLogEntry(log);
    const template = (log.template || payload?.template || activityName || "Unknown").toString();
    templateMap.set(template, (templateMap.get(template) || 0) + 1);

    const raw = `${activityName} ${payload?.status || ""}`.toLowerCase();
    const status = raw.includes("close") || raw.includes("end") || raw.includes("exit")
      ? "Closed"
      : raw.includes("open") || raw.includes("start") || raw.includes("launch")
        ? "Opened"
        : "In Progress";
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  }

  const templateBreakdown = [...templateMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const statusBreakdown = [...statusMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const hourlyPeak = hourlyBuckets.reduce((max, bucket) => Math.max(max, bucket.count), 0);

  return {
    totalCustomers,
    totalActivityLogs,
    activeTodayCustomers,
    activeTodayLogs: activeTodayLogs.length,
    recentEvents,
    dailySeries: dailyBuckets,
    hourlySeries: hourlyBuckets,
    userTotals,
    templateBreakdown,
    statusBreakdown,
    hourlyPeak,
    generatedAt: new Date().toISOString(),
    recentLogs: recentWindow,
  };
};
