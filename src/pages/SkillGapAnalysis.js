import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function SkillGapAnalysis() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const savedInsights = (() => {
    try { return JSON.parse(localStorage.getItem("latestCareerInsights") || "{}"); } catch { return {}; }
  })();
  const latestResumeId = savedInsights.resumeId;
  const [jobDescription, setJobDescription] = useState(savedInsights.jobDescription || "");
  const [result, setResult] = useState(savedInsights.skillGap || null);

  const email = localStorage.getItem("email");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/resumes/${email}`)
      .then((res) => res.json())
      .then((data) => {
        setResumes(data);

        if (data.length > 0) {
          setSelectedResume(latestResumeId || data[0].id);
        }
      });
  }, [email, latestResumeId]);

  const analyzeSkillGap = async () => {
    if (!selectedResume) {
      alert("Please select a resume.");
      return;
    }

    if (jobDescription.trim() === "") {
      alert("Please enter a Job Description.");
      return;
    }

    const response = await fetch("http://127.0.0.1:8000/skill-gap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume_id: selectedResume,
        job_description: jobDescription,
      }),
    });

    const data = await response.json();

    setResult(data);
  };

  return (
    <Layout>
      <div
    
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 0 12px gray",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#2563eb",
          marginBottom: "30px",
        }}
      >
        🎯 Skill Gap Analysis
      </h1>

      <h3>Select Resume</h3>

      <select
        value={selectedResume}
        onChange={(e) => setSelectedResume(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
        }}
      >
        {resumes.map((resume) => (
          <option key={resume.id} value={resume.id}>
            {resume.resume_name}
          </option>
        ))}
      </select>

      <h3>Job Description</h3>

      <textarea
        rows="12"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          resize: "vertical",
        }}
      />

      <button
        onClick={analyzeSkillGap}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "14px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Analyze Skill Gap
      </button>

      {result && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <h2>
            Overall Match Score: {result.score}%
          </h2>

          <hr />

          <h3 style={{ color: "green" }}>
            ✅ Matching Skills
          </h3>

          <ul>
            {result.matched_skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3 style={{ color: "red" }}>
            ❌ Missing Skills
          </h3>

          <ul>
            {result.missing_skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3 style={{ color: "#2563eb" }}>
            📚 Recommended Learning
          </h3>

          <ul>
            {result.missing_skills.map((skill, index) => (
              <li key={index}>
                Learn {skill} through online courses and projects.
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          textAlign: "center",
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "12px 25px",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
    </Layout>
  );
}

export default SkillGapAnalysis;
