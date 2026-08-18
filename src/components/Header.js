import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const name = localStorage.getItem("name");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        height: "80px",
        background: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Left */}
      <div>
        <h2
          style={{
            margin: 0,
            color: "#1e3a8a",
          }}
        >
          🚀 AI Career Intelligence Platform
        </h2>

        <p
          style={{
            margin: "5px 0 0 0",
            color: "gray",
            fontSize: "14px",
          }}
        >
          {today}
        </p>
      </div>

      {/* Right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            color: "#1e293b",
          }}
        >
          👋 Welcome, {name}
        </span>

        <button
          onClick={() => navigate("/edit-profile")}
          style={{
            padding: "10px 18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}

export default Header;