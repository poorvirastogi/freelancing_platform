import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";
import API from "../utils/api";

const AcceptedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/"); fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/jobs/my/posted");
      setJobs(data.filter(j => j.status === 'in_progress' || j.status === 'completed'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-2">Accepted Jobs</h1>
        <p className="text-gray-400 mb-8">Track progress and manage milestone payments</p>
        {loading && <div className="text-gray-400">Loading...</div>}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">No active jobs</h3>
            <p className="text-gray-400">Hire a freelancer to see jobs here</p>
          </div>
        )}
        <div className="flex flex-col gap-6">
          {jobs.map(job => (
            <div key={job._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${job.status === 'completed' ? 'bg-violet-900/40 text-violet-400 border-violet-700/50' : 'bg-blue-900/40 text-blue-400 border-blue-700/50'}`}>
                    {job.status === 'completed' ? '🏆 Completed' : 'In Progress'}
                  </span>
                </div>
                <button onClick={() => navigate(`/jobs/${job._id}`)} className="text-violet-400 text-sm hover:text-violet-300">View details →</button>
              </div>
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Payment Released</span>
                  <span className="text-violet-400 font-bold">{job.paymentProgress || 0}% of {job.budget} ETH</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div className="bg-violet-600 h-4 rounded-full transition-all duration-700" style={{ width: `${job.paymentProgress || 0}%` }}/>
                </div>
              </div>
              {job.milestones?.length > 0 && (
                <div className="flex flex-col gap-2">
                  {job.milestones.map((m, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                      <div>
                        <span className="font-medium text-sm">{m.title}</span>
                        <span className="text-gray-400 text-xs ml-2">{m.percentage}% = {(job.budget * m.percentage / 100).toFixed(4)} ETH</span>
                      </div>
                      {m.released
                        ? <span className="text-green-400 text-xs font-semibold">✅ Released</span>
                        : <span className="text-yellow-400 text-xs">⏳ Awaiting work submission</span>}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-gray-500 text-xs mt-3">💡 Go to job detail to accept submitted work and release payment</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AcceptedJobs;
