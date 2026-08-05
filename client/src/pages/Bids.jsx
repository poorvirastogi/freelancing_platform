import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";
import API from "../utils/api";

const Bids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/"); fetchBids(); }, []);

  const fetchBids = async () => {
    try {
      const { data } = await API.get("/jobs/my/bids");
      setBids(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-2">My Bids</h1>
        <p className="text-gray-400 mb-8">Track your submitted proposals and payments</p>
        {loading && <div className="text-gray-400">Loading...</div>}
        {!loading && bids.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">No bids yet</h3>
            <button onClick={() => navigate("/jobs")} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl">Browse Jobs</button>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {bids.map(bid => (
            <div key={bid._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-violet-700 transition-all"
              onClick={() => navigate(`/jobs/${bid.job?._id}`)}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{bid.job?.title}</h3>
                <span className={`text-xs px-3 py-1 rounded-full border ${
                  bid.status === "accepted" ? "bg-green-900/40 text-green-400 border-green-700/50"
                  : bid.status === "rejected" ? "bg-red-900/40 text-red-400 border-red-700/50"
                  : "bg-yellow-900/40 text-yellow-400 border-yellow-700/50"}`}>
                  {bid.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{bid.proposal}</p>

              {/* Payment progress if hired */}
              {bid.job?.status === 'in_progress' || bid.job?.status === 'completed' ? (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Payment Progress</span>
                    <span className="text-violet-400">{bid.job?.paymentProgress || 0}% received</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-violet-600 h-2 rounded-full transition-all" style={{ width: `${bid.job?.paymentProgress || 0}%` }}/>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-6 text-sm">
                <div><span className="text-gray-500">Your Bid: </span><span className="text-violet-400 font-bold">{bid.amount} ETH</span></div>
                <div><span className="text-gray-500">Delivery: </span><span className="text-gray-300">{bid.deliveryDays} days</span></div>
                <div><span className="text-gray-500">Job Budget: </span><span className="text-gray-300">{bid.job?.budget} ETH</span></div>
                {bid.job?.status === 'completed' && <span className="text-green-400 font-semibold">🏆 Completed</span>}
              </div>

              {bid.status === 'rejected' && (
                <div className="mt-3 bg-red-900/20 border border-red-700/50 rounded-xl p-3">
                  <p className="text-red-400 text-xs">Your bid was rejected. You can view the job and submit a new bid.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Bids;
