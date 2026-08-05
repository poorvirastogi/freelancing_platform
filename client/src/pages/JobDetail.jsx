import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import API from "../utils/api";
import EscrowABI from "../utils/EscrowABI";
import SubmitWork from "../components/SubmitWork";
import SubmissionsList from "../components/SubmissionsList";

const JobDetail = () => {
  const { id } = useParams();
  const { account, user } = useWallet();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ amount: "", proposal: "", deliveryDays: "" });
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);
  const [escrowLoading, setEscrowLoading] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState(null);
  const [txHash, setTxHash] = useState("");

  useEffect(() => { if (!account) navigate("/"); fetchJob(); }, []);

  const fetchJob = async () => {
    try {
      const { data } = await API.get(`/jobs/${id}`);
      setJob(data.job);
      setBids(data.bids);
      if (data.job.escrowAddress) await fetchEscrowStatus(data.job.escrowAddress);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchEscrowStatus = async (addr) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(addr, EscrowABI, provider);
      const status = await contract.getStatus();
      setEscrowStatus({
        client: status[0], freelancer: status[1],
        amount: ethers.formatEther(status[2]),
        isFunded: status[3], isCompleted: status[4], isRefunded: status[5],
      });
    } catch (err) { console.error("Escrow status error:", err); }
  };

  const handleBid = async (e) => {
    e.preventDefault(); setBidLoading(true); setBidError("");
    try {
      await API.post(`/jobs/${id}/bid`, { ...bidForm, amount: parseFloat(bidForm.amount), deliveryDays: parseInt(bidForm.deliveryDays) });
      setBidSuccess(true); fetchJob();
    } catch (err) { setBidError(err.response?.data?.error || "Failed to place bid"); }
    finally { setBidLoading(false); }
  };

  const handleHire = async (bid) => {
    setEscrowLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const artifact = await fetch("/Escrow.json").then(r => r.json()).catch(() => null);
      if (!artifact) { alert("Escrow.json not found in public folder"); return; }
      const factory = new ethers.ContractFactory(EscrowABI, artifact.bytecode, signer);
      const escrow = await factory.deploy(bid.freelancer.walletAddress, id);
      await escrow.waitForDeployment();
      const escrowAddress = await escrow.getAddress();
      await API.post(`/jobs/${id}/hire`, { freelancerId: bid.freelancer._id, escrowAddress });
      setTxHash(escrow.deploymentTransaction()?.hash || "");
      fetchJob();
    } catch (err) { alert("Failed to deploy escrow: " + err.message); }
    finally { setEscrowLoading(false); }
  };

  const handleDeposit = async () => {
    setEscrowLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(job.escrowAddress, EscrowABI, signer);
      const tx = await contract.deposit({ value: ethers.parseEther(job.budget.toString()) });
      await tx.wait(); setTxHash(tx.hash);
      alert("✅ Funds deposited into escrow!");
      fetchEscrowStatus(job.escrowAddress);
    } catch (err) { alert("Deposit failed: " + err.message); }
    finally { setEscrowLoading(false); }
  };

  // Accept work submission + release milestone payment on-chain
  const handleAcceptWork = async (submissionId, milestoneIdx) => {
    if (!confirm("Accept this work and release milestone payment?")) return;
    setEscrowLoading(true);
    try {
      // Release payment on-chain via escrow
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(job.escrowAddress, EscrowABI, signer);

      // Calculate amount for this milestone
      const milestone = job.milestones[milestoneIdx];
      const milestoneAmount = (job.budget * milestone.percentage / 100).toString();

      const tx = await contract.release();
      await tx.wait();
      setTxHash(tx.hash);

      // Update milestone in backend
      await API.post(`/jobs/${id}/milestone`, { milestoneIndex: milestoneIdx });
      fetchJob();
      alert(`✅ Work accepted! ${milestone.percentage}% payment released.`);
    } catch (err) { alert("Failed to release payment: " + err.message); }
    finally { setEscrowLoading(false); }
  };

  const handleRefund = async () => {
    setEscrowLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(job.escrowAddress, EscrowABI, signer);
      const tx = await contract.refund();
      await tx.wait(); setTxHash(tx.hash);
      alert("✅ Refund processed!");
      fetchEscrowStatus(job.escrowAddress);
    } catch (err) { alert("Refund failed: " + err.message); }
    finally { setEscrowLoading(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>;

  const isOwner = job?.client?._id?.toString() === user?.id?.toString();
  const isHiredFreelancer =
    job?.hiredFreelancer?._id?.toString() === user?.id?.toString() ||
    job?.hiredFreelancer?.toString() === user?.id?.toString();

  const progressPct = job?.paymentProgress || 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <button onClick={() => navigate("/jobs")} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">← Back to Jobs</button>
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Job Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs px-3 py-1 rounded-full border ${
                job.status === 'open' ? 'bg-green-900/40 text-green-400 border-green-700/50'
                : job.status === 'in_progress' ? 'bg-blue-900/40 text-blue-400 border-blue-700/50'
                : job.status === 'completed' ? 'bg-violet-900/40 text-violet-400 border-violet-700/50'
                : 'bg-gray-900/40 text-gray-400 border-gray-700/50'}`}>
                {job.status === 'completed' ? '🏆 Completed' : job.status}
              </span>
              <span className="text-gray-500 text-sm">{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-bold mb-4">{job.title}</h1>
            <p className="text-gray-300 leading-relaxed mb-6">{job.description}</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map(skill => (
                <span key={skill} className="bg-violet-900/30 text-violet-300 text-sm px-3 py-1 rounded-lg border border-violet-700/30">{skill}</span>
              ))}
            </div>
          </div>

          {/* Progress Bar — shown to both client and freelancer */}
          {job.status !== 'open' && job.milestones?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">📊 Payment Progress</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Overall Progress</span>
                  <span className="text-violet-400 font-bold">{progressPct}% released</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div className="bg-violet-600 h-4 rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%` }}/>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {job.milestones.map((m, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                    <div>
                      <span className="text-sm font-medium text-white">{m.title}</span>
                      <span className="text-gray-400 text-xs ml-2">({m.percentage}% = {(job.budget * m.percentage / 100).toFixed(4)} ETH)</span>
                    </div>
                    {m.released
                      ? <span className="text-green-400 text-xs font-semibold">✅ Paid</span>
                      : <span className="text-yellow-400 text-xs">⏳ Pending</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escrow Contract */}
          {job.escrowAddress && (
            <div className="bg-gray-900 border border-violet-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-violet-400">⛓️ Escrow Contract</h2>
              <div className="text-xs text-gray-400 font-mono mb-4 break-all">{job.escrowAddress}</div>
              {escrowStatus && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className="text-gray-400 text-xs mb-1">Status</div>
                    <div className={`font-semibold text-sm ${escrowStatus.isCompleted ? 'text-green-400' : escrowStatus.isRefunded ? 'text-red-400' : escrowStatus.isFunded ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {escrowStatus.isCompleted ? '✅ Completed' : escrowStatus.isRefunded ? '↩️ Refunded' : escrowStatus.isFunded ? '🔒 Funded' : '⏳ Awaiting Deposit'}
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className="text-gray-400 text-xs mb-1">Locked Amount</div>
                    <div className="text-violet-400 font-bold">{escrowStatus.amount} ETH</div>
                  </div>
                </div>
              )}
              {isOwner && escrowStatus && !escrowStatus.isCompleted && !escrowStatus.isRefunded && (
                <div className="flex gap-3">
                  {!escrowStatus.isFunded && (
                    <button onClick={handleDeposit} disabled={escrowLoading}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
                      {escrowLoading ? "Processing..." : "💰 Deposit Funds"}
                    </button>
                  )}
                  {escrowStatus.isFunded && (
                    <button onClick={handleRefund} disabled={escrowLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
                      {escrowLoading ? "Processing..." : "↩️ Refund"}
                    </button>
                  )}
                </div>
              )}
              {txHash && (
                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                  className="text-violet-400 text-xs mt-3 block hover:underline">View on Etherscan ↗</a>
              )}
            </div>
          )}

          {/* Submissions visible to client — with Accept button */}
          {isOwner && <SubmissionsList jobId={id} onApprove={handleAcceptWork} />}

          {/* Submit Work — visible to hired freelancer */}
          {isHiredFreelancer && job.status === "in_progress" && (
            <SubmitWork jobId={id} milestones={job.milestones} onSubmitted={fetchJob} />
          )}

          {/* Bids */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Bids ({bids.length})</h2>
            {bids.length === 0 ? <p className="text-gray-400 text-sm">No bids yet.</p> : (
              <div className="flex flex-col gap-4">
                {bids.map(bid => (
                  <div key={bid._id} className="border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-violet-400 font-bold">{bid.amount} ETH</span>
                      <span className="text-gray-400 text-sm">{bid.deliveryDays} days</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{bid.proposal}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-500 text-xs">{bid.freelancer?.walletAddress?.slice(0, 10)}...</p>
                      {isOwner && job.status === 'open' && (
                        <button onClick={() => handleHire(bid)} disabled={escrowLoading}
                          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
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
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-violet-400 mb-1">{job.budget} ETH</div>
            <div className="text-gray-400 text-sm mb-4">Budget</div>
            <div className="text-gray-300 text-sm"><span className="text-gray-500">Deadline: </span>{new Date(job.deadline).toLocaleDateString()}</div>
            <div className="text-gray-300 text-sm mt-2"><span className="text-gray-500">Posted by: </span>{job.client?.walletAddress?.slice(0, 10)}...</div>
            {job.status === 'completed' && (
              <div className="mt-4 bg-violet-900/30 border border-violet-700/50 rounded-xl p-3 text-center">
                <div className="text-violet-400 font-bold">🏆 Job Completed!</div>
                <div className="text-gray-400 text-xs mt-1">All payments released</div>
              </div>
            )}
          </div>

          {/* Bid form — freelancer only, open jobs only */}
          {!isOwner && !isHiredFreelancer && job.status === 'open' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Place a Bid</h3>
              {bidSuccess ? (
                <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded-xl text-sm">✅ Bid placed!</div>
              ) : (
                <form onSubmit={handleBid} className="flex flex-col gap-3">
                  <input placeholder="Your bid (ETH)" type="number" step="0.001" value={bidForm.amount}
                    onChange={e => setBidForm({...bidForm, amount: e.target.value})} required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm"/>
                  <input placeholder="Delivery days" type="number" value={bidForm.deliveryDays}
                    onChange={e => setBidForm({...bidForm, deliveryDays: e.target.value})} required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm"/>
                  <textarea placeholder="Write your proposal..." value={bidForm.proposal}
                    onChange={e => setBidForm({...bidForm, proposal: e.target.value})} required rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm resize-none"/>
                  {bidError && <p className="text-red-400 text-xs">{bidError}</p>}
                  <button type="submit" disabled={bidLoading}
                    className="bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 text-sm">
                    {bidLoading ? "Submitting..." : "Submit Bid"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
