import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

function EditProfile() {
  const email = localStorage.getItem("email");

  const [user, setUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    qualification: "",
    college: "",
    branch: "",
    graduation_year: "",
    cgpa: "",
    experience: "",
    preferred_role: "",
    preferred_location: "",
    technical_skills: "",
    soft_skills: "",
    certifications: "",
    linkedin: "",
    github: "",
    expected_salary: ""
  });

  useEffect(() => {
    if (!email) return;

    fetch(`http://127.0.0.1:8000/profile/${email}`)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.log(err));
  }, [email]);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async () => {
    const response = await fetch(
      `http://127.0.0.1:8000/profile/${email}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      }
    );

    const data = await response.json();
    alert(data.message);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
  };

  return (
    <Layout>
      <div
    
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "1000px",
          background: "#fff",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2563eb",
            marginBottom: "30px",
          }}
        >
          👤 Edit Profile
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <input
            style={inputStyle}
            name="full_name"
            placeholder="Full Name"
            value={user.full_name}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="email"
            placeholder="Email"
            value={user.email}
            disabled
          />

          <input
            style={inputStyle}
            name="phone"
            placeholder="Phone Number"
            value={user.phone}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="qualification"
            placeholder="Qualification"
            value={user.qualification}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="college"
            placeholder="College"
            value={user.college}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="branch"
            placeholder="Branch"
            value={user.branch}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="graduation_year"
            placeholder="Graduation Year"
            value={user.graduation_year}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="cgpa"
            placeholder="CGPA"
            value={user.cgpa}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="experience"
            placeholder="Experience"
            value={user.experience}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="preferred_role"
            placeholder="Preferred Role"
            value={user.preferred_role}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="preferred_location"
            placeholder="Preferred Location"
            value={user.preferred_location}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="expected_salary"
            placeholder="Expected Salary"
            value={user.expected_salary}
            onChange={handleChange}
          />

          <textarea
            style={{
              ...inputStyle,
              height: "100px",
            }}
            name="technical_skills"
            placeholder="Technical Skills"
            value={user.technical_skills}
            onChange={handleChange}
          />

          <textarea
            style={{
              ...inputStyle,
              height: "100px",
            }}
            name="soft_skills"
            placeholder="Soft Skills"
            value={user.soft_skills}
            onChange={handleChange}
          />

          <textarea
            style={{
              ...inputStyle,
              height: "100px",
              gridColumn: "span 2",
            }}
            name="certifications"
            placeholder="Certifications"
            value={user.certifications}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="linkedin"
            placeholder="LinkedIn Profile"
            value={user.linkedin}
            onChange={handleChange}
          />

          <input
            style={inputStyle}
            name="github"
            placeholder="GitHub Profile"
            value={user.github}
            onChange={handleChange}
          />
        </div>

        <div
          style={{
            marginTop: "35px",
            textAlign: "center",
          }}
        >
          <button
            onClick={updateProfile}
            style={{
              width: "300px",
              padding: "14px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
    </Layout>
  );
}

export default EditProfile;