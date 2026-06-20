import { createElement } from "react";
import { LayoutDashboard, Users, UserCircle, Settings, LogOut, Grid, Zap, X } from "lucide-react";

const NAV = [
  {
    group: "Monitor",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", tab: "Dashboard" },
      { icon: Users, label: "Employees", tab: "Employees" },
    ],
  },
  {
    group: "Tools",
    items: [{ icon: Grid, label: "Apps", tab: "Apps" }],
  },
  {
    group: "Account",
    items: [
      { icon: UserCircle, label: "Profile", tab: "Profile" },
      { icon: Settings, label: "Settings", tab: "Settings" },
    ],
  },
];

export const Sidebar = ({ activeTab = "Dashboard", onTabChange, onLogout, companyName = "Neo", mobileOpen = false, onClose }) => (
  <aside
    className="app-sidebar sidebar-drawer"
    data-open={mobileOpen ? "true" : "false"}
  >
    <div className="px-5 pt-6 pb-4">
      <div className="rounded-3xl px-4 py-4 relative" style={{ background: "linear-gradient(135deg, var(--accent), #0ea5e9)", boxShadow: "var(--shadow-md)" }}>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden absolute right-3 top-3 w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.16)" }}>
            <Zap size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: "rgba(255,255,255,0.72)" }}>
              Workspace
            </p>
            <span className="block text-[15px] font-black tracking-tight truncate max-w-[160px] text-white" title={companyName}>
              {companyName}
            </span>
          </div>
        </div>
      </div>
    </div>

    <nav className="flex-1 px-3 pb-4 space-y-6 overflow-y-auto">
      {NAV.map(({ group, items }) => (
        <div key={group}>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] px-3 mb-2" style={{ color: "var(--sidebar-muted)" }}>
            {group}
          </p>
          <div className="space-y-1">
            {items.map(({ icon: Icon, label, tab }) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: isActive ? "var(--sidebar-hover)" : "transparent",
                    color: isActive ? "var(--sidebar-active)" : "var(--sidebar-muted)",
                    fontWeight: isActive ? 800 : 600,
                    boxShadow: isActive ? "inset 0 0 0 1px var(--border)" : "none",
                  }}
                  onMouseEnter={(event) => {
                    if (!isActive) event.currentTarget.style.background = "var(--sidebar-hover)";
                    event.currentTarget.style.color = "var(--sidebar-text)";
                  }}
                  onMouseLeave={(event) => {
                    if (!isActive) event.currentTarget.style.background = "transparent";
                    if (!isActive) event.currentTarget.style.color = "var(--sidebar-muted)";
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: isActive ? "var(--accent)" : "transparent" }}
                  >
                    {createElement(Icon, { size: 16, style: { color: isActive ? "#fff" : "inherit" } })}
                  </div>
                  <span className="text-[13px]">{label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>

    <div className="p-4 mt-auto">
      <div className="rounded-2xl p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left active:scale-[0.98]"
          style={{ color: "#f87171", fontWeight: 700 }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "rgba(248,113,113,0.1)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "transparent";
          }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(248,113,113,0.1)" }}>
            <LogOut size={15} style={{ color: "#f87171" }} />
          </div>
          <span className="text-[13px]">Sign Out</span>
        </button>
      </div>
    </div>
  </aside>
);
