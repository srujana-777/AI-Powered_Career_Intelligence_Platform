import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      navigate("/dashboard");
    }
  }, [navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Save login session
      localStorage.setItem("email", data.email);
      localStorage.setItem("name", data.name);

      alert(data.message);

      navigate("/dashboard");
    } else {
      alert(data.detail || data.message);
    }

  } catch (error) {
    console.error(error);
    alert("Unable to connect to backend.");
  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#0f172a,#2563eb)",
      }}
    >
      <div
        style={{
          background: "white",
          width: "380px",
          padding: "35px",
          borderRadius: "15px",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        }}
      >
        <h1 style={{ color: "#2563eb" }}>
          AI Career Intelligence
        </h1>

        <p>Login to continue</p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            borderRadius: "8px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            borderRadius: "8px",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          Login
        </button>

        <p style={{ marginTop: "20px" }}>
          Don't have an account?{" "}
          <Link to="/signup">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;