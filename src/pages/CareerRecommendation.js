import { useState, useEffect } from "react";
import Layout from "../components/Layout";

function CareerRecommendation() {
  const savedInsights = (() => {
    try {
      const value = JSON.parse(localStorage.getItem("latestCareerInsights") || "{}");
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  })();
  const latestResumeId = savedInsights.resumeId;
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [recommendations, setRecommendations] = useState(() => Array.isArray(savedInsights.careers) ? savedInsights.careers : []);

  const email = localStorage.getItem("email");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/resumes/${email}`)
      .then((res) => res.json())
      .then((data) => {
        setResumes(data);

        if (data.length > 0) {
          setSelectedResume(latestResumeId || data[0].id);
        }
      })
      .catch((err) => console.log(err));
  }, [email, latestResumeId]);

  const recommendCareer = async () => {
    if (!selectedResume) {
      alert("Please select a resume.");
      return;
    }

    const response = await fetch(
      "http://127.0.0.1:8000/career-recommendation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_id: selectedResume,
        }),
      }
    );

    const data = await response.json();

    setRecommendations(Array.isArray(data) ? data : []);
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: "900px",
          margin: "20px auto",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 0 12px rgba(0,0,0,0.15)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2563eb",
          }}
        >
          💼 Career Recommendation
        </h1>

        <h3>Select Resume</h3>

        <select
          value={selectedResume}
          onChange={(e) => setSelectedResume(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "25px",
          }}
        >
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.resume_name}
            </option>
          ))}
        </select>

        <button
          onClick={recommendCareer}
          style={{
            width: "100%",
            padding: "14px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Recommend Career
        </button>

        {recommendations.length > 0 && (
          <div style={{ marginTop: "30px" }}>
            <h2 style={{ color: "#16a34a" }}>
              Recommended Careers
            </h2>

            {recommendations.map((career) => (
              <div
                key={career.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "15px",
                  background: "#f8fafc",
                }}
              >
                <h3>{career.recommended_role}</h3>

                <p>
                  <strong>Match Score:</strong>{" "}
                  {career.match_score}%
                </p>

                <p>
                  <strong>Reason:</strong>{" "}
                  {career.reason}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default CareerRecommendation;
