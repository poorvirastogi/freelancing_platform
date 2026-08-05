import { useState } from "react";
import API from "../utils/api";

const SubmitWork = ({ jobId, milestones, onSubmitted }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [milestoneIndex, setMilestoneIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file");
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("message", message);
      formData.append("milestoneIndex", milestoneIndex);
      await API.post(`/submissions/${jobId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit work");
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="bg-green-900/30 border border-green-700 rounded-2xl p-6">
      <div className="text-green-400 font-semibold mb-1">✅ Work submitted!</div>
      <p className="text-gray-400 text-sm">Waiting for client to review and release payment.</p>
    </div>
  );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="font-semibold mb-4">📤 Submit Your Work</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {milestones && milestones.length > 0 && (
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Submitting for Milestone</label>
            <select value={milestoneIndex} onChange={e => setMilestoneIndex(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500">
              {milestones.map((m, i) => (
                <option key={i} value={i}>{m.title} ({m.percentage}%)</option>
              ))}
            </select>
          </div>
        )}
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-violet-500 transition-colors"
          onClick={() => document.getElementById("fileInput").click()}>
          <input id="fileInput" type="file" onChange={e => setFile(e.target.files[0])} className="hidden"
            accept=".pdf,.zip,.png,.jpg,.jpeg,.txt,.doc,.docx"/>
          {file ? (
            <div>
              <div className="text-violet-400 font-medium">{file.name}</div>
              <div className="text-gray-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">📁</div>
              <div className="text-gray-400 text-sm">Click to upload your work file</div>
              <div className="text-gray-600 text-xs mt-1">PDF, ZIP, Images, Documents (max 10MB)</div>
            </div>
          )}
        </div>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Add a message (optional)..." rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm resize-none"/>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading || !file}
          className="bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
          {loading ? "Uploading..." : "Submit Work"}
        </button>
      </form>
    </div>
  );
};

export default SubmitWork;
