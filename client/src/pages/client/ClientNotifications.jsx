import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";

const iconMap = {
  bid_received: "🎯",
  hired: "🤝",
  payment_released: "💰",
  work_submitted: "📁",
  bid_rejected: "❌",
  job_deleted: "🗑️"
};

const ClientNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) navigate("/client/login");
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      setNotifications(data);
      await API.put("/notifications/read").catch(() => {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleClick = (n) => {
    if (!n.jobId) return;
    // Always navigate to client job detail path
    navigate(`/client/job/${n.jobId}`);
  };

  return (
    <div className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #190019 0%, #2B124C 100%)" }}>
      <ClientSidebar />
      <main className="flex-1 p-8 overflow-auto">

        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2"
            style={{ color: "rgba(133,79,108,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>
            Client Portal
          </p>
          <h1 className="text-3xl font-black mb-1"
            style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>
            Notifications
          </h1>
          <p className="text-sm" style={{ color: "rgba(223,182,178,0.4)" }}>
            Stay updated on your jobs and bids
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "rgba(223,182,178,0.4)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
            <span className="text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Loading...</span>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold mb-2"
              style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>
              No notifications yet
            </h3>
            <p className="text-sm" style={{ color: "rgba(223,182,178,0.4)" }}>
              You'll be notified when freelancers bid on your jobs
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 max-w-2xl">
          {notifications.map(n => (
            <div
              key={n._id}
              onClick={() => handleClick(n)}
              className="rounded-2xl p-5 flex items-start gap-4 transition-all duration-200"
              style={{
                background: n.read ? "rgba(43,18,76,0.3)" : "rgba(133,79,108,0.12)",
                border: n.read ? "1px solid rgba(133,79,108,0.12)" : "1px solid rgba(133,79,108,0.35)",
                cursor: n.jobId ? "pointer" : "default",
              }}
              onMouseEnter={e => { if (n.jobId) e.currentTarget.style.border = "1px solid rgba(133,79,108,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.border = n.read ? "1px solid rgba(133,79,108,0.12)" : "1px solid rgba(133,79,108,0.35)"; }}>

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: "rgba(133,79,108,0.15)", border: "1px solid rgba(133,79,108,0.2)" }}>
                {iconMap[n.type] || "🔔"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed"
                  style={{ color: n.read ? "rgba(223,182,178,0.6)" : "#DFB6B2" }}>
                  {n.message}
                </p>
                <p className="text-xs mt-1.5"
                  style={{ color: "rgba(133,79,108,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
                {n.jobId && (
                  <p className="text-xs mt-1"
                    style={{ color: "rgba(133,79,108,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>
                    Click to view job →
                  </p>
                )}
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                  style={{ background: "#854F6C" }}/>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ClientNotifications;
