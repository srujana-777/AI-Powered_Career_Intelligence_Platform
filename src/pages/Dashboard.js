import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Layout from "../components/Layout";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");

    if (!email) {
      navigate("/login");
    }
  }, [navigate]);

  const name = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("latestCareerInsights");
    navigate("/login");
  };

  const features = [
    {
      icon: "📂",
      title: "My Resumes",
      route: "/my-resumes",
    },
    {
      icon: "🤖",
      title: "ATS Analysis",
      route: "/ats-analysis",
    },
    {
      icon: "🎯",
      title: "Skill Gap Analysis",
      route: "/skill-gap",
    },
    {
      icon: "💼",
      title: "Career Recommendation",
      route: "/career",
    },
    {
      icon: "🏢",
      title: "Job Recommendation",
      route: "/jobs",
    },
    {
      icon: "📚",
      title: "Course Recommendation",
      route: "/courses",
    },
    {
      icon: "📈",
      title: "Dashboard Analytics",
      route: "/dashboard-analytics",
    },
    {
      icon: "💰",
      title: "Salary Prediction",
      route: "/salary-prediction",
    },
    {
      icon: "🧠",
      title: "CS Interview Prep",
      route: "/interview-prep",
    },
  ];
  return (
    <Layout>
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f6fb",
        padding: "10px",
        fontFamily: "Arial",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
          color: "white",
          padding: "15px",
          borderRadius: "12px",
          marginBottom: "15px",
          position: "relative",
          textAlign: "center",
        }}
      >
        <button
          onClick={() => navigate("/edit-profile")}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "10px 18px",
            background: "white",
            color: "#2563eb",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ✏ Edit Profile
        </button>

        <h1
          style={{
            color: "#FFD700",
            marginBottom: "10px",
            padding:"10px",
            borderRadius:"12px",
            margin:"0",
          }}
        >
          🚀 AI Career Intelligence Platform
        </h1>

        <p
          style={{
            color: "#e5e7eb",
            fontSize: "18px",
            marginBottom: "15px",
          }}
        >
          Smart Resume Analysis • Career Guidance • AI Insights
        </p>

        <h2>Welcome, {name} 👋</h2>
      </div>

      <h2
        style={{
          textAlign: "center",
          color: "#1e293b",
          marginTop: "10px",
          fontSize: "22px",
        }}
      >
        Platform Features
      </h2>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "15px",
        }}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            onClick={() => {
              if (feature.route) {
                navigate(feature.route);
              } else {
                alert(feature.title + " is under development.");
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
            style={{
              width: "220px",
              height: "120px",
              background: "white",
              borderRadius: "15px",
              boxShadow: "0 6px 15px rgba(0,0,0,0.12)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "36px",
                marginBottom: "15px",
              }}
            >
              {feature.icon}
            </div>

            <h3
              style={{
                textAlign: "center",
                color: "#1e293b",
                fontSize: "18px",
                margin: 0,
              }}
            >
              {feature.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            padding: "12px 35px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
    </Layout>
  );
}

export default Dashboard;
