import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";
import API from "../utils/api";

const iconMap = { bid_received: "🎯", hired: "🤝", payment_released: "💰", work_submitted: "📁", bid_rejected: "❌", job_deleted: "🗑️" };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) navigate("/");
    API.get("/notifications").then(({ data }) => {
      setNotifications(data);
      API.put("/notifications/read").catch(() => {});
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-2">Notifications</h1>
        <p className="text-gray-400 mb-8">Stay updated on your jobs and bids</p>
        {notifications.length === 0 && (
          <div className="text-center py-20"><div className="text-5xl mb-4">🔔</div><h3 className="text-xl font-semibold">No notifications yet</h3></div>
        )}
        <div className="flex flex-col gap-3">
          {notifications.map(n => (
            <div key={n._id} onClick={() => n.jobId && navigate(`/jobs/${n.jobId}`)}
              className={`bg-gray-900 border rounded-2xl p-4 flex items-start gap-4 cursor-pointer hover:border-violet-700 transition-all ${n.read ? "border-gray-800" : "border-violet-700/50 bg-violet-900/10"}`}>
              <span className="text-2xl">{iconMap[n.type] || "🔔"}</span>
              <div className="flex-1">
                <p className="text-gray-200 text-sm">{n.message}</p>
                <p className="text-gray-500 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && <span className="w-2 h-2 bg-violet-500 rounded-full mt-1.5 flex-shrink-0"/>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
