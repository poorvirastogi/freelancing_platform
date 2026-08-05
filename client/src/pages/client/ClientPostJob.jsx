import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";

const ClientPostJob = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:"", description:"", skills:"", budget:"", deadline:"" });
  const [milestones, setMilestones] = useState([{ title:"Initial delivery", percentage:50 },{ title:"Final delivery", percentage:50 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const totalPct = milestones.reduce((s,m) => s + Number(m.percentage), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalPct !== 100) return setError("Milestone percentages must add up to 100%");
    setLoading(true); setError("");
    try {
      await API.post("/jobs", { ...form, skills: form.skills.split(",").map(s=>s.trim()), budget: parseFloat(form.budget), milestones });
      navigate("/client/my-jobs");
    } catch (err) { setError(err.response?.data?.error || "Failed to post job"); }
    finally { setLoading(false); }
  };

  const updateMilestone = (i, field, val) => {
    const u = [...milestones]; u[i][field] = field==="percentage" ? Number(val) : val; setMilestones(u);
  };

  return (
    <div className="min-h-screen bg-blue-950 text-white flex">
      <ClientSidebar />
      <main className="flex-1 p-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-2 text-blue-100">Post a Job</h1>
        <p className="text-blue-400 mb-8">Fill in the details and define payment milestones</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm text-blue-400 mb-1.5">Job Title</label>
            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Build a DeFi Dashboard" required
              className="w-full bg-blue-900/40 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-500 focus:outline-none focus:border-blue-400"/>
          </div>
          <div>
            <label className="block text-sm text-blue-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the project..." required rows={4}
              className="w-full bg-blue-900/40 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-500 focus:outline-none focus:border-blue-400 resize-none"/>
          </div>
          <div>
            <label className="block text-sm text-blue-400 mb-1.5">Required Skills</label>
            <input value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="React, Solidity, Node.js" required
              className="w-full bg-blue-900/40 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-500 focus:outline-none focus:border-blue-400"/>
            <p className="text-blue-600 text-xs mt-1">Separate with commas</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-blue-400 mb-1.5">Budget (ETH)</label>
              <input type="number" step="0.001" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="0.05" required
                className="w-full bg-blue-900/40 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-500 focus:outline-none focus:border-blue-400"/>
            </div>
            <div>
              <label className="block text-sm text-blue-400 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} required
                className="w-full bg-blue-900/40 border border-blue-700 rounded-xl px-4 py-3 text-white placeholder-blue-500 focus:outline-none focus:border-blue-400"/>
            </div>
          </div>
          <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-blue-200">Payment Milestones</h3>
              <button type="button" onClick={()=>setMilestones([...milestones,{title:"Milestone",percentage:0}])} className="text-blue-400 text-xs hover:text-blue-300">+ Add</button>
            </div>
            {milestones.map((m,i)=>(
              <div key={i} className="flex gap-3 mb-3">
                <input value={m.title} onChange={e=>updateMilestone(i,"title",e.target.value)} placeholder="Milestone title"
                  className="flex-1 bg-blue-900/60 border border-blue-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"/>
                <input type="number" value={m.percentage} onChange={e=>updateMilestone(i,"percentage",e.target.value)} placeholder="%" min="1" max="100"
                  className="w-20 bg-blue-900/60 border border-blue-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"/>
                <span className="text-blue-400 text-sm py-2">%</span>
                {milestones.length > 1 && <button type="button" onClick={()=>setMilestones(milestones.filter((_,j)=>j!==i))} className="text-red-400 text-sm px-2">✕</button>}
              </div>
            ))}
            <div className={`text-xs mt-2 ${totalPct===100?"text-green-400":"text-red-400"}`}>Total: {totalPct}% {totalPct===100?"✅":"(must be 100%)"}</div>
          </div>
          {error && <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
            {loading ? "Posting..." : "Post Job"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ClientPostJob;
