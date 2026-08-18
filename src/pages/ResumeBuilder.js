import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const API_URL = "http://127.0.0.1:8000";
const emptyResume = (email) => ({
  full_name: "", email: email || "", phone: "", address: "", linkedin: "", github: "",
  objective: "", education: "", technical_skills: "", soft_skills: "", experience: "",
  projects: "", certifications: "", achievements: "", languages: "",
});

function Field({ label, name, value, onChange, textarea = false, placeholder, required = false }) {
  const shared = { name, value, onChange, placeholder, required, style: { width: "100%", boxSizing: "border-box", marginTop: "7px", padding: "11px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", font: "inherit", resize: "vertical" } };
  return <label style={{ display: "block", color: "#334155", fontWeight: 600 }}>{label}{required && " *"}{textarea ? <textarea {...shared} rows="4" /> : <input {...shared} />}</label>;
}

function Section({ title, description, children }) {
  return <section style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "22px", marginTop: "20px", background: "#fff" }}>
    <h2 style={{ margin: 0, color: "#1e3a8a", fontSize: "20px" }}>{title}</h2>
    {description && <p style={{ color: "#64748b", margin: "7px 0 20px" }}>{description}</p>}
    {children}
  </section>;
}

function ResumeBuilder() {
  const email = localStorage.getItem("email");
  const [formData, setFormData] = useState(() => emptyResume(email));
  const [existingResume, setExistingResume] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!email) return;
    fetch(`${API_URL}/resume-builder/${email}`)
      .then((response) => response.ok ? response.json() : null)
      .then((resume) => {
        if (resume) {
          setFormData(resume);
          setExistingResume(true);
        }
      })
      .catch(() => {});
  }, [email]);

  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveResume = async (event) => {
    event.preventDefault();
    if (!email) return alert("Please log in before saving a resume.");
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/resume-builder${existingResume ? `/${email}` : ""}`, {
        method: existingResume ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, email }),
      });
      if (!response.ok) throw new Error();
      setExistingResume(true);
      alert("Resume saved successfully.");
    } catch {
      alert("Unable to save the resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return <Layout>
    <main style={{ maxWidth: "1000px", margin: "30px auto", padding: "0 20px 40px" }}>
      <div style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "white", padding: "30px", borderRadius: "16px" }}>
        <h1 style={{ color: "white", margin: 0 }}>Build your resume</h1>
        <p style={{ margin: "8px 0 0", opacity: 0.9 }}>Complete each section to save one polished, editable resume profile.</p>
      </div>
      <form onSubmit={saveResume}>
        <Section title="👤 Contact information" description="Make it easy for recruiters to contact you.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
            <Field label="Full name" name="full_name" value={formData.full_name} onChange={handleChange} required />
            <Field label="Email" name="email" value={formData.email} onChange={handleChange} required />
            <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            <Field label="LinkedIn URL" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="linkedin.com/in/your-name" />
            <Field label="GitHub URL" name="github" value={formData.github} onChange={handleChange} placeholder="github.com/your-name" />
          </div>
          <div style={{ marginTop: "18px" }}><Field label="Location / address" name="address" value={formData.address} onChange={handleChange} textarea placeholder="City, State" /></div>
        </Section>
        <Section title="🎯 Professional summary" description="Write 2–3 concise sentences describing the role you are targeting.">
          <Field label="Career objective" name="objective" value={formData.objective} onChange={handleChange} textarea required placeholder="Aspiring software engineer with…" />
        </Section>
        <Section title="🎓 Education" description="Include qualification, institution, graduation year, and relevant results.">
          <Field label="Education" name="education" value={formData.education} onChange={handleChange} textarea required placeholder="B.Tech in Computer Science — ABC College, 2026 — CGPA 8.5" />
        </Section>
        <Section title="💻 Skills" description="Use commas to separate skills so they are easy to scan.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
            <Field label="Technical skills" name="technical_skills" value={formData.technical_skills} onChange={handleChange} textarea placeholder="Python, React, SQL, Git" />
            <Field label="Soft skills" name="soft_skills" value={formData.soft_skills} onChange={handleChange} textarea placeholder="Communication, teamwork, problem solving" />
          </div>
        </Section>
        <Section title="💼 Experience & projects">
          <div style={{ display: "grid", gap: "18px" }}>
            <Field label="Work experience" name="experience" value={formData.experience} onChange={handleChange} textarea placeholder="Role — Company — dates — key outcomes" />
            <Field label="Projects" name="projects" value={formData.projects} onChange={handleChange} textarea placeholder="Project name — technologies — measurable outcome" />
          </div>
        </Section>
        <Section title="🏆 Additional details">
          <div style={{ display: "grid", gap: "18px" }}>
            <Field label="Certifications" name="certifications" value={formData.certifications} onChange={handleChange} textarea />
            <Field label="Achievements" name="achievements" value={formData.achievements} onChange={handleChange} textarea />
            <Field label="Languages" name="languages" value={formData.languages} onChange={handleChange} placeholder="English, Hindi" />
          </div>
        </Section>
        <button type="submit" disabled={isSaving} style={{ width: "100%", marginTop: "24px", padding: "15px", background: isSaving ? "#94a3b8" : "#2563eb", color: "white", border: 0, borderRadius: "9px", fontSize: "17px", cursor: isSaving ? "wait" : "pointer" }}>{isSaving ? "Saving…" : existingResume ? "Save changes" : "Save resume"}</button>
      </form>
    </main>
  </Layout>;
}

export default ResumeBuilder;
