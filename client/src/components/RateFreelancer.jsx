import { useState } from "react";
import API from "../utils/api";

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

const RateFreelancer = ({ jobId, freelancerId, onRated }) => {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (score === 0) return alert("Please select a rating");
    setLoading(true);
    try {
      await API.post("/zk/rate", { jobId, freelancerId, score, review });
      setDone(true);
      if (onRated) onRated();
    } catch (err) {
      alert(err.response?.data?.error || "Rating failed");
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="rounded-2xl p-6 text-center"
      style={{ background: "rgba(43,18,76,0.4)", border: "1px solid rgba(133,79,108,0.25)" }}>
      <div className="text-4xl mb-3">🛡️</div>
      <h3 className="font-bold mb-1" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>
        Rating Submitted
      </h3>
      <p className="text-sm" style={{ color: "rgba(223,182,178,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>
        The freelancer's ZK reputation proof has been updated. Your exact rating is never revealed.
      </p>
    </div>
  );

  return (
    <div className="rounded-2xl p-6"
      style={{ background: "rgba(43,18,76,0.4)", border: "1px solid rgba(133,79,108,0.25)" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-5" style={{ borderBottom: "1px solid rgba(133,79,108,0.12)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #522B5B, #854F6C)" }}>
          ⭐
        </div>
        <div>
          <h3 className="font-bold" style={{ fontFamily: "Syne, sans-serif", color: "#DFB6B2" }}>
            Rate This Freelancer
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "rgba(223,182,178,0.4)", fontFamily: "Space Grotesk, sans-serif" }}>
            Your rating is private — only a ZK proof is published
          </p>
        </div>
      </div>

      {/* Stars */}
      <div className="mb-2">
        <p className="text-xs font-semibold mb-3 tracking-widest uppercase"
          style={{ color: "rgba(133,79,108,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>
          Your Rating
        </p>
        <div className="flex items-center gap-3">
          {[1,2,3,4,5].map(star => (
            <button key={star}
              onClick={() => setScore(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-all duration-150"
              style={{ transform: (hover || score) >= star ? "scale(1.3)" : "scale(1)", fontSize: "28px" }}>
              <span style={{ color: (hover || score) >= star ? "#DFB6B2" : "rgba(133,79,108,0.25)" }}>★</span>
            </button>
          ))}
          {(hover || score) > 0 && (
            <span className="text-sm ml-1" style={{ color: "rgba(223,182,178,0.6)", fontFamily: "Space Grotesk, sans-serif" }}>
              {LABELS[hover || score]}
            </span>
          )}
        </div>
      </div>

      {/* Score bar visual */}
      {score > 0 && (
        <div className="mb-5 mt-3">
          <div className="w-full rounded-full h-1.5" style={{ background: "rgba(133,79,108,0.15)" }}>
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${score * 20}%`, background: "linear-gradient(90deg, #522B5B, #DFB6B2)" }} />
          </div>
        </div>
      )}

      {/* Review */}
      <div className="mb-5">
        <p className="text-xs font-semibold mb-2 tracking-widest uppercase"
          style={{ color: "rgba(133,79,108,0.7)", fontFamily: "Space Grotesk, sans-serif" }}>
          Review (Optional)
        </p>
        <textarea value={review} onChange={e => setReview(e.target.value)}
          placeholder="Describe your experience working with this freelancer..."
          rows={3}
          className="w-full rounded-xl p-4 text-sm outline-none resize-none"
          style={{ background: "rgba(25,0,25,0.6)", border: "1px solid rgba(133,79,108,0.2)", color: "#DFB6B2", fontFamily: "Space Grotesk, sans-serif", lineHeight: "1.6" }}
          onFocus={e => e.target.style.border = "1px solid rgba(133,79,108,0.5)"}
          onBlur={e => e.target.style.border = "1px solid rgba(133,79,108,0.2)"}/>
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-3 p-4 rounded-xl mb-5"
        style={{ background: "rgba(133,79,108,0.06)", border: "1px solid rgba(133,79,108,0.12)" }}>
        <span style={{ color: "#854F6C", fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>🔒</span>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(223,182,178,0.5)", fontFamily: "Space Grotesk, sans-serif" }}>
          Your exact rating is <strong style={{ color: "rgba(223,182,178,0.75)" }}>never shown</strong> to other clients.
          Only a cryptographic ZK proof verifying whether the freelancer meets a quality threshold is published publicly.
        </p>
      </div>

      <button onClick={handleSubmit} disabled={loading || score === 0}
        className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, #522B5B, #854F6C)",
          color: "#FBE4D8",
          opacity: score === 0 ? 0.35 : 1,
          boxShadow: score > 0 ? "0 0 25px rgba(133,79,108,0.3)" : "none",
          fontFamily: "Space Grotesk, sans-serif",
        }}>
        {loading ? (
          <><span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>Updating ZK Proof...</span></>
        ) : (
          <><span>🛡️</span><span>Submit & Update ZK Proof</span></>
        )}
      </button>
    </div>
  );
};

export default RateFreelancer;
