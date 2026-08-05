import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";
import { PageHeader, StatCard, Card, Badge, Button } from "../../components/ui";
import {
  FileText,
  Zap,
  Trophy,
  Coins,
  FilePlus2,
  FolderKanban,
  Activity,
  Star,
  ArrowRight,
} from "lucide-react";

const statusTone = (status) =>
  status === "open" ? "success" : status === "in_progress" ? "accent" : status === "completed" ? "accent" : "neutral";

const statusLabel = (status) =>
  status === "completed" ? "Completed" : status === "in_progress" ? "In progress" : status === "open" ? "Open" : status;

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

  const quickActions = [
    { icon: FilePlus2,    label: "Post a New Job",     desc: "Find the perfect freelancer",           path: "/client/post-job" },
    { icon: FolderKanban, label: "Manage Posted Jobs",  desc: "Edit, delete, view bids",               path: "/client/my-jobs" },
    { icon: Activity,     label: "Active Jobs",         desc: "Accept submissions & release payments", path: "/client/active-jobs" },
    { icon: Star,         label: "Top Freelancers",     desc: "Find best talent using skill graph",    path: "/client/top-freelancers" },
  ];

  return (
    <div className="client-theme min-h-screen flex bg-bg text-foreground">
      <ClientSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">

          <PageHeader
            eyebrow="Client Dashboard"
            title={`Welcome back, ${user?.username || "Client"}`}
            description={user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : user?.email}
            actions={
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-surface border border-line text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Sepolia Testnet
              </span>
            }
          />

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 stagger">
            <StatCard label="Jobs Posted" value={stats?.postedJobs ?? 0} icon={FileText} />
            <StatCard label="Active Jobs" value={stats?.activeJobs ?? 0} icon={Zap} />
            <StatCard label="Completed" value={stats?.completedJobs ?? 0} icon={Trophy} />
            <StatCard label="ETH Spent" value={stats?.totalSpent ?? 0} hint="on completed jobs" icon={Coins} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

            {/* Recent Jobs */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-foreground">Recent Jobs</h2>
                <button onClick={() => navigate("/client/my-jobs")}
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors focus-ring rounded px-1">
                  View all <ArrowRight size={13} />
                </button>
              </div>

              {recentJobs.length === 0 ? (
                <p className="text-sm text-faint py-4">No jobs posted yet</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentJobs.map(job => (
                    <button key={job._id} onClick={() => navigate(`/client/job/${job._id}`)}
                      className="w-full text-left rounded-[var(--radius-md)] p-4 bg-bg-elev border border-line hover:border-line-strong transition-colors focus-ring">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <span className="font-medium text-sm text-foreground truncate">{job.title}</span>
                        <span className="font-data font-semibold text-sm text-accent whitespace-nowrap">{job.budget} ETH</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge tone={statusTone(job.status)}>{statusLabel(job.status)}</Badge>
                        {(job.status === 'in_progress' || job.status === 'completed') && (
                          <span className="text-xs text-muted font-data">{job.paymentProgress || 0}% released</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-5">Quick Actions</h2>
              <div className="flex flex-col gap-3">
                {quickActions.map(a => {
                  const Icon = a.icon;
                  return (
                    <button key={a.label} onClick={() => navigate(a.path)}
                      className="group flex items-center gap-4 p-4 rounded-[var(--radius-md)] text-left bg-bg-elev border border-line hover:border-line-strong transition-colors focus-ring">
                      <span className="grid place-items-center h-10 w-10 rounded-[var(--radius-sm)] bg-accent-soft text-accent shrink-0">
                        <Icon size={18} strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-foreground">{a.label}</div>
                        <div className="text-xs text-muted truncate">{a.desc}</div>
                      </div>
                      <ArrowRight size={16} className="text-faint group-hover:text-accent transition-colors shrink-0" />
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
