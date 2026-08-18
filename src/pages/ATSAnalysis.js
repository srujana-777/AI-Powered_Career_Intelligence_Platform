import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function ATSAnalysis() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const savedInsights = (() => {
    try { return JSON.parse(localStorage.getItem("latestCareerInsights") || "{}"); } catch { return {}; }
  })();
  const [jobDescription, setJobDescription] = useState(savedInsights.jobDescription || "");
  const [result, setResult] = useState(savedInsights.ats || null);

  const email = localStorage.getItem("email");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/resumes/${email}`)
      .then((res) => res.json())
      .then((data) => {
        setResumes(data);

        if (data.length > 0) {
          setSelectedResume(savedInsights.resumeId || data[0].id);
        }
      })
      .catch((err) => console.log(err));
  }, [email, savedInsights.resumeId]);

  const analyzeResume = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/ats-analysis",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_id: selectedResume,
          job_description: jobDescription,
        }),
      }
    );

    const data = await response.json();

    setResult(data);
  };

  return (
    <Layout>
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "30px",
        background: "white",
        borderRadius: "10px",
        boxShadow: "0 0 10px gray",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#2563eb" }}>
        ATS Resume Analysis
      </h1>

      <h3>Select Resume</h3>

      <select
        value={selectedResume}
        onChange={(e) => setSelectedResume(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
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
        rows="10"
        placeholder="Paste Job Description..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
        }}
      />

      <button
        onClick={analyzeResume}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "12px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Analyze Resume
      </button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>ATS Score: {result.score}%</h2>

          <h3>Matching Skills</h3>
          <ul>
            {result.matching_skills.map((skill, index) => (
              <li key={index}>✅ {skill}</li>
            ))}
          </ul>

          <h3>Missing Skills</h3>
          <ul>
            {result.missing_skills.map((skill, index) => (
              <li key={index}>❌ {skill}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "30px",
          background: "#16a34a",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ← Back to Dashboard
      </button>
    </div>
    </Layout>
  );
}

export default ATSAnalysis;
