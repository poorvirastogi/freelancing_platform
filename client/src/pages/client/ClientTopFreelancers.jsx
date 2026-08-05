import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";

const ClientTopFreelancers = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState("");
  const [searched, setSearched] = useState(false);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/client/login"); fetchRankings(); }, []);

  const fetchRankings = async (skills = "") => {
    setLoading(true);
    try {
      const query = skills ? `?skills=${encodeURIComponent(skills)}` : "";
      const { data } = await API.get(`/ranking/freelancers${query}`);
      setRankings(data.rankings || []);
      setSearched(!!skills);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRankings(skillFilter);
  };

  const getMedalStyle = (i) => {
    if (i === 0) return { bg: "rgba(255,215,0,0.08)", border: "rgba(255,215,0,0.3)", color: "#FFD700", medal: "🥇" };
    if (i === 1) return { bg: "rgba(192,192,192,0.08)", border: "rgba(192,192,192,0.25)", color: "#C0C0C0", medal: "🥈" };
    if (i === 2) return { bg: "rgba(205,127,50,0.08)", border: "rgba(205,127,50,0.25)", color: "#CD7F32", medal: "🥉" };
    return { bg: "rgba(43,18,76,0.4)", border: "rgba(133,79,108,0.2)", color: "#DFB6B2", medal: null };
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #190019 0%, #2B124C 100%)" }}>
      <ClientSidebar />
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2"
            style={{ color: "rgba(133,79,108,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>
            Skill Graph · PageRank Algorithm · Novelty 3
          </p>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>
            Top Freelancers
          </h1>
          <p className="text-sm" style={{ color: "rgba(223,182,178,0.4)" }}>
            Ranked by verified skills, ZK reputation and activity using PageRank algorithm.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(133,79,108,0.5)", fontSize: "16px" }}>⌕</span>
            <input
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              placeholder="Filter by skills e.g. React, Solidity, Python"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none"
              style={{ background: "rgba(43,18,76,0.5)", border: "1px solid rgba(133,79,108,0.25)", color: "#DFB6B2", fontFamily: "Space Grotesk, sans-serif" }}
              onFocus={e => e.target.style.border = "1px solid rgba(133,79,108,0.6)"}
              onBlur={e => e.target.style.border = "1px solid rgba(133,79,108,0.25)"}
            />
          </div>
          <button type="submit"
            className="px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all"
            style={{ background: "linear-gradient(135deg, #522B5B, #854F6C)", color: "#FBE4D8", fontFamily: "Space Grotesk, sans-serif" }}>
            Find Best Match
          </button>
          {searched && (
            <button type="button" onClick={() => { setSkillFilter(""); fetchRankings(""); }}
              className="px-4 py-3.5 rounded-2xl text-sm"
              style={{ background: "rgba(133,79,108,0.12)", border: "1px solid rgba(133,79,108,0.2)", color: "#DFB6B2" }}>
              Clear
            </button>
          )}
        </form>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "rgba(223,182,178,0.4)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
            <span className="text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Computing rankings...</span>
          </div>
        )}

        {!loading && rankings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2"
              style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>No freelancers found</h3>
            <p className="text-sm" style={{ color: "rgba(223,182,178,0.4)" }}>Try different skill filters or check back later</p>
          </div>
        )}

        {/* How scoring works */}
        {!loading && rankings.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {[
              { label: "Verified Skills", pts: "40 pts", color: "#DFB6B2" },
              { label: "ZK Reputation", pts: "30 pts", color: "#6ee7b7" },
              { label: "Activity", pts: "20 pts", color: "#7DA0CA" },
              { label: "PageRank", pts: "10 pts", color: "#fbbf24" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(133,79,108,0.08)", border: "1px solid rgba(133,79,108,0.15)" }}>
                <span className="text-xs font-bold" style={{ color: s.color }}>{s.pts}</span>
                <span className="text-xs" style={{ color: "rgba(223,182,178,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Rankings */}
        <div className="flex flex-col gap-4">
          {rankings.map((item, i) => {
            const colors = getMedalStyle(i);
            return (
              <div key={item.freelancer._id} className="rounded-2xl p-6 transition-all duration-200"
                style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>

                <div className="flex items-start gap-5">

                  {/* Rank badge */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl"
                    style={{ background: `${colors.color}15`, border: `1px solid ${colors.color}30` }}>
                    {colors.medal
                      ? <span className="text-2xl">{colors.medal}</span>
                      : <span className="text-lg font-black" style={{ color: colors.color, fontFamily: "Syne, sans-serif" }}>#{i+1}</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>
                        {item.freelancer.username || item.freelancer.walletAddress?.slice(0, 12) + "..."}
                      </h3>

                      {/* ZK badge — show even if not verified */}
                      {item.zkProof && item.zkProof.verified && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: `${item.zkProof.color}15`, color: item.zkProof.color, border: `1px solid ${item.zkProof.color}30`, fontFamily: "Space Grotesk, sans-serif" }}>
                          {item.zkProof.emoji} {item.zkProof.level}
                        </span>
                      )}
                      {(!item.zkProof || !item.zkProof.verified) && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "Space Grotesk, sans-serif" }}>
                          ◌ No ZK Reputation
                        </span>
                      )}
                    </div>

                    {/* Wallet */}
                    <p className="text-xs font-mono mb-3" style={{ color: "rgba(223,182,178,0.3)" }}>
                      {item.freelancer.walletAddress?.slice(0, 16)}...
                    </p>

                    {/* Verified skill badges */}
                    {item.verifiedSkills?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.verifiedSkills.map(s => (
                          <span key={s.skill} className="text-xs px-2.5 py-1 rounded-lg"
                            style={{ background: `${s.badgeColor || "#6ee7b7"}12`, color: s.badgeColor || "#6ee7b7", border: `1px solid ${s.badgeColor || "#6ee7b7"}25`, fontFamily: "Space Grotesk, sans-serif" }}>
                            {s.badgeEmoji || "✓"} {s.skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs mb-3" style={{ color: "rgba(223,182,178,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                        No verified skills yet
                      </p>
                    )}

                    {/* Matched skills highlight */}
                    {item.matchedSkills?.length > 0 && (
                      <p className="text-xs mb-2" style={{ color: "#6ee7b7", fontFamily: "Space Grotesk, sans-serif" }}>
                        ✓ Matches {item.matchedSkills.length} of your required skills: {item.matchedSkills.join(", ")}
                      </p>
                    )}

                    <div className="flex gap-4 text-xs flex-wrap" style={{ color: "rgba(223,182,178,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>
                      <span>✅ {item.jobsCompleted} jobs completed</span>
                      <span>📋 {item.bidCount} bids placed</span>
                      <span>📊 PageRank: {item.pageRank}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-3xl font-black mb-1" style={{ fontFamily: "Syne, sans-serif", color: colors.color }}>
                      {item.scores.totalScore}
                    </div>
                    <div className="text-xs mb-3" style={{ color: "rgba(223,182,178,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>Total Score</div>
                    <div className="flex flex-col gap-1 text-xs" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      <div className="flex justify-between gap-4">
                        <span style={{ color: "rgba(223,182,178,0.4)" }}>Skills</span>
                        <span style={{ color: "#DFB6B2" }}>+{item.scores.matchScore}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span style={{ color: "rgba(223,182,178,0.4)" }}>ZK Rep</span>
                        <span style={{ color: "#DFB6B2" }}>+{item.scores.zkScore}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span style={{ color: "rgba(223,182,178,0.4)" }}>Activity</span>
                        <span style={{ color: "#DFB6B2" }}>+{item.scores.activityScore}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span style={{ color: "rgba(223,182,178,0.4)" }}>PageRank</span>
                        <span style={{ color: "#DFB6B2" }}>+{item.scores.prScore}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-5">
                  <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(133,79,108,0.12)" }}>
                    <div className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(item.scores.totalScore, 100)}%`, background: `linear-gradient(90deg, #522B5B, ${colors.color})` }}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ClientTopFreelancers;
