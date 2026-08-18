import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    qualification: "",
    college: "",
    branch: "",
    graduation_year: "",
    cgpa: "",
    experience: "",
    preferred_role: "",
    preferred_location: "",
    linkedin: "",
    github: "",
    technical_skills: "",
    soft_skills: "",
    certifications: "",
    expected_salary: ""
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const register = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        navigate("/login");
      } else {
        alert(data.detail);
      }
    } catch (error) {
      alert("Registration Failed");
    }
  };

  return (
    <Layout>
      <div
        style={{
          width: "800px",
          margin: "30px auto",
          background: "#fff",
          padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 0 10px gray",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#2563eb" }}>
        Career Intelligence Platform
      </h1>

      <h2>Register</h2>

      <input name="full_name" placeholder="Full Name" onChange={handleChange} /><br /><br />
      <input name="email" placeholder="Email" onChange={handleChange} /><br /><br />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} /><br /><br />
      <input name="phone" placeholder="Phone Number" onChange={handleChange} /><br /><br />

      <label>Date of Birth</label><br />
      <input type="date" name="dob" onChange={handleChange} /><br /><br />

      <select name="gender" onChange={handleChange}>
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select><br /><br />

      <textarea
        name="address"
        placeholder="Address"
        onChange={handleChange}
      ></textarea><br /><br />

      <h3>Education</h3>

      <input name="qualification" placeholder="Qualification" onChange={handleChange} /><br /><br />
      <input name="college" placeholder="College" onChange={handleChange} /><br /><br />
      <input name="branch" placeholder="Branch" onChange={handleChange} /><br /><br />
      <input name="graduation_year" placeholder="Graduation Year" onChange={handleChange} /><br /><br />
      <input name="cgpa" placeholder="CGPA" onChange={handleChange} /><br /><br />

      <h3>Career Details</h3>

      <input name="experience" placeholder="Experience" onChange={handleChange} /><br /><br />
      <input name="preferred_role" placeholder="Preferred Job Role" onChange={handleChange} /><br /><br />
      <input name="preferred_location" placeholder="Preferred Location" onChange={handleChange} /><br /><br />

      <h3>Profiles</h3>

      <input name="linkedin" placeholder="LinkedIn URL" onChange={handleChange} /><br /><br />
      <input name="github" placeholder="GitHub URL" onChange={handleChange} /><br /><br />

      <h3>Skills</h3>

      <input name="technical_skills" placeholder="Technical Skills" onChange={handleChange} /><br /><br />
      <input name="soft_skills" placeholder="Soft Skills" onChange={handleChange} /><br /><br />
      <input name="certifications" placeholder="Certifications" onChange={handleChange} /><br /><br />

      <input name="expected_salary" placeholder="Expected Salary" onChange={handleChange} /><br /><br />

      <button
        onClick={register}
        style={{
          width: "100%",
          padding: "12px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        Register
      </button>
    </div>
  </Layout>
  );
}

export default Register;