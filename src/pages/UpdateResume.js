import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";

function UpdateResume() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/resume/${id}`)
      .then((res) => res.json())
      .then((data) => setResume(data))
      .catch((err) => console.log(err));
  }, [id]);

  const updateResume = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `http://127.0.0.1:8000/resume/${id}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    const data = await response.json();

    alert(data.message);

    navigate("/my-resumes");
  };

  if (!resume) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  return (
    <Layout>
      <div
        style={{
          maxWidth: "700px",
          margin: "40px auto",
          padding: "30px",
          background: "white",
        borderRadius: "10px",
        boxShadow: "0 0 10px gray",
      }}
    >
      <h2 style={{ color: "#2563eb", textAlign: "center" }}>
        Update Resume
      </h2>

      <p>
        <b>Current Resume:</b> {resume.resume_name}
      </p>

      <form onSubmit={updateResume}>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <br />
        <br />

        <button
          type="submit"
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Update Resume
        </button>

        <button
          type="button"
          onClick={() => navigate("/my-resumes")}
          style={{
            background: "gray",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  </Layout>
  );
}

export default UpdateResume;
