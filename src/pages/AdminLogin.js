import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Unable to sign in.");
      localStorage.setItem("adminSession", data.admin_session);
      localStorage.setItem("adminEmail", data.email);
      navigate("/admin/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", background: "linear-gradient(135deg, #0f172a, #1e3a8a)" }}>
    <form onSubmit={submit} style={{ width: "min(420px, 100%)", padding: "38px", borderRadius: "18px", background: "white", boxShadow: "0 24px 60px rgba(0,0,0,.28)" }}>
      <p style={{ margin: 0, color: "#2563eb", fontWeight: 700 }}>CAREERINTEL AI</p>
      <h1 style={{ margin: "8px 0", color: "#0f172a" }}>Admin sign in</h1>
      <p style={{ color: "#64748b", marginBottom: "26px" }}>Access platform operations and analytics.</p>
      <label style={{ display: "block", fontWeight: 600 }}>Admin email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "12px", marginTop: "8px", border: "1px solid #cbd5e1", borderRadius: "8px" }} /></label>
      <label style={{ display: "block", fontWeight: 600, marginTop: "18px" }}>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "12px", marginTop: "8px", border: "1px solid #cbd5e1", borderRadius: "8px" }} /></label>
      {error && <p role="alert" style={{ color: "#b91c1c", fontSize: "14px" }}>{error}</p>}
      <button disabled={isLoading} type="submit" style={{ width: "100%", padding: "13px", border: 0, borderRadius: "8px", color: "white", background: "#2563eb", marginTop: "24px", cursor: "pointer" }}>{isLoading ? "Signing in…" : "Sign in to admin"}</button>
    </form>
  </main>;
}

export default AdminLogin;
