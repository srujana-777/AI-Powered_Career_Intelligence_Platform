import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import AnalyticsCharts from "../components/AnalyticsCharts";

function DashboardAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const email = localStorage.getItem("email");

  const fetchAnalytics = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/dashboard-analytics/${email}`)
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading analytics:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (email) {
      fetchAnalytics();
    }
  }, [email]);

  if (loading || !analytics) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2 style={{ color: "#2563eb", marginBottom: "10px" }}>📊 Loading Career Intelligence Analytics...</h2>
          <p style={{ color: "#64748b" }}>Gathering resume ATS scores, skill gaps, and market benchmarks...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: "1200px", margin: "auto", padding: "10px 20px 40px" }}>
        
        {/* Hero Title Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
            color: "white",
            padding: "28px 24px",
            borderRadius: "16px",
            marginBottom: "25px",
            boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px"
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "800" }}>
              📊 AI Career Intelligence Dashboard
            </h1>
            <p style={{ margin: "5px 0 0 0", color: "#bfdbfe", fontSize: "15px" }}>
              Real-time telemetry on ATS match scores, skill gap analysis, recommended pathways, and market salary predictions.
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            style={{
              padding: "10px 18px",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s"
            }}
          >
            🔄 Refresh Analytics
          </button>
        </div>

        {/* Top 6 Analytics KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "25px",
          }}
        >
          <Card
            icon="🤖"
            title="ATS Compatibility"
            value={`${analytics.score}%`}
            subtitle={analytics.score >= 70 ? "High Match" : "Optimization Needed"}
            color="#2563eb"
          />

          <Card
            icon="📄"
            title="Resume Status"
            value={analytics.resume_status}
            subtitle={`${analytics.total_resumes || 0} Total Resumes`}
            color="#10b981"
          />

          <Card
            icon="📋"
            title="JD Alignment"
            value={analytics.job_description_status}
            subtitle={`${analytics.matching_skills?.length || 0} Matched Skills`}
            color="#f59e0b"
          />

          <Card
            icon="👤"
            title="Profile Readiness"
            value={`${analytics.profile_completion}%`}
            subtitle="Completed Profile"
            color="#8b5cf6"
          />

          <Card
            icon="💰"
            title="Predicted Salary"
            value={analytics.average_salary ? `₹${analytics.average_salary.toFixed(1)} LPA` : "N/A"}
            subtitle="Based on market role"
            color="#ec4899"
          />

          <Card
            icon="🎯"
            title="Career Insights"
            value={analytics.recommended_careers?.length || 0}
            subtitle="Matched Roles"
            color="#0ea5e9"
          />
        </div>

        {/* Charts & Interactive Visualizations */}
        <AnalyticsCharts data={analytics} />

      </div>
    </Layout>
  );
}

function Card({ icon, title, value, subtitle, color }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "20px",
        color: "#0f172a",
        boxShadow: "0 4px 15px rgba(15, 23, 42, 0.05)",
        border: "1px solid #f1f5f9",
        borderTop: `4px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s ease"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#64748b" }}>{title}</span>
        <span style={{ fontSize: "22px" }}>{icon}</span>
      </div>

      <h2
        style={{
          margin: "5px 0",
          fontSize: "28px",
          fontWeight: "800",
          color: color,
        }}
      >
        {value}
      </h2>

      <span
        style={{
          fontSize: "12px",
          color: "#94a3b8",
          fontWeight: "500"
        }}
      >
        {subtitle}
      </span>
    </div>
  );
}

export default DashboardAnalytics;