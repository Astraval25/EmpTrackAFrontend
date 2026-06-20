import { useState } from "react";
import { Users, Search, Plus, ChevronRight, Activity, UserPlus, X } from "lucide-react";

export const EmployeesPage = ({ users, onLoadLogs, onCreateUser, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", name: "" });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    onCreateUser(newUser.username, newUser.password, newUser.name);
    setNewUser({ username: "", password: "", name: "" });
    setShowAddModal(false);
  };

  const filtered = users
    .filter((u) => u.username.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.username.localeCompare(b.username));

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Employees</h1>
          <p className="text-sm font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
            {users.length} member{users.length !== 1 ? "s" : ""} provisioned
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary h-10 px-4 font-black text-[13px]">
          <Plus size={15} />
          Add Employee
        </button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: users.length, color: "var(--accent)" },
          { label: "Active Kiosk",  value: users.length, color: "#22c55e" },
          { label: "System Status", value: "Online",     color: "#f59e0b" },
          { label: "Search Results",value: filtered.length, color: "#8b5cf6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
              {label}
            </p>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* table card */}
      <div className="card overflow-hidden p-0">
        {/* search bar */}
        <div className="px-6 py-4 flex items-center gap-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search employees..."
              className="premium-input h-9 pl-9 text-[13px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="app-table">
            <thead>
              <tr>
                <th className="pl-6">Employee</th>
                <th>Created By</th>
                <th>Status</th>
                <th className="text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <Activity size={28} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                    <p className="text-sm font-black" style={{ color: "var(--text-muted)" }}>No employees found</p>
                  </td>
                </tr>
              ) : filtered.map((emp) => (
                <tr
                  key={emp.username}
                  className="cursor-pointer"
                  onClick={() => onLoadLogs(emp.username)}
                >
                  <td className="pl-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[13px] text-white flex-shrink-0"
                        style={{ background: "var(--accent)" }}
                      >
                        {emp.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-black" style={{ color: "var(--text-primary)" }}>
                          {emp.username}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                          Kiosk Access
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-[13px] font-bold" style={{ color: "var(--text-secondary)" }}>
                      {emp.createdBy || "Admin"}
                    </span>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                      style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Active
                    </span>
                  </td>
                  <td className="text-right pr-6">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                      <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* add modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card w-full max-w-md p-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-light)" }}>
                  <UserPlus size={18} style={{ color: "var(--accent-text)" }} />
                </div>
                <div>
                  <h3 className="text-base font-black" style={{ color: "var(--text-primary)" }}>Add Employee</h3>
                  <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Create kiosk credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {[
                { label: "Full Name",     key: "name",     type: "text",     placeholder: "Employee full name" },
                { label: "Username",      key: "username", type: "text",     placeholder: "Kiosk username" },
                { label: "Password",      key: "password", type: "password", placeholder: "Secure password" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    className="premium-input h-11"
                    value={newUser[key]}
                    onChange={(e) => setNewUser({ ...newUser, [key]: e.target.value })}
                    required
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-ghost flex-1 h-11 font-black text-[13px]"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-[2] h-11 font-black text-[13px]">
                  {loading ? "Provisioning..." : "Provision Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
