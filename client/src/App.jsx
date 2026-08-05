import { Routes, Route, Navigate } from "react-router-dom";
import RoleGate from "./pages/RoleGate";
import ClientLogin from "./pages/client/ClientLogin";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientPostJob from "./pages/client/ClientPostJob";
import ClientMyJobs from "./pages/client/ClientMyJobs";
import ClientActiveJobs from "./pages/client/ClientActiveJobs";
import ClientProfile from "./pages/client/ClientProfile";
import ClientNotifications from "./pages/client/ClientNotifications";
import ClientJobDetail from "./pages/client/ClientJobDetail";
import ClientTopFreelancers from "./pages/client/ClientTopFreelancers";
import FreelancerLogin from "./pages/freelancer/FreelancerLogin";
import FreelancerDashboard from "./pages/freelancer/FreelancerDashboard";
import FreelancerJobs from "./pages/freelancer/FreelancerJobs";
import FreelancerBids from "./pages/freelancer/FreelancerBids";
import FreelancerActiveWork from "./pages/freelancer/FreelancerActiveWork";
import FreelancerProfile from "./pages/freelancer/FreelancerProfile";
import FreelancerNotifications from "./pages/freelancer/FreelancerNotifications";
import FreelancerJobDetail from "./pages/freelancer/FreelancerJobDetail";
import FreelancerSkillVerify from "./pages/freelancer/FreelancerSkillVerify";
import FreelancerReputation from "./pages/freelancer/FreelancerReputation";
import FreelancerRecommendations from "./pages/freelancer/FreelancerRecommendations";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleGate />} />
      <Route path="/client/login" element={<ClientLogin />} />
      <Route path="/client/dashboard" element={<ClientDashboard />} />
      <Route path="/client/post-job" element={<ClientPostJob />} />
      <Route path="/client/my-jobs" element={<ClientMyJobs />} />
      <Route path="/client/active-jobs" element={<ClientActiveJobs />} />
      <Route path="/client/job/:id" element={<ClientJobDetail />} />
      <Route path="/client/profile" element={<ClientProfile />} />
      <Route path="/client/notifications" element={<ClientNotifications />} />
      <Route path="/client/top-freelancers" element={<ClientTopFreelancers />} />
      <Route path="/freelancer/login" element={<FreelancerLogin />} />
      <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
      <Route path="/freelancer/jobs" element={<FreelancerJobs />} />
      <Route path="/freelancer/recommended" element={<FreelancerRecommendations />} />
      <Route path="/freelancer/bids" element={<FreelancerBids />} />
      <Route path="/freelancer/active-work" element={<FreelancerActiveWork />} />
      <Route path="/freelancer/job/:id" element={<FreelancerJobDetail />} />
      <Route path="/freelancer/profile" element={<FreelancerProfile />} />
      <Route path="/freelancer/notifications" element={<FreelancerNotifications />} />
      <Route path="/freelancer/skill-verify" element={<FreelancerSkillVerify />} />
      <Route path="/freelancer/reputation" element={<FreelancerReputation />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
