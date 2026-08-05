import { useNavigate, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useState, useEffect } from "react";
import API from "../utils/api";
import {
  Hexagon,
  LayoutDashboard,
  FilePlus2,
  FolderKanban,
  Activity,
  Trophy,
  UserRound,
  Bell,
  LogOut,
} from "lucide-react";

const ClientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { disconnect, user } = useWallet();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    API.get("/notifications").then(({ data }) => setUnread(data.filter(n => !n.read).length)).catch(() => {});
  }, [location.pathname]);

  const items = [
    { icon: LayoutDashboard, label: "Dashboard",       path: "/client/dashboard" },
    { icon: FilePlus2,       label: "Post a Job",       path: "/client/post-job" },
    { icon: FolderKanban,    label: "Posted Jobs",      path: "/client/my-jobs" },
    { icon: Activity,        label: "Active Jobs",      path: "/client/active-jobs" },
    { icon: Trophy,          label: "Top Freelancers",  path: "/client/top-freelancers" },
    { icon: UserRound,       label: "Profile",          path: "/client/profile" },
  ];

  const handleDisconnect = () => { disconnect(); navigate("/"); };
  const isActive = (path) => location.pathname === path;

  const navItemClass = (active) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-left transition-all duration-200 relative focus-ring ${
      active
        ? "bg-accent-soft text-foreground"
        : "text-muted hover:text-foreground hover:bg-surface-2"
    }`;

  return (
    <aside className="client-theme w-64 shrink-0 flex flex-col py-6 px-4 min-h-screen sticky top-0 bg-surface border-r border-line">
      {/* Brand */}
      <button
        onClick={() => navigate("/client/dashboard")}
        className="flex flex-col items-start px-2 mb-8 focus-ring rounded-[var(--radius-sm)]"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center h-8 w-8 rounded-[var(--radius-sm)] bg-accent text-accent-fg">
            <Hexagon size={18} strokeWidth={2.25} />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-foreground">Free</span>
            <span className="text-muted">Lance3</span>
          </span>
        </div>
        <span className="ml-[2.75rem] -mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-accent">
          Client Portal
        </span>
      </button>

      {/* Signed-in identity */}
      <div className="mx-1 mb-6 px-3 py-3 rounded-[var(--radius-md)] bg-bg-elev border border-line">
        <div className="text-[10px] uppercase tracking-wider text-faint mb-1">Signed in as</div>
        <div className="text-sm font-medium text-foreground truncate">
          {user?.username || user?.email || "Client"}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {items.map(item => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={() => navigate(item.path)} className={navItemClass(active)}
              aria-current={active ? "page" : undefined}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-accent" />}
              <Icon size={18} strokeWidth={2} className={active ? "text-accent" : "text-faint group-hover:text-muted"} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}

        <button onClick={() => navigate("/client/notifications")} className={navItemClass(isActive("/client/notifications"))}
          aria-current={isActive("/client/notifications") ? "page" : undefined}>
          {isActive("/client/notifications") && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-accent" />}
          <Bell size={18} strokeWidth={2} className={isActive("/client/notifications") ? "text-accent" : "text-faint group-hover:text-muted"} />
          <span className="text-sm font-medium flex-1">Notifications</span>
          {unread > 0 && (
            <span className="grid place-items-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-semibold font-data bg-accent text-accent-fg">
              {unread}
            </span>
          )}
        </button>
      </nav>

      {/* Disconnect */}
      <div className="mt-4 pt-4 border-t border-line">
        <button onClick={handleDisconnect}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-left text-muted transition-all duration-200 hover:text-danger hover:bg-danger-soft focus-ring">
          <LogOut size={18} strokeWidth={2} />
          <span className="text-sm font-medium">Disconnect</span>
        </button>
      </div>
    </aside>
  );
};

export default ClientSidebar;
