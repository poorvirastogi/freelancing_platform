import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import SubmitWork from "../../components/SubmitWork";
import API from "../../utils/api";

const FreelancerJobDetail = () => {
  const { id } = useParams();
  const { account, user } = useWallet();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ amount:"", proposal:"", deliveryDays:"" });
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);

  useEffect(() => { if (!account) navigate("/freelancer/login"); fetchJob(); }, []);

  const fetchJob = async () => {
    try {
      const { data } = await API.get(`/jobs/${id}`);
      setJob(data.job); setBids(data.bids);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleBid = async (e) => {
    e.preventDefault(); setBidLoading(true); setBidError("");
    try {
      await API.post(`/jobs/${id}/bid`, { ...bidForm, amount:parseFloat(bidForm.amount), deliveryDays:parseInt(bidForm.deliveryDays) });
      setBidSuccess(true); fetchJob();
    } catch (err) { setBidError(err.response?.data?.error||"Failed to place bid"); }
    finally { setBidLoading(false); }
  };

  if (loading) return <div className="min-h-screen bg-teal-950 text-white flex items-center justify-center"><div className="text-teal-400">Loading...</div></div>;

  const isHiredFreelancer = job?.hiredFreelancer?._id?.toString()===user?.id?.toString() || job?.hiredFreelancer?.toString()===user?.id?.toString();
  const myBid = bids.find(b=>b.freelancer?._id?.toString()===user?.id?.toString());
  const progressPct = job?.paymentProgress||0;

  return (
    <div className="min-h-screen bg-teal-950 text-white p-8">
      <button onClick={()=>navigate("/freelancer/jobs")} className="text-teal-400 hover:text-teal-300 mb-6 flex items-center gap-2">← Back to Jobs</button>
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Job Info */}
          <div className="bg-teal-900/40 border border-teal-800 rounded-2xl p-6">
            <div className="flex justify-between mb-4">
              <span className={`text-xs px-3 py-1 rounded-full border ${job.status==='open'?'bg-green-900/40 text-green-400 border-green-700/50':job.status==='in_progress'?'bg-teal-800 text-teal-300 border-teal-600/50':job.status==='completed'?'bg-violet-900/40 text-violet-400 border-violet-700/50':'bg-gray-800 text-gray-400 border-gray-700'}`}>{job.status==='completed'?'�� Completed':job.status}</span>
              <span className="text-teal-500 text-sm">{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-teal-100">{job.title}</h1>
            <p className="text-teal-200 leading-relaxed mb-6">{job.description}</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map(skill=>(
                <span key={skill} className="bg-teal-800/60 text-teal-300 text-sm px-3 py-1 rounded-lg border border-teal-700/30">{skill}</span>
              ))}
            </div>
          </div>

          {/* Payment Progress */}
          {job.status!=='open' && job.milestones?.length>0 && (
            <div className="bg-teal-900/40 border border-teal-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-teal-100">📊 Payment Progress</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2"><span className="text-teal-400">Your earnings released</span><span className="text-teal-300 font-bold">{progressPct}%</span></div>
                <div className="w-full bg-teal-900 rounded-full h-4 overflow-hidden"><div className="bg-teal-500 h-4 rounded-full transition-all duration-700" style={{width:`${progressPct}%`}}/></div>
              </div>
              <div className="flex flex-col gap-2">
                {job.milestones.map((m,i)=>(
                  <div key={i} className="flex items-center justify-between bg-teal-900/60 rounded-xl px-4 py-3">
                    <div><span className="text-sm font-medium text-teal-100">{m.title}</span><span className="text-teal-400 text-xs ml-2">({m.percentage}% = {(job.budget*m.percentage/100).toFixed(4)} ETH)</span></div>
                    {m.released?<span className="text-green-400 text-xs font-semibold">✅ Paid to you</span>:<span className="text-yellow-400 text-xs">⏳ Pending</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Work */}
          {isHiredFreelancer && job.status==='in_progress' && (
            <SubmitWork jobId={id} milestones={job.milestones} onSubmitted={fetchJob} />
          )}

          {/* Bids list */}
          <div className="bg-teal-900/40 border border-teal-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-teal-100">Bids ({bids.length})</h2>
            {bids.length===0 ? <p className="text-teal-400 text-sm">No bids yet. Be the first!</p> : (
              <div className="flex flex-col gap-3">
                {bids.map(bid=>(
                  <div key={bid._id} className={`border rounded-xl p-4 ${bid.freelancer?._id?.toString()===user?.id?.toString()?"border-teal-500 bg-teal-800/30":"border-teal-800"}`}>
                    <div className="flex justify-between mb-2">
                      <span className="text-teal-300 font-bold">{bid.amount} ETH</span>
                      <span className="text-teal-400 text-sm">{bid.deliveryDays} days</span>
                    </div>
                    <p className="text-teal-200 text-sm">{bid.proposal}</p>
                    {bid.freelancer?._id?.toString()===user?.id?.toString() && <p className="text-teal-400 text-xs mt-2">← Your bid</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-teal-900/40 border border-teal-800 rounded-2xl p-6">
            <div className="text-3xl font-bold text-teal-300 mb-1">{job.budget} ETH</div>
            <div className="text-teal-400 text-sm mb-4">Budget</div>
            <div className="text-teal-200 text-sm"><span className="text-teal-400">Deadline: </span>{new Date(job.deadline).toLocaleDateString()}</div>
            <div className="text-teal-200 text-sm mt-2"><span className="text-teal-400">Posted by: </span>{job.client?.walletAddress?.slice(0,10)}...</div>
          </div>

          {/* Bid form */}
          {!isHiredFreelancer && job.status==='open' && !myBid && (
            <div className="bg-teal-900/40 border border-teal-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-4 text-teal-100">Place a Bid</h3>
              {bidSuccess ? (
                <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded-xl text-sm">✅ Bid placed!</div>
              ) : (
                <form onSubmit={handleBid} className="flex flex-col gap-3">
                  <input placeholder="Your bid (ETH)" type="number" step="0.001" value={bidForm.amount} onChange={e=>setBidForm({...bidForm,amount:e.target.value})} required
                    className="w-full bg-teal-950/60 border border-teal-700 rounded-xl px-4 py-2.5 text-white placeholder-teal-500 focus:outline-none focus:border-teal-400 text-sm"/>
                  <input placeholder="Delivery days" type="number" value={bidForm.deliveryDays} onChange={e=>setBidForm({...bidForm,deliveryDays:e.target.value})} required
                    className="w-full bg-teal-950/60 border border-teal-700 rounded-xl px-4 py-2.5 text-white placeholder-teal-500 focus:outline-none focus:border-teal-400 text-sm"/>
                  <textarea placeholder="Write your proposal..." value={bidForm.proposal} onChange={e=>setBidForm({...bidForm,proposal:e.target.value})} required rows={4}
                    className="w-full bg-teal-950/60 border border-teal-700 rounded-xl px-4 py-2.5 text-white placeholder-teal-500 focus:outline-none focus:border-teal-400 text-sm resize-none"/>
                  {bidError && <p className="text-red-400 text-xs">{bidError}</p>}
                  <button type="submit" disabled={bidLoading} className="bg-teal-600 hover:bg-teal-500 text-white py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 text-sm">{bidLoading?"Submitting...":"Submit Bid"}</button>
                </form>
              )}
            </div>
          )}

          {myBid && (
            <div className="bg-teal-900/40 border border-teal-500 rounded-2xl p-6">
              <h3 className="font-semibold mb-2 text-teal-100">Your Bid</h3>
              <div className="text-teal-300 font-bold text-xl mb-1">{myBid.amount} ETH</div>
              <div className="text-teal-400 text-sm">{myBid.deliveryDays} days delivery</div>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${myBid.status==="accepted"?"bg-green-900/40 text-green-400":myBid.status==="rejected"?"bg-red-900/40 text-red-400":"bg-yellow-900/40 text-yellow-400"}`}>{myBid.status}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerJobDetail;
