import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import API from "../../utils/api";

const FreelancerReputation = () => {
  const { account } = useWallet();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) navigate("/freelancer/login");
    API.get("/zk/my-proof")
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #021024 0%, #052659 100%)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8 overflow-auto">

        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2"
            style={{ color: "rgba(84,131,179,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>
            Zero Knowledge Proof
          </p>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>
            My Reputation
          </h1>
          <p className="text-sm" style={{ color: "rgba(193,232,255,0.4)" }}>
            Your actual score is private. Only a ZK proof of your level is shown to clients.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "rgba(193,232,255,0.4)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
            <span className="text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Loading your proof...</span>
          </div>
        )}

        {!loading && (
          <div className="max-w-2xl flex flex-col gap-6">

            {/* Current ZK Level */}
            <div className="rounded-2xl p-7"
              style={{ background: "rgba(5,38,89,0.5)", border: "1px solid rgba(84,131,179,0.2)" }}>
              <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>
                🛡️ Your ZK Proof (What Clients See)
              </h2>

              {data?.proof ? (
                <div className="flex flex-col gap-4">
                  {/* Main status */}
                  <div className="rounded-2xl p-6 text-center"
                    style={{
                      background: data.proof.verified ? `${data.proof.verifiedColor}10` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${data.proof.verified ? `${data.proof.verifiedColor}30` : "rgba(255,255,255,0.08)"}`,
                    }}>
                    <div className="text-5xl mb-3">{data.proof.verifiedEmoji || "◌"}</div>
                    <h3 className="text-2xl font-black mb-1"
                      style={{ fontFamily: "Syne, sans-serif", color: data.proof.verified ? data.proof.verifiedColor : "rgba(255,255,255,0.3)" }}>
                      {data.proof.verified ? `${data.proof.verifiedLevel} Freelancer` : "No Level Yet"}
                    </h3>
                    <p className="text-sm" style={{ color: "rgba(193,232,255,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>
                      {data.proof.publicStatement}
                    </p>
                  </div>

                  {/* Proof hash */}
                  <div className="p-4 rounded-xl" style={{ background: "rgba(2,16,36,0.5)", border: "1px solid rgba(84,131,179,0.12)" }}>
                    <p className="text-xs mb-2" style={{ color: "rgba(193,232,255,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>
                      Proof Hash (public on-chain)
                    </p>
                    <p className="text-xs font-mono break-all" style={{ color: "rgba(193,232,255,0.3)" }}>
                      {data.proof.proofHash}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">🔮</div>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>
                    No Proof Yet
                  </h3>
                  <p className="text-sm" style={{ color: "rgba(193,232,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>
                    Complete jobs and get rated by clients to generate your ZK proof.
                  </p>
                </div>
              )}
            </div>

            {/* Threshold progress — private */}
            {data?.privateData && (
              <div className="rounded-2xl p-7"
                style={{ background: "rgba(5,38,89,0.5)", border: "1px solid rgba(84,131,179,0.2)" }}>
                <div className="flex items-center gap-2 mb-5">
                  <span>🔒</span>
                  <h2 className="text-lg font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>
                    Private Data (Only You)
                  </h2>
                </div>

                {/* Score + count */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl p-5 text-center"
                    style={{ background: "rgba(2,16,36,0.5)", border: "1px solid rgba(84,131,179,0.12)" }}>
                    <div className="text-3xl font-black mb-1"
                      style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>
                      {data.privateData.averageScore > 0 ? `${data.privateData.averageScore}` : "—"}
                    </div>
                    <div className="text-xs mb-1" style={{ color: "rgba(193,232,255,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>
                      Weighted Avg Score
                    </div>
                    <div className="flex justify-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= Math.round(data.privateData.averageScore) ? "#fbbf24" : "rgba(255,255,255,0.1)", fontSize: "12px" }}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl p-5 text-center"
                    style={{ background: "rgba(2,16,36,0.5)", border: "1px solid rgba(84,131,179,0.12)" }}>
                    <div className="text-3xl font-black mb-1"
                      style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>
                      {data.privateData.totalRatings}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(193,232,255,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>
                      Total Ratings
                    </div>
                  </div>
                </div>

                {/* Threshold levels */}
                <div>
                  <p className="text-xs font-semibold mb-3 tracking-widest uppercase"
                    style={{ color: "rgba(84,131,179,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>
                    Reputation Levels
                  </p>
                  <div className="flex flex-col gap-3">
                    {data.privateData.thresholds?.map(t => (
                      <div key={t.level} className="flex items-center gap-4 p-4 rounded-xl"
                        style={{
                          background: t.met ? `${t.color}08` : "rgba(2,16,36,0.4)",
                          border: `1px solid ${t.met ? `${t.color}30` : "rgba(84,131,179,0.1)"}`,
                        }}>
                        <span className="text-2xl">{t.met ? t.emoji : "◌"}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-bold" style={{ color: t.met ? t.color : "rgba(255,255,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                              {t.level}
                            </span>
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>
                              ≥ {t.min} ★
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>
                            {t.desc}
                          </p>
                          {/* Progress toward this threshold */}
                          <div className="mt-2 w-full rounded-full h-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-1 rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.min((data.privateData.averageScore / t.min) * 100, 100)}%`,
                                background: t.met ? t.color : "rgba(255,255,255,0.15)",
                              }}/>
                          </div>
                        </div>
                        {t.met && (
                          <span className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                            style={{ background: `${t.color}20`, color: t.color, fontFamily: "Space Grotesk, sans-serif", border: `1px solid ${t.color}40` }}>
                            ✓ Met
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs mt-4 text-center" style={{ color: "rgba(193,232,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>
                  🔒 This data is never shared with clients. They only see your ZK proof level above.
                </p>
              </div>
            )}

            {/* How it works */}
            <div className="rounded-2xl p-7"
              style={{ background: "rgba(5,38,89,0.5)", border: "1px solid rgba(84,131,179,0.15)" }}>
              <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>
                How ZK Reputation Works
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  { step: "01", title: "Client rates privately", desc: "1-5 stars after job completion. Stored securely — never shown to other clients." },
                  { step: "02", title: "Weighted score computed", desc: "Recent ratings carry more weight. Your evolving score stays completely private." },
                  { step: "03", title: "ZK proof generated", desc: "SHA-256 hash proves your score meets Rising/Trusted/Expert threshold without revealing the number." },
                  { step: "04", title: "Only level is public", desc: "Clients see ⭐ Expert, 🛡️ Trusted, or 📈 Rising — never your actual score or rating count." },
                ].map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: "rgba(84,131,179,0.2)", color: "#7DA0CA", fontFamily: "Space Grotesk, sans-serif" }}>
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: "#C1E8FF", fontFamily: "Space Grotesk, sans-serif" }}>{item.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: "rgba(193,232,255,0.35)", fontFamily: "Space Grotesk, sans-serif" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FreelancerReputation;
