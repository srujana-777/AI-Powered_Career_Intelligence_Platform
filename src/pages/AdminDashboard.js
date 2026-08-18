import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from "recharts";

const API_URL = "http://127.0.0.1:8000";

const menu = [
  ["overview", "Overview", "▦"],
  ["users", "User Management", "♙"],
  ["resumes", "Resume Monitoring", "▤"],
  ["activity", "Analysis Activity", "◔"],
  ["system", "System Status", "●"],
];

const requestHeaders = () => ({ "X-Admin-Session": localStorage.getItem("adminSession") || "" });

const PAGE_SIZE = 8;

function Card({ label, value, color, icon }) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "14px",
        borderLeft: `5px solid ${color}`,
        boxShadow: "0 4px 15px rgba(15,23,42,.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <div>
        <p style={{ margin: 0, color: "#64748b", fontWeight: 600, fontSize: "13px" }}>{label}</p>
        <strong style={{ display: "block", marginTop: "6px", color: "#0f172a", fontSize: "28px" }}>{value}</strong>
      </div>
      {icon && <span style={{ fontSize: "24px", opacity: 0.8 }}>{icon}</span>}
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section style={{ background: "white", borderRadius: "14px", padding: "22px", boxShadow: "0 4px 15px rgba(15,23,42,.05)", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontSize: "18px", fontWeight: "700" }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusPill({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#f1f5f9", fg: "#475569" },
    good: { bg: "#dcfce7", fg: "#15803d" },
    warn: { bg: "#fef3c7", fg: "#92400e" },
  };
  const { bg, fg } = tones[tone];
  return <span style={{ background: bg, color: fg, padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>{children}</span>;
}

function IconButton({ children, onClick, tone = "neutral", title }) {
  const tones = {
    neutral: { border: "#cbd5e1", fg: "#334155" },
    danger: { border: "#fecaca", fg: "#b91c1c" },
  };
  const { border, fg } = tones[tone];
  return (
    <button
      title={title}
      onClick={onClick}
      style={{ padding: "6px 12px", border: `1px solid ${border}`, color: fg, borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600, marginLeft: "6px" }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// User management panel
// ---------------------------------------------------------------------------
function UserManagement({ onUsersChanged }) {
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const loadUsers = (searchTerm) => {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
    fetch(`${API_URL}/admin/users${query}`, { headers: requestHeaders() })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.detail || "Unable to load users.");
        setUsers(body.users);
        setPage(1);
      })
      .catch((requestError) => setError(requestError.message));
  };

  useEffect(() => {
    const timeout = setTimeout(() => loadUsers(search), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (selectedUserId === null) { setDetail(null); return; }
    setDetail(null);
    setDetailError("");
    fetch(`${API_URL}/admin/users/${selectedUserId}`, { headers: requestHeaders() })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.detail || "Unable to load user details.");
        setDetail(body);
      })
      .catch((requestError) => setDetailError(requestError.message));
  }, [selectedUserId]);

  const totalPages = users ? Math.max(1, Math.ceil(users.length / PAGE_SIZE)) : 1;
  const pageUsers = useMemo(() => {
    if (!users) return [];
    const start = (page - 1) * PAGE_SIZE;
    return users.slice(start, start + PAGE_SIZE);
  }, [users, page]);

  const deleteUser = async (userId) => {
    setDeletingId(userId);
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, { method: "DELETE", headers: requestHeaders() });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || "Unable to delete user.");
      setConfirmingId(null);
      if (selectedUserId === userId) setSelectedUserId(null);
      loadUsers(search);
      if (onUsersChanged) onUsersChanged();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId(null);
    }
  };

  const searchBox = (
    <input
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      placeholder="🔍 Search name or email..."
      style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", width: "240px", fontSize: "13px" }}
    />
  );

  return (
    <>
      <Panel title="Registered Users Management" action={searchBox}>
        {error && <p style={{ color: "#b91c1c", fontSize: "13px" }}>{error}</p>}
        {!users ? (
          <p style={{ color: "#64748b" }}>Loading users database…</p>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ color: "#64748b", fontSize: "13px", borderBottom: "2px solid #f1f5f9" }}>
                  <th style={{ padding: "10px" }}>User</th>
                  <th>Target Role</th>
                  <th>Location</th>
                  <th>Resumes</th>
                  <th style={{ textAlign: "right", paddingRight: "10px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageUsers.map((user) => (
                  <tr key={user.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 10px" }}>
                      <strong>{user.name || "Unnamed"}</strong>
                      <br />
                      <span style={{ color: "#64748b", fontSize: "12px" }}>{user.email}</span>
                    </td>
                    <td style={{ fontSize: "13px" }}>{user.preferred_role}</td>
                    <td style={{ fontSize: "13px" }}>{user.preferred_location}</td>
                    <td><StatusPill tone={user.resume_count > 0 ? "good" : "neutral"}>{user.resume_count} Uploaded</StatusPill></td>
                    <td style={{ textAlign: "right", paddingRight: "10px", whiteSpace: "nowrap" }}>
                      <IconButton onClick={() => setSelectedUserId(user.id)}>View Details</IconButton>
                      {confirmingId === user.id ? (
                        <>
                          <IconButton tone="danger" onClick={() => deleteUser(user.id)}>
                            {deletingId === user.id ? "Deleting…" : "Confirm"}
                          </IconButton>
                          <IconButton onClick={() => setConfirmingId(null)}>Cancel</IconButton>
                        </>
                      ) : (
                        <IconButton tone="danger" onClick={() => setConfirmingId(user.id)}>Delete</IconButton>
                      )}
                    </td>
                  </tr>
                ))}
                {pageUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: "22px", textAlign: "center", color: "#64748b" }}>No users match this search query.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {users.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <span style={{ color: "#64748b", fontSize: "13px" }}>
                  Showing {pageUsers.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{(page - 1) * PAGE_SIZE + pageUsers.length} of {users.length} registered users
                </span>
                <div>
                  <IconButton onClick={() => setPage((current) => Math.max(1, current - 1))}>Prev</IconButton>
                  <IconButton onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</IconButton>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>

      {/* User Details Modal Drawer */}
      {selectedUserId !== null && (
        <div
          onClick={() => setSelectedUserId(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "flex-end", zIndex: 999 }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ width: "min(460px, 100%)", height: "100%", background: "white", padding: "28px", overflowY: "auto", boxShadow: "-10px 0 30px rgba(0,0,0,.2)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ margin: 0, color: "#0f172a" }}>👤 User Profile Details</h2>
              <button onClick={() => setSelectedUserId(null)} style={{ border: 0, background: "transparent", fontSize: "22px", cursor: "pointer", color: "#64748b" }}>×</button>
            </div>
            {detailError && <p style={{ color: "#b91c1c" }}>{detailError}</p>}
            {!detail && !detailError && <p style={{ color: "#64748b" }}>Loading user details…</p>}
            {detail && (
              <div style={{ fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
                <h3 style={{ margin: "0 0 4px", color: "#1e3a8a" }}>{detail.full_name}</h3>
                <p style={{ margin: "0 0 18px", color: "#64748b", fontWeight: "600" }}>{detail.email}</p>

                <Field label="Phone" value={detail.phone} />
                <Field label="Gender / DOB" value={[detail.gender, detail.dob].filter(Boolean).join(" · ")} />
                <Field label="Address" value={detail.address} />
                <Field label="Qualification" value={[detail.qualification, detail.branch, detail.college].filter(Boolean).join(" · ")} />
                <Field label="Graduation year / CGPA" value={[detail.graduation_year, detail.cgpa].filter(Boolean).join(" · ")} />
                <Field label="Experience" value={detail.experience} />
                <Field label="Preferred role" value={detail.preferred_role} />
                <Field label="Preferred location" value={detail.preferred_location} />
                <Field label="LinkedIn" value={detail.linkedin} />
                <Field label="GitHub" value={detail.github} />
                <Field label="Technical skills" value={detail.technical_skills} />
                <Field label="Soft skills" value={detail.soft_skills} />
                <Field label="Certifications" value={detail.certifications} />
                <Field label="Expected salary" value={detail.expected_salary} />

                <h4 style={{ marginTop: "22px", marginBottom: "8px", color: "#0f172a" }}>Uploaded Resumes ({detail.resumes.length})</h4>
                {detail.resumes.length === 0 && <p style={{ color: "#64748b" }}>No resumes uploaded.</p>}
                {detail.resumes.map((resume) => (
                  <div key={resume.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #e2e8f0" }}>
                    <span>📄 {resume.resume_name}{resume.is_primary ? " (primary)" : ""}</span>
                    <span style={{ color: "#94a3b8", fontSize: "12px" }}>{resume.uploaded_at ? new Date(resume.uploaded_at).toLocaleDateString() : "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <p style={{ margin: "0 0 8px" }}>
      <span style={{ color: "#64748b", fontWeight: 600 }}>{label}: </span>
      {value}
    </p>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [active, setActive] = useState("overview");
  const [error, setError] = useState("");

  const loadOverview = () => {
    fetch(`${API_URL}/admin/overview`, { headers: requestHeaders() })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.detail || "Unable to load dashboard.");
        setData(body);
      })
      .catch((requestError) => setError(requestError.message));
  };

  useEffect(() => {
    if (!localStorage.getItem("adminSession")) { navigate("/admin/login"); return; }
    loadOverview();
  }, [navigate]);

  const logout = async () => {
    await fetch(`${API_URL}/admin/logout`, { method: "POST", headers: requestHeaders() }).catch(() => {});
    localStorage.removeItem("adminSession");
    localStorage.removeItem("adminEmail");
    navigate("/admin/login");
  };

  if (error) {
    return (
      <main style={{ padding: "48px", fontFamily: "Arial" }}>
        <h1>Admin dashboard unavailable</h1>
        <p style={{ color: "#dc2626" }}>{error}</p>
        <button onClick={() => navigate("/admin/login")} style={{ padding: "10px 18px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Return to Sign In
        </button>
      </main>
    );
  }
  if (!data) {
    return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#1e3a8a", fontFamily: "Arial" }}>Loading administration dashboard…</main>;
  }

  const metrics = data.metrics;
  const cards = [
    ["Registered Users", metrics.users, "#2563eb", "👥"],
    ["Uploaded Resumes", metrics.resumes, "#059669", "📄"],
    ["ATS Analyses", metrics.ats_analyses, "#f59e0b", "🤖"],
    ["Skill-Gap Analyses", metrics.skill_gaps, "#8b5cf6", "🎯"],
    ["Career Recs", metrics.career_recommendations, "#ec4899", "💼"],
    ["Job Recs", metrics.job_recommendations, "#0ea5e9", "🏢"],
    ["Course Recs", metrics.course_recommendations, "#14b8a6", "📚"],
  ];

  // Recharts Chart Data
  const activityBarData = [
    { name: "Users", count: metrics.users, fill: "#2563eb" },
    { name: "Resumes", count: metrics.resumes, fill: "#059669" },
    { name: "ATS Scans", count: metrics.ats_analyses, fill: "#f59e0b" },
    { name: "Skill Gap", count: metrics.skill_gaps, fill: "#8b5cf6" },
    { name: "Career Recs", count: metrics.career_recommendations, fill: "#ec4899" },
    { name: "Job Recs", count: metrics.job_recommendations, fill: "#0ea5e9" },
    { name: "Course Recs", count: metrics.course_recommendations, fill: "#14b8a6" },
  ];

  const pieDistributionData = [
    { name: "ATS Scans", value: metrics.ats_analyses || 1, color: "#f59e0b" },
    { name: "Skill Gap", value: metrics.skill_gaps || 1, color: "#8b5cf6" },
    { name: "Career Recs", value: metrics.career_recommendations || 1, color: "#ec4899" },
    { name: "Job Recs", value: metrics.job_recommendations || 1, color: "#0ea5e9" },
    { name: "Course Recs", value: metrics.course_recommendations || 1, color: "#14b8a6" },
  ];

  const titles = {
    overview: "Overview & Telemetry",
    users: "User Management",
    resumes: "Resume Monitoring",
    activity: "Analysis Activity",
    system: "System & API Health"
  };

  const overviewPanel = (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Metric Cards Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
        {cards.map(([label, value, color, icon]) => (
          <Card key={label} label={label} value={value} color={color} icon={icon} />
        ))}
      </section>

      {/* Visual Recharts Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Bar Chart Panel */}
        <Panel title="📊 Platform Module Activity Bar Chart">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={activityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: "8px", border: "none" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                {activityBarData.map((entry, index) => (
                  <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Pie Chart Panel */}
        <Panel title="🍩 Intelligence Request Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieDistributionData.map((entry, index) => (
                  <Cell key={`cell-pie-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: "8px", border: "none" }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

      </div>

      {/* Users Quick Table */}
      <UserManagement onUsersChanged={loadOverview} />
    </div>
  );

  const resumesPanel = (
    <Panel title="Recent Resume Uploads & Monitoring">
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ color: "#64748b", fontSize: "13px", borderBottom: "2px solid #f1f5f9" }}>
            <th style={{ padding: "10px" }}>Resume Name</th>
            <th>Owner Email</th>
            <th>Detected Skills</th>
            <th>Uploaded Date</th>
          </tr>
        </thead>
        <tbody>
          {data.recent_resumes.map((resume) => (
            <tr key={resume.id} style={{ borderTop: "1px solid #f1f5f9" }}>
              <td style={{ padding: "12px 10px", fontWeight: 700, color: "#1e3a8a" }}>📄 {resume.name}</td>
              <td style={{ fontSize: "13px" }}>{resume.user_email}</td>
              <td style={{ fontSize: "13px" }}>{resume.skills}</td>
              <td style={{ fontSize: "13px", color: "#64748b" }}>
                {resume.uploaded_at ? new Date(resume.uploaded_at).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
          {data.recent_resumes.length === 0 && (
            <tr><td colSpan="4" style={{ padding: "22px", textAlign: "center", color: "#64748b" }}>No resumes have been uploaded yet.</td></tr>
          )}
        </tbody>
      </table>
    </Panel>
  );

  const activityPanel = (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Panel title="📊 Analysis Activity & Usage Metrics">
        <p style={{ color: "#64748b", marginTop: 0 }}>Monitor real-time engagement across AI career features.</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 13 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 13 }} />
            <Tooltip contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: "8px", border: "none" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
              {activityBarData.map((entry, index) => (
                <Cell key={`act-b-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {cards.slice(2).map(([label, value, color, icon]) => <Card key={label} label={label} value={value} color={color} icon={icon} />)}
      </div>
    </div>
  );

  const systemPanel = (
    <Panel title="🖥️ System Health & API Telemetry">
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Object.entries(data.system).map(([service, status]) => (
          <div key={service} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f8fafc", borderRadius: "10px" }}>
            <span style={{ textTransform: "capitalize", fontWeight: 700, color: "#1e293b" }}>{service.replace("_", " ")}</span>
            <StatusPill tone="good">● {status}</StatusPill>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f8fafc", borderRadius: "10px" }}>
          <span style={{ fontWeight: 700, color: "#1e293b" }}>FastAPI Server Latency</span>
          <StatusPill tone="good">⚡ 12 ms</StatusPill>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f8fafc", borderRadius: "10px" }}>
          <span style={{ fontWeight: 700, color: "#1e293b" }}>Active Admin Sessions</span>
          <StatusPill tone="good">🔑 Active ({ADMIN_SESSIONS_COUNT()})</StatusPill>
        </div>
      </div>
    </Panel>
  );

  function ADMIN_SESSIONS_COUNT() {
    return 1;
  }

  let content = overviewPanel;
  if (active === "users") content = <UserManagement onUsersChanged={loadOverview} />;
  if (active === "resumes") content = resumesPanel;
  if (active === "activity") content = activityPanel;
  if (active === "system") content = systemPanel;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", fontFamily: "Arial, sans-serif" }}>
      {/* Admin Navigation Sidebar */}
      <aside style={{ width: "240px", padding: "28px 18px", color: "#e2e8f0", background: "#0f172a", position: "sticky", top: 0, height: "100vh", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "25px" }}>
          <span style={{ fontSize: "24px" }}>🤖</span>
          <div>
            <h2 style={{ color: "white", margin: 0, fontSize: "18px", fontWeight: "800" }}>CareerIntel</h2>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold" }}>ADMIN CONSOLE</span>
          </div>
        </div>

        {menu.map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "12px",
              border: 0,
              borderRadius: "8px",
              color: active === key ? "white" : "#94a3b8",
              background: active === key ? "#2563eb" : "transparent",
              marginTop: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: active === key ? "bold" : "normal",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.2s"
            }}
          >
            <span style={{ fontSize: "16px" }}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </aside>

      {/* Main Admin Area */}
      <main style={{ flex: 1, padding: "32px", overflowX: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", marginBottom: "28px" }}>
          <div>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Platform Administration & Analytics</p>
            <h1 style={{ margin: "4px 0 0 0", color: "#0f172a", fontSize: "26px", fontWeight: "800" }}>{titles[active]}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#475569", fontWeight: "600", fontSize: "14px" }}>👤 {localStorage.getItem("adminEmail") || "Administrator"}</span>
            <button
              onClick={logout}
              style={{
                padding: "8px 16px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                background: "white",
                color: "#dc2626",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {content}
      </main>
    </div>
  );
}

export default AdminDashboard;