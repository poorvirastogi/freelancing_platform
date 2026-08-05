import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import API from "../utils/api";

const RoleSelect = () => {
  const { user } = useWallet();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await API.put("/users/profile", { role: selected });
      const updatedUser = { ...user, role: selected };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      navigate("/dashboard");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="text-3xl font-bold text-violet-400 mb-2">FreeLance3</div>
      <p className="text-gray-400 mb-12 text-center">How will you be using the platform?</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full mb-8">
        {[
          { role: "client", icon: "🏢", title: "I'm a Client", desc: "I want to post jobs and hire talented freelancers.", features: ["Post jobs", "Review bids", "Manage escrow", "Release payments via milestones"] },
          { role: "freelancer", icon: "💻", title: "I'm a Freelancer", desc: "I want to find work and get paid securely.", features: ["Browse jobs", "Place bids", "Submit work per milestone", "Get paid in ETH"] },
        ].map((item) => (
          <button key={item.role} onClick={() => setSelected(item.role)}
            className={`flex flex-col text-left p-6 rounded-2xl border-2 transition-all ${selected === item.role ? "border-violet-500 bg-violet-900/20" : "border-gray-800 bg-gray-900 hover:border-gray-600"}`}>
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="text-lg font-bold mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{item.desc}</p>
            <ul className="flex flex-col gap-1.5">
              {item.features.map(f => (
                <li key={f} className="text-sm flex items-center gap-2">
                  <span className={selected === item.role ? "text-violet-400" : "text-gray-600"}>✓</span>
                  <span className="text-gray-300">{f}</span>
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <button onClick={handleContinue} disabled={!selected || loading}
        className="bg-violet-600 hover:bg-violet-700 text-white px-12 py-4 rounded-xl text-lg font-semibold transition-all disabled:opacity-30">
        {loading ? "Saving..." : "Continue →"}
      </button>
    </div>
  );
};

export default RoleSelect;
