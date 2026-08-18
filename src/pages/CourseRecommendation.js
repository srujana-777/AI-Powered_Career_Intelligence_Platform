import { useState, useEffect } from "react";
import Layout from "../components/Layout";

function CourseRecommendation() {
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
  const [courses, setCourses] = useState(() => Array.isArray(savedInsights.courses) ? savedInsights.courses : []);

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

  const getCourses = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/course-recommendation",
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
    setCourses(Array.isArray(data) ? data : []);
  };

  return (
    <Layout>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2563eb",
          }}
        >
          📚 Course Recommendations
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
          onClick={getCourses}
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
          Get Course Recommendations
        </button>

        <div style={{ marginTop: "30px" }}>
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                background: "#fff",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <h2>{course.course_name}</h2>

              <p><b>Skill:</b> {course.skill}</p>

              <p><b>Platform:</b> {course.platform}</p>

              <a
                href={course.course_link}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#2563eb",
                  fontWeight: "bold",
                }}
              >
                Enroll Now
              </a>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default CourseRecommendation;
