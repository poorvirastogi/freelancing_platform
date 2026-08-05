import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";
import API from "../utils/api";

const Profile = () => {
  const { user, account } = useWallet();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    skills: user?.skills?.join(", ") || "",
    role: user?.role || "both",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.put("/users/profile", {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="text-gray-400 mb-8">Manage your freelancer profile</p>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
          <div className="text-violet-400 font-mono text-sm">{account}</div>
        </div>
        <form onSubmit={handleSave}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Username</label>
            <input value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Your name or handle"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"/>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Bio</label>
            <textarea value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell clients about yourself..." rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"/>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Skills</label>
            <input value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="React, Solidity, Node.js"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"/>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">I am a</label>
            <select value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
              <option value="both">Both Client & Freelancer</option>
              <option value="client">Client only</option>
              <option value="freelancer">Freelancer only</option>
            </select>
          </div>
          {saved && (
            <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded-xl text-sm">
              ✅ Profile saved!
            </div>
          )}
          <button type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition-all">
            Save Profile
          </button>
        </form>
      </main>
    </div>
  );
};

export default Profile;