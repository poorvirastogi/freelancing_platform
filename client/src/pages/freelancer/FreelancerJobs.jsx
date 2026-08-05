import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import FreelancerSidebar from "../../components/FreelancerSidebar";
import API from "../../utils/api";

const FreelancerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { account } = useWallet();
  const navigate = useNavigate();

  useEffect(() => { if (!account) navigate("/freelancer/login"); fetchJobs(); }, []);

  const fetchJobs = async () => {
    try { const { data } = await API.get("/jobs"); setJobs(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #021024 0%, #052659 100%)" }}>
      <FreelancerSidebar />
      <main className="flex-1 p-8 overflow-auto">

        <div className="mb-8" style={{ animation: "fadeInUp 0.6s ease forwards" }}>
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(84,131,179,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>Browse</p>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#C1E8FF" }}>Available Jobs</h1>
          <p className="text-sm" style={{ color: "rgba(193,232,255,0.4)" }}>{filtered.length} open positions</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(84,131,179,0.5)" }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or skill..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{ background: "rgba(5,38,89,0.5)", border: "1px solid rgba(84,131,179,0.2)", color: "#C1E8FF", fontFamily: "Space Grotesk, sans-serif" }}
            onFocus={e => e.target.style.border = "1px solid rgba(84,131,179,0.5)"}
            onBlur={e => e.target.style.border = "1px solid rgba(84,131,179,0.2)"}/>
        </div>

        {loading && (
          <div className="flex items-center gap-3" style={{ color: "rgba(193,232,255,0.4)" }}>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            <span className="text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Loading jobs...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((job, i) => (
            <div key={job._id} onClick={() => navigate(`/freelancer/job/${job._id}`)}
              className="rounded-2xl p-6 cursor-pointer group relative overflow-hidden transition-all duration-300"
              style={{ background: "rgba(5,38,89,0.5)", border: "1px solid rgba(84,131,179,0.15)", animation: `fadeInUp 0.5s ease ${i*0.05}s both` }}
              onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(84,131,179,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(84,131,179,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}>

              {/* Hover glow */}
              <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, transparent, rgba(84,131,179,0.4), transparent)" }} />

              <div className="flex justify-between items-start mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>
                  ● Open
                </span>
                <span className="text-xs" style={{ color: "rgba(193,232,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-bold text-base mb-2 leading-snug" style={{ color: "#C1E8FF", fontFamily: "Syne, sans-serif" }}>{job.title}</h3>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: "rgba(193,232,255,0.45)" }}>{job.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {job.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(84,131,179,0.15)", color: "#7DA0CA", border: "1px solid rgba(84,131,179,0.2)", fontFamily: "Space Grotesk, sans-serif" }}>
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-end pt-4" style={{ borderTop: "1px solid rgba(84,131,179,0.1)" }}>
                <div>
                  <div className="font-bold text-lg" style={{ color: "#5483B3", fontFamily: "Syne, sans-serif" }}>{job.budget} ETH</div>
                  <div className="text-xs" style={{ color: "rgba(193,232,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>Budget</div>
                </div>
                <div className="text-right">
                  <div className="text-sm" style={{ color: "rgba(193,232,255,0.5)" }}>{new Date(job.deadline).toLocaleDateString()}</div>
                  <div className="text-xs" style={{ color: "rgba(193,232,255,0.3)", fontFamily: "Space Grotesk, sans-serif" }}>Deadline</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FreelancerJobs;
