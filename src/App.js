import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import EditProfile from "./pages/EditProfile";
import MyResumes from "./pages/MyResumes";
import ViewResume from "./pages/ViewResume";  
import UpdateResume from "./pages/UpdateResume";
import ATSAnalysis from "./pages/ATSAnalysis";
import SkillGapAnalysis from "./pages/SkillGapAnalysis";
import CareerRecommendation from "./pages/CareerRecommendation";
import SalaryPrediction from "./pages/SalaryPrediction";
import JobRecommendation from "./pages/JobRecommendation";
import CourseRecommendation from "./pages/CourseRecommendation";
import DashboardAnalytics from "./pages/DashboardAnalytics";
import ResumeImprovement from "./pages/ResumeImprovement";
import ResumeBuilder from "./pages/ResumeBuilder";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import InterviewPrep from "./pages/InterviewPrep";
function AppContent() {
  const location = useLocation();
  return (
    <>
      {!location.pathname.startsWith("/admin") && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload_resume" element={<ResumeUpload />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/my-resumes" element={<MyResumes />} />
        <Route path="/view-resume/:id" element={<ViewResume />} />
        <Route path="/update-resume/:id" element={<UpdateResume />} />
        <Route path="/ats-analysis" element={<ATSAnalysis />} />
        <Route path="/skill-gap" element={<SkillGapAnalysis />} />
        <Route path="/career" element={<CareerRecommendation />} />
        <Route path="/salary-prediction" element={<SalaryPrediction />} />
        <Route path="/jobs" element={<JobRecommendation />} />
        <Route path="/courses" element={<CourseRecommendation />} />
        <Route path="/dashboard-analytics" element={<DashboardAnalytics />} />
        <Route path="/resume-improvement" element={<ResumeImprovement />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

      </Routes>
    </>
  );
}

function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>;
}

export default App;
