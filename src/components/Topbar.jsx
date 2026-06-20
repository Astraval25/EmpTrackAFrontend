import { Menu, Moon, Sun, Sparkles } from "lucide-react";

export const Topbar = ({ adminName, darkMode, onToggleDark, onOpenSidebar }) => (
  <header className="app-topbar">
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="md:hidden w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-[0.98]"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>
      <div className="hidden md:flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <Sparkles size={14} style={{ color: "var(--accent-text)" }} />
        <span className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: "var(--text-muted)" }}>
          Premium Workspace
        </span>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <button
        onClick={onToggleDark}
        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-[0.98]"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="flex items-center gap-3 rounded-2xl pl-3 pr-3.5 py-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-black leading-none" style={{ color: "var(--text-primary)" }}>
            {adminName}
          </p>
          <p className="text-[10px] font-bold mt-0.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Administrator
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-white/10">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName || "A")}&background=4f46e5&color=fff&size=72`}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  </header>
);
