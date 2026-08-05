import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";
import API from "../utils/api";

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { account } = useWallet();

  useEffect(() => {
    if (!account) navigate("/");
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/jobs");
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Browse Jobs</h1>
            <p className="text-gray-400 mt-1">{jobs.length} open jobs available</p>
          </div>
          <button onClick={() => navigate("/post-job")}
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg transition-all">
            + Post a Job
          </button>
        </div>
        {loading && <div className="text-gray-400 text-center py-20">Loading jobs...</div>}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-xl font-semibold mb-2">No jobs yet</h3>
            <p className="text-gray-400 mb-6">Be the first to post a job!</p>
            <button onClick={() => navigate("/post-job")}
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl transition-all">
              Post a Job
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-violet-600 cursor-pointer transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-green-900/40 text-green-400 text-xs px-3 py-1 rounded-full border border-green-700/50">Open</span>
                <span className="text-gray-500 text-xs">{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">{job.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{job.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.slice(0, 3).map((skill) => (
                  <span key={skill}
                    className="bg-violet-900/30 text-violet-300 text-xs px-2.5 py-1 rounded-lg border border-violet-700/30">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div>
                  <div className="text-violet-400 font-bold">{job.budget} ETH</div>
                  <div className="text-gray-500 text-xs">Budget</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-300 text-sm">{new Date(job.deadline).toLocaleDateString()}</div>
                  <div className="text-gray-500 text-xs">Deadline</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default JobListings;