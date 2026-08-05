import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../utils/api";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const { account, user, disconnect } = useWallet();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) navigate("/");
    fetchData();
  }, [account]);

  const fetchData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        API.get("/users/stats"),
        API.get("/jobs"),
      ]);
      setStats(statsRes.data);
      setRecentJobs(jobsRes.data.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col py-8 px-4">
        <div className="text-2xl font-bold text-violet-400 mb-10 px-2">
          FreeLance3
        </div>
        <nav className="flex flex-col gap-1">
          {[
            { icon: "🏠", label: "Dashboard", path: "/dashboard" },
            { icon: "💼", label: "Find Jobs", path: "/jobs" },
            { icon: "➕", label: "Post a Job", path: "/post-job" },
            { icon: "📋", label: "My Bids", path: "/bids" },
            { icon: "👤", label: "Profile", path: "/profile" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-150 text-left"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <button
            onClick={disconnect}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-all"
          >
            <span>🚪</span>
            <span>Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.username || "Anon"} 👋
            </h1>
            <p className="text-gray-400 mt-1 font-mono text-sm">
              {shortAddress}
            </p>
          </div>
          <div className="bg-violet-900/40 border border-violet-700/50 text-violet-300 px-4 py-2 rounded-lg text-sm">
            🟢 Connected to Sepolia
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Jobs Posted",
              value: loading ? "..." : stats?.postedJobs ?? 0,
              icon: "📝",
              color: "violet",
            },
            {
              label: "Active Jobs",
              value: loading ? "..." : stats?.activeJobs ?? 0,
              icon: "⚡",
              color: "blue",
            },
            {
              label: "Bids Placed",
              value: loading ? "..." : stats?.totalBids ?? 0,
              icon: "🎯",
              color: "green",
            },
            {
              label: "Jobs Won",
              value: loading ? "..." : stats?.jobsWon ?? 0,
              icon: "🏆",
              color: "amber",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Jobs */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Jobs</h2>
              <button
                onClick={() => navigate("/jobs")}
                className="text-violet-400 text-sm hover:text-violet-300"
              >
                View all →
              </button>
            </div>
            {recentJobs.length === 0 ? (
              <p className="text-gray-400 text-sm">No jobs yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentJobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="border border-gray-800 rounded-xl p-4 hover:border-violet-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm">{job.title}</h3>
                      <span className="text-violet-400 text-sm font-bold">
                        {job.budget} ETH
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {job.skills.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
                          className="bg-violet-900/30 text-violet-300 text-xs px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              {[
                {
                  icon: "💼",
                  label: "Browse open jobs",
                  desc: "Find work that matches your skills",
                  path: "/jobs",
                },
                {
                  icon: "➕",
                  label: "Post a new job",
                  desc: "Hire a freelancer for your project",
                  path: "/post-job",
                },
                {
                  icon: "📋",
                  label: "View my bids",
                  desc: "Track your submitted proposals",
                  path: "/bids",
                },
                {
                  icon: "👤",
                  label: "Edit profile",
                  desc: "Update your skills and bio",
                  path: "/profile",
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-4 p-4 border border-gray-800 rounded-xl hover:border-violet-700 transition-all text-left"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-gray-400 text-xs">{action.desc}</div>
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

export default Dashboard;