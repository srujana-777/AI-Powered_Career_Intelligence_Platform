import { useEffect, useState } from "react";
import Layout from "../components/Layout";

function ResumeImprovement() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [result, setResult] = useState(null);

  const email = localStorage.getItem("email");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/resumes/${email}`)
      .then((res) => res.json())
      .then((data) => setResumes(data))
      .catch((err) => console.log(err));
  }, [email]);

  const handleAnalyze = async () => {
    if (!resumeId) {
      alert("Please select a resume");
      return;
    }

    const response = await fetch(
      "http://127.0.0.1:8000/resume-improvement",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_id: Number(resumeId),
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
          margin: "auto",
          padding: "30px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2563eb",
            marginBottom: "30px",
          }}
        >
          📄 Resume Improvement Recommendation
        </h1>

        <select
          value={resumeId}
          onChange={(e) => setResumeId(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
          }}
        >
          <option value="">Select Resume</option>

          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.resume_name}
            </option>
          ))}
        </select>

        <button
          onClick={handleAnalyze}
          style={{
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Analyze Resume
        </button>

        {result && (
          <div
            style={{
              marginTop: "30px",
              background: "#fff",
              padding: "25px",
              borderRadius: "10px",
              boxShadow: "0 5px 12px rgba(0,0,0,.1)",
            }}
          >
            <h2>✅ Strengths</h2>

            <ul>
              {result.strengths.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>⚠ Weaknesses</h2>

            <ul>
              {result.weaknesses.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>💡 Recommendations</h2>

            <ul>
              {result.recommendations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>📝 Improved Professional Summary</h2>

            <div
              style={{
                background: "#f8fafc",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              {result.improved_summary}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ResumeImprovement;