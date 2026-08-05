import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";
import { PageHeader, Card, StatCard, Field, Input, Textarea, Button } from "../../components/ui";
import { Building2, FileText, Zap, Trophy, Wallet, Coins, Check } from "lucide-react";

const ClientProfile = () => {
  const { user, account } = useWallet();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: user?.username || "", bio: user?.bio || "", skills: user?.skills?.join(", ") || "" });
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!account) navigate("/client/login");
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get("/jobs/my/posted");
      setStats({
        total: data.length,
        open: data.filter(j => j.status === "open").length,
        active: data.filter(j => j.status === "in_progress").length,
        completed: data.filter(j => j.status === "completed").length,
        totalBudget: data.reduce((s, j) => s + j.budget, 0).toFixed(3),
        totalSpent: data.filter(j => j.status === "completed").reduce((s, j) => s + j.budget, 0).toFixed(3),
      });
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.put("/users/profile", {
        ...form,
        role: "client",
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="client-theme min-h-screen flex bg-bg text-foreground">
      <ClientSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">

          <PageHeader
            eyebrow="Client Portal"
            title="My Profile"
            description="Manage your client profile and view activity summary"
          />

          <div className="flex flex-col gap-6 mt-8">

            {/* Identity */}
            <Card className="p-6">
              <div className="flex items-center gap-5">
                <span className="grid place-items-center h-16 w-16 rounded-[var(--radius-lg)] bg-accent text-accent-fg shrink-0">
                  <Building2 size={30} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-foreground">{user?.username || "Client"}</h2>
                  <p className="text-xs font-data text-muted mt-1 mb-2 truncate">
                    {account && account !== "email-user" ? account : user?.email}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent-soft text-accent border border-[color:var(--accent)]/30">
                    <Building2 size={12} /> Client
                  </span>
                </div>
              </div>
            </Card>

            {/* Activity Summary */}
            {stats && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-5">Activity Summary</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  <StatCard label="Jobs Posted" value={stats.total} icon={FileText} />
                  <StatCard label="Active Jobs" value={stats.active} icon={Zap} />
                  <StatCard label="Completed" value={stats.completed} icon={Trophy} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard label="Total Budget Posted" value={`${stats.totalBudget} ETH`} icon={Wallet} />
                  <StatCard label="Total ETH Spent" value={`${stats.totalSpent} ETH`} icon={Coins} />
                </div>
              </Card>
            )}

            {/* Edit form */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-5">Edit Profile</h2>
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <Field label="Name / Company">
                  <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Your name or company" />
                </Field>

                <Field label="About">
                  <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell freelancers about your company and projects..." rows={4} />
                </Field>

                <Field label="Skills You Need" hint="Used for freelancer matching">
                  <Input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Solidity, Node.js" />
                </Field>

                {saved && (
                  <div role="status" className="px-4 py-3 rounded-[var(--radius-md)] text-sm flex items-center gap-2 bg-success-soft border border-[color:var(--success)]/30 text-success">
                    <Check size={16} /> Profile saved!
                  </div>
                )}

                <div>
                  <Button type="submit">Save Profile</Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientProfile;
