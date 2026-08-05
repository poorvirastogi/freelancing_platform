import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import ClientSidebar from "../../components/ClientSidebar";
import API from "../../utils/api";
import { PageHeader, Card, Field, Input, Textarea, Button } from "../../components/ui";
import { Plus, X, AlertTriangle, Check } from "lucide-react";

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
    <div className="client-theme min-h-screen flex bg-bg text-foreground">
      <ClientSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10">

          <PageHeader
            eyebrow="Client Portal"
            title="Post a Job"
            description="Fill in the details and define payment milestones"
          />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-8">
            <Card className="p-6 flex flex-col gap-5">
              <Field label="Job Title">
                <Input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Build a DeFi Dashboard" required />
              </Field>

              <Field label="Description">
                <Textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the project..." required rows={4} />
              </Field>

              <Field label="Required Skills" hint="Separate with commas">
                <Input value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} placeholder="React, Solidity, Node.js" required />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Budget (ETH)">
                  <Input type="number" step="0.001" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="0.05" required />
                </Field>
                <Field label="Deadline">
                  <Input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} required />
                </Field>
              </div>
            </Card>

            {/* Milestones */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Payment Milestones</h3>
                <button type="button" onClick={()=>setMilestones([...milestones,{title:"Milestone",percentage:0}])}
                  className="inline-flex items-center gap-1 text-xs text-accent hover:brightness-110 transition focus-ring rounded px-1">
                  <Plus size={14} /> Add
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {milestones.map((m,i)=>(
                  <div key={i} className="flex gap-3 items-center">
                    <Input value={m.title} onChange={e=>updateMilestone(i,"title",e.target.value)} placeholder="Milestone title" className="flex-1" />
                    <div className="relative w-24 shrink-0">
                      <Input type="number" value={m.percentage} onChange={e=>updateMilestone(i,"percentage",e.target.value)} placeholder="%" min="1" max="100" className="pr-7" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint font-data">%</span>
                    </div>
                    {milestones.length > 1 && (
                      <button type="button" onClick={()=>setMilestones(milestones.filter((_,j)=>j!==i))}
                        aria-label="Remove milestone"
                        className="grid place-items-center h-9 w-9 rounded-[var(--radius-sm)] text-muted hover:text-danger hover:bg-danger-soft transition focus-ring shrink-0">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-medium font-data ${totalPct===100 ? "text-success" : "text-danger"}`}>
                {totalPct===100 ? <Check size={14} /> : <AlertTriangle size={14} />}
                Total: {totalPct}% {totalPct===100 ? "" : "(must be 100%)"}
              </div>
            </Card>

            {error && (
              <div role="alert" className="px-4 py-3 rounded-[var(--radius-md)] text-sm flex items-start gap-2 bg-danger-soft border border-[color:var(--danger)]/30 text-danger">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" /> <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ClientPostJob;
