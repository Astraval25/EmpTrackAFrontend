import { useState } from "react";
import { Save, Sliders, Download, ShieldCheck } from "lucide-react";

export const SettingsPage = ({ companyName, onUpdateCompanyName, showToast }) => {
  const [tempCompanyName, setTempCompanyName] = useState(companyName);
  const [policies, setPolicies] = useState({
    enforceTimeout: true,
    lockOnClose: true,
    realtimeLogs: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!tempCompanyName.trim()) { showToast("Company name cannot be empty!", "error"); return; }
    onUpdateCompanyName(tempCompanyName);
    showToast("Settings saved successfully!");
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Settings</h1>
        <p className="text-sm font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
          Workspace configuration and kiosk policies
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">

          {/* workspace form */}
          <form onSubmit={handleSave} className="card p-7 space-y-6">
            <h3 className="text-base font-black flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Sliders size={16} style={{ color: "var(--accent-text)" }} />
              Workspace
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--text-muted)" }}>
                Organisation Name
              </label>
              <input
                type="text"
                className="premium-input h-11"
                placeholder="Enter organisation name"
                value={tempCompanyName}
                onChange={(e) => setTempCompanyName(e.target.value)}
                required
              />
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
                Kiosk Policies
              </p>
              <div className="space-y-3">
                <PolicyRow
                  label="Enforce Lock Timeout"
                  description="Auto-lock workstation after idle period"
                  checked={policies.enforceTimeout}
                  onChange={(v) => setPolicies({ ...policies, enforceTimeout: v })}
                />
                <PolicyRow
                  label="Lock on Service Close"
                  description="Trigger lockscreen if service is terminated"
                  checked={policies.lockOnClose}
                  onChange={(v) => setPolicies({ ...policies, lockOnClose: v })}
                />
                <PolicyRow
                  label="Real-Time Activity Stream"
                  description="Stream kiosk events live to the dashboard"
                  checked={policies.realtimeLogs}
                  onChange={(v) => setPolicies({ ...policies, realtimeLogs: v })}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full h-11 font-black">
              <Save size={15} />
              Save Settings
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {/* download */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-black flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Download size={16} style={{ color: "var(--accent-text)" }} />
              Kiosk Installer
            </h3>
            <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Download the EmpTrackAI agent to install on employee workstations.
            </p>
            <a
              href="/KioskLockSetup.exe"
              download="EmpTrackAI.exe"
              className="btn-primary w-full h-10 no-underline font-black text-[13px]"
            >
              <Download size={14} />
              Download EmpTrackAI.exe
            </a>
          </div>

          {/* compliance */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-black flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <ShieldCheck size={16} style={{ color: "#22c55e" }} />
              Compliance
            </h3>
            <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              All workstation security systems are running in high compliance mode.
            </p>
            <div
              className="rounded-xl py-3 text-center text-[11px] font-black uppercase tracking-widest"
              style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
            >
              System Secured
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PolicyRow = ({ label, description, checked, onChange }) => (
  <div
    className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
  >
    <div>
      <p className="text-[13px] font-black" style={{ color: "var(--text-primary)" }}>{label}</p>
      <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-9 h-5 rounded-full peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
        style={{
          background: checked ? "var(--accent)" : "var(--border)",
          position: "relative",
        }}
      />
    </label>
  </div>
);
