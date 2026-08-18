import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg,#0f172a,#1d4ed8,#3b82f6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Side */}
        <div style={{ width: "50%" }}>
          <h1
            style={{
              color: "white",
              fontSize: "48px",
              marginBottom: "15px",
              lineHeight: "60px",
            }}
          >
            🤖 AI-Powered Career
            <br />
            Intelligence Platform
          </h1>

          <h2
            style={{
              color: "#FFD700",
              marginBottom: "20px",
            }}
          >
            Smart Resume Analysis & Career Guidance
          </h2>

          <p
            style={{
              fontSize: "18px",
              lineHeight: "30px",
              color: "#E5E7EB",
            }}
          >
            Upload your resume and receive AI-powered
            career recommendations, skill gap analysis,
            learning resources, and salary predictions.
          </p>

          <button
            onClick={() => navigate("/login")}
            style={{
              marginTop: "30px",
              background: "#FFD700",
              color: "#000",
              border: "none",
              padding: "15px 35px",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🚀 Get Started
          </button>
        </div>

        {/* Right Side */}
        <div
          style={{
            width: "45%",
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "20px",
          }}
        >
          {[
            ["📄", "Resume Upload"],
            ["🤖", "Resume Analysis"],
            ["🎯", "Skill Gap"],
            ["💼", "Career Advice"],
            ["📚", "Learning"],
            ["💰", "Salary"],
          ].map(([icon, title], index) => (
            <div
              key={index}
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                borderRadius: "18px",
                padding: "20px",
                textAlign: "center",
                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ fontSize: "45px" }}>{icon}</div>

              <h3>{title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;