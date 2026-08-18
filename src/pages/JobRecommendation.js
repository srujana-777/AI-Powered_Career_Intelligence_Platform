import { useState, useEffect } from "react";
import Layout from "../components/Layout";

function JobRecommendation() {
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
  const [jobs, setJobs] = useState(() => Array.isArray(savedInsights.jobs) ? savedInsights.jobs : []);

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
      .catch((error) => console.error(error));
  }, [email, latestResumeId]);

  const getRecommendations = async () => {

    const response = await fetch(
      "http://127.0.0.1:8000/job-recommendation",
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

    setJobs(Array.isArray(data) ? data : []);
  };

  return (
    <Layout>
    <div
      style={{
        maxWidth: "1000px",
        margin: "30px auto",
        padding: "30px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#2563eb",
        }}
      >
        Job Recommendations
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

      <button
        onClick={getRecommendations}
        style={{
          width: "100%",
          padding: "12px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Get Job Recommendations
      </button>

      <div style={{ marginTop: "30px" }}>

        {jobs.map((job) => (

          <div
            key={job.id}
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
              boxShadow: "0 2px 10px rgba(0,0,0,.1)",
            }}
          >
            <h2>{job.job_title}</h2>

            <p><b>Company:</b> {job.company}</p>

            <p><b>Location:</b> {job.location}</p>

            <p><b>Salary:</b> {job.salary}</p>

            <p><b>Required Skills:</b> {job.skills_required}</p>

            <a
              href={job.apply_link}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#2563eb",
                fontWeight: "bold",
              }}
            >
              Apply Now
            </a>

          </div>

        ))}

      </div>

    </div>
    </Layout>
  );
}

export default JobRecommendation;
