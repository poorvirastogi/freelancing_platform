import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";

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
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #190019 0%, #2B124C 100%)" }}>
      <ClientSidebar />
      <main className="flex-1 p-8 overflow-auto">

        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(133,79,108,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>Client Portal</p>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>My Profile</h1>
          <p className="text-sm" style={{ color: "rgba(223,182,178,0.4)" }}>Manage your client profile and view activity summary</p>
        </div>

        <div className="max-w-3xl flex flex-col gap-6">

          {/* Identity card */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(43,18,76,0.5)", border: "1px solid rgba(133,79,108,0.2)" }}>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #522B5B, #854F6C)", boxShadow: "0 0 20px rgba(133,79,108,0.3)" }}>
                🏢
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>
                  {user?.username || "Client"}
                </h2>
                <p className="text-xs font-mono mb-2" style={{ color: "rgba(223,182,178,0.4)" }}>
                  {account && account !== "email-user" ? account : user?.email}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(133,79,108,0.2)", color: "#DFB6B2", border: "1px solid rgba(133,79,108,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                  🏢 Client
                </span>
              </div>
            </div>
          </div>

          {/* Activity stats */}
          {stats && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(43,18,76,0.5)", border: "1px solid rgba(133,79,108,0.2)" }}>
              <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>📊 Activity Summary</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Jobs Posted", value: stats.total, icon: "📝" },
                  { label: "Active Jobs", value: stats.active, icon: "⚡" },
                  { label: "Completed", value: stats.completed, icon: "🏆" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-4 text-center"
                    style={{ background: "rgba(25,0,25,0.4)", border: "1px solid rgba(133,79,108,0.12)" }}>
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-2xl font-black mb-0.5" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>{s.value}</div>
                    <div className="text-xs" style={{ color: "rgba(223,182,178,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Budget Posted", value: `${stats.totalBudget} ETH`, icon: "��" },
                  { label: "Total ETH Spent", value: `${stats.totalSpent} ETH`, icon: "💰" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-4 flex items-center gap-3"
                    style={{ background: "rgba(25,0,25,0.4)", border: "1px solid rgba(133,79,108,0.12)" }}>
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <div className="font-bold" style={{ color: "#DFB6B2", fontFamily: "Syne, sans-serif" }}>{s.value}</div>
                      <div className="text-xs" style={{ color: "rgba(223,182,178,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit form */}
          <form onSubmit={handleSave} className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: "rgba(43,18,76,0.5)", border: "1px solid rgba(133,79,108,0.2)" }}>
            <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>✏️ Edit Profile</h2>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: "rgba(223,182,178,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>Name / Company</label>
              <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Your name or company"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(25,0,25,0.6)", border: "1px solid rgba(133,79,108,0.2)", color: "#DFB6B2" }}
                onFocus={e => e.target.style.border = "1px solid rgba(133,79,108,0.5)"}
                onBlur={e => e.target.style.border = "1px solid rgba(133,79,108,0.2)"}/>
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: "rgba(223,182,178,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>About</label>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                placeholder="Tell freelancers about your company and projects..."
                rows={4} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ background: "rgba(25,0,25,0.6)", border: "1px solid rgba(133,79,108,0.2)", color: "#DFB6B2", lineHeight: "1.7" }}
                onFocus={e => e.target.style.border = "1px solid rgba(133,79,108,0.5)"}
                onBlur={e => e.target.style.border = "1px solid rgba(133,79,108,0.2)"}/>
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: "rgba(223,182,178,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>Skills You Need</label>
              <input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})}
                placeholder="React, Solidity, Node.js"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(25,0,25,0.6)", border: "1px solid rgba(133,79,108,0.2)", color: "#DFB6B2" }}
                onFocus={e => e.target.style.border = "1px solid rgba(133,79,108,0.5)"}
                onBlur={e => e.target.style.border = "1px solid rgba(133,79,108,0.2)"}/>
              <p className="text-xs mt-1" style={{ color: "rgba(133,79,108,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>Used for freelancer matching</p>
            </div>

            {saved && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#6ee7b7" }}>
                ✅ Profile saved!
              </div>
            )}

            <button type="submit" className="py-3 rounded-xl font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, #522B5B, #854F6C)", color: "#FBE4D8", fontFamily: "Space Grotesk, sans-serif" }}>
              Save Profile
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ClientProfile;
