import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { ethers } from "ethers";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";
import EscrowABI from "../../utils/EscrowABI";
import SubmissionsList from "../../components/SubmissionsList";

const ClientActiveJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escrowLoading, setEscrowLoading] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/client/login"); fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/jobs/my/posted");
      setJobs(data.filter(j => j.status === 'in_progress' || j.status === 'completed'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAcceptWork = async (submissionId, milestoneIdx, job) => {
    if (!confirm("Accept this work and release milestone payment?")) return;
    setEscrowLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(job.escrowAddress, EscrowABI, signer);
      const milestone = job.milestones[milestoneIdx];
      if (!milestone) { alert("Milestone not found"); return; }
      const status = await contract.getStatus();
      if (status[5]) { alert("Escrow was refunded."); return; }
      if (!status[3]) { alert("Please deposit funds first."); return; }
      const tx = await contract.releaseMilestone(milestone.percentage);
      await tx.wait();
      await API.post(`/jobs/${job._id}/milestone`, { milestoneIndex: milestoneIdx });
      fetchJobs();
      alert(`✅ Milestone ${milestoneIdx + 1} released! (${milestone.percentage}%)`);
    } catch (err) { alert("Failed: " + err.message); }
    finally { setEscrowLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #190019 0%, #2B124C 100%)" }}>
      <ClientSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(133,79,108,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>Client Portal</p>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>Active Jobs</h1>
          <p className="text-sm" style={{ color: "rgba(223,182,178,0.4)" }}>Track progress and release milestone payments</p>
        </div>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "rgba(223,182,178,0.4)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"/>
            <span className="text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Loading...</span>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>No active jobs</h3>
            <p className="text-sm mb-6" style={{ color: "rgba(223,182,178,0.4)" }}>Hire a freelancer to see jobs here</p>
            <button onClick={() => navigate("/client/my-jobs")}
              className="px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ background: "linear-gradient(135deg, #522B5B, #854F6C)", color: "#FBE4D8" }}>
              View Posted Jobs
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {jobs.map(job => (
            <div key={job._id} className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(43,18,76,0.4)", border: "1px solid rgba(133,79,108,0.2)" }}>

              {/* Job header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>{job.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: job.status === 'completed' ? "rgba(133,79,108,0.3)" : "rgba(133,79,108,0.15)", color: "#DFB6B2", border: "1px solid rgba(133,79,108,0.3)" }}>
                      {job.status === 'completed' ? '🏆 Completed' : '⚡ In Progress'}
                    </span>
                  </div>
                  <button onClick={() => navigate(`/client/job/${job._id}`)}
                    className="text-xs px-4 py-2 rounded-xl transition-all"
                    style={{ background: "rgba(133,79,108,0.15)", color: "#DFB6B2", border: "1px solid rgba(133,79,108,0.25)" }}>
                    Full Details →
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: "rgba(223,182,178,0.5)" }}>Payment Released</span>
                    <span className="font-bold" style={{ color: "#DFB6B2" }}>{job.paymentProgress || 0}% of {job.budget} ETH</span>
                  </div>
                  <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "rgba(133,79,108,0.15)" }}>
                    <div className="h-3 rounded-full transition-all duration-700"
                      style={{ width: `${job.paymentProgress || 0}%`, background: "linear-gradient(90deg, #522B5B, #DFB6B2)" }}/>
                  </div>
                </div>

                {/* Milestones */}
                {job.milestones?.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {job.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{ background: "rgba(25,0,25,0.4)", border: "1px solid rgba(133,79,108,0.12)" }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: "#DFB6B2" }}>{m.title}</span>
                          <span className="text-xs ml-2" style={{ color: "rgba(223,182,178,0.4)" }}>
                            {m.percentage}% = {(job.budget * m.percentage / 100).toFixed(4)} ETH
                          </span>
                        </div>
                        {m.released
                          ? <span className="text-xs font-semibold" style={{ color: "#6ee7b7" }}>✅ Released</span>
                          : <span className="text-xs" style={{ color: "#fbbf24" }}>⏳ Awaiting submission</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Toggle submissions */}
                <button
                  onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "rgba(133,79,108,0.12)", border: "1px solid rgba(133,79,108,0.2)", color: "#DFB6B2" }}>
                  {expandedJob === job._id ? "▲ Hide Submissions" : "▼ View & Accept Submissions"}
                </button>
              </div>

              {/* Submissions panel */}
              {expandedJob === job._id && (
                <div className="px-6 pb-6">
                  <SubmissionsList
                    jobId={job._id}
                    escrowAddress={job.escrowAddress}
                    milestones={job.milestones}
                    onApprove={(subId, milestoneIdx) => handleAcceptWork(subId, milestoneIdx, job)}
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

export default ClientActiveJobs;
