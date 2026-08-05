import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const RoleGate = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Fetch live platform stats
    axios.get(`${import.meta.env.VITE_API_URL}/platform/stats`)
      .then(({ data }) => setStats(data))
      .catch(() => {});

    // Particle animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
      color: Math.random() > 0.5
        ? `rgba(133,79,108,${Math.random() * 0.6 + 0.2})`
        : `rgba(84,131,179,${Math.random() * 0.6 + 0.2})`,
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(135deg, #190019 0%, #0d0d1a 40%, #021024 100%)" }}>

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.7 }} />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(82,43,91,0.25) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(5,38,89,0.35) 0%, transparent 70%)", filter: "blur(40px)" }} />

      <div className="relative z-10 flex flex-col items-center" style={{ animation: "fadeInUp 0.8s ease forwards" }}>

        {/* Logo */}
        <div className="mb-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #522B5B, #854F6C)", boxShadow: "0 0 30px rgba(133,79,108,0.5)" }}>
            <span className="text-xl">⛓</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            <span style={{ color: "#DFB6B2" }}>Free</span>
            <span style={{ color: "#7DA0CA" }}>Lance</span>
            <span style={{ color: "rgba(255,255,255,0.9)" }}>3</span>
          </h1>
        </div>

        <p className="text-sm mb-4 tracking-widest uppercase"
          style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.25em", fontFamily: "Space Grotesk, sans-serif" }}>
          Decentralized · Trustless · On-Chain
        </p>

        {/* Live platform stats */}
        {stats && (
          <div className="flex gap-6 mb-12 px-8 py-4 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { label: "Freelancers", value: stats.totalFreelancers },
              { label: "Jobs Posted", value: stats.totalJobs },
              { label: "Completed", value: stats.completedJobs },
              { label: "ETH Transacted", value: `${stats.ethTransacted}` },
              { label: "Skills Verified", value: stats.verifiedSkills },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-black" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>{s.value}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Grotesk, sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full px-6">

          {/* CLIENT */}
          <button onClick={() => navigate("/client/login")}
            className="group relative overflow-hidden rounded-3xl p-px cursor-pointer"
            style={{ background: "linear-gradient(135deg, rgba(133,79,108,0.6), rgba(82,43,91,0.3), rgba(133,79,108,0.1))" }}>
            <div className="relative rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-[0.98]"
              style={{ background: "linear-gradient(145deg, rgba(43,18,76,0.9) 0%, rgba(25,0,25,0.95) 100%)", backdropFilter: "blur(20px)" }}>
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(133,79,108,0.2) 0%, transparent 70%)" }} />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl"
                  style={{ background: "linear-gradient(135deg, rgba(133,79,108,0.3), rgba(82,43,91,0.3))", border: "1px solid rgba(133,79,108,0.4)", boxShadow: "0 0 20px rgba(133,79,108,0.2)" }}>🏢</div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>Client</h2>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(251,228,216,0.55)" }}>
                  Post jobs, hire verified talent, and release payments via smart contract escrow.
                </p>
                <div className="flex flex-col gap-2 mb-8">
                  {["Post & manage jobs", "Hire verified freelancers", "Milestone-based payments", "View Top Freelancers ranking"].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(223,182,178,0.7)" }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#854F6C" }} />{f}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(133,79,108,0.8)", fontFamily: "Space Grotesk, sans-serif" }}>Client Portal</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform"
                    style={{ background: "rgba(133,79,108,0.3)", border: "1px solid rgba(133,79,108,0.5)" }}>
                    <span style={{ color: "#DFB6B2" }}>→</span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* FREELANCER */}
          <button onClick={() => navigate("/freelancer/login")}
            className="group relative overflow-hidden rounded-3xl p-px cursor-pointer"
            style={{ background: "linear-gradient(135deg, rgba(84,131,179,0.6), rgba(5,38,89,0.3), rgba(84,131,179,0.1))" }}>
            <div className="relative rounded-3xl p-8 h-full transition-all duration-500 group-hover:scale-[0.98]"
              style={{ background: "linear-gradient(145deg, rgba(5,38,89,0.9) 0%, rgba(2,16,36,0.95) 100%)", backdropFilter: "blur(20px)" }}>
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(84,131,179,0.2) 0%, transparent 70%)" }} />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl"
                  style={{ background: "linear-gradient(135deg, rgba(84,131,179,0.3), rgba(5,38,89,0.3))", border: "1px solid rgba(84,131,179,0.4)", boxShadow: "0 0 20px rgba(84,131,179,0.2)" }}>💻</div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>Freelancer</h2>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(193,232,255,0.55)" }}>
                  Find projects, bid on work, deliver milestones, and get paid in ETH.
                </p>
                <div className="flex flex-col gap-2 mb-8">
                  {["Browse all open jobs", "AI skill verification badges", "ZK reputation proof", "Smart job recommendations"].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(193,232,255,0.7)" }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#5483B3" }} />{f}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(84,131,179,0.8)", fontFamily: "Space Grotesk, sans-serif" }}>Freelancer Portal</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform"
                    style={{ background: "rgba(84,131,179,0.3)", border: "1px solid rgba(84,131,179,0.5)" }}>
                    <span style={{ color: "#C1E8FF" }}>→</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        <p className="mt-12 text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>
          Powered by Ethereum · Zero Fees · Fully Decentralized
        </p>
      </div>
    </div>
  );
};

export default RoleGate;
