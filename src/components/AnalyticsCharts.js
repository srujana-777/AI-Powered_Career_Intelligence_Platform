import React from "react";
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
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from "recharts";

function AnalyticsCharts({ data }) {
  const matchingSkills = data.matching_skills || [];
  const missingSkills = data.missing_skills || [];
  const totalSkills = matchingSkills.length + missingSkills.length;
  const matchPercentage = totalSkills > 0 ? Math.round((matchingSkills.length / totalSkills) * 100) : 0;

  // 1. Skill Data for Bar & Pie
  const skillBarData = [
    { name: "Matching Skills", value: matchingSkills.length, fill: "#10b981" },
    { name: "Missing Skills", value: missingSkills.length, fill: "#ef4444" },
  ];

  const skillPieData = [
    { name: "Matching", value: matchingSkills.length, color: "#10b981" },
    { name: "Missing", value: missingSkills.length, color: "#f43f5e" },
  ];

  // 2. Feature Activity Breakdown Chart
  const activityData = [
    { feature: "Resumes", count: data.total_resumes || 0, fill: "#3b82f6" },
    { feature: "ATS Scans", count: data.total_ats_analyses || 0, fill: "#10b981" },
    { feature: "Skill Gap", count: data.total_skill_gaps || 0, fill: "#f59e0b" },
    { feature: "Career Recs", count: data.total_career_recommendations || 0, fill: "#ec4899" },
    { feature: "Job Recs", count: data.total_job_recommendations || 0, fill: "#0ea5e9" },
    { feature: "Course Recs", count: data.total_course_recommendations || 0, fill: "#8b5cf6" },
    { feature: "Salary Pred", count: data.total_salary_predictions || 0, fill: "#14b8a6" },
  ];

  // 3. Predicted Salary Growth Trajectory (Mock / Estimated Benchmark Data)
  const salaryBenchmarkData = [
    { exp: "Fresher", salary: data.average_salary ? Math.round(data.average_salary * 0.6) : 5 },
    { exp: "1-3 Yrs", salary: data.average_salary ? Math.round(data.average_salary * 0.85) : 8 },
    { exp: "3-5 Yrs", salary: data.average_salary ? Math.round(data.average_salary) : 12 },
    { exp: "5-8 Yrs", salary: data.average_salary ? Math.round(data.average_salary * 1.4) : 18 },
    { exp: "8+ Yrs", salary: data.average_salary ? Math.round(data.average_salary * 1.9) : 25 },
  ];

  const careers = data.recommended_careers || [];
  const courses = data.recommended_courses || [];

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #f1f5f9",
    transition: "all 0.3s ease",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", marginTop: "10px" }}>
      
      {/* SECTION 1: Skills Analysis & Pie Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
        
        {/* Skill Match Bar Chart */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ color: "#1e3a8a", margin: 0, fontSize: "18px", fontWeight: "700" }}>
              📊 Skill Match vs Gap Distribution
            </h3>
            <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
              Match Rate: {matchPercentage}%
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#166534", padding: "10px", borderRadius: "10px", textAlign: "center" }}>
              <span style={{ display: "block", fontSize: "12px" }}>Matching Skills</span>
              <strong style={{ fontSize: "20px" }}>{matchingSkills.length}</strong>
            </div>
            <div style={{ flex: 1, background: "#fff1f2", border: "1px solid #fecdd3", color: "#9f1239", padding: "10px", borderRadius: "10px", textAlign: "center" }}>
              <span style={{ display: "block", fontSize: "12px" }}>Missing Skills</span>
              <strong style={{ fontSize: "20px" }}>{missingSkills.length}</strong>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={skillBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: "8px", border: "none" }}
                itemStyle={{ color: "#38bdf8" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                {skillBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Match Donut Chart */}
        <div style={cardStyle}>
          <h3 style={{ color: "#1e3a8a", marginBottom: "15px", fontSize: "18px", fontWeight: "700" }}>
            🍩 Skill Compatibility Share
          </h3>
          <div style={{ position: "relative", height: "220px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={skillPieData.filter(d => d.value > 0).length > 0 ? skillPieData : [{ name: "No Data", value: 1, color: "#cbd5e1" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {skillPieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: "8px", border: "none" }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", textAlign: "center", pointerEvents: "none" }}>
              <span style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b" }}>{matchPercentage}%</span>
              <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>Matched</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: Platform Feature Usage Activity Chart */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ color: "#1e3a8a", margin: 0, fontSize: "18px", fontWeight: "700" }}>
            ⚡ Activity & Intelligence Usage Breakdown
          </h3>
          <span style={{ fontSize: "13px", color: "#64748b" }}>Total AI Analyses & Recommendations</span>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="feature" tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: "8px", border: "none" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
              {activityData.map((entry, index) => (
                <Cell key={`act-cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SECTION 3: Salary Trajectory & Skills Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
        
        {/* Estimated Salary Growth Area Chart */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ color: "#1e3a8a", margin: 0, fontSize: "18px", fontWeight: "700" }}>
              📈 Estimated Salary Growth Trajectory
            </h3>
            <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
              Avg: ₹{data.average_salary ? data.average_salary.toFixed(1) : "0"} LPA
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salaryBenchmarkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="exp" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} unit="L" />
              <Tooltip contentStyle={{ background: "#0f172a", color: "#fff", borderRadius: "8px", border: "none" }} formatter={(val) => [`₹${val} LPA`, "Est Salary"]} />
              <Area type="monotone" dataKey="salary" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#salaryGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Skills List Box */}
        <div style={cardStyle}>
          <h3 style={{ color: "#1e3a8a", marginBottom: "15px", fontSize: "18px", fontWeight: "700" }}>
            🎯 Detected Skills Breakdown
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#15803d", display: "block", marginBottom: "8px" }}>
                ✅ Matching Skills ({matchingSkills.length})
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "100px", overflowY: "auto" }}>
                {matchingSkills.length > 0 ? (
                  matchingSkills.map((skill, index) => (
                    <span key={index} style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "#94a3b8", fontSize: "13px" }}>No matching skills detected yet.</span>
                )}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#b91c1c", display: "block", marginBottom: "8px" }}>
                ❌ Missing Skills Gap ({missingSkills.length})
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "100px", overflowY: "auto" }}>
                {missingSkills.length > 0 ? (
                  missingSkills.map((skill, index) => (
                    <span key={index} style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                      ! {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "#94a3b8", fontSize: "13px" }}>No skill gaps identified.</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 4: Recommended Careers & Courses Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
        
        {/* Careers */}
        <div style={cardStyle}>
          <h3 style={{ color: "#1e3a8a", marginBottom: "15px", fontSize: "18px", fontWeight: "700" }}>
            💼 Recommended Career Roles
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {careers.length > 0 ? (
              careers.map((career, index) => (
                <div
                  key={index}
                  style={{
                    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                    color: "#1d4ed8",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                    border: "1px solid #bfdbfe",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span>🎯</span>
                  <span>{career}</span>
                </div>
              ))
            ) : (
              <p style={{ color: "#64748b", fontSize: "14px" }}>No career recommendations generated yet.</p>
            )}
          </div>
        </div>

        {/* Courses */}
        <div style={cardStyle}>
          <h3 style={{ color: "#1e3a8a", marginBottom: "15px", fontSize: "18px", fontWeight: "700" }}>
            📚 Recommended Learning Courses
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <div
                  key={index}
                  style={{
                    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                    color: "#047857",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "14px",
                    border: "1px solid #a7f3d0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span>📖</span>
                  <span>{course}</span>
                </div>
              ))
            ) : (
              <p style={{ color: "#64748b", fontSize: "14px" }}>No course recommendations generated yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default AnalyticsCharts;