import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";

const FreelancerLogin = () => {
  const { connectWallet, loading, account, user } = useWallet();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (account && user?.role === "freelancer") navigate("/freelancer/dashboard");
    if (account && user?.role === "client") setError("This wallet is registered as a Client. Please switch wallet.");
  }, [account, user]);

  const handleConnect = async () => {
    setError("");
    const result = await connectWallet("freelancer");
    if (result?.success) navigate("/freelancer/dashboard");
    else if (result?.wrongPortal) setError(`This wallet is a ${result.correctRole}. Please switch to your freelancer wallet.`);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #021024 0%, #052659 60%, #021024 100%)" }}>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(5,38,89,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(84,131,179,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>

      <div className="relative z-10 flex items-center justify-between px-8 py-5"
        style={{ borderBottom: "1px solid rgba(84,131,179,0.15)" }}>
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm transition-all duration-200"
          style={{ color: "rgba(193,232,255,0.5)" }}
          onMouseEnter={e => e.currentTarget.style.color = "#C1E8FF"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(193,232,255,0.5)"}>
          ← Back
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: "linear-gradient(135deg, #052659, #5483B3)", boxShadow: "0 0 15px rgba(84,131,179,0.4)" }}>⛓</div>
          <span className="text-lg font-black" style={{ fontFamily: "Syne, sans-serif" }}>
            <span style={{ color: "#C1E8FF" }}>Free</span><span style={{ color: "rgba(255,255,255,0.5)" }}>Lance3</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full ml-1"
            style={{ background: "rgba(84,131,179,0.2)", border: "1px solid rgba(84,131,179,0.3)", color: "#C1E8FF", fontFamily: "Space Grotesk, sans-serif" }}>
            Freelancer
          </span>
        </div>
        <div className="w-16" />
      </div>

      <div className="relative z-10 flex flex-1">
        <div className="flex-1 flex flex-col justify-center px-16 py-12" style={{ animation: "fadeInUp 0.7s ease forwards" }}>
          <div className="text-5xl mb-6" style={{ animation: "float 4s ease-in-out infinite" }}>💻</div>
          <h1 className="text-5xl font-black mb-4 leading-none" style={{ fontFamily: "Syne, sans-serif" }}>
            <span style={{ color: "rgba(255,255,255,0.9)" }}>Welcome,</span><br/>
            <span style={{ color: "#C1E8FF" }}>Freelancer.</span>
          </h1>
          <p className="text-base mb-10 max-w-sm leading-relaxed" style={{ color: "rgba(193,232,255,0.55)" }}>
            Find great projects, deliver quality work, and get paid directly to your wallet in ETH.
          </p>
          <div className="flex flex-col gap-3 mb-10">
            {["Browse all open jobs", "Submit milestone deliverables", "Get paid in ETH directly", "Build on-chain reputation"].map((f, i) => (
              <div key={f} className="flex items-center gap-3" style={{ animation: `fadeInUp 0.6s ease ${i * 0.1}s both` }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #052659, #5483B3)" }}>
                  <span style={{ fontSize: "9px", color: "#C1E8FF" }}>✓</span>
                </div>
                <span className="text-sm" style={{ color: "rgba(193,232,255,0.65)", fontFamily: "Space Grotesk, sans-serif" }}>{f}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4 max-w-sm" style={{ background: "rgba(84,131,179,0.08)", border: "1px solid rgba(84,131,179,0.2)" }}>
            <p className="text-xs mb-2 font-semibold" style={{ color: "#C1E8FF", fontFamily: "Space Grotesk, sans-serif" }}>🦊 Using multiple wallets?</p>
            <ol className="flex flex-col gap-1.5">
              {["Open MetaMask extension", "Click account name at top", "Switch to your Freelancer wallet", "Click Connect below"].map((s, i) => (
                <li key={i} className="text-xs flex gap-2" style={{ color: "rgba(193,232,255,0.5)" }}>
                  <span style={{ color: "#5483B3", fontWeight: 700 }}>{i+1}.</span> {s}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="w-[420px] flex items-center justify-center p-8">
          <div className="w-full rounded-3xl p-px" style={{ background: "linear-gradient(135deg, rgba(84,131,179,0.5), rgba(5,38,89,0.2), rgba(84,131,179,0.1))" }}>
            <div className="rounded-3xl p-8" style={{ background: "linear-gradient(145deg, rgba(5,38,89,0.95), rgba(2,16,36,0.98))", backdropFilter: "blur(20px)" }}>

              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "linear-gradient(135deg, rgba(84,131,179,0.3), rgba(5,38,89,0.3))", border: "1px solid rgba(84,131,179,0.3)" }}>
                <span className="text-xl">💻</span>
              </div>

              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>Freelancer Access</h2>
              <p className="text-sm mb-8" style={{ color: "rgba(193,232,255,0.45)", fontFamily: "Space Grotesk, sans-serif" }}>
                Connect your freelancer wallet to continue
              </p>

              {error && (
                <div className="mb-6 px-4 py-3 rounded-2xl text-sm" style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff9999" }}>
                  ⚠ {error}
                </div>
              )}

              <button onClick={handleConnect} disabled={loading}
                className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #052659, #5483B3)", color: "#C1E8FF", boxShadow: "0 0 30px rgba(84,131,179,0.3)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 50px rgba(84,131,179,0.5)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 30px rgba(84,131,179,0.3)"}>
                {loading ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /><span>Connecting...</span></>
                ) : (
                  <><span>🦊</span><span style={{ fontFamily: "Space Grotesk, sans-serif" }}>Connect Freelancer Wallet</span></>
                )}
              </button>

              <p className="text-center mt-4 text-xs" style={{ color: "rgba(84,131,179,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>
                Requires MetaMask · Sepolia testnet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerLogin;
