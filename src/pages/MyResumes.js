import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function MyResumes() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);

  const email = localStorage.getItem("email");

  useEffect(() => {
  console.log("Email:", email);

  fetch(`http://127.0.0.1:8000/resumes/${email}`)
    .then((res) => res.json())
    .then((data) => {
      console.log(JSON.stringify(data, null, 2)); // Log the data for debugging
      setResumes(data);
    })
    .catch((err) => console.log(err));
}, [email]);

  const loadResumes = () => {
    fetch(`http://127.0.0.1:8000/resumes/${email}`)
      .then((res) => res.json())
      .then((data) => setResumes(data))
      .catch((err) => console.log(err));
  };

  const deleteResume = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmDelete) return;

    const response = await fetch(
      `http://127.0.0.1:8000/resume/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    alert(data.message);

    loadResumes();
  };

  const setPrimary = async (id) => {
    const response = await fetch(
      `http://127.0.0.1:8000/resume/${id}/primary`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    alert(data.message);

    loadResumes();
  };

  return (
    <Layout>
    <div
    
      style={{
        maxWidth: "1200px",
        margin: "40px auto",
        background: "white",
        padding: "30px",
        borderRadius: "10px",
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
        📂 My Uploaded Resumes
      </h1>

      {resumes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "30px",
          }}
        >
          <h3>No resumes uploaded.</h3>

          <button
            onClick={() => navigate("/upload_resume")}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Upload Resume
          </button>
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#2563eb",
                color: "white",
              }}
            >
              <th style={{ padding: "12px" }}>Resume</th>
              <th>Education</th>
              <th>Experience</th>
              <th>Skills</th>
              <th>Uploaded</th>
              <th>Primary</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {resumes.map((resume) => (
              <tr key={resume.id}>
                <td style={{ padding: "10px" }}>
                  {resume.resume_name}
                </td>

                <td>{resume.education}</td>

                <td>{resume.experience}</td>

                <td>{resume.skills}</td>

                <td>
                  {resume.uploaded_at
                    ? new Date(resume.uploaded_at).toLocaleDateString()
                    : "-"}
                </td>

                <td>
                  {resume.is_primary ? "⭐ Yes" : "No"}
                </td>
                <td
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  <button
                    onClick={() => navigate(`/view-resume/${resume.id}`)}
                    style={{
                      background: "#51ec8aff",
                      color: "black",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginRight: "5px",
                      fontSize: "12px",
                    }}
                  >
                    👁 View
                  </button>

                  <button
                    onClick={() => navigate(`/update-resume/${resume.id}`)}
                    style={{
                      background: "#f091ffff",
                      color: "black",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginRight: "5px",
                      fontSize: "12px",
                    }}
                  >
                    ✏ Update
                  </button>

                  <a
                    href={`http://127.0.0.1:8000/resume/${resume.id}/download`}
                    style={{
                      background: "#2563eb",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: "5px",
                      marginRight: "5px",
                      fontSize: "12px",
                      textDecoration: "none",
                    }}
                  >
                    ⬇ Download
                  </a>

                  <button
                    onClick={() => setPrimary(resume.id)}
                    style={{
                      background: "#5befffff",
                      color: "black",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginRight: "5px",
                      fontSize: "12px",
                    }}
                  >
                    ⭐ Primary
                  </button>

                  <button
                    onClick={() => deleteResume(resume.id)}
                    style={{
                      background: "#9a9a9aff",
                      color: "black",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← Dashboard
        </button>

        <button
          onClick={() => navigate("/upload_resume")}
          style={{
            background: "#16a34a",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          + Upload New Resume
        </button>
      </div>
    </div>
    </Layout>
  );
}

export default MyResumes;
