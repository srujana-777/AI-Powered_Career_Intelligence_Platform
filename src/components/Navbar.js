import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        background: "#0f172a",
        color: "white",
        padding: "18px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2>🤖 CareerIntel AI</h2>

      <div style={{ display: "flex", gap: "18px" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Home</Link>
        <Link to="/admin/login" style={{ color: "#bfdbfe", textDecoration: "none", fontWeight: "bold" }}>Admin</Link>
      </div>
    </nav>
  );
}

export default Navbar;
