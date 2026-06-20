import { startTransition, useCallback, useState, useEffect, useRef } from "react";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AppsPage } from "./pages/AppsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { UserLogsPage } from "./pages/UserLogsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Toast } from "./components/Toast";
import { adminService } from "./api/adminService";
import { buildDashboardOverview } from "./components/dashboardAnalytics";

function App() {
  const [token, setToken] = useState(localStorage.getItem("admin_token"));
  const [loggedInAdmin, setLoggedInAdmin] = useState(localStorage.getItem("admin_email") || localStorage.getItem("admin_user"));
  const [companyName, setCompanyName] = useState(localStorage.getItem("company_name") || "Neo");
  const [currentTab, setCurrentTab] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dark_mode") === "true");
  const currentTabRef = useRef(currentTab);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("dark_mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    currentTabRef.current = currentTab;
  }, [currentTab]);
  
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dashboardOverview, setDashboardOverview] = useState({
    totalCustomers: 0,
    totalActivityLogs: 0,
    activeTodayCustomers: 0,
    activeTodayLogs: 0,
    dailySeries: [],
    hourlySeries: [],
    userTotals: [],
    templateBreakdown: [],
    statusBreakdown: [],
    recentEvents: [],
    hourlyPeak: 0,
    generatedAt: null,
    recentLogs: [],
  });
  const [overviewLoading, setOverviewLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await adminService.login(email, password);
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_email", email);
      localStorage.setItem("company_name", data.companyName);
      setToken(data.token);
      setLoggedInAdmin(email);
      setCompanyName(data.companyName);
      showToast("Welcome back, " + email);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email, password, companyName) => {
    setLoading(true);
    try {
      await adminService.register(email, password, companyName);
      showToast("Admin account registered successfully!");
      // Automatically log them in after registration for a frictionless UX
      await handleLogin(email, password);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("company_name");
    setToken(null);
    setLoggedInAdmin(null);
    setCompanyName("Neo");
    setSelectedUser(null);
    setUsers([]);
    setLogs([]);
    setOverviewLoading(false);
    setMobileSidebarOpen(false);
    setDashboardOverview({
      totalCustomers: 0,
      totalActivityLogs: 0,
      activeTodayCustomers: 0,
      activeTodayLogs: 0,
      dailySeries: [],
      hourlySeries: [],
      userTotals: [],
      templateBreakdown: [],
      statusBreakdown: [],
      recentEvents: [],
      hourlyPeak: 0,
      generatedAt: null,
      recentLogs: [],
    });
    setCurrentTab("Dashboard");
  }, []);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminService.getUsers(token);
      setUsers(data);
    } catch (err) {
      if (err.message.includes("401") || err.message.includes("token")) {
        handleLogout();
      }
    }
  }, [token, handleLogout]);

  const handleCreateUser = async (username, password, name) => {
    setLoading(true);
    try {
      await adminService.createUser(token, username, password, name);
      showToast("User provisioned successfully");
      loadUsers();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (username) => {
    setSelectedUser(username);
    setLoading(true);
    try {
      const response = await adminService.getLogs(token, username, { limit: 20 });
      setLogs(response.logs);
      setCurrentTab("UserLogs"); // Move to logs page
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (username) => {
    setSelectedUser(username);
    try {
      const response = await adminService.getLogs(token, username, { limit: 20 });
      setLogs(response.logs);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const refreshDashboardOverview = useCallback(async (userList = users) => {
    if (!token || !userList.length) {
      setOverviewLoading(false);
      setDashboardOverview({
        totalCustomers: userList.length || 0,
        totalActivityLogs: 0,
        activeTodayCustomers: 0,
        activeTodayLogs: 0,
        dailySeries: [],
        hourlySeries: [],
        userTotals: [],
        templateBreakdown: [],
        statusBreakdown: [],
        recentEvents: [],
        hourlyPeak: 0,
        generatedAt: null,
        recentLogs: [],
      });
      return;
    }

    setOverviewLoading(true);
    try {
      const snapshots = await Promise.all(
        userList.map(async (user) => {
          const response = await adminService.getLogs(token, user.username, { limit: 200 });
          return {
            username: user.username,
            total: response.total,
            logs: response.logs,
          };
        })
      );

      setDashboardOverview(buildDashboardOverview({ users: userList, userSnapshots: snapshots }));
    } catch {
      setDashboardOverview(buildDashboardOverview({ users: userList, userSnapshots: [] }));
    } finally {
      setOverviewLoading(false);
    }
  }, [token, users]);

  useEffect(() => {
    if (token) loadUsers();
  }, [token, loadUsers]);

  useEffect(() => {
    if (!token || currentTabRef.current !== "Dashboard") return undefined;

    let cancelled = false;
    const syncOverview = () => {
      if (!cancelled && document.visibilityState === "visible") {
        refreshDashboardOverview(users);
      }
    };

    syncOverview();
    const interval = setInterval(syncOverview, 30000);
    window.addEventListener("focus", syncOverview);
    document.addEventListener("visibilitychange", syncOverview);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", syncOverview);
      document.removeEventListener("visibilitychange", syncOverview);
    };
  }, [token, users, refreshDashboardOverview]);

  if (!token) {
    return (
      <>
        {toast && <Toast message={toast.message} type={toast.type} />}
        <AuthPage onLogin={handleLogin} onRegister={handleRegister} loading={loading} />
      </>
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case "Dashboard":
        return (
          <DashboardPage 
            users={users}
            logs={logs}
            selectedUser={selectedUser}
            loading={loading}
            loggedInAdmin={loggedInAdmin}
            overview={dashboardOverview}
            overviewLoading={overviewLoading}
            onCreateUser={handleCreateUser}
            onLoadLogs={loadLogs}
            onSelectUser={handleSelectUser}
          />
        );
      case "Employees":
        return (
          <EmployeesPage 
            users={users} 
            onLoadLogs={loadLogs} 
            onCreateUser={handleCreateUser} 
            loading={loading}
          />
        );
      case "Apps":
        return (
          <AppsPage
            users={users}
            logs={logs}
          />
        );
      case "UserLogs":
        return (
          <UserLogsPage 
            username={selectedUser} 
            initialLogs={logs}
            token={token}
            onBack={() => setCurrentTab("Dashboard")} 
          />
        );
      case "Profile":
        return (
          <ProfilePage 
            loggedInAdmin={loggedInAdmin}
            companyName={companyName}
          />
        );
      case "Settings":
        return (
          <SettingsPage 
            companyName={companyName}
            onUpdateCompanyName={(newVal) => {
              localStorage.setItem("company_name", newVal);
              setCompanyName(newVal);
            }}
            showToast={showToast}
          />
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text-primary)]" style={{ background: "var(--bg)" }}>
      {mobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-slate-950/55 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}
      {/* Sidebar - Fixed Width */}
      <Sidebar
        activeTab={currentTab}
        onTabChange={(tab) => startTransition(() => {
          setCurrentTab(tab);
          setMobileSidebarOpen(false);
        })}
        onLogout={handleLogout}
        companyName={companyName}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area - Flexible Width with Offset */}
      <div className="flex-1 ml-0 md:ml-64 min-h-screen flex flex-col">
        <Topbar
          adminName={loggedInAdmin}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((d) => !d)}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />
        <main key={currentTab} className="flex-1 anim-fade-up">
          {renderContent()}
        </main>

        <footer className="py-5 px-8 text-center" style={{borderTop:'1px solid var(--border)'}}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{color:'var(--text-muted)'}}>
            &copy; 2026 Astraval &bull; EmpTrackAI
          </p>
        </footer>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default App;
