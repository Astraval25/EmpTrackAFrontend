import { createElement, useState } from "react";
import { User, Lock, Building2, Zap, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export const AuthPage = ({ onLogin, onRegister, loading }) => {
  const [mode, setMode] = useState("login");
  const [auth, setAuth] = useState({ email: "", password: "", companyName: "" });

  const handleSubmit = (event) => {
    event.preventDefault();
    mode === "login" ? onLogin(auth.email, auth.password) : onRegister(auth.email, auth.password, auth.companyName);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setAuth({ email: "", password: "", companyName: "" });
  };

  return (
    <main className="min-h-screen p-6 md:p-10 flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 anim-fade-up">
        <section
          className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 text-white shadow-2xl anim-pop"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #312e81 55%, #4f46e5 100%)" }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.28), transparent 28%)" }} />
          <div className="relative z-10 flex h-full flex-col justify-between gap-10 stagger-children">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 w-fit backdrop-blur">
              <Sparkles size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.28em]">EmpTrackAI</span>
            </div>

            <div className="max-w-xl space-y-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/12 backdrop-blur">
                <Zap size={24} className="text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
                Sleek admin control for modern workspace tracking.
              </h1>
              <p className="max-w-lg text-base md:text-lg text-white/78 leading-7">
                Manage employees, review activity trails, and inspect detailed log tracking with a polished dark-first interface built for speed.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-xl">
              {[
                { label: "Secure access", value: "Always on" },
                { label: "Log insight", value: "Instant" },
                { label: "Theme", value: "Dark ready" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/60">{item.label}</p>
                  <p className="mt-2 text-lg font-black">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card p-6 md:p-8 self-center anim-pop">
          <div className="flex rounded-2xl p-1 mb-7" style={{ background: "var(--surface-2)" }}>
            {["login", "register"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchMode(item)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-black transition-all duration-200 capitalize"
                style={{
                  background: mode === item ? "var(--surface)" : "transparent",
                  color: mode === item ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: mode === item ? "var(--shadow-sm)" : "none",
                }}
              >
                {item === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {mode === "login"
                ? "Sign in to your admin dashboard"
                : "Set up your kiosk management workspace"}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Email" icon={User}>
              <input
                type="email"
                placeholder="admin@company.com"
                className="premium-input h-12 pl-10"
                value={auth.email}
                onChange={(event) => setAuth({ ...auth, email: event.target.value })}
                required
              />
            </Field>

            <Field label="Password" icon={Lock}>
              <input
                type="password"
                placeholder="Password"
                className="premium-input h-12 pl-10"
                value={auth.password}
                onChange={(event) => setAuth({ ...auth, password: event.target.value })}
                required
              />
            </Field>

            {mode === "register" && (
              <div className="animate-in slide-in-from-top-3 duration-300">
                <Field label="Company Name" icon={Building2}>
                  <input
                    type="text"
                    placeholder="Your organisation name"
                    className="premium-input h-12 pl-10"
                    value={auth.companyName}
                    onChange={(event) => setAuth({ ...auth, companyName: event.target.value })}
                    required
                  />
                </Field>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 mt-2 font-black text-[14px] shadow-lg"
              style={{ boxShadow: "0 16px 40px rgba(79,70,229,0.25)" }}
            >
              {loading ? (mode === "login" ? "Signing in..." : "Creating account...") : mode === "login" ? "Sign In" : "Create Account"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-light)", color: "var(--accent-text)" }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-[13px] font-black" style={{ color: "var(--text-primary)" }}>
                Secure by design
              </p>
              <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                Dark theme, activity tracking, and unified workspace styling.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

const Field = ({ label, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--text-muted)" }}>
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        {createElement(Icon, { size: 15, style: { color: "var(--text-muted)" } })}
      </div>
      {children}
    </div>
  </div>
);

