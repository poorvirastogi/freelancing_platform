import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import API from "../../utils/api";

const FreelancerProfile = () => {
  const { user, account } = useWallet();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: user?.username || "", bio: user?.bio || "", skills: user?.skills?.join(", ") || "" });
  const [saved, setSaved] = useState(false);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [zkProof, setZkProof] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) navigate("/freelancer/login");
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [skillsRes, zkRes] = await Promise.all([
        API.get("/skills/my"),
        API.get("/zk/my-proof"),
      ]);
      setVerifiedSkills(skillsRes.data.filter(s => s.status === "passed"));
      setZkProof(zkRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.put("/users/profile", {
        ...form,
        role: "freelancer",
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #021024 0%, #052659 100%)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8 overflow-auto">

        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(84,131,179,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>Freelancer Portal</p>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>My Profile</h1>
          <p className="text-sm" style={{ color: "rgba(193,232,255,0.4)" }}>Your public profile, verified skills and reputation</p>
        </div>

        <div className="max-w-3xl flex flex-col gap-6">

          {/* Identity card */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(5,38,89,0.5)", border: "1px solid rgba(84,131,179,0.2)" }}>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #052659, #5483B3)", boxShadow: "0 0 20px rgba(84,131,179,0.3)" }}>
                💻
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>
                  {user?.username || "Freelancer"}
                </h2>
                <p className="text-xs font-mono mb-2" style={{ color: "rgba(193,232,255,0.4)" }}>
                  {account && account !== "email-user" ? account : user?.email}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(84,131,179,0.2)", color: "#7DA0CA", border: "1px solid rgba(84,131,179,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                    💻 Freelancer
                  </span>
                  {zkProof?.proof?.verified && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${zkProof.proof.verifiedColor}15`, color: zkProof.proof.verifiedColor, border: `1px solid ${zkProof.proof.verifiedColor}30`, fontFamily: "Space Grotesk, sans-serif" }}>
                      {zkProof.proof.verifiedEmoji} {zkProof.proof.verifiedLevel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ZK Reputation summary */}
          {zkProof?.proof && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(5,38,89,0.5)", border: "1px solid rgba(84,131,179,0.2)" }}>
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>🛡️ ZK Reputation</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: zkProof.proof.verified ? `${zkProof.proof.verifiedColor}15` : "rgba(255,255,255,0.04)", border: `1px solid ${zkProof.proof.verified ? `${zkProof.proof.verifiedColor}30` : "rgba(255,255,255,0.08)"}` }}>
                  {zkProof.proof.verifiedEmoji || "◌"}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm mb-0.5" style={{ color: zkProof.proof.verified ? zkProof.proof.verifiedColor : "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                    {zkProof.proof.verified ? `${zkProof.proof.verifiedLevel} Freelancer` : "No reputation yet"}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(193,232,255,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>
                    {zkProof.proof.publicStatement}
                  </p>
                  {zkProof.privateData && (
                    <p className="text-xs mt-1" style={{ color: "rgba(193,232,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                      Based on {zkProof.privateData.totalRatings} private rating{zkProof.privateData.totalRatings !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <button onClick={() => navigate("/freelancer/reputation")}
                  className="text-xs px-3 py-1.5 rounded-xl transition-all flex-shrink-0"
                  style={{ background: "rgba(84,131,179,0.15)", color: "#7DA0CA", border: "1px solid rgba(84,131,179,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>
                  View Details →
                </button>
              </div>
            </div>
          )}

          {/* Verified skill badges */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(5,38,89,0.5)", border: "1px solid rgba(84,131,179,0.2)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>🎓 Verified Skills</h2>
              <button onClick={() => navigate("/freelancer/skill-verify")}
                className="text-xs px-3 py-1.5 rounded-xl transition-all"
                style={{ background: "linear-gradient(135deg, #052659, #5483B3)", color: "#C1E8FF", fontFamily: "Space Grotesk, sans-serif" }}>
                + Verify More
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-2" style={{ color: "rgba(193,232,255,0.3)" }}>
                <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin"/>
                <span className="text-xs" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Loading badges...</span>
              </div>
            )}

            {!loading && verifiedSkills.length === 0 && (
              <div className="text-center py-8 rounded-xl" style={{ background: "rgba(2,16,36,0.4)", border: "1px dashed rgba(84,131,179,0.2)" }}>
                <div className="text-3xl mb-2">🎓</div>
                <p className="text-sm mb-3" style={{ color: "rgba(193,232,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>
                  No verified skills yet
                </p>
                <button onClick={() => navigate("/freelancer/skill-verify")}
                  className="text-xs px-4 py-2 rounded-xl"
                  style={{ background: "rgba(84,131,179,0.15)", color: "#7DA0CA", border: "1px solid rgba(84,131,179,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>
                  Get Verified Now
                </button>
              </div>
            )}

            {!loading && verifiedSkills.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {verifiedSkills.map(s => (
                  <div key={s.skill} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                    style={{ background: `${s.badgeColor || "#6ee7b7"}10`, border: `1px solid ${s.badgeColor || "#6ee7b7"}30` }}>
                    <span className="text-xl">{s.badgeEmoji || "✓"}</span>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: s.badgeColor || "#6ee7b7", fontFamily: "Space Grotesk, sans-serif" }}>
                        {s.skill}
                      </div>
                      <div className="text-xs" style={{ color: `${s.badgeColor || "#6ee7b7"}70`, fontFamily: "Space Grotesk, sans-serif" }}>
                        {s.badgeLevel || "Verified"} · {new Date(s.verifiedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit profile form */}
          <form onSubmit={handleSave} className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: "rgba(5,38,89,0.5)", border: "1px solid rgba(84,131,179,0.2)" }}>
            <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>✏️ Edit Profile</h2>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: "rgba(193,232,255,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>Full Name</label>
              <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Your name"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(2,16,36,0.6)", border: "1px solid rgba(84,131,179,0.2)", color: "#C1E8FF" }}
                onFocus={e => e.target.style.border = "1px solid rgba(84,131,179,0.5)"}
                onBlur={e => e.target.style.border = "1px solid rgba(84,131,179,0.2)"}/>
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: "rgba(193,232,255,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>Bio</label>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                placeholder="Tell clients about your experience and expertise..."
                rows={4} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ background: "rgba(2,16,36,0.6)", border: "1px solid rgba(84,131,179,0.2)", color: "#C1E8FF", lineHeight: "1.7" }}
                onFocus={e => e.target.style.border = "1px solid rgba(84,131,179,0.5)"}
                onBlur={e => e.target.style.border = "1px solid rgba(84,131,179,0.2)"}/>
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: "rgba(193,232,255,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>Skills</label>
              <input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})}
                placeholder="React, Solidity, Node.js, Python"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(2,16,36,0.6)", border: "1px solid rgba(84,131,179,0.2)", color: "#C1E8FF" }}
                onFocus={e => e.target.style.border = "1px solid rgba(84,131,179,0.5)"}
                onBlur={e => e.target.style.border = "1px solid rgba(84,131,179,0.2)"}/>
              <p className="text-xs mt-1" style={{ color: "rgba(84,131,179,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>Separate with commas</p>
            </div>

            {saved && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#6ee7b7" }}>
                ✅ Profile saved!
              </div>
            )}

            <button type="submit" className="py-3 rounded-xl font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, #052659, #5483B3)", color: "#C1E8FF", fontFamily: "Space Grotesk, sans-serif" }}>
              Save Profile
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default FreelancerProfile;
