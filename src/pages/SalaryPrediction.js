import { useState, useEffect } from "react";
import Layout from "../components/Layout";

function SalaryPrediction() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [prediction, setPrediction] = useState(null);

  const email = localStorage.getItem("email");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/resumes/${email}`)
      .then((res) => res.json())
      .then((data) => {
        setResumes(data);

        if (data.length > 0) {
          setSelectedResume(data[0].id);
        }
      })
      .catch((err) => console.log(err));
  }, [email]);

  const predictSalary = async () => {
    if (!selectedResume) {
      alert("Please select a resume.");
      return;
    }

    const response = await fetch(
      "http://127.0.0.1:8000/salary-prediction",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_id: Number(selectedResume),
        }),
      }
    );

    const data = await response.json();
    setPrediction(data);
  };

  return (
    <Layout>
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
          maxWidth: "900px",
          margin: "20px auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2563eb",
            marginBottom: "25px",
          }}
        >
          💰 Salary Prediction
        </h1>

        <h3>Select Resume</h3>

        <select
          value={selectedResume}
          onChange={(e) => setSelectedResume(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
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
          onClick={predictSalary}
          style={{
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Predict Salary
        </button>

        {prediction && (
          <div
            style={{
              marginTop: "30px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              background: "#f8fafc",
            }}
          >
            <h2 style={{ color: "#16a34a" }}>
              💼 {prediction.predicted_role}
            </h2>

            <p>
              <strong>💰 Predicted Salary:</strong>{" "}
              {prediction.predicted_salary}
            </p>

            <p>
              <strong>🎓 Education:</strong>{" "}
              {prediction.education}
            </p>

            <p>
              <strong>👨‍💻 Experience:</strong>{" "}
              {prediction.experience}
            </p>

            <p>
              <strong>🛠 Skills:</strong>{" "}
              {prediction.skills}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SalaryPrediction;