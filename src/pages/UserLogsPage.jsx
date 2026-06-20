import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Search,
  Download,
  Activity,
  ExternalLink,
  Settings,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { adminService } from "../api/adminService";
import { LogDetailModal } from "../components/LogDetailModal";
import { parseLogEntry } from "../components/logUtils";

const PAGE_SIZE = 20;
const EXPORT_PAGE_SIZE = 200;

const sortChronologically = (items) =>
  [...items].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

const formatDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });

const formatTimeFull = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export const UserLogsPage = ({ username, token, initialLogs = [], onBack }) => {
  const [filterType, setFilterType] = useState("last20");
  const [searchQuery, setSearchQuery] = useState("");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [visibleLogs, setVisibleLogs] = useState(sortChronologically(initialLogs));
  const [totalLogs, setTotalLogs] = useState(initialLogs.length);
  const [hasMore, setHasMore] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exportingLogs, setExportingLogs] = useState(false);
  const [buildingReport, setBuildingReport] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [kioskRules, setKioskRules] = useState({
    screenShotEnable: true,
    mouseTrackingEnable: true,
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const scrollRef = useRef(null);
  const visibleCountRef = useRef(visibleLogs.length);

  const buildOptions = useCallback((offset = 0, limit = PAGE_SIZE) => {
    const options = { limit, offset, search: searchQuery.trim() };
    if (filterType === "custom") {
      options.startDate = customDates.start;
      options.endDate = customDates.end;
    }
    return options;
  }, [searchQuery, filterType, customDates.start, customDates.end]);

  const fetchLogs = useCallback(async ({ reset = false } = {}) => {
    if (!token || !username) return;
    reset ? setLoadingLogs(true) : setLoadingMore(true);
    setErrorMsg("");
    try {
      const response = await adminService.getLogs(token, username, buildOptions(reset ? 0 : visibleCountRef.current, PAGE_SIZE));
      setVisibleLogs((currentVisibleLogs) => sortChronologically(reset ? response.logs : [...currentVisibleLogs, ...response.logs]));
      setTotalLogs(response.total);
      setHasMore(response.hasMore);
      if (reset && scrollRef.current) scrollRef.current.scrollTop = 0;
    } catch (error) {
      setErrorMsg(error.message || "Unable to load logs");
      if (reset) {
        setVisibleLogs([]);
        setTotalLogs(0);
        setHasMore(false);
      }
    } finally {
      setLoadingLogs(false);
      setLoadingMore(false);
    }
  }, [token, username, buildOptions]);

  useEffect(() => {
    setVisibleLogs(sortChronologically(initialLogs));
    setTotalLogs(initialLogs.length);
    setHasMore(false);
  }, [initialLogs]);

  useEffect(() => {
    visibleCountRef.current = visibleLogs.length;
  }, [visibleLogs.length]);

  useEffect(() => {
    if (!showSettings) fetchLogs({ reset: true });
  }, [username, token, filterType, customDates.start, customDates.end, searchQuery, showSettings, fetchLogs]);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || filterType !== "custom" || loadingLogs || loadingMore || !hasMore) return;
    if (container.scrollHeight - container.scrollTop - container.clientHeight < 120) {
      fetchLogs();
    }
  };

  const summary = useMemo(() => {
    const uniqueDays = new Set(visibleLogs.map((log) => new Date(log.timestamp).toDateString())).size;
    return {
      firstLog: visibleLogs[0] || null,
      lastLog: visibleLogs[visibleLogs.length - 1] || null,
      uniqueDays,
    };
  }, [visibleLogs]);

  const downloadCsv = (rows, name) => {
    const anchor = document.createElement("a");
    anchor.href = encodeURI(`data:text/csv;charset=utf-8,${rows.join("\n")}`);
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const fetchAll = async () => {
    const all = [];
    let offset = 0;
    let more = true;
    while (more) {
      const response = await adminService.getLogs(token, username, buildOptions(offset, EXPORT_PAGE_SIZE));
      all.push(...response.logs);
      offset += response.logs.length;
      more = response.hasMore && response.logs.length > 0;
    }
    return sortChronologically(all);
  };

  const handleDownloadReport = async () => {
    if (!visibleLogs.length) return;
    setBuildingReport(true);
    try {
      const rows = [
        "Metric,Value",
        `"Username","${username}"`,
        `"Filter","${filterType === "last20" ? "Last 20" : "Custom Range"}"`,
        `"Visible Logs","${visibleLogs.length}"`,
        `"Total Logs","${totalLogs}"`,
        `"Active Days","${summary.uniqueDays}"`,
        "",
        "Activity,Date,Time",
        ...visibleLogs.map((log) => {
          const { activityName, timestamp } = parseLogEntry(log);
          return `"${activityName.replace(/"/g, '""')}","${formatDate(timestamp)}","${formatTimeFull(timestamp)}"`;
        }),
      ];
      downloadCsv(rows, `${username}_report.csv`);
    } finally {
      setBuildingReport(false);
    }
  };

  const handleExport = async () => {
    if (!token || !username || !totalLogs) return;
    setExportingLogs(true);
    try {
      const all = await fetchAll();
      const rows = [
        "Activity,Date,Time",
        ...all.map((log) => {
          const { activityName, timestamp } = parseLogEntry(log);
          return `"${activityName.replace(/"/g, '""')}","${formatDate(timestamp)}","${formatTimeFull(timestamp)}"`;
        }),
      ];
      downloadCsv(rows, `${username}_logs.csv`);
    } catch (error) {
      setErrorMsg(error.message || "Export failed");
    } finally {
      setExportingLogs(false);
    }
  };

  const handleSaveRules = () => {
    setSuccessMsg(`Rules updated for ${username}`);
    setTimeout(() => {
      setSuccessMsg("");
      setShowSettings(false);
    }, 2000);
  };

  const S = {
    card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1rem" },
    surface2: { background: "var(--surface-2)", border: "1px solid var(--border)" },
    textPrimary: { color: "var(--text-primary)" },
    textMuted: { color: "var(--text-muted)" },
    textSecondary: { color: "var(--text-secondary)" },
    accent: { background: "var(--accent)", color: "#fff" },
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ ...S.surface2, color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black" style={S.textPrimary}>
              Activity History
            </h1>
            <div className="flex items-center gap-2 text-xs font-bold mt-0.5" style={S.textMuted}>
              <span>{username}</span>
              <span>-</span>
              <span>{showSettings ? "Kiosk Configuration" : `${totalLogs} logs`}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={showSettings ? S.accent : { ...S.surface2, color: "var(--text-secondary)" }}
          >
            <Settings size={15} />
            Kiosk Rules
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={!visibleLogs.length || buildingReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ ...S.surface2, color: "var(--text-secondary)" }}
          >
            <Download size={15} />
            {buildingReport ? "Building..." : "Report"}
          </button>
          <button
            onClick={handleExport}
            disabled={!totalLogs || exportingLogs}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-40"
          >
            <ExternalLink size={15} />
            {exportingLogs ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>

      {!showSettings && (
        <div className="p-4 rounded-2xl grid grid-cols-1 lg:grid-cols-3 gap-4 items-center" style={S.card}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={S.accent}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[13px] font-black" style={S.textPrimary}>
                {username}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest" style={S.textMuted}>
                {totalLogs} logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl self-center" style={S.surface2}>
            {["last20", "custom"].map((option) => (
              <button
                key={option}
                onClick={() => setFilterType(option)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                style={filterType === option ? S.accent : { color: "var(--text-muted)", background: "transparent" }}
              >
                {option === "last20" ? "Last 20" : "Custom Range"}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={S.textMuted} />
            <input
              type="text"
              placeholder="Search activities..."
              className="premium-input h-9 pl-9 text-[13px]"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>
      )}

      {!showSettings && filterType === "custom" && (
        <div className="p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-3 duration-300" style={S.card}>
          {["start", "end"].map((key) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={S.textMuted}>
                {key === "start" ? "Start Date" : "End Date"}
              </label>
              <input
                type="date"
                className="premium-input h-10"
                value={customDates[key]}
                onChange={(event) => setCustomDates({ ...customDates, [key]: event.target.value })}
              />
            </div>
          ))}
        </div>
      )}

      {showSettings ? (
        <div className="p-7 rounded-2xl space-y-6 animate-in fade-in duration-300" style={S.card}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black" style={S.textPrimary}>
                Kiosk Monitoring Rules
              </h3>
              <p className="text-xs font-medium mt-0.5" style={S.textMuted}>
                Configure monitoring for {username}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm" style={S.accent}>
              {username.charAt(0).toUpperCase()}
            </div>
          </div>

          {successMsg && (
            <div
              className="rounded-xl py-3 px-4 text-center text-xs font-black uppercase tracking-widest"
              style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
            >
              {successMsg}
            </div>
          )}

          <div className="space-y-3">
            {[
              { key: "screenShotEnable", label: "Screen Capture Stream", desc: "Captures screenshot on terminal unlock" },
              { key: "mouseTrackingEnable", label: "Mouse Movement Telemetry", desc: "Records mouse paths and click coordinates" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl" style={S.surface2}>
                <div>
                  <p className="text-[13px] font-black" style={S.textPrimary}>
                    {label}
                  </p>
                  <p className="text-[11px] font-medium mt-0.5" style={S.textMuted}>
                    {desc}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={kioskRules[key]}
                  onChange={(event) => setKioskRules({ ...kioskRules, [key]: event.target.checked })}
                  className="w-4 h-4 cursor-pointer accent-indigo-500"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <button onClick={handleSaveRules} className="btn-primary px-6 py-2.5 font-black text-sm">
              Save Rules
            </button>
            <button onClick={() => setShowSettings(false)} className="btn-ghost px-6 py-2.5 font-black text-sm">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <div className="rounded-2xl overflow-hidden" style={S.card}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                <div>
                  <h3 className="text-[13px] font-black" style={S.textPrimary}>
                    Complete Activity Trail
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={S.textMuted}>
                    {filterType === "last20" ? "Latest 20 logs in time order" : `${visibleLogs.length} of ${totalLogs} matching logs`}
                  </p>
                </div>
              </div>

              <div ref={scrollRef} onScroll={handleScroll} className="overflow-auto max-h-[520px]">
                {loadingLogs ? (
                  <div className="py-20 text-center">
                    <Activity size={28} className="mx-auto mb-3 animate-pulse" style={S.textMuted} />
                    <p className="text-sm font-bold" style={S.textMuted}>
                      Loading logs...
                    </p>
                  </div>
                ) : errorMsg ? (
                  <div className="py-20 text-center">
                    <p className="text-sm font-bold text-red-400">{errorMsg}</p>
                  </div>
                ) : visibleLogs.length === 0 ? (
                  <div className="py-20 text-center">
                    <Activity size={28} className="mx-auto mb-3" style={S.textMuted} />
                    <p className="text-sm font-bold" style={S.textMuted}>
                      No activity records found.
                    </p>
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left table-fixed">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th className="pb-3 pt-4 text-[10px] font-black uppercase tracking-widest pl-6 w-7/12" style={S.textMuted}>
                          Activity Name
                        </th>
                        <th className="pb-3 pt-4 text-[10px] font-black uppercase tracking-widest w-3/12" style={S.textMuted}>
                          Date
                        </th>
                        <th className="pb-3 pt-4 text-[10px] font-black uppercase tracking-widest w-2/12 text-right pr-6" style={S.textMuted}>
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleLogs.map((log, index) => {
                        const { activityName, timestamp } = parseLogEntry(log);
                        const dateValue = new Date(timestamp);
                        return (
                          <tr
                            key={`${timestamp}-${index}`}
                            className="cursor-pointer transition-colors"
                            onClick={() => setSelectedLog(log)}
                            style={{ borderBottom: "1px solid var(--border)" }}
                            onMouseEnter={(event) => {
                              event.currentTarget.style.background = "var(--accent-light)";
                            }}
                            onMouseLeave={(event) => {
                              event.currentTarget.style.background = "transparent";
                            }}
                          >
                            <td className="py-3 pl-6 text-sm font-black" style={S.textPrimary}>
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] flex-shrink-0"
                                  style={{ background: "var(--accent-light)", color: "var(--accent-text)" }}
                                >
                                  {activityName.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate" title={activityName}>
                                  {activityName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-xs font-bold whitespace-nowrap" style={S.textMuted}>
                              {Number.isNaN(dateValue.getTime()) ? "—" : formatDate(timestamp)}
                            </td>
                            <td className="py-3 text-xs font-black text-right pr-6 whitespace-nowrap" style={S.textSecondary}>
                              {Number.isNaN(dateValue.getTime()) ? "—" : formatTimeFull(timestamp)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {filterType === "custom" && (
                  <div className="px-6 py-3 text-center" style={{ borderTop: "1px solid var(--border)" }}>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={S.textMuted}>
                      {loadingMore ? "Loading more..." : hasMore ? "Scroll to load more" : "All logs loaded"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-2xl p-6 space-y-5" style={S.card}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={S.textMuted}>
                  Log Summary
                </p>
                <h3 className="text-base font-black mt-1" style={S.textPrimary}>
                  Activity Overview
                </h3>
              </div>

              <div className="space-y-3">
                <SummaryRow icon={Activity} label="Total Logs" value={String(totalLogs)} />
                <SummaryRow icon={CalendarDays} label="Active Days" value={String(summary.uniqueDays)} />
                <SummaryRow icon={Clock3} label="Visible Logs" value={String(visibleLogs.length)} />
              </div>

              <div className="space-y-3">
                <LogSnippet label="First Log" entry={summary.firstLog ? parseLogEntry(summary.firstLog) : null} />
                <LogSnippet label="Latest Log" entry={summary.lastLog ? parseLogEntry(summary.lastLog) : null} />
              </div>
            </div>
          </div>
        </div>
      )}

      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

const SummaryRow = ({ icon, label, value }) => (
  <div
    className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-light)", color: "var(--accent-text)" }}>
        {createElement(icon, { size: 15 })}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
    <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
      {value}
    </p>
  </div>
);

const LogSnippet = ({ label, entry }) => (
  <div className="rounded-xl px-4 py-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
    <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
      {label}
    </p>
    <p className="text-[13px] font-black truncate" style={{ color: "var(--text-primary)" }}>
      {entry ? entry.activityName : "No log"}
    </p>
    {entry && (
      <p className="text-[10px] font-bold mt-0.5" style={{ color: "var(--text-muted)" }}>
        {new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" })} {" - "}
        {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    )}
  </div>
);

