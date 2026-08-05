import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { Button } from "../../components/ui";
import {
  Hexagon,
  ArrowLeft,
  Building2,
  Wallet,
  Check,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

const ClientLogin = () => {
  const { connectWallet, loading, account, user } = useWallet();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (account && user?.role === "client") navigate("/client/dashboard");
    if (account && user?.role === "freelancer") setError("This wallet is registered as a Freelancer. Please switch wallet.");
  }, [account, user]);

  const handleConnect = async () => {
    setError("");
    const result = await connectWallet("client");
    if (result?.success) navigate("/client/dashboard");
    else if (result?.wrongPortal) setError(`This wallet is a ${result.correctRole}. Please switch to your client wallet in MetaMask.`);
  };

  const features = [
    "Zero platform commission",
    "Smart contract escrow",
    "Milestone payment control",
    "AI-verified freelancers",
  ];

  const walletSteps = [
    "Open MetaMask extension",
    "Click account name at top",
    "Switch to your Client wallet",
    "Click Connect below",
  ];

  return (
    <div className="client-theme min-h-screen flex flex-col bg-bg text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-line">
        <button onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors focus-ring rounded-[var(--radius-sm)] px-1 py-1">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center h-7 w-7 rounded-[var(--radius-sm)] bg-accent text-accent-fg">
            <Hexagon size={16} strokeWidth={2.25} />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-foreground">Free</span><span className="text-muted">Lance3</span>
          </span>
          <span className="ml-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-[color:var(--accent)]/30">
            Client
          </span>
        </div>
        <div className="w-16" aria-hidden="true" />
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Left — value proposition */}
        <section className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 animate-fadeInUp">
          <span className="grid place-items-center h-14 w-14 rounded-[var(--radius-lg)] bg-accent-soft text-accent mb-6">
            <Building2 size={28} strokeWidth={1.75} />
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight text-balance">
            Welcome,<br /><span className="text-accent">Client.</span>
          </h1>
          <p className="text-base text-muted mt-4 mb-10 max-w-sm leading-relaxed text-pretty">
            Post jobs, hire verified talent, and release payments via unstoppable smart contracts.
          </p>

          <ul className="flex flex-col gap-3 mb-10">
            {features.map(f => (
              <li key={f} className="flex items-center gap-3">
                <span className="grid place-items-center h-5 w-5 rounded-full bg-accent text-accent-fg shrink-0">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-sm text-muted">{f}</span>
              </li>
            ))}
          </ul>

          {/* Wallet tip */}
          <div className="rounded-[var(--radius-lg)] p-4 max-w-sm bg-surface border border-line">
            <p className="text-xs font-semibold text-foreground mb-3">Using multiple wallets?</p>
            <ol className="flex flex-col gap-1.5">
              {walletSteps.map((s, i) => (
                <li key={i} className="text-xs flex gap-2 text-muted">
                  <span className="font-data font-semibold text-accent">{i + 1}.</span> {s}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Right — auth card */}
        <section className="w-full lg:w-[440px] flex items-center justify-center p-6 sm:p-8">
          <div className="w-full rounded-[var(--radius-xl)] p-8 bg-surface border border-line shadow-[0_24px_80px_-40px_var(--accent)]">
            <span className="grid place-items-center h-12 w-12 rounded-[var(--radius-md)] bg-accent-soft text-accent border border-[color:var(--accent)]/30 mb-6">
              <Building2 size={22} strokeWidth={1.75} />
            </span>

            <h2 className="text-2xl font-semibold text-foreground">Client Access</h2>
            <p className="text-sm text-muted mt-1 mb-8">Connect your client wallet to continue</p>

            {error && (
              <div role="alert" className="mb-6 px-4 py-3 rounded-[var(--radius-md)] text-sm flex items-start gap-2 bg-danger-soft border border-[color:var(--danger)]/30 text-danger">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" /> <span>{error}</span>
              </div>
            )}

            <Button onClick={handleConnect} disabled={loading} size="lg" className="w-full">
              {loading ? (
                <><span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> Connecting...</>
              ) : (
                <><Wallet size={18} /> Connect Client Wallet</>
              )}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-center mt-4 text-xs text-faint">
              <ShieldCheck size={13} /> Requires MetaMask · Sepolia testnet
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClientLogin;
