import { useEffect, useMemo } from "react";
import { Activity, CalendarDays, Clock3, MonitorOff, MonitorPlay, X } from "lucide-react";
import { parseLogEntry } from "./logUtils";

const toValidDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) =>
  value ? value.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) : "-";

const formatTime = (value) =>
  value ? value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "-";

const formatDuration = (milliseconds) => {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return "-";
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const extractTimestamp = (payload, keys) => {
  for (const key of keys) {
    const value = payload?.[key];
    const date = toValidDate(value);
    if (date) return date;
  }
  return null;
};

const getTrackingDetails = (log) => {
  const parsed = parseLogEntry(log);
  const payload = parsed.payload || {};
  const recordedAt = toValidDate(parsed.timestamp);

  const startTime =
    extractTimestamp(payload, ["start_time", "startTime", "opened_at", "openedAt", "open_time", "openTime", "start"]) ||
    recordedAt;

  const endTime =
    extractTimestamp(payload, ["end_time", "endTime", "closed_at", "closedAt", "close_time", "closeTime", "end"]) ||
    null;

  let durationFromPayload = null;
  if (payload.duration_ms !== undefined || payload.durationMs !== undefined) {
    durationFromPayload = Number(payload.duration_ms ?? payload.durationMs);
  } else if (payload.duration_seconds !== undefined || payload.durationSeconds !== undefined) {
    durationFromPayload = Number(payload.duration_seconds ?? payload.durationSeconds) * 1000;
  } else if (payload.duration !== undefined) {
    durationFromPayload = Number(payload.duration);
  }

  const resolvedEndTime = endTime || (startTime && durationFromPayload != null ? new Date(startTime.getTime() + durationFromPayload) : null);
  const resolvedDuration = durationFromPayload ?? (startTime && resolvedEndTime ? resolvedEndTime.getTime() - startTime.getTime() : null);

  const subjectName =
    payload.template ||
    log?.template ||
    payload.application ||
    payload.app ||
    payload.appName ||
    payload.product ||
    parsed.activityName;

  const eventState = (() => {
    const raw = `${parsed.activityName} ${payload.status || ""}`.toLowerCase();
    if (raw.includes("close") || raw.includes("end") || raw.includes("exit")) return "Closed";
    if (raw.includes("open") || raw.includes("start") || raw.includes("launch")) return "Opened";
    if (resolvedEndTime && startTime) return "Completed";
    return "Tracked";
  })();

  return {
    activityName: parsed.activityName,
    subjectName,
    recordedAt,
    startTime,
    endTime: resolvedEndTime,
    duration: resolvedDuration,
    eventState,
    payload,
  };
};

const DetailRow = ({ label, value, icon: Icon, iconColor }) => (
  <div className="rounded-2xl px-4 py-3 flex items-start justify-between gap-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
    <div className="flex items-center gap-2 min-w-0">
      {Icon && <Icon size={14} style={{ color: iconColor || "var(--accent-text)" }} className="flex-shrink-0" />}
      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
    <p className="text-[12px] font-black text-right break-words max-w-[62%]" style={{ color: "var(--text-primary)" }}>
      {value}
    </p>
  </div>
);

export const LogDetailModal = ({ log, onClose }) => {
  const details = useMemo(() => (log ? getTrackingDetails(log) : null), [log]);

  useEffect(() => {
    if (!log) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [log, onClose]);

  if (!log || !details) return null;

  const rawPayloadEntries = Object.entries(details.payload || {}).filter(([, value]) => value !== null && value !== undefined);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ background: "rgba(2,6,23,0.7)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Activity detail dialog"
      >
        <div className="px-7 py-6" style={{ background: "linear-gradient(135deg, var(--accent), #4f46e5)" }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                {details.activityName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(224,231,255,0.85)" }}>
                  Activity Tracking
                </p>
                <p className="text-lg font-black text-white mt-0.5 leading-tight truncate">
                  {details.activityName}
                </p>
                <p className="text-xs font-bold mt-1" style={{ color: "rgba(224,231,255,0.8)" }}>
                  {details.subjectName || "Activity log"} {details.eventState ? `- ${details.eventState}` : ""}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-7 py-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <DetailRow label="Start Time" value={`${formatDate(details.startTime)} - ${formatTime(details.startTime)}`} icon={MonitorPlay} iconColor="#22c55e" />
            <DetailRow label="End Time" value={details.endTime ? `${formatDate(details.endTime)} - ${formatTime(details.endTime)}` : "Still open"} icon={MonitorOff} iconColor="#f97316" />
            <DetailRow label="Duration" value={formatDuration(details.duration)} icon={Clock3} iconColor="var(--accent-text)" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DetailRow label="Recorded At" value={`${formatDate(details.recordedAt)} - ${formatTime(details.recordedAt)}`} icon={CalendarDays} />
            <DetailRow label="Template / App" value={details.subjectName || "-"} icon={Activity} />
          </div>

          <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Event Timeline
                </p>
                <p className="text-sm font-black mt-0.5" style={{ color: "var(--text-primary)" }}>
                  Delivery-style tracking view
                </p>
              </div>
              <span className="badge-accent">{details.eventState}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--accent)" }} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Activity started
                  </p>
                  <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                    {formatDate(details.startTime)} at {formatTime(details.startTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: details.endTime ? "#22c55e" : "var(--border)" }} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Activity completed
                  </p>
                  <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                    {details.endTime ? `${formatDate(details.endTime)} at ${formatTime(details.endTime)}` : "Still active"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#f59e0b" }} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Total duration
                  </p>
                  <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                    {formatDuration(details.duration)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {rawPayloadEntries.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Raw Details
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {rawPayloadEntries.map(([key, value]) => {
                  const display = typeof value === "object" ? JSON.stringify(value) : String(value);
                  const keyLabel = key.replace(/_/g, " ");
                  return (
                    <div key={key} className="rounded-xl px-4 py-3 flex items-start justify-between gap-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                        {keyLabel}
                      </p>
                      <p className="text-[12px] font-black text-right break-words max-w-[62%]" style={{ color: "var(--text-primary)" }}>
                        {display}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={onClose} className="btn-ghost w-full h-11 font-black text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
