import { useState, useEffect } from "react";
import API from "../utils/api";

const TrustScore = ({ freelancerId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!freelancerId) { setLoading(false); setErrored(true); return; }
    setLoading(true);
    setErrored(false);
    API.get(`/trust/${freelancerId}`)
      .then(({ data }) => setData(data))
      .catch(err => { console.error("TrustScore error:", err); setErrored(true); })
      .finally(() => setLoading(false));
  }, [freelancerId]);

  // Loading skeleton — keeps layout space instead of collapsing
  if (loading) return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", minHeight: "44px" }}>
      <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin"
        style={{ color: "rgba(255,255,255,0.15)" }}/>
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)", fontFamily: "Space Grotesk, sans-serif" }}>
        Loading trust score...
      </span>
    </div>
  );

  // Error or no data — show a neutral placeholder, never blank
  if (errored || !data) return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", minHeight: "44px" }}>
      <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.15)" }}>◌</span>
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>
        Trust score unavailable
      </span>
    </div>
  );

  const { trustScore, trustLabel, breakdown, verifiedSkills } = data;

  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl w-full text-left transition-all"
        style={{ background: `${trustLabel.color}10`, border: `1px solid ${trustLabel.color}30` }}>

        <div className="relative w-10 h-10 flex-shrink-0">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
            <circle cx="20" cy="20" r="16" fill="none"
              stroke={trustLabel.color} strokeWidth="3"
              strokeDasharray={`${trustScore} 100`}
              strokeDashoffset="25"
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s ease" }}
              transform="rotate(-90 20 20)"/>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
            style={{ color: trustLabel.color, fontSize: "10px" }}>{trustScore}</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{trustLabel.emoji}</span>
            <span className="text-xs font-bold" style={{ color: trustLabel.color, fontFamily: "Space Grotesk, sans-serif" }}>
              {trustLabel.label}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif", fontSize: "10px" }}>
            Trust Score: {trustScore}/100 · click for details
          </p>
        </div>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
      </button>

      {expanded && (
        <div className="mt-2 rounded-2xl p-4"
          style={{ background: "rgba(2,16,36,0.95)", border: "1px solid rgba(84,131,179,0.2)", backdropFilter: "blur(20px)" }}>
          <p className="text-xs font-bold mb-3" style={{ color: "#C1E8FF", fontFamily: "Syne, sans-serif" }}>Score Breakdown</p>

          <div className="flex items-center justify-between mb-2 p-2 rounded-lg" style={{ background: "rgba(84,131,179,0.08)" }}>
            <div className="flex items-center gap-2">
              <span>{breakdown.zkReputation.emoji}</span>
              <span className="text-xs" style={{ color: "rgba(193,232,255,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>ZK Reputation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "rgba(193,232,255,0.4)" }}>{breakdown.zkReputation.level}</span>
              <span className="text-xs font-bold" style={{ color: "#C1E8FF" }}>+{breakdown.zkReputation.points}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2 p-2 rounded-lg" style={{ background: "rgba(84,131,179,0.08)" }}>
            <div className="flex items-center gap-2">
              <span>🎓</span>
              <span className="text-xs" style={{ color: "rgba(193,232,255,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>Verified Skills</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "rgba(193,232,255,0.4)" }}>
                {breakdown.skills.gold}🥇 {breakdown.skills.silver}🥈 {breakdown.skills.bronze}🥉
              </span>
              <span className="text-xs font-bold" style={{ color: "#C1E8FF" }}>+{breakdown.skills.points}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3 p-2 rounded-lg" style={{ background: "rgba(84,131,179,0.08)" }}>
            <div className="flex items-center gap-2">
              <span>📋</span>
              <span className="text-xs" style={{ color: "rgba(193,232,255,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "rgba(193,232,255,0.4)" }}>{breakdown.activity.totalBids} bids</span>
              <span className="text-xs font-bold" style={{ color: "#C1E8FF" }}>+{breakdown.activity.points}</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: "rgba(193,232,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>Total Score</span>
              <span className="text-xs font-bold" style={{ color: trustLabel.color }}>{trustScore}/100</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${trustScore}%`, background: trustLabel.color }} />
            </div>
          </div>

          {verifiedSkills?.length > 0 && (
            <div>
              <p className="text-xs mb-2" style={{ color: "rgba(193,232,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>Verified Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {verifiedSkills.map(s => (
                  <span key={s.skill} className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: `${s.badgeColor || "#6ee7b7"}12`, color: s.badgeColor || "#6ee7b7", border: `1px solid ${s.badgeColor || "#6ee7b7"}25`, fontFamily: "Space Grotesk, sans-serif", fontSize: "10px" }}>
                    {s.badgeEmoji} {s.skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrustScore;
