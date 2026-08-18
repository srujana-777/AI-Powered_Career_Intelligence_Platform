from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from database import Base
from datetime import datetime


# ==========================
# User Table
# ==========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Personal Information
    full_name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    password = Column(String(255))
    phone = Column(String(20))
    dob = Column(String(20))
    gender = Column(String(20))
    address = Column(Text)

    # Education
    qualification = Column(String(100))
    college = Column(String(150))
    branch = Column(String(100))
    graduation_year = Column(String(10))
    cgpa = Column(String(10))

    # Career Details
    experience = Column(String(100))
    preferred_role = Column(String(100))
    preferred_location = Column(String(100))

    # Professional Links
    linkedin = Column(String(255))
    github = Column(String(255))

    # Skills
    technical_skills = Column(Text)
    soft_skills = Column(Text)
    certifications = Column(Text)

    # Salary Expectation
    expected_salary = Column(String(50))


# ==========================
# Resume Table
# ==========================

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)

    user_email = Column(String, index=True)

    resume_name = Column(String)
    resume_path = Column(String)
    resume_text = Column(Text)

    name = Column(String)
    email = Column(String)
    phone = Column(String)

    education = Column(String)
    experience = Column(String)

    skills = Column(Text)

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    is_primary = Column(Boolean, default=False)

class ATSAnalysis(Base):
    __tablename__ = "ats_analysis"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    resume_id = Column(Integer)
    score = Column(Integer)
    job_description = Column(Text)
    matching_skills = Column(Text)
    missing_skills = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
class CareerRecommendation(Base):
    __tablename__ = "career_recommendations"

    id = Column(Integer, primary_key=True, index=True)

    user_email = Column(String, index=True)

    resume_id = Column(Integer, ForeignKey("resumes.id"))

    recommended_role = Column(String)

    match_score = Column(Integer)

    reason = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    
class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analysis"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String)
    resume_id = Column(Integer)
    missing_skills = Column(Text)
    recommended_skills = Column(Text)
    matched_skills = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class SalaryPrediction(Base):
    __tablename__ = "salary_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String)
    resume_id = Column(Integer)

    predicted_role = Column(String)
    predicted_salary = Column(String)
    experience = Column(String)
    education = Column(String)
    skills = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

class JobRecommendation(Base):
    __tablename__ = "job_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String)
    resume_id = Column(Integer)

    job_title = Column(String)
    company = Column(String)
    location = Column(String)
    salary = Column(String)
    match_score = Column(Integer)
    skills_required = Column(String)
    apply_link = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

class CourseRecommendation(Base):
    __tablename__ = "course_recommendations"

    id = Column(Integer, primary_key=True, index=True)

    user_email = Column(String)
    resume_id = Column(Integer)

    skill = Column(String)
    course_name = Column(String)
    platform = Column(String)
    course_link = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

class ResumeImprovement(Base):
    __tablename__ = "resume_improvements"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    resume_id = Column(Integer)
    strengths = Column(Text)
    weaknesses = Column(Text)
    recommendations = Column(Text)
    improved_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class ResumeBuilder(Base):
    __tablename__ = "resume_builder"

    id = Column(Integer, primary_key=True, index=True)

    user_email = Column(String, index=True)

    full_name = Column(String)
    email = Column(String)
    phone = Column(String)
    address = Column(Text)

    linkedin = Column(String)
    github = Column(String)

    objective = Column(Text)

    education = Column(Text)
    technical_skills = Column(Text)
    soft_skills = Column(Text)

    experience = Column(Text)
    projects = Column(Text)
    certifications = Column(Text)
    achievements = Column(Text)
    languages = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)