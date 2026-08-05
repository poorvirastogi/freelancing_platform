import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { ethers } from "ethers";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";
import EscrowABI from "../../utils/EscrowABI";
import SubmissionsList from "../../components/SubmissionsList";
import RateFreelancer from "../../components/RateFreelancer";
import ZKReputationBadge from "../../components/ZKReputationBadge";
import TrustScore from "../../components/TrustScore";

const ClientJobDetail = () => {
  const { id } = useParams();
  const { account, user } = useWallet();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escrowLoading, setEscrowLoading] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState(null);
  const [txHash, setTxHash] = useState("");

  useEffect(() => { if (!account) navigate("/client/login"); fetchJob(); }, []);

  const fetchJob = async () => {
    try {
      const { data } = await API.get(`/jobs/${id}`);
      setJob(data.job); setBids(data.bids);
      if (data.job.escrowAddress) await fetchEscrowStatus(data.job.escrowAddress);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchEscrowStatus = async (addr) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(addr, EscrowABI, provider);
      const s = await contract.getStatus();
      setEscrowStatus({ client:s[0], freelancer:s[1], amount:ethers.formatEther(s[2]), isFunded:s[3], isCompleted:s[4], isRefunded:s[5] });
    } catch (err) { console.error(err); }
  };

  const handleHire = async (bid) => {
    setEscrowLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const artifact = await fetch("/Escrow.json").then(r=>r.json()).catch(()=>null);
      if (!artifact) { alert("Escrow.json not found"); return; }
      const factory = new ethers.ContractFactory(EscrowABI, artifact.bytecode, signer);
      const escrow = await factory.deploy(bid.freelancer.walletAddress, id);
      await escrow.waitForDeployment();
      const escrowAddress = await escrow.getAddress();
      await API.post(`/jobs/${id}/hire`, { freelancerId:bid.freelancer._id, escrowAddress });
      setTxHash(escrow.deploymentTransaction()?.hash||"");
      fetchJob();
    } catch (err) { alert("Failed: "+err.message); } finally { setEscrowLoading(false); }
  };

  const handleDeposit = async () => {
    setEscrowLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(job.escrowAddress, EscrowABI, signer);
      const tx = await contract.deposit({ value: ethers.parseEther(job.budget.toString()) });
      await tx.wait(); setTxHash(tx.hash);
      alert("✅ Funds deposited!"); fetchEscrowStatus(job.escrowAddress);
    } catch (err) { alert("Failed: "+err.message); } finally { setEscrowLoading(false); }
  };

  const handleAcceptWork = async (submissionId, milestoneIdx) => {
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
      if (!status[3]) { alert("Please deposit funds into escrow first."); return; }
      const tx = await contract.releaseMilestone(milestone.percentage);
      await tx.wait();
      setTxHash(tx.hash);
      await API.post(`/jobs/${id}/milestone`, { milestoneIndex: milestoneIdx });
      fetchJob();
      alert(`✅ Milestone ${milestoneIdx + 1} payment released! (${milestone.percentage}% = ${(job.budget * milestone.percentage / 100).toFixed(4)} ETH)`);
    } catch (err) {
      console.error(err);
      alert("Failed: " + err.message);
    } finally { setEscrowLoading(false); }
  };

  const handleRefund = async () => {
    setEscrowLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(job.escrowAddress, EscrowABI, signer);
      const tx = await contract.refund();
      await tx.wait(); setTxHash(tx.hash);
      alert("✅ Refunded!"); fetchEscrowStatus(job.escrowAddress);
    } catch (err) { alert("Failed: "+err.message); } finally { setEscrowLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #190019 0%, #2B124C 100%)" }}>
      <div className="flex items-center gap-3" style={{ color: "rgba(223,182,178,0.4)" }}>
        <span className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin"/>
        <span style={{ fontFamily: "Space Grotesk, sans-serif" }}>Loading...</span>
      </div>
    </div>
  );

  const progressPct = job?.paymentProgress || 0;

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #190019 0%, #2B124C 100%)" }}>
      <ClientSidebar />
      <div className="flex-1 p-8 overflow-auto">
        <button onClick={() => navigate("/client/my-jobs")}
          className="flex items-center gap-2 text-sm mb-6 transition-all"
          style={{ color: "rgba(223,182,178,0.5)" }}
          onMouseEnter={e => e.currentTarget.style.color = "#DFB6B2"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(223,182,178,0.5)"}>
          ← Back to My Jobs
        </button>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Job Info */}
            <div className="rounded-2xl p-6"
              style={{ background: "rgba(43,18,76,0.5)", border: "1px solid rgba(133,79,108,0.2)" }}>
              <div className="flex justify-between mb-4">
                <span className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    background: job.status==='open' ? "rgba(16,185,129,0.1)" : job.status==='in_progress' ? "rgba(133,79,108,0.2)" : job.status==='completed' ? "rgba(133,79,108,0.3)" : "rgba(255,255,255,0.05)",
                    color: job.status==='open' ? "#6ee7b7" : job.status==='in_progress' ? "#DFB6B2" : job.status==='completed' ? "#FBE4D8" : "#888",
                    borderColor: job.status==='open' ? "rgba(16,185,129,0.25)" : "rgba(133,79,108,0.3)",
                  }}>
                  {job.status==='completed' ? '🏆 Completed' : job.status}
                </span>
                <span className="text-sm" style={{ color: "rgba(223,182,178,0.4)" }}>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: "#FBE4D8" }}>{job.title}</h1>
              <p className="leading-relaxed mb-6 text-sm" style={{ color: "rgba(223,182,178,0.6)" }}>{job.description}</p>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => (
                  <span key={skill} className="text-xs px-3 py-1 rounded-lg"
                    style={{ background: "rgba(133,79,108,0.15)", color: "#DFB6B2", border: "1px solid rgba(133,79,108,0.25)" }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Payment Progress */}
            {job.status !== 'open' && job.milestones?.length > 0 && (
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(43,18,76,0.5)", border: "1px solid rgba(133,79,108,0.2)" }}>
                <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>📊 Payment Progress</h2>
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: "rgba(223,182,178,0.5)" }}>Overall Released</span>
                    <span className="font-bold" style={{ color: "#DFB6B2" }}>{progressPct}%</span>
                  </div>
                  <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "rgba(133,79,108,0.15)" }}>
                    <div className="h-3 rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #522B5B, #DFB6B2)" }}/>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {job.milestones.map((m, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: "rgba(25,0,25,0.4)", border: "1px solid rgba(133,79,108,0.12)" }}>
                      <div>
                        <span className="text-sm font-medium" style={{ color: "#DFB6B2" }}>{m.title}</span>
                        <span className="text-xs ml-2" style={{ color: "rgba(223,182,178,0.4)" }}>
                          ({m.percentage}% = {(job.budget * m.percentage / 100).toFixed(4)} ETH)
                        </span>
                      </div>
                      {m.released
                        ? <span className="text-xs font-semibold" style={{ color: "#6ee7b7" }}>✅ Paid</span>
                        : <span className="text-xs" style={{ color: "#fbbf24" }}>⏳ Pending</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Escrow Contract */}
            {job.escrowAddress && (
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(43,18,76,0.5)", border: "1px solid rgba(133,79,108,0.35)" }}>
                <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>⛓️ Escrow Contract</h2>
                <div className="text-xs font-mono mb-4 break-all" style={{ color: "rgba(223,182,178,0.35)" }}>{job.escrowAddress}</div>
                {escrowStatus && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl p-3" style={{ background: "rgba(25,0,25,0.5)" }}>
                      <div className="text-xs mb-1" style={{ color: "rgba(223,182,178,0.4)" }}>Status</div>
                      <div className="font-semibold text-sm" style={{ color: escrowStatus.isCompleted ? "#6ee7b7" : escrowStatus.isRefunded ? "#ff9999" : escrowStatus.isFunded ? "#DFB6B2" : "#fbbf24" }}>
                        {escrowStatus.isCompleted ? '✅ Completed' : escrowStatus.isRefunded ? '↩️ Refunded' : escrowStatus.isFunded ? '🔒 Funded' : '⏳ Awaiting Deposit'}
                      </div>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: "rgba(25,0,25,0.5)" }}>
                      <div className="text-xs mb-1" style={{ color: "rgba(223,182,178,0.4)" }}>Locked Amount</div>
                      <div className="font-bold" style={{ color: "#DFB6B2" }}>{escrowStatus.amount} ETH</div>
                    </div>
                  </div>
                )}
                {escrowStatus && !escrowStatus.isCompleted && !escrowStatus.isRefunded && (
                  <div className="flex gap-3">
                    {!escrowStatus.isFunded && (
                      <button onClick={handleDeposit} disabled={escrowLoading}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #522B5B, #854F6C)", color: "#FBE4D8" }}>
                        {escrowLoading ? "Processing..." : "💰 Deposit Funds"}
                      </button>
                    )}
                    {escrowStatus.isFunded && (
                      <button onClick={handleRefund} disabled={escrowLoading}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                        style={{ background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff9999" }}>
                        {escrowLoading ? "Processing..." : "↩️ Refund"}
                      </button>
                    )}
                  </div>
                )}
                {txHash && (
                  <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs mt-3 block hover:underline" style={{ color: "rgba(133,79,108,0.7)" }}>
                    View on Etherscan ↗
                  </a>
                )}
              </div>
            )}

            {/* Work Submissions */}
            <SubmissionsList jobId={id} escrowAddress={job.escrowAddress} milestones={job.milestones} onApprove={handleAcceptWork} />

            {/* ── Rate Freelancer (shown only when job is completed) ── */}
            {job.status === 'completed' && job.hiredFreelancer && (
              <RateFreelancer
                jobId={id}
                freelancerId={job.hiredFreelancer?._id || job.hiredFreelancer}
                onRated={fetchJob}
              />
            )}

            {/* Bids */}
            <div className="rounded-2xl p-6"
              style={{ background: "rgba(43,18,76,0.5)", border: "1px solid rgba(133,79,108,0.2)" }}>
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>
                Bids ({bids.length})
              </h2>
              {bids.length === 0
                ? <p className="text-sm" style={{ color: "rgba(223,182,178,0.35)" }}>No bids yet</p>
                : (
                  <div className="flex flex-col gap-4">
                    {bids.map(bid => (
                      <div key={bid._id} className="rounded-xl p-4"
                        style={{ background: "rgba(25,0,25,0.4)", border: "1px solid rgba(133,79,108,0.15)" }}>
                        <div className="flex justify-between mb-2">
                          <span className="font-bold" style={{ color: "#DFB6B2" }}>{bid.amount} ETH</span>
                          <span className="text-sm" style={{ color: "rgba(223,182,178,0.5)" }}>{bid.deliveryDays} days</span>
                        </div>
                        <p className="text-sm mb-3" style={{ color: "rgba(223,182,178,0.6)" }}>{bid.proposal}</p>

                        {/* ── ZK Reputation Badge for each bidder ── */}
                        <div className="mb-3">
                          <ZKReputationBadge freelancerId={bid.freelancer?._id} size="small" />
                        <div className="mt-2"><TrustScore freelancerId={bid.freelancer?._id} /></div>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-xs font-mono" style={{ color: "rgba(133,79,108,0.6)" }}>
                            {bid.freelancer?.walletAddress?.slice(0, 10)}...
                          </p>
                          {job.status === 'open' && (
                            <button onClick={() => handleHire(bid)} disabled={escrowLoading}
                              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                              style={{ background: "linear-gradient(135deg, #522B5B, #854F6C)", color: "#FBE4D8" }}>
                              {escrowLoading ? "Deploying..." : "🤝 Hire"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl p-6"
              style={{ background: "rgba(43,18,76,0.5)", border: "1px solid rgba(133,79,108,0.2)" }}>
              <div className="text-3xl font-black mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>
                {job.budget} ETH
              </div>
              <div className="text-sm mb-5" style={{ color: "rgba(223,182,178,0.4)" }}>Budget</div>
              <div className="text-sm mb-2" style={{ color: "rgba(223,182,178,0.6)" }}>
                <span style={{ color: "rgba(133,79,108,0.8)" }}>Deadline: </span>
                {new Date(job.deadline).toLocaleDateString()}
              </div>
              {job.status === 'completed' && (
                <div className="mt-4 rounded-xl p-3 text-center"
                  style={{ background: "rgba(133,79,108,0.15)", border: "1px solid rgba(133,79,108,0.3)" }}>
                  <div className="font-bold" style={{ color: "#DFB6B2" }}>🏆 Job Completed!</div>
                  <div className="text-xs mt-1" style={{ color: "rgba(223,182,178,0.45)" }}>All payments released</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientJobDetail;
