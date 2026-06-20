import { Mail, Shield, Clock, CheckCircle } from "lucide-react";

export const ProfilePage = ({ loggedInAdmin, companyName }) => {
  const initial = loggedInAdmin ? loggedInAdmin.charAt(0).toUpperCase() : "A";
  const joinedDate = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Profile</h1>
        <p className="text-sm font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
          Your active administrator account
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* avatar card */}
        <div className="card p-8 flex flex-col items-center text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white mb-5 shadow-lg"
            style={{ background: "linear-gradient(135deg, var(--accent), #8b5cf6)" }}
          >
            {initial}
          </div>
          <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
            {loggedInAdmin || "Administrator"}
          </h3>
          <span className="badge-accent mt-2">Super Admin</span>

          <div className="w-full mt-6 pt-6 space-y-3 text-left" style={{ borderTop: "1px solid var(--border)" }}>
            <InfoRow label="Role" value="Workspace Administrator" />
            <InfoRow label="Company" value={companyName || "—"} />
            <InfoRow label="Status" value="Active" valueColor="#22c55e" />
          </div>
        </div>

        {/* account details */}
        <div className="xl:col-span-2 space-y-4">
          <div className="card p-7">
            <h3 className="text-base font-black mb-5 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Mail size={17} style={{ color: "var(--accent-text)" }} />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailBlock label="Email Address" value={loggedInAdmin || "—"} />
              <DetailBlock label="Account Type" value="Administrator" />
              <DetailBlock label="Organisation" value={companyName || "—"} />
              <DetailBlock label="Session" value="Active & Authenticated" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={Shield} label="Access Level" value="Full Access" color="#6366f1" />
            <StatCard icon={CheckCircle} label="Account Status" value="Verified" color="#22c55e" />
            <StatCard icon={Clock} label="Session" value="Live" color="#f59e0b" />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, valueColor }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
      {label}
    </span>
    <span className="text-[13px] font-black" style={{ color: valueColor || "var(--text-primary)" }}>
      {value}
    </span>
  </div>
);

const DetailBlock = ({ label, value }) => (
  <div className="rounded-xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
    <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
      {label}
    </p>
    <p className="text-[13px] font-black" style={{ color: "var(--text-primary)" }}>{value}</p>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}18` }}
    >
      <Icon size={18} style={{ color }} />
    </div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-[13px] font-black mt-0.5" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  </div>
);
