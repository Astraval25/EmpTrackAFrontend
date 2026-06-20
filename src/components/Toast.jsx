import { CheckCircle2, AlertCircle, X } from "lucide-react";

export const Toast = ({ message, type }) => {
  if (!message) return null;
  const isError = type === "error";

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300"
      style={{
        background: isError ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
        border: `1px solid ${isError ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
        backdropFilter: "blur(12px)",
        color: isError ? "#f87171" : "#4ade80",
      }}
    >
      {isError
        ? <AlertCircle size={16} />
        : <CheckCircle2 size={16} />}
      <span className="text-sm font-black">{message}</span>
    </div>
  );
};
