import { useNavigate, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { useState, useEffect } from "react";
import API from "../utils/api";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { disconnect, user } = useWallet();
  const [unread, setUnread] = useState(0);
  const role = user?.role || "freelancer";

  useEffect(() => {
    API.get("/notifications").then(({ data }) => {
      setUnread(data.filter(n => !n.read).length);
    }).catch(() => {});
  }, [location.pathname]);

  const clientItems = [
    { icon: "🏠", label: "Dashboard", path: "/dashboard" },
    { icon: "➕", label: "Post a Job", path: "/post-job" },
    { icon: "📋", label: "Posted Jobs", path: "/my-jobs" },
    { icon: "✅", label: "Accepted Jobs", path: "/accepted-jobs" },
    { icon: "��", label: "Profile", path: "/profile" },
  ];

  const freelancerItems = [
    { icon: "🏠", label: "Dashboard", path: "/dashboard" },
    { icon: "��", label: "Find Jobs", path: "/jobs" },
    { icon: "📋", label: "My Bids", path: "/bids" },
    { icon: "👤", label: "Profile", path: "/profile" },
  ];

  const items = role === "client" ? clientItems : freelancerItems;

  const handleDisconnect = () => {
    disconnect();
    navigate("/");
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col py-8 px-4 min-h-screen">
      <div className="text-2xl font-bold text-violet-400 mb-2 px-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
        FreeLance3
      </div>
      <div className="px-2 mb-6">
        <span className={`text-xs px-2 py-1 rounded-full border ${role === "client" ? "bg-blue-900/30 text-blue-400 border-blue-700/30" : "bg-green-900/30 text-green-400 border-green-700/30"}`}>
          {role === "client" ? "🏢 Client" : "💻 Freelancer"}
        </span>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${location.pathname === item.path ? "bg-violet-900/30 text-violet-300 border border-violet-700/30" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
            <span>{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
        <button onClick={() => navigate("/notifications")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${location.pathname === "/notifications" ? "bg-violet-900/30 text-violet-300 border border-violet-700/30" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
          <span>🔔</span><span>Notifications</span>
          {unread > 0 && <span className="ml-auto bg-violet-600 text-white text-xs px-1.5 py-0.5 rounded-full">{unread}</span>}
        </button>
      </nav>
      <div className="mt-auto flex flex-col gap-1">
        <button onClick={() => navigate("/role-select")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all text-sm">
          <span>🔄</span><span>Switch Role</span>
        </button>
        <button onClick={handleDisconnect}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-all cursor-pointer">
          <span>🚪</span><span>Disconnect</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
