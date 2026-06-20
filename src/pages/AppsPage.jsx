import { Bot, Boxes, Sparkles, Smartphone, Zap } from "lucide-react";
import coreflowImg from "../assets/image.png";

const apps = [
  {
    name: "CoreFlow",
    version: "v1.0.0",
    status: "Installed",
    description: "Core employee workflow engine for kiosk operations, attendance handling, and secure process flow.",
    icon: Boxes,
    gradient: "linear-gradient(135deg, #1d4ed8, #38bdf8)",
    href: "https://coreflow.astraval.com/",
  },
  {
    name: "EmpMap AI",
    version: "v1.0.0",
    status: "Installed",
    description: "AI support layer for employee mapping, activity understanding, and smart monitoring insights.",
    icon: Bot,
    gradient: "linear-gradient(135deg, #0f172a, #6366f1)",
    href: null,
  },
];

export const AppsPage = ({ users = [], logs = [] }) => (
  <div className="p-8 space-y-6 animate-in fade-in duration-500">
    <div>
      <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Applications</h1>
      <p className="text-sm font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
        Installed system applications for your kiosk network
      </p>
    </div>

    {/* stats */}
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "Installed Apps",  value: apps.length,  icon: Boxes,      color: "var(--accent)" },
        { label: "Active Devices",  value: users.length, icon: Smartphone, color: "#22c55e" },
        { label: "Loaded Events",   value: logs.length,  icon: Zap,        color: "#f59e0b" },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}18` }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="text-xl font-black mt-0.5" style={{ color: "var(--text-primary)" }}>{value}</p>
          </div>
        </div>
      ))}
    </div>

    {/* app cards */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {apps.map((app) => {
        const card = <AppCard key={app.name} app={app} />;
        return app.href
          ? <a key={app.name} href={app.href} target="_blank" rel="noopener noreferrer" className="block">{card}</a>
          : <div key={app.name}>{card}</div>;
      })}
    </div>
  </div>
);

const AppCard = ({ app }) => {
  const Icon = app.icon;
  return (
    <div className="card overflow-hidden p-0">
      <div className="p-7 text-white" style={{ background: app.gradient }}>
        <div className="flex items-start justify-between gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}>
            {app.name.toLowerCase() === "coreflow"
              ? <img src={coreflowImg} alt="CoreFlow" className="w-full h-full object-cover" />
              : <Icon size={26} />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}>
            {app.status}
          </span>
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-tight">{app.name}</h2>
        <p className="mt-1 text-sm font-bold opacity-70">{app.version}</p>
      </div>
      <div className="p-6">
        <p className="text-sm font-medium leading-6" style={{ color: "var(--text-secondary)" }}>{app.description}</p>
        <div className="mt-5 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent-light)" }}>
            <Sparkles size={15} style={{ color: "var(--accent-text)" }} />
          </div>
          <div>
            <p className="text-[13px] font-black" style={{ color: "var(--text-primary)" }}>Ready to use</p>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Stable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
