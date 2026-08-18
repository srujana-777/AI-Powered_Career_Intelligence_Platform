import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: "🏠", title: "Dashboard", route: "/dashboard" },
    { icon: "📂", title: "My Resumes", route: "/my-resumes" },
    { icon: "🤖", title: "ATS Analysis", route: "/ats-analysis" },
    { icon: "📝", title: "Resume Improvement", route: "/resume-improvement" },
    { icon: "🎯", title: "Skill Gap Analysis", route: "/skill-gap" },
    { icon: "💼", title: "Career Recommendation", route: "/career" },
    { icon: "🏢", title: "Job Recommendation", route: "/jobs" },
    { icon: "📚", title: "Course Recommendation", route: "/courses" },
    { icon: "💰", title: "Salary Prediction", route: "/salary-prediction" },
    { icon: "📝", title: "Resume Builder", route: "/resume-builder" },
    { icon: "🧠", title: "Interview Prep", route: "/interview-prep" },
    { icon: "📊", title: "DashboardAnalytics", route: "/dashboard-analytics" },
    { icon: "👤", title: "Profile", route: "/edit-profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("latestCareerInsights");
    navigate("/login");
  };

  return (
    <div
      style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "220px",
      height: "100vh",
      background: "#1e3a8a",
      color: "white",
      padding: "15px",
      boxSizing: "border-box",
      overflowY: "auto",
      overflowX: "hidden",
      zIndex: 1000,
      boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
    }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "30px",
          color: "#FFD700",
        }}
      >
        AI Career
      </h2>

      {menuItems.map((item) => (
        <div
          key={item.route}
          onClick={() => navigate(item.route)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
            cursor: "pointer",
            background:
              location.pathname === item.route
                ? "#2563eb"
                : "transparent",
          }}
        >
          <span style={{ fontSize: "20px" }}>{item.icon}</span>

          <span>{item.title}</span>
        </div>
      ))}

      <button
        onClick={handleLogout}
        style={{
          width: "100%",
          marginTop: "30px",
          padding: "12px",
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

export default Sidebar;
