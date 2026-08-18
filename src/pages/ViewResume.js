import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

function ViewResume() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/resume/${id}`)
      .then((res) => res.json())
      .then((data) => setResume(data))
      .catch((err) => console.log(err));
  }, [id]);

  if (!resume) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  return (
    <Layout>
      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          background: "white",
          padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 0 10px gray",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#2563eb",
          marginBottom: "30px",
        }}
      >
        📄 Resume Details
      </h1>

      <p><strong>Resume Name:</strong> {resume.resume_name}</p>
      <p><strong>Name:</strong> {resume.name}</p>
      <p><strong>Email:</strong> {resume.email}</p>
      <p><strong>Phone:</strong> {resume.phone}</p>
      <p><strong>Education:</strong> {resume.education}</p>
      <p><strong>Experience:</strong> {resume.experience}</p>
      <p><strong>Skills:</strong> {resume.skills}</p>

      <p>
        <strong>Uploaded:</strong>{" "}
        {resume.uploaded_at
          ? new Date(resume.uploaded_at).toLocaleString()
          : "-"}
      </p>

      <h3 style={{ marginTop: "30px" }}>Extracted Resume Text</h3>

      <div
        style={{
          background: "#f3f4f6",
          padding: "15px",
          borderRadius: "8px",
          maxHeight: "400px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {resume.resume_text}
      </div>

      <button
        onClick={() => navigate("/my-resumes")}
        style={{
          marginTop: "25px",
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ← Back to My Resumes
      </button>
    </div>
  </Layout>
  );
}

export default ViewResume;