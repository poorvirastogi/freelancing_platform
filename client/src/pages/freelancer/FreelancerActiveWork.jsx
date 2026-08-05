import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import SubmitWork from "../../components/SubmitWork";
import API from "../../utils/api";

const FreelancerActiveWork = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/freelancer/login"); fetchBids(); }, []);

  const fetchBids = async () => {
    try {
      const { data } = await API.get("/jobs/my/bids");
      setBids(data.filter(b => b.job?.status === 'in_progress' || b.job?.status === 'completed'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #021024 0%, #052659 100%)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(84,131,179,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>Freelancer Portal</p>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>Active Work</h1>
          <p className="text-sm" style={{ color: "rgba(193,232,255,0.4)" }}>Submit work and track your payment progress</p>
        </div>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "rgba(193,232,255,0.4)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
            <span className="text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Loading...</span>
          </div>
        )}

        {!loading && bids.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔨</div>
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>No active work</h3>
            <p className="text-sm mb-6" style={{ color: "rgba(193,232,255,0.4)" }}>Win a bid to see your active work here</p>
            <button onClick={() => navigate("/freelancer/jobs")}
              className="px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, #052659, #5483B3)", color: "#C1E8FF" }}>
              Browse Jobs
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {bids.map(bid => (
            <div key={bid._id} className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(5,38,89,0.5)", border: "1px solid rgba(84,131,179,0.2)" }}>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>{bid.job?.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: bid.job?.status === 'completed' ? "rgba(84,131,179,0.3)" : "rgba(84,131,179,0.15)", color: "#C1E8FF", border: "1px solid rgba(84,131,179,0.3)" }}>
                      {bid.job?.status === 'completed' ? '🏆 Completed' : '⚡ In Progress'}
                    </span>
                  </div>
                  <button onClick={() => navigate(`/freelancer/job/${bid.job?._id}`)}
                    className="text-xs px-4 py-2 rounded-xl transition-all"
                    style={{ background: "rgba(84,131,179,0.15)", color: "#C1E8FF", border: "1px solid rgba(84,131,179,0.25)" }}>
                    Full Details →
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: "rgba(193,232,255,0.5)" }}>Payment Received</span>
                    <span className="font-bold" style={{ color: "#C1E8FF" }}>{bid.job?.paymentProgress || 0}%</span>
                  </div>
                  <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "rgba(84,131,179,0.15)" }}>
                    <div className="h-3 rounded-full transition-all duration-700"
                      style={{ width: `${bid.job?.paymentProgress || 0}%`, background: "linear-gradient(90deg, #052659, #7DA0CA)" }}/>
                  </div>
                </div>

                {/* Milestones */}
                {bid.job?.milestones?.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {bid.job.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{ background: "rgba(2,16,36,0.5)", border: "1px solid rgba(84,131,179,0.12)" }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: "#C1E8FF" }}>{m.title}</span>
                          <span className="text-xs ml-2" style={{ color: "rgba(193,232,255,0.4)" }}>
                            {m.percentage}% = {(bid.job.budget * m.percentage / 100).toFixed(4)} ETH
                          </span>
                        </div>
                        {m.released
                          ? <span className="text-xs font-semibold" style={{ color: "#6ee7b7" }}>✅ Paid to you</span>
                          : <span className="text-xs" style={{ color: "#fbbf24" }}>⏳ Pending</span>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 text-sm" style={{ color: "rgba(193,232,255,0.4)" }}>
                  <span>💰 Your bid: {bid.amount} ETH</span>
                  <span>📅 {bid.deliveryDays} days delivery</span>
                </div>

                {/* Submit work toggle */}
                {bid.job?.status === 'in_progress' && (
                  <button
                    onClick={() => setExpandedJob(expandedJob === bid._id ? null : bid._id)}
                    className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "rgba(84,131,179,0.15)", border: "1px solid rgba(84,131,179,0.3)", color: "#C1E8FF" }}>
                    {expandedJob === bid._id ? "▲ Hide Submit Form" : "📤 Submit Work"}
                  </button>
                )}
              </div>

              {/* Submit work panel */}
              {expandedJob === bid._id && bid.job?.status === 'in_progress' && (
                <div className="px-6 pb-6">
                  <SubmitWork
                    jobId={bid.job?._id}
                    milestones={bid.job?.milestones}
                    onSubmitted={() => { setExpandedJob(null); fetchBids(); }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FreelancerActiveWork;
