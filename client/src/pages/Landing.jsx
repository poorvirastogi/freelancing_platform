import { useWallet } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Landing = () => {
  const { connectWallet, loginWithPassword, registerWithPassword, loading, account } = useWallet();
  const navigate = useNavigate();
  const [tab, setTab] = useState("wallet");
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "freelancer" });
  const [error, setError] = useState("");

  useEffect(() => { if (account) navigate("/dashboard"); }, [account]);

  const handleConnect = async () => {
    const result = await connectWallet();
    if (result?.needsRole) navigate("/role-select");
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setError("");
    const result = await loginWithPassword(form.email, form.password);
    if (!result.success) setError(result.error);
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError("");
    const result = await registerWithPassword(form.username, form.email, form.password, form.role);
    if (!result.success) setError(result.error);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <div className="text-2xl font-bold text-violet-400">FreeLance3</div>
      </nav>
      <div className="flex flex-1">
        {/* Left hero */}
        <div className="flex-1 flex flex-col justify-center px-16">
          <div className="bg-violet-900/40 text-violet-300 text-sm px-4 py-1.5 rounded-full mb-8 border border-violet-700/50 w-fit">
            ⛓️ Powered by Ethereum Smart Contracts
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            The Future of<span className="text-violet-400"> Freelancing</span><br />is Decentralized
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mb-8">
            Secure payments via smart contract escrow. Verified skills via on-chain badges. No middlemen. No fees.
          </p>
          <div className="flex gap-8">
            {[["100%", "Smart Contract Escrow"], ["0 Fees", "No Middlemen"], ["Verified", "On-chain Reputation"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-violet-400">{val}</div>
                <div className="text-gray-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right auth panel */}
        <div className="w-96 flex items-center justify-center p-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-800 rounded-xl p-1 mb-6">
              {[["wallet", "🦊 Wallet"], ["login", "Login"], ["register", "Register"]].map(([t, label]) => (
                <button key={t} onClick={() => { setTab(t); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
                  {label}
                </button>
              ))}
            </div>

            {tab === "wallet" && (
              <div className="flex flex-col gap-4">
                <p className="text-gray-400 text-sm text-center">Connect your MetaMask wallet to get started</p>
                <button onClick={handleConnect} disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
                  {loading ? "Connecting..." : "🦊 Connect MetaMask"}
                </button>
                <p className="text-gray-500 text-xs text-center">Requires MetaMask + Sepolia testnet ETH</p>
              </div>
            )}

            {tab === "login" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"/>
                <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"/>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            )}

            {tab === "register" && (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <input placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"/>
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"/>
                <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"/>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500">
                  <option value="freelancer">💻 I am a Freelancer</option>
                  <option value="client">🏢 I am a Client</option>
                </select>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
