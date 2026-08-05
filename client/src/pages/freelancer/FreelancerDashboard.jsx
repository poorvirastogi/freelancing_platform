import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import API from "../../utils/api";

const StatCard = ({ icon, label, value, accent, sub }) => (
  <div className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300"
    style={{ background: "linear-gradient(145deg, rgba(5,38,89,0.6), rgba(2,16,36,0.8))", border: `1px solid ${accent}22` }}
    onMouseEnter={e => e.currentTarget.style.border = `1px solid ${accent}55`}
    onMouseLeave={e => e.currentTarget.style.border = `1px solid ${accent}22`}>
    <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
      style={{ background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)` }} />
    <div className="text-2xl mb-3">{icon}</div>
    <div className="text-2xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>{value}</div>
    <div className="text-xs" style={{ color: "rgba(193,232,255,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>{label}</div>
    {sub && <div className="text-xs mt-0.5" style={{ color: "rgba(193,232,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>{sub}</div>}
  </div>
);

const FreelancerDashboard = () => {
  const { account, user } = useWallet();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBids, setRecentBids] = useState([]);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [zkProof, setZkProof] = useState(null);

  useEffect(() => {
    if (!account) navigate("/freelancer/login");
    fetchData();
  }, [account]);

  const fetchData = async () => {
    try {
      const [bidsRes, skillsRes, zkRes] = await Promise.all([
        API.get("/jobs/my/bids"),
        API.get("/skills/my"),
        API.get("/zk/my-proof"),
      ]);
      const bids = bidsRes.data;
      const wonJobs = bids.filter(b => b.job?.status === "completed" || b.job?.status === "in_progress");
      const ethEarned = bids
        .filter(b => b.job?.status === "completed")
        .reduce((s, b) => s + (b.job?.budget * (b.job?.paymentProgress || 0) / 100), 0);
      setStats({
        totalBids: bids.length,
        jobsWon: wonJobs.length,
        activeJobs: bids.filter(b => b.job?.status === "in_progress").length,
        ethEarned: ethEarned.toFixed(4),
        winRate: bids.length > 0 ? Math.round((wonJobs.length / bids.length) * 100) : 0,
      });
      setRecentBids(bids.slice(0, 3));
      setVerifiedSkills(skillsRes.data.filter(s => s.status === "passed").slice(0, 5));
      setZkProof(zkRes.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #021024 0%, #052659 100%)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(84,131,179,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>Freelancer Dashboard</p>
            <h1 className="text-3xl font-black" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>
              Welcome back, {user?.username || "Freelancer"} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(193,232,255,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>
              {user?.walletAddress ? `${user.walletAddress.slice(0,6)}...${user.walletAddress.slice(-4)}` : user?.email}
            </p>
          </div>
          <div className="px-4 py-2 rounded-full text-xs flex items-center gap-2"
            style={{ background: "rgba(84,131,179,0.12)", border: "1px solid rgba(84,131,179,0.25)", color: "#7DA0CA", fontFamily: "Space Grotesk, sans-serif" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            Sepolia Testnet
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🎯" label="Bids Placed"  value={stats?.totalBids ?? 0}   accent="#5483B3" />
          <StatCard icon="🏆" label="Jobs Won"     value={stats?.jobsWon ?? 0}     accent="#7DA0CA" sub={`${stats?.winRate ?? 0}% win rate`} />
          <StatCard icon="⚡" label="In Progress"  value={stats?.activeJobs ?? 0}  accent="#5483B3" />
          <StatCard icon="💰" label="ETH Earned"   value={`${stats?.ethEarned ?? 0}`} sub="from completed jobs" accent="#C1E8FF" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ZK + Skills summary */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(5,38,89,0.4)", border: "1px solid rgba(84,131,179,0.15)" }}>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>Your Web3 Identity</h2>

            {/* ZK level */}
            <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
              style={{ background: "rgba(2,16,36,0.5)", border: "1px solid rgba(84,131,179,0.12)" }}>
              <span className="text-2xl">{zkProof?.proof?.verifiedEmoji || "◌"}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: zkProof?.proof?.verified ? zkProof.proof.verifiedColor : "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                  {zkProof?.proof?.verified ? `${zkProof.proof.verifiedLevel} Reputation` : "No ZK Reputation Yet"}
                </p>
                <p className="text-xs" style={{ color: "rgba(193,232,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>ZK Proof · Private score</p>
              </div>
              <button onClick={() => navigate("/freelancer/reputation")}
                className="text-xs px-2 py-1 rounded-lg"
                style={{ background: "rgba(84,131,179,0.15)", color: "#7DA0CA", fontFamily: "Space Grotesk, sans-serif" }}>
                View →
              </button>
            </div>

            {/* Verified skills */}
            {verifiedSkills.length > 0 ? (
              <div>
                <p className="text-xs mb-2" style={{ color: "rgba(193,232,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                  Verified Skills ({verifiedSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {verifiedSkills.map(s => (
                    <span key={s.skill} className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: `${s.badgeColor || "#6ee7b7"}12`, color: s.badgeColor || "#6ee7b7", border: `1px solid ${s.badgeColor || "#6ee7b7"}25`, fontFamily: "Space Grotesk, sans-serif" }}>
                      {s.badgeEmoji} {s.skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 rounded-xl" style={{ background: "rgba(2,16,36,0.4)", border: "1px dashed rgba(84,131,179,0.2)" }}>
                <p className="text-xs mb-2" style={{ color: "rgba(193,232,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>No verified skills yet</p>
                <button onClick={() => navigate("/freelancer/skill-verify")}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(84,131,179,0.15)", color: "#7DA0CA", border: "1px solid rgba(84,131,179,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>
                  Get Verified →
                </button>
              </div>
            )}
          </div>

          {/* Recent bids + quick actions */}
          <div className="flex flex-col gap-4">
            {/* Recent bids */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(5,38,89,0.4)", border: "1px solid rgba(84,131,179,0.15)" }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>Recent Bids</h2>
                <button onClick={() => navigate("/freelancer/bids")} className="text-xs"
                  style={{ color: "rgba(84,131,179,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>
                  View all →
                </button>
              </div>
              {recentBids.length === 0
                ? <p className="text-xs" style={{ color: "rgba(193,232,255,0.3)" }}>No bids placed yet</p>
                : recentBids.map(bid => (
                  <div key={bid._id} onClick={() => navigate(`/freelancer/job/${bid.job?._id}`)}
                    className="rounded-xl p-3 mb-2 cursor-pointer transition-all"
                    style={{ background: "rgba(2,16,36,0.5)", border: "1px solid rgba(84,131,179,0.1)" }}
                    onMouseEnter={e => e.currentTarget.style.border = "1px solid rgba(84,131,179,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.border = "1px solid rgba(84,131,179,0.1)"}>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium truncate" style={{ color: "#C1E8FF", maxWidth: "180px" }}>{bid.job?.title}</span>
                      <span className="text-xs font-bold" style={{ color: "#5483B3" }}>{bid.amount} ETH</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ background: bid.status === "accepted" ? "rgba(16,185,129,0.1)" : bid.status === "rejected" ? "rgba(255,80,80,0.1)" : "rgba(84,131,179,0.1)", color: bid.status === "accepted" ? "#6ee7b7" : bid.status === "rejected" ? "#ff9999" : "#7DA0CA", fontFamily: "Space Grotesk, sans-serif" }}>
                      {bid.status}
                    </span>
                  </div>
                ))
              }
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(5,38,89,0.4)", border: "1px solid rgba(84,131,179,0.15)" }}>
              <div className="flex flex-col gap-2">
                {[
                  { icon: "💼", label: "Browse Jobs",     desc: "Find new work",              path: "/freelancer/jobs" },
                  { icon: "🎯", label: "Recommended",     desc: "Matched to your skills",     path: "/freelancer/recommended" },
                  { icon: "🤖", label: "Verify Skills",   desc: "Earn badges",                path: "/freelancer/skill-verify" },
                  { icon: "🛡️", label: "My Reputation",  desc: "View ZK proof",              path: "/freelancer/reputation" },
                ].map(a => (
                  <button key={a.label} onClick={() => navigate(a.path)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                    style={{ background: "rgba(2,16,36,0.4)", border: "1px solid rgba(84,131,179,0.1)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(84,131,179,0.1)"; e.currentTarget.style.border = "1px solid rgba(84,131,179,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(2,16,36,0.4)"; e.currentTarget.style.border = "1px solid rgba(84,131,179,0.1)"; }}>
                    <span className="text-lg w-7 text-center">{a.icon}</span>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: "#C1E8FF" }}>{a.label}</div>
                      <div className="text-xs" style={{ color: "rgba(193,232,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FreelancerDashboard;
