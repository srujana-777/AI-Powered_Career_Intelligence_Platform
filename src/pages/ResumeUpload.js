import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const API_URL = "http://127.0.0.1:8000";

function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const runAnalysis = async (path, body) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Unable to complete ${path}.`);
    }
    return response.json();
  };

  const uploadResume = async () => {
    if (!file) return alert("Please select a PDF resume.");
    if (!jobDescription.trim()) return alert("Please add a job description so ATS and skill-gap analysis can run.");
    const userEmail = localStorage.getItem("email");
    if (!userEmail) return navigate("/login");

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_email", userEmail);
      const uploadResponse = await fetch(`${API_URL}/upload_resume`, { method: "POST", body: formData });
      const uploadedResume = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadedResume.detail || "Unable to upload resume.");

      const resumeId = uploadedResume.resume_id;
      const [ats, skillGap, careers, jobs, courses, improvement, salary] = await Promise.all([
        runAnalysis("/ats-analysis", { resume_id: resumeId, job_description: jobDescription }),
        runAnalysis("/skill-gap", { resume_id: resumeId, job_description: jobDescription }),
        runAnalysis("/career-recommendation", { resume_id: resumeId }),
        runAnalysis("/job-recommendation", { resume_id: resumeId }),
        runAnalysis("/course-recommendation", { resume_id: resumeId }),
        runAnalysis("/resume-improvement", { resume_id: resumeId }),
        runAnalysis("/salary-prediction", { resume_id: resumeId }),
      ]);

      localStorage.setItem("latestCareerInsights", JSON.stringify({ resumeId, jobDescription, ats, skillGap, careers, jobs, courses, improvement, salary }));
      navigate("/dashboard-analytics");
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to generate career insights.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div style={{ minHeight: "100vh", background: "#f4f7fb", display: "flex", justifyContent: "center", alignItems: "center", padding: "30px" }}>
        <div style={{ width: "min(700px, 100%)", background: "white", padding: "35px", borderRadius: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
          <h1 style={{ textAlign: "center", color: "#2563eb" }}>📄 Upload Resume & Generate Insights</h1>
          <p style={{ textAlign: "center", color: "#64748b" }}>Upload a PDF and target job description to generate your complete career analysis.</p>
          <label htmlFor="resume-file"><strong>Resume (PDF)</strong></label>
          <input id="resume-file" type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files[0])} style={{ width: "100%", marginTop: "10px" }} />
          <label htmlFor="job-description" style={{ display: "block", marginTop: "24px" }}><strong>Target job description</strong></label>
          <textarea id="job-description" rows="9" placeholder="Paste the job description to calculate ATS and skill-gap insights..." value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} style={{ width: "100%", boxSizing: "border-box", marginTop: "10px", padding: "12px", resize: "vertical" }} />
          <button onClick={uploadResume} disabled={isProcessing} style={{ width: "100%", marginTop: "20px", padding: "14px", background: isProcessing ? "#94a3b8" : "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: isProcessing ? "wait" : "pointer", fontSize: "17px" }}>
            {isProcessing ? "Uploading and generating insights…" : "Upload & Generate All Insights"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default ResumeUpload;
