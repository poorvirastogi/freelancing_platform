import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";

const ClientMyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editJob, setEditJob] = useState(null);
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/client/login"); fetchJobs(); }, []);

  const fetchJobs = async () => {
    try { const { data } = await API.get("/jobs/my/posted"); setJobs(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job?")) return;
    try { await API.delete(`/jobs/${id}`); fetchJobs(); }
    catch (err) { alert("Delete failed: " + (err.response?.data?.error || err.message)); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/jobs/${editJob._id}`, { ...editJob, skills: typeof editJob.skills==="string" ? editJob.skills.split(",").map(s=>s.trim()) : editJob.skills });
      setEditJob(null); fetchJobs();
    } catch (err) { alert("Edit failed: " + (err.response?.data?.error || err.message)); }
  };

  return (
    <div className="min-h-screen bg-blue-950 text-white flex">
      <ClientSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold text-blue-100">Posted Jobs</h1><p className="text-blue-400 mt-1">{jobs.length} jobs</p></div>
          <button onClick={()=>navigate("/client/post-job")} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg transition-all">+ Post New Job</button>
        </div>
        {loading && <div className="text-blue-400">Loading...</div>}
        <div className="flex flex-col gap-4">
          {jobs.map(job=>(
            <div key={job._id} className="bg-blue-900/40 border border-blue-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg text-blue-100">{job.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${job.status==='open'?'bg-green-900/40 text-green-400 border-green-700/50':job.status==='in_progress'?'bg-blue-800 text-blue-300 border-blue-600/50':job.status==='completed'?'bg-violet-900/40 text-violet-400 border-violet-700/50':'bg-gray-800 text-gray-400 border-gray-700'}`}>{job.status==='completed'?'🏆 Completed':job.status}</span>
                  </div>
                  <p className="text-blue-300 text-sm">{job.description?.slice(0,100)}...</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={()=>navigate(`/client/job/${job._id}`)} className="bg-blue-800 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm">View</button>
                  {job.status==='open' && <button onClick={()=>setEditJob({...job,skills:job.skills.join(", ")})} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm">Edit</button>}
                  {job.status==='open' && <button onClick={()=>handleDelete(job._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm">Delete</button>}
                </div>
              </div>
              {(job.status==='in_progress'||job.status==='completed') && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-blue-400 mb-1"><span>Payment Progress</span><span>{job.paymentProgress||0}% released</span></div>
                  <div className="w-full bg-blue-900 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full transition-all" style={{width:`${job.paymentProgress||0}%`}}/></div>
                </div>
              )}
              <div className="flex gap-4 mt-3 text-sm text-blue-400"><span>💰 {job.budget} ETH</span><span>📅 {new Date(job.deadline).toLocaleDateString()}</span></div>
            </div>
          ))}
        </div>
        {editJob && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-blue-900 border border-blue-700 rounded-2xl p-6 w-full max-w-lg">
              <h2 className="text-lg font-bold mb-4 text-blue-100">Edit Job</h2>
              <form onSubmit={handleEdit} className="flex flex-col gap-4">
                <input value={editJob.title} onChange={e=>setEditJob({...editJob,title:e.target.value})} className="w-full bg-blue-950 border border-blue-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400"/>
                <textarea value={editJob.description} onChange={e=>setEditJob({...editJob,description:e.target.value})} rows={3} className="w-full bg-blue-950 border border-blue-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400 resize-none"/>
                <input value={editJob.skills} onChange={e=>setEditJob({...editJob,skills:e.target.value})} placeholder="Skills (comma separated)" className="w-full bg-blue-950 border border-blue-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400"/>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-semibold">Save</button>
                  <button type="button" onClick={()=>setEditJob(null)} className="flex-1 border border-blue-700 text-blue-300 py-2.5 rounded-xl hover:border-blue-500">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientMyJobs;
