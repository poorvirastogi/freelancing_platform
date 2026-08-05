import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";

const StatCard = ({ icon, label, value, accent, sub }) => (
  <div className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300"
    style={{ background: "linear-gradient(145deg, rgba(43,18,76,0.6), rgba(25,0,25,0.8))", border: `1px solid ${accent}22` }}
    onMouseEnter={e => e.currentTarget.style.border = `1px solid ${accent}55`}
    onMouseLeave={e => e.currentTarget.style.border = `1px solid ${accent}22`}>
    <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
      style={{ background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)` }} />
    <div className="text-2xl mb-3">{icon}</div>
    <div className="text-2xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#FBE4D8" }}>{value}</div>
    <div className="text-xs" style={{ color: "rgba(223,182,178,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>{label}</div>
    {sub && <div className="text-xs mt-0.5" style={{ color: "rgba(223,182,178,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>{sub}</div>}
  </div>
);

const ClientDashboard = () => {
  const { account, user } = useWallet();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);

  useEffect(() => {
    if (!account) navigate("/client/login");
    fetchData();
  }, [account]);

  const fetchData = async () => {
    try {
      const [jobsRes] = await Promise.all([API.get("/jobs/my/posted")]);
      const jobs = jobsRes.data;
      setRecentJobs(jobs.slice(0, 3));
      setStats({
        postedJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'in_progress').length,
        completedJobs: jobs.filter(j => j.status === 'completed').length,
        totalSpent: jobs.filter(j => j.status === 'completed').reduce((s, j) => s + j.budget, 0).toFixed(3),
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #190019 0%, #2B124C 100%)" }}>
      <ClientSidebar />
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(133,79,108,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>Client Dashboard</p>
            <h1 className="text-3xl font-black" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>
              Welcome back, {user?.username || "Client"} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(223,182,178,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>
              {user?.walletAddress ? `${user.walletAddress.slice(0,6)}...${user.walletAddress.slice(-4)}` : user?.email}
            </p>
          </div>
          <div className="px-4 py-2 rounded-full text-xs flex items-center gap-2"
            style={{ background: "rgba(133,79,108,0.12)", border: "1px solid rgba(133,79,108,0.25)", color: "#DFB6B2", fontFamily: "Space Grotesk, sans-serif" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            Sepolia Testnet
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📝" label="Jobs Posted"  value={stats?.postedJobs ?? 0}    accent="#854F6C" />
          <StatCard icon="⚡" label="Active Jobs"  value={stats?.activeJobs ?? 0}    accent="#522B5B" />
          <StatCard icon="🏆" label="Completed"    value={stats?.completedJobs ?? 0} accent="#DFB6B2" />
          <StatCard icon="💰" label="ETH Spent"    value={`${stats?.totalSpent ?? 0}`} sub="on completed jobs" accent="#854F6C" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Jobs */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(43,18,76,0.4)", border: "1px solid rgba(133,79,108,0.15)" }}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>Recent Jobs</h2>
              <button onClick={() => navigate("/client/my-jobs")} className="text-xs transition-all"
                style={{ color: "rgba(133,79,108,0.7)", fontFamily: "Space Grotesk, sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.color = "#DFB6B2"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(133,79,108,0.7)"}>
                View all →
              </button>
            </div>
            {recentJobs.length === 0
              ? <p className="text-sm" style={{ color: "rgba(223,182,178,0.35)" }}>No jobs posted yet</p>
              : recentJobs.map(job => (
                <div key={job._id} onClick={() => navigate(`/client/job/${job._id}`)}
                  className="rounded-xl p-4 mb-3 cursor-pointer transition-all duration-200"
                  style={{ background: "rgba(133,79,108,0.08)", border: "1px solid rgba(133,79,108,0.12)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(133,79,108,0.15)"; e.currentTarget.style.border = "1px solid rgba(133,79,108,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(133,79,108,0.08)"; e.currentTarget.style.border = "1px solid rgba(133,79,108,0.12)"; }}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-sm" style={{ color: "#DFB6B2" }}>{job.title}</span>
                    <span className="font-bold text-sm" style={{ color: "#854F6C" }}>{job.budget} ETH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: job.status === 'open' ? "rgba(16,185,129,0.12)" : job.status === 'in_progress' ? "rgba(133,79,108,0.2)" : "rgba(255,255,255,0.05)",
                               color: job.status === 'open' ? "#6ee7b7" : job.status === 'in_progress' ? "#DFB6B2" : "#888",
                               fontFamily: "Space Grotesk, sans-serif" }}>
                      {job.status === 'completed' ? '🏆 Completed' : job.status}
                    </span>
                    {(job.status === 'in_progress' || job.status === 'completed') && (
                      <span className="text-xs" style={{ color: "rgba(223,182,178,0.4)" }}>{job.paymentProgress || 0}% released</span>
                    )}
                  </div>
                </div>
              ))
            }
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(43,18,76,0.4)", border: "1px solid rgba(133,79,108,0.15)" }}>
            <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>Quick Actions</h2>
            <div className="flex flex-col gap-3">
              {[
                { icon: "✦", label: "Post a New Job",        desc: "Find the perfect freelancer",             path: "/client/post-job" },
                { icon: "◈", label: "Manage Posted Jobs",     desc: "Edit, delete, view bids",                 path: "/client/my-jobs" },
                { icon: "◉", label: "Active Jobs",            desc: "Accept submissions & release payments",   path: "/client/active-jobs" },
                { icon: "⭐", label: "Top Freelancers",        desc: "Find best talent using skill graph",      path: "/client/top-freelancers" },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className="flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
                  style={{ background: "rgba(133,79,108,0.08)", border: "1px solid rgba(133,79,108,0.12)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(133,79,108,0.15)"; e.currentTarget.style.border = "1px solid rgba(133,79,108,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(133,79,108,0.08)"; e.currentTarget.style.border = "1px solid rgba(133,79,108,0.12)"; }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                    style={{ background: "rgba(133,79,108,0.2)", color: "#DFB6B2" }}>{a.icon}</div>
                  <div>
                    <div className="font-medium text-sm" style={{ color: "#DFB6B2" }}>{a.label}</div>
                    <div className="text-xs" style={{ color: "rgba(223,182,178,0.45)", fontFamily: "Space Grotesk, sans-serif" }}>{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
