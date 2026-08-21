from fastapi import FastAPI, HTTPException, UploadFile, File, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from typing import List, cast
from fastapi import Form
from sqlalchemy import Float, func, cast
from sqlalchemy.types import Float

import fitz
import shutil
import os
import re
from pathlib import Path
from uuid import uuid4
from secrets import token_urlsafe

from database import SessionLocal, engine, Base
from models import (
    User,
    Resume,
    ATSAnalysis,
    CareerRecommendation,
    SalaryPrediction,
    JobRecommendation,
    CourseRecommendation,
    SkillGapAnalysis,
    ResumeImprovement,
    ResumeBuilder
)

from schemas import (
    UserCreate,
    UserLogin,
    ResumeResponse,
    ProfileUpdate,
    ATSRequest,
    ATSResponse,
    ResumeImprovementRequest,
    ResumeImprovementResponse,
    SalaryPredictionResponse,
    SkillGapAnalysisRequest,
    CareerRecommendationRequest,
    CareerRecommendationResponse,
    SalaryPredictionRequest,
    SalaryPredictionResponse,
    JobRecommendationRequest,
    JobRecommendationResponse,
    CourseRecommendationRequest,
    CourseRecommendationResponse,
    ResumeBuilderRequest,
    ResumeBuilderResponse,
    DashboardAnalyticsResponse,
    InterviewEvalRequest,
    MockTestRequest
)

from skills import SKILLS


# ==========================
# Create Database Tables
# ==========================
Base.metadata.create_all(bind=engine)


# ==========================
# Password Hashing
# ==========================
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ==========================
# Create FastAPI App
# ==========================
app = FastAPI()


# ==========================
# Enable CORS
# ==========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",

        # Deployed React Frontend
        "https://ai-powered-career-intelligence-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


ALLOWED_RESUME_EXTENSIONS = {".pdf"}
# Environment variables take precedence; the local defaults support development.
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL") or "admin@gmail.com.com"
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD") or "12345"
ADMIN_SESSIONS = set()


def extract_resume_data(file_path: str):
    """Extract the supported PDF fields used throughout the career modules."""
    try:
        with fitz.open(file_path) as pdf:
            text = "".join(page.get_text() for page in pdf)
    except Exception as error:
        raise HTTPException(status_code=400, detail="The uploaded PDF could not be read.") from error

    found_skills = [skill for skill in SKILLS if skill.lower() in text.lower()]
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phone_match = re.search(r'(\+?\d{1,3}[- ]?)?\d{10}', text)
    education = next((degree for degree in ["B.Tech", "B.E", "M.Tech", "MCA", "BCA", "B.Sc", "M.Sc", "MBA", "Bachelor", "Master"] if degree.lower() in text.lower()), "Not Found")
    exp_match = re.search(r'(\d+)\+?\s*(years|year)', text, re.IGNORECASE)
    return {
        "text": text,
        "skills": found_skills,
        "name": lines[0] if lines else "Not Found",
        "email": email_match.group() if email_match else "Not Found",
        "phone": phone_match.group() if phone_match else "Not Found",
        "education": education,
        "experience": exp_match.group() if exp_match else "Fresher",
    }


def save_uploaded_pdf(file: UploadFile):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_RESUME_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Please upload a PDF resume.")
    upload_dir = Path(__file__).resolve().parent / "uploads"
    upload_dir.mkdir(exist_ok=True)
    file_path = upload_dir / f"{uuid4().hex}{suffix}"
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return str(file_path)


def require_admin(x_admin_session: str = Header(default="")):
    if x_admin_session not in ADMIN_SESSIONS:
        raise HTTPException(status_code=401, detail="Admin authentication is required.")


@app.post("/admin/login")
def admin_login(credentials: dict):
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        raise HTTPException(status_code=503, detail="Admin access is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD on the API server.")
    if credentials.get("email") != ADMIN_EMAIL or credentials.get("password") != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials.")
    session = token_urlsafe(32)
    ADMIN_SESSIONS.add(session)
    return {"admin_session": session, "email": ADMIN_EMAIL}


@app.post("/admin/logout")
def admin_logout(x_admin_session: str = Header(default="")):
    ADMIN_SESSIONS.discard(x_admin_session)
    return {"message": "Admin session closed."}


@app.get("/admin/overview", dependencies=[Depends(require_admin)])
def admin_overview():
    db = SessionLocal()
    try:
        users = db.query(User).order_by(User.id.desc()).all()
        resumes = db.query(Resume).order_by(Resume.uploaded_at.desc()).all()
        recent_users = [
            {"id": user.id, "name": user.full_name, "email": user.email, "preferred_role": user.preferred_role or "Not specified", "resume_count": sum(resume.user_email == user.email for resume in resumes)}
            for user in users[:8]
        ]
        recent_resumes = [
            {"id": resume.id, "name": resume.resume_name, "user_email": resume.user_email, "skills": resume.skills or "No skills detected", "uploaded_at": resume.uploaded_at}
            for resume in resumes[:8]
        ]
        return {
            "metrics": {
                "users": len(users), "resumes": len(resumes), "ats_analyses": db.query(ATSAnalysis).count(),
                "skill_gaps": db.query(SkillGapAnalysis).count(), "career_recommendations": db.query(CareerRecommendation).count(),
                "job_recommendations": db.query(JobRecommendation).count(), "course_recommendations": db.query(CourseRecommendation).count(),
            },
            "recent_users": recent_users,
            "recent_resumes": recent_resumes,
            "system": {"api": "Operational", "database": "Connected", "resume_parser": "Operational"},
        }
    finally:
        db.close()


@app.get("/admin/users", dependencies=[Depends(require_admin)])
def admin_list_users(search: str = ""):
    db = SessionLocal()
    try:
        users = db.query(User).order_by(User.id.desc()).all()
        resumes = db.query(Resume).all()

        def resume_count(email):
            return sum(resume.user_email == email for resume in resumes)

        results = [
            {
                "id": user.id,
                "name": user.full_name,
                "email": user.email,
                "phone": user.phone,
                "preferred_role": user.preferred_role or "Not specified",
                "preferred_location": user.preferred_location or "Not specified",
                "qualification": user.qualification,
                "experience": user.experience,
                "resume_count": resume_count(user.email),
            }
            for user in users
        ]

        if search:
            needle = search.lower()
            results = [
                row for row in results
                if needle in (row["name"] or "").lower() or needle in (row["email"] or "").lower()
            ]

        return {"total": len(results), "users": results}
    finally:
        db.close()


@app.get("/admin/users/{user_id}", dependencies=[Depends(require_admin)])
def admin_get_user(user_id: int):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        resumes = db.query(Resume).filter(Resume.user_email == user.email).order_by(Resume.uploaded_at.desc()).all()

        return {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "dob": user.dob,
            "gender": user.gender,
            "address": user.address,
            "qualification": user.qualification,
            "college": user.college,
            "branch": user.branch,
            "graduation_year": user.graduation_year,
            "cgpa": user.cgpa,
            "experience": user.experience,
            "preferred_role": user.preferred_role,
            "preferred_location": user.preferred_location,
            "linkedin": user.linkedin,
            "github": user.github,
            "technical_skills": user.technical_skills,
            "soft_skills": user.soft_skills,
            "certifications": user.certifications,
            "expected_salary": user.expected_salary,
            "resumes": [
                {"id": resume.id, "resume_name": resume.resume_name, "uploaded_at": resume.uploaded_at, "is_primary": resume.is_primary}
                for resume in resumes
            ],
        }
    finally:
        db.close()


@app.delete("/admin/users/{user_id}", dependencies=[Depends(require_admin)])
def admin_delete_user(user_id: int):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        email = user.email

        for model in (CareerRecommendation, ATSAnalysis, SkillGapAnalysis, SalaryPrediction, JobRecommendation, CourseRecommendation, ResumeImprovement):
            db.query(model).filter(model.user_email == email).delete()

        resumes = db.query(Resume).filter(Resume.user_email == email).all()
        for resume in resumes:
            if resume.resume_path and os.path.exists(resume.resume_path):
                os.remove(resume.resume_path)
        db.query(Resume).filter(Resume.user_email == email).delete()

        db.query(ResumeBuilder).filter(ResumeBuilder.user_email == email).delete()

        db.delete(user)
        db.commit()

        return {"message": "User deleted successfully"}
    finally:
        db.close()


# Home API
@app.get("/")
def home():
    return {
        "message": "Career Intelligence API is Running"
    }



# Register API
@app.post("/register")
def register(user: UserCreate):

    db = SessionLocal()

    # Check if email already exists
    existing = db.query(User).filter(User.email == user.email).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash Password
    hashed_password = pwd_context.hash(user.password)

    # Create User
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_password,

        phone=user.phone,
        dob=user.dob,
        gender=user.gender,
        address=user.address,

        qualification=user.qualification,
        college=user.college,
        branch=user.branch,
        graduation_year=user.graduation_year,
        cgpa=user.cgpa,

        experience=user.experience,
        preferred_role=user.preferred_role,
        preferred_location=user.preferred_location,

        linkedin=user.linkedin,
        github=user.github,

        technical_skills=user.technical_skills,
        soft_skills=user.soft_skills,
        certifications=user.certifications,

        expected_salary=user.expected_salary
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    db.close()

    return {
        "message": "Registration Successful"
    }
def recommend_roles(skills):
    skills = [skill.strip().lower() for skill in skills.split(",") if skill.strip()]

    careers = {
        "Data Scientist": ["python", "sql", "machine learning", "statistics"],
        "Machine Learning Engineer": ["python", "machine learning", "tensorflow", "pytorch"],
        "AI Engineer": ["python", "machine learning", "deep learning"],
        "Python Developer": ["python", "django", "flask"],
        "Data Analyst": ["python", "sql", "excel", "power bi"],
        "Software Engineer": ["java", "python", "c++", "git"],
    }

    recommendations = []

    for role, required_skills in careers.items():
        matched = [s for s in required_skills if s in skills]
        score = int((len(matched) / len(required_skills)) * 100)

        if score > 0:
            recommendations.append({
                "role": role,
                "score": score,
                "reason": f"Matched skills: {', '.join(matched)}"
            })

    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:5]
def predict_salary(role, experience):

    role = role.lower()

    if "data scientist" in role:
        if "fresher" in experience.lower():
            return "₹6 - ₹10 LPA"
        else:
            return "₹12 - ₹20 LPA"

    elif "machine learning" in role:
        if "fresher" in experience.lower():
            return "₹7 - ₹11 LPA"
        else:
            return "₹15 - ₹25 LPA"

    elif "python" in role:
        return "₹5 - ₹9 LPA"

    elif "software" in role:
        return "₹4 - ₹10 LPA"

    return "₹3 - ₹6 LPA"

JOBS = [
    {
        "title": "Python Developer",
        "company": "Infosys",
        "location": "Hyderabad",
        "salary": "₹5-8 LPA",
        "skills": ["python", "django", "sql"]
    },
    {
        "title": "Data Analyst",
        "company": "TCS",
        "location": "Bangalore",
        "salary": "₹4-7 LPA",
        "skills": ["python", "sql", "excel"]
    },
    {
        "title": "Machine Learning Engineer",
        "company": "Accenture",
        "location": "Pune",
        "salary": "₹8-12 LPA",
        "skills": ["python", "machine learning", "tensorflow"]
    },
    {
        "title": "AI Engineer",
        "company": "Wipro",
        "location": "Hyderabad",
        "salary": "₹7-11 LPA",
        "skills": ["python", "deep learning", "pytorch"]
    }
]
COURSES = {
    "python": {
        "course_name": "Python for Everybody",
        "platform": "Coursera",
        "course_link": "https://www.coursera.org/specializations/python"
    },
    "react": {
        "course_name": "React - The Complete Guide",
        "platform": "Udemy",
        "course_link": "https://www.udemy.com/"
    },
    "sql": {
        "course_name": "SQL for Data Science",
        "platform": "Coursera",
        "course_link": "https://www.coursera.org/"
    },
    "machine learning": {
        "course_name": "Machine Learning",
        "platform": "Coursera",
        "course_link": "https://www.coursera.org/learn/machine-learning"
    },
    "java": {
        "course_name": "Java Programming",
        "platform": "NPTEL",
        "course_link": "https://nptel.ac.in/"
    }
}
# Login API
@app.post("/login")
def login(user: UserLogin):

    db = SessionLocal()

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    if not pwd_context.verify(
        user.password,
        existing.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    db.close()

    return {
        "message": "Login Successful",
        "name": existing.full_name,
        "email": existing.email
    }
@app.get("/profile/{email}")
def get_profile(email: str):

    db = SessionLocal()

    user = db.query(User).filter(User.email == email).first()

    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")

    db.close()

    return user


# Resume Upload API
@app.put("/profile/{email}")
def update_profile(email: str, updated_user: ProfileUpdate):

    db = SessionLocal()

    user = db.query(User).filter(User.email == email).first()

    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")

    user.full_name = updated_user.full_name
    user.phone = updated_user.phone
    user.dob = updated_user.dob
    user.gender = updated_user.gender
    user.address = updated_user.address

    user.qualification = updated_user.qualification
    user.college = updated_user.college
    user.branch = updated_user.branch
    user.graduation_year = updated_user.graduation_year
    user.cgpa = updated_user.cgpa

    user.experience = updated_user.experience
    user.preferred_role = updated_user.preferred_role
    user.preferred_location = updated_user.preferred_location

    user.linkedin = updated_user.linkedin
    user.github = updated_user.github

    user.technical_skills = updated_user.technical_skills
    user.soft_skills = updated_user.soft_skills
    user.certifications = updated_user.certifications

    user.expected_salary = updated_user.expected_salary

    db.commit()
    db.refresh(user)
    db.close()

    return {"message": "Profile updated successfully"}


# Resume Upload API
@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...), user_email: str = Form(...)):
    original_name = file.filename or "resume.pdf"
    file_path = save_uploaded_pdf(file)
    extracted = extract_resume_data(file_path)

    # Save Resume to PostgreSQL
    db = SessionLocal()

    resume = Resume(
        user_email=user_email,
        resume_name=original_name,
        resume_path=file_path,
        resume_text=extracted["text"],
        name=extracted["name"],
        email=extracted["email"],
        phone=extracted["phone"],
        education=extracted["education"],
        experience=extracted["experience"],
        skills=", ".join(extracted["skills"]),
        is_primary=False
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)
    db.close()

    return {
        "message": "Resume uploaded successfully!",
        "resume_name": original_name,
        "resume_id": resume.id,
        "name": extracted["name"],
        "email": extracted["email"],
        "phone": extracted["phone"],
        "education": extracted["education"],
        "experience": extracted["experience"],
        "skills": extracted["skills"],
        "resume_text": extracted["text"]
    }
# ==============================
# Get All Uploaded Resumes
# ==============================

@app.get("/resumes/{email}", response_model=List[ResumeResponse])
def get_resumes(email: str):

    db = SessionLocal()

    resumes = (
        db.query(Resume)
        .filter(Resume.user_email == email)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )

    db.close()

    return resumes
@app.delete("/resume/{resume_id}")
def delete_resume(resume_id: int):

    db = SessionLocal()

    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()

        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        # Delete related records
        db.query(CareerRecommendation).filter(
            CareerRecommendation.resume_id == resume_id
        ).delete()

        db.query(ATSAnalysis).filter(
            ATSAnalysis.resume_id == resume_id
        ).delete()

        db.query(SkillGapAnalysis).filter(
            SkillGapAnalysis.resume_id == resume_id
        ).delete()

        db.query(SalaryPrediction).filter(
            SalaryPrediction.resume_id == resume_id
        ).delete()

        db.query(JobRecommendation).filter(
            JobRecommendation.resume_id == resume_id
        ).delete()

        db.query(CourseRecommendation).filter(
            CourseRecommendation.resume_id == resume_id
        ).delete()

        db.query(ResumeImprovement).filter(
            ResumeImprovement.resume_id == resume_id
        ).delete()

        # Delete PDF file
        if resume.resume_path and os.path.exists(resume.resume_path):
            os.remove(resume.resume_path)

        # Delete resume
        db.delete(resume)

        db.commit()

        return {"message": "Resume deleted successfully"}

    finally:
        db.close()
@app.get("/resume/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int):

    db = SessionLocal()

    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        db.close()
        raise HTTPException(status_code=404, detail="Resume not found")

    db.close()

    return resume


@app.get("/resume/{resume_id}/download")
def download_resume(resume_id: int):
    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume or not resume.resume_path or not os.path.exists(resume.resume_path):
            raise HTTPException(status_code=404, detail="Resume file not found")
        return FileResponse(resume.resume_path, media_type="application/pdf", filename=resume.resume_name)
    finally:
        db.close()
@app.put("/resume/{resume_id}/primary")
def set_primary_resume(resume_id: int):

    db = SessionLocal()

    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        db.close()
        raise HTTPException(status_code=404, detail="Resume not found")

    # Remove previous primary resume
    db.query(Resume).filter(
        Resume.user_email == resume.user_email
    ).update({"is_primary": False})

    resume.is_primary = True

    db.commit()
    db.close()

    return {"message": "Primary resume updated successfully"}
@app.put("/resume/{resume_id}")
async def update_resume(
    resume_id: int,
    file: UploadFile = File(...)
):
    db = SessionLocal()

    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        db.close()
        raise HTTPException(status_code=404, detail="Resume not found")

    file_path = save_uploaded_pdf(file)
    extracted = extract_resume_data(file_path)
    if resume.resume_path and os.path.exists(resume.resume_path):
        os.remove(resume.resume_path)

    # Update database
    resume.resume_name = file.filename or "resume.pdf"
    resume.resume_path = file_path
    resume.resume_text = extracted["text"]
    resume.skills = ", ".join(extracted["skills"])
    resume.name = extracted["name"]
    resume.email = extracted["email"]
    resume.phone = extracted["phone"]
    resume.education = extracted["education"]
    resume.experience = extracted["experience"]

    db.commit()
    db.refresh(resume)
    db.close()

    return {
        "message": "Resume updated successfully"
    }


@app.post("/ats-analysis", response_model=ATSResponse)
def analyze_ats(request: ATSRequest):

    db = SessionLocal()

    try:
        resume = db.query(Resume).filter(
            Resume.id == request.resume_id
        ).first()

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found"
            )

        resume_skills = [
            skill.strip().lower()
            for skill in resume.skills.split(",")
            if skill.strip()
        ]

        jd_skills = []

        for skill in SKILLS:
            if skill.lower() in request.job_description.lower():
                jd_skills.append(skill.lower())

        matching = [
            skill for skill in jd_skills
            if skill in resume_skills
        ]

        missing = [
            skill for skill in jd_skills
            if skill not in resume_skills
        ]

        if len(jd_skills) == 0:
            score = 0
        else:
            score = int((len(matching) / len(jd_skills)) * 100)

        # Save ATS Analysis
        ats = ATSAnalysis(
            user_email=resume.user_email,
            resume_id=resume.id,
            score=score,
            job_description=request.job_description,
            matching_skills=",".join(matching),
            missing_skills=",".join(missing),
        )

        db.add(ats)
        db.commit()
        db.refresh(ats)

        return {
            "score": score,
            "matching_skills": [s.title() for s in matching],
            "missing_skills": [s.title() for s in missing]
        }

    finally:
        db.close()

@app.post("/resume-improvement", response_model=ResumeImprovementResponse)
def resume_improvement(request: ResumeImprovementRequest):

    db = SessionLocal()

    resume = db.query(Resume).filter(
        Resume.id == request.resume_id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    skills = [s.strip() for s in resume.skills.split(",") if s.strip()]

    strengths = []
    weaknesses = []
    recommendations = []

    if len(skills) >= 5:
        strengths.append("Good technical skill set")
    else:
        weaknesses.append("Very few technical skills")
        recommendations.append("Add more technical skills relevant to your career.")

    if resume.education:
        strengths.append("Education section is available")
    else:
        weaknesses.append("Education section missing")
        recommendations.append("Include your education details.")

    if resume.experience:
        strengths.append("Experience section available")
    else:
        recommendations.append("Add internships or projects.")

    improved_summary = (
        f"AI/ML enthusiast with skills in {resume.skills}. "
        "Seeking opportunities to apply technical knowledge and continuously learn."
    )

    record = ResumeImprovement(
        user_email=resume.user_email,
        resume_id=resume.id,
        strengths=",".join(strengths),
        weaknesses=",".join(weaknesses),
        recommendations=",".join(recommendations),
        improved_summary=improved_summary
    )
    
    db.add(record)
    db.commit()
    db.refresh(record)
    db.close()

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "improved_summary": improved_summary,
    }

@app.post("/skill-gap")
def skill_gap(request: SkillGapAnalysisRequest):

    db = SessionLocal()

    resume = db.query(Resume).filter(
        Resume.id == request.resume_id
    ).first()

    if not resume:
        db.close()
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_skills = [
        s.strip().lower()
        for s in resume.skills.split(",")
        if s.strip()
    ]

    jd = request.job_description.lower()

    job_skills = []

    for skill in SKILLS:
        if skill.lower() in jd:
            job_skills.append(skill)

    matched = []
    missing = []

    for skill in job_skills:
        if skill.lower() in resume_skills:
            matched.append(skill)
        else:
            missing.append(skill)

    score = 0

    if len(job_skills) > 0:
        score = round((len(matched) / len(job_skills)) * 100)

    skill_gap = SkillGapAnalysis(
        user_email=resume.user_email,
        resume_id=resume.id,
        matched_skills=",".join(matched),
        missing_skills=",".join(missing),
        recommended_skills=",".join(missing)
    )

    db.add(skill_gap)
    db.commit()
    db.refresh(skill_gap)
    db.close()

    return {
        "score": score,
        "matched_skills": matched,
        "missing_skills": missing
    }

@app.post("/career-recommendation", response_model=List[CareerRecommendationResponse])
def career_recommendation(request: CareerRecommendationRequest):

    db = SessionLocal()

    resume = db.query(Resume).filter(
        Resume.id == request.resume_id
    ).first()

    if not resume:
        db.close()
        raise HTTPException(status_code=404, detail="Resume not found")

    recommendations = recommend_roles(resume.skills)
    db.query(CareerRecommendation).filter(
        CareerRecommendation.resume_id == resume.id
    ).delete(synchronize_session=False)

    saved = []

    for item in recommendations:

        recommendation = CareerRecommendation(
            user_email=resume.user_email,
            resume_id=resume.id,
            recommended_role=item["role"],
            match_score=item["score"],
            reason=item["reason"]
        )

        db.add(recommendation)
        saved.append(recommendation)

    db.commit()
    for recommendation in saved:
        db.refresh(recommendation)

    return [
    {
        "id": item.id,
        "user_email": item.user_email,
        "resume_id": item.resume_id,
        "recommended_role": item.recommended_role,
        "match_score": item.match_score,
        "reason": item.reason,
        "created_at": item.created_at
    }
    for item in saved
]
@app.post(
    "/salary-prediction",
    response_model=SalaryPredictionResponse
)
def salary_prediction(request: SalaryPredictionRequest):

    db = SessionLocal()

    resume = db.query(Resume).filter(
        Resume.id == request.resume_id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    recommendations = recommend_roles(resume.skills)

    role = recommendations[0]["role"] if recommendations else "Software Engineer"

    salary = predict_salary(
        role,
        resume.experience
    )

    prediction = SalaryPrediction(
        user_email=resume.user_email,
        resume_id=resume.id,
        predicted_role=role,
        predicted_salary=salary,
        experience=resume.experience,
        education=resume.education,
        skills=resume.skills
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return prediction

@app.post(
    "/job-recommendation",
    response_model=List[JobRecommendationResponse]
)
def job_recommendation(request: JobRecommendationRequest):

    db = SessionLocal()

    resume = db.query(Resume).filter(
        Resume.id == request.resume_id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    skills = resume.skills.lower()

    jobs = []

    if "python" in skills:
        jobs.append({
            "company": "Google",
            "job_title": "Python Developer",
            "location": "Bangalore",
            "salary": "₹10-15 LPA",
            "skills_required": "Python, Django, SQL",
            "apply_link": "https://careers.google.com"
        })

    if "java" in skills:
        jobs.append({
            "company": "Infosys",
            "job_title": "Java Developer",
            "location": "Hyderabad",
            "salary": "₹6-9 LPA",
            "skills_required": "Java, Spring Boot",
            "apply_link": "https://careers.infosys.com"
        })

    if "machine learning" in skills:
        jobs.append({
            "company": "Microsoft",
            "job_title": "ML Engineer",
            "location": "Hyderabad",
            "salary": "₹18-25 LPA",
            "skills_required": "Python, ML, TensorFlow",
            "apply_link": "https://careers.microsoft.com"
        })

    if "sql" in skills:
        jobs.append({
            "company": "TCS",
            "job_title": "Data Analyst",
            "location": "Pune",
            "salary": "₹5-8 LPA",
            "skills_required": "SQL, Excel, Power BI",
            "apply_link": "https://www.tcs.com/careers"
        })

    saved_jobs = []

    for job in jobs:

        new_job = JobRecommendation(
            user_email=resume.user_email,
            resume_id=resume.id,
            company=job["company"],
            job_title=job["job_title"],
            location=job["location"],
            salary=job["salary"],
            skills_required=job["skills_required"],
            apply_link=job["apply_link"]
        )

        db.add(new_job)
        db.commit()
        db.refresh(new_job)

        saved_jobs.append(new_job)

    return saved_jobs

@app.post(
    "/course-recommendation",
    response_model=List[CourseRecommendationResponse]
)
def course_recommendation(request: CourseRecommendationRequest):

    db = SessionLocal()

    try:
        resume = db.query(Resume).filter(
            Resume.id == request.resume_id
        ).first()

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found"
            )

        resume_skills = [
            skill.strip().lower()
            for skill in resume.skills.split(",")
            if skill.strip()
        ]

        recommendations = []

        db.query(CourseRecommendation).filter(
            CourseRecommendation.resume_id == resume.id
        ).delete(synchronize_session=False)

        for skill, course in COURSES.items():

            if skill not in resume_skills:

                recommendation = CourseRecommendation(
                    user_email=resume.user_email,
                    resume_id=resume.id,
                    skill=skill,
                    course_name=course["course_name"],
                    platform=course["platform"],
                    course_link=course["course_link"]
                )

                db.add(recommendation)
                recommendations.append(recommendation)

        db.commit()
        for recommendation in recommendations:
            db.refresh(recommendation)

        result = [
            CourseRecommendationResponse.model_validate(course)
            for course in recommendations
        ]

        return result

    finally:
        db.close()

@app.post("/resume-builder", response_model=ResumeBuilderResponse)
def create_resume(request: ResumeBuilderRequest):

    db = SessionLocal()

    try:
        resume = ResumeBuilder(
            user_email=request.email,

            full_name=request.full_name,
            email=request.email,
            phone=request.phone,
            address=request.address,

            linkedin=request.linkedin,
            github=request.github,

            objective=request.objective,

            education=request.education,
            technical_skills=request.technical_skills,
            soft_skills=request.soft_skills,

            experience=request.experience,
            projects=request.projects,
            certifications=request.certifications,
            achievements=request.achievements,
            languages=request.languages
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return resume

    finally:
        db.close()@app.get("/resume-builder/{email}", response_model=ResumeBuilderResponse)
def get_resume_builder(email: str):

    db = SessionLocal()

    try:
        resume = db.query(ResumeBuilder).filter(
            ResumeBuilder.user_email == email
        ).first()

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found"
            )

        return resume

    finally:
        db.close()

@app.put("/resume-builder/{email}", response_model=ResumeBuilderResponse)
def update_resume_builder(email: str, request: ResumeBuilderRequest):

    db = SessionLocal()

    try:
        resume = db.query(ResumeBuilder).filter(
            ResumeBuilder.user_email == email
        ).first()

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found"
            )

        resume.full_name = request.full_name
        resume.phone = request.phone
        resume.address = request.address
        resume.linkedin = request.linkedin
        resume.github = request.github
        resume.objective = request.objective
        resume.education = request.education
        resume.technical_skills = request.technical_skills
        resume.soft_skills = request.soft_skills
        resume.experience = request.experience
        resume.projects = request.projects
        resume.certifications = request.certifications
        resume.achievements = request.achievements
        resume.languages = request.languages

        db.commit()
        db.refresh(resume)

        return resume

    finally:
        db.close()



@app.get(
    "/dashboard-analytics/{email}",
    response_model=DashboardAnalyticsResponse
)
def dashboard_analytics(email: str):

    db = SessionLocal()

    try:

        total_resumes = db.query(Resume).filter(
            Resume.user_email == email
        ).count()

        total_ats_analyses = db.query(ATSAnalysis).filter(
            ATSAnalysis.user_email == email
        ).count()

        total_resume_improvements = db.query(ResumeImprovement).filter(
            ResumeImprovement.user_email == email
        ).count()

        total_skill_gap = db.query(SkillGapAnalysis).filter(
            SkillGapAnalysis.user_email == email
        ).count()

        total_career = db.query(CareerRecommendation).filter(
            CareerRecommendation.user_email == email
        ).count()

        total_salary_predictions = db.query(SalaryPrediction
        ).filter(
            SalaryPrediction.user_email == email
        ).count()

        total_jobs = db.query(JobRecommendation).filter(
            JobRecommendation.user_email == email
        ).count()

        total_courses = db.query(CourseRecommendation).filter(
            CourseRecommendation.user_email == email
        ).count()

        salary_ranges = db.query(SalaryPrediction.predicted_salary).filter(
            SalaryPrediction.user_email == email
        ).all()
        salary_starts = []
        for (salary_range,) in salary_ranges:
            match = re.search(r"(\d+(?:\.\d+)?)", salary_range or "")
            if match:
                salary_starts.append(float(match.group(1)))
        average_salary = sum(salary_starts) / len(salary_starts) if salary_starts else 0

        latest_ats = (
            db.query(ATSAnalysis)
            .filter(ATSAnalysis.user_email == email)
            .order_by(ATSAnalysis.id.desc())
            .first()
        )

        latest_skill_gap = (
            db.query(SkillGapAnalysis)
            .filter(SkillGapAnalysis.user_email == email)
            .order_by(SkillGapAnalysis.id.desc())
            .first()
        )

        latest_career = (
            db.query(CareerRecommendation)
            .filter(CareerRecommendation.user_email == email)
            .order_by(CareerRecommendation.id.desc())
            .all()
        )

        latest_courses = (
            db.query(CourseRecommendation)
            .filter(CourseRecommendation.user_email == email)
            .order_by(CourseRecommendation.id.desc())
            .all()
        )
        ats_score = latest_ats.score if latest_ats else 0

        matching_skills = []
        missing_skills = []

        if latest_ats:
            matching_skills = (
                latest_ats.matching_skills.split(",")
                if latest_ats.matching_skills else []
            )

            missing_skills = (
                latest_ats.missing_skills.split(",")
                if latest_ats.missing_skills else []
            )

        recommended_careers = list(dict.fromkeys(
            c.recommended_role for c in latest_career
        ))

        recommended_courses = list(dict.fromkeys(
            c.course_name for c in latest_courses
        ))

        resume_status = "Ready" if total_resumes else "Upload a resume"

        job_description_status = (
            "Matched" if ats_score >= 60 else "Not Matched"
        )
    
        user = db.query(User).filter(User.email == email).first()
        profile_fields = [
            "full_name", "phone", "dob", "gender", "address", "qualification",
            "college", "branch", "graduation_year", "cgpa", "experience",
            "preferred_role", "preferred_location", "linkedin", "github",
            "technical_skills", "soft_skills", "certifications", "expected_salary",
        ]
        completed_fields = sum(bool(getattr(user, field, None)) for field in profile_fields) if user else 0
        profile_completion = round((completed_fields / len(profile_fields)) * 100)
        return DashboardAnalyticsResponse(
        score=ats_score,
        resume_status=resume_status,
        job_description_status=job_description_status,
        profile_completion=profile_completion,

        matching_skills=matching_skills,
        missing_skills=missing_skills,

        recommended_careers=recommended_careers,
        recommended_courses=recommended_courses,

        total_resumes=total_resumes,
        total_ats_analyses=total_ats_analyses,
        total_resume_improvements=total_resume_improvements,
        total_skill_gaps=total_skill_gap,
        total_career_recommendations=total_career,
        total_job_recommendations=total_jobs,
        total_course_recommendations=total_courses,
        total_salary_predictions=total_salary_predictions,
        average_salary=average_salary
    )

    finally:
        db.close()    
@app.get("/status")
def status():

    return {
        "status": "Running",
        "project": "AI-Powered Career Intelligence Platform",
        "version": "1.0"
    }


# ==========================================
# Computer Science Interview Prep Endpoints
# ==========================================

CS_INTERVIEW_QUESTIONS = [
    {
        "id": 1,
        "category": "Data Structures & Algorithms",
        "topic": "Array & Two Pointers",
        "difficulty": "Easy",
        "question": "What is the Time and Space Complexity of finding Two Sum using a Hash Map versus Two Pointers (on sorted array)?",
        "explanation": "Using a Hash Map (Unordered Map), we store elements as key and index as value. We check if (target - nums[i]) exists in O(1) average time. Total Time Complexity is O(N) and Space Complexity is O(N). When the array is already sorted, the Two Pointers technique uses left pointer at 0 and right pointer at N-1, giving O(N) Time and O(1) Space Complexity.",
        "key_concepts": ["Hash Map lookup O(1)", "Two Pointers on sorted array", "Time-Space trade-off"],
        "code_example": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
        "company_tags": ["Google", "Amazon", "Meta", "Microsoft"],
        "options": [
            "Hash Map: O(N) Time & O(N) Space; Sorted Two Pointers: O(N) Time & O(1) Space",
            "Hash Map: O(N^2) Time & O(1) Space; Sorted Two Pointers: O(N log N) Time & O(N) Space",
            "Both use O(1) Time and O(N) Space",
            "Both use O(N^2) Time and O(1) Space"
        ],
        "correct_option": 0
    },
    {
        "id": 2,
        "category": "Data Structures & Algorithms",
        "topic": "Dynamic Programming",
        "difficulty": "Hard",
        "question": "Explain the difference between Top-Down (Memoization) and Bottom-Up (Tabulation) Dynamic Programming with an example.",
        "explanation": "Top-Down DP starts with the main problem and recursively breaks it down into subproblems, caching (memoizing) results to avoid redundant calculations. It uses call stack memory O(N recursion stack). Bottom-Up DP starts by solving the smallest base subproblems first and iteratively fills a DP table up to the target state. It eliminates recursion stack overhead and allows space optimization (e.g. reduction from O(N) to O(1) in Fibonacci).",
        "key_concepts": ["Overlapping Subproblems", "Optimal Substructure", "Memoization vs Tabulation", "Space Compression"],
        "code_example": "# Bottom-Up DP for Fibonacci with O(1) Space\ndef fib(n):\n    if n <= 1: return n\n    prev2, prev1 = 0, 1\n    for _ in range(2, n + 1):\n        curr = prev1 + prev2\n        prev2, prev1 = prev1, curr\n    return prev1",
        "company_tags": ["Google", "Apple", "Netflix", "Amazon"],
        "options": [
            "Top-Down is iterative; Bottom-Up is recursive",
            "Top-Down uses recursion + memoization; Bottom-Up builds solution iteratively using a DP table",
            "Top-Down always takes higher Time Complexity than Bottom-Up",
            "There is no functional difference between them"
        ],
        "correct_option": 1
    },
    {
        "id": 3,
        "category": "Object-Oriented Programming",
        "topic": "OOP Principles & Design",
        "difficulty": "Medium",
        "question": "What are the 4 core pillars of OOPs and how does Abstraction differ from Encapsulation?",
        "explanation": "The 4 core pillars are Encapsulation, Abstraction, Inheritance, and Polymorphism.\n- Encapsulation is wrapping data (variables) and code (methods) into a single unit (class) and hiding private implementation details using access specifiers (private, protected, public).\n- Abstraction is hiding internal complexity and showing only relevant functionality to the user (e.g., via abstract classes or interfaces). Encapsulation is about Data Hiding; Abstraction is about Complexity Hiding.",
        "key_concepts": ["Encapsulation vs Abstraction", "Access Modifiers", "Interface vs Abstract Class", "SOLID Principles"],
        "code_example": "# Abstraction via Interface / Abstract Class in Python\nfrom abc import ABC, abstractmethod\n\nclass PaymentProcessor(ABC):\n    @abstractmethod\n    def process_payment(self, amount: float):\n        pass\n\nclass StripePayment(PaymentProcessor):\n    def process_payment(self, amount: float):\n        # Hidden internal API details (Encapsulation + Abstraction)\n        return f'Processed ${amount} via Stripe'",
        "company_tags": ["Microsoft", "Uber", "Amazon", "ServiceNow"],
        "options": [
            "Encapsulation hides complexity; Abstraction hides data",
            "Encapsulation wraps data & methods hiding private state; Abstraction shows essential features hiding background implementation",
            "Both terms refer to the exact same concept in Java/C++",
            "Abstraction requires multiple inheritance; Encapsulation requires interfaces"
        ],
        "correct_option": 1
    },
    {
        "id": 4,
        "category": "Object-Oriented Programming",
        "topic": "SOLID Principles",
        "difficulty": "Medium",
        "question": "What is the Liskov Substitution Principle (LSP) and how does violating it break software design?",
        "explanation": "Liskov Substitution Principle states that objects of a superclass should be replaceable with objects of a subclass without affecting the correctness of the program. A classic violation is a Square class inheriting from a Rectangle class, where setting width changes height. Subtypes must satisfy all contract expectations of the base type without throwing unexpected exceptions or altering state invariants.",
        "key_concepts": ["Liskov Substitution", "Subtyping Contract", "SOLID Architecture", "Behavioral Compatibility"],
        "code_example": "// LSP Violation Example\nclass Rectangle {\n    protected int width, height;\n    public void setWidth(int w) { this.width = w; }\n    public void setHeight(int h) { this.height = h; }\n}\nclass Square extends Rectangle {\n    public void setWidth(int w) { this.width = w; this.height = w; } // Breaks LSP!\n}",
        "company_tags": ["Amazon", "Google", "Goldman Sachs"],
        "options": [
            "Derived classes must override all parent methods as private",
            "Subclasses must be substitutable for their base classes without causing runtime bugs or altered expected behavior",
            "Classes should be open for modification and closed for extension",
            "Interfaces should contain at least 10 methods"
        ],
        "correct_option": 1
    },
    {
        "id": 5,
        "category": "Operating Systems",
        "topic": "Process & Concurrency",
        "difficulty": "Hard",
        "question": "What is a Deadlock, what are Coffman's 4 necessary conditions, and how can it be prevented?",
        "explanation": "A Deadlock is a state where a set of processes are blocked because each process holds a resource and waits for another resource held by another process.\nCoffman's 4 Conditions (all 4 MUST hold simultaneously for deadlock):\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\nDeadlock Prevention works by breaking at least 1 of these 4 conditions (e.g. imposing total order on resource acquisition to eliminate Circular Wait). Banker's Algorithm is used for Deadlock Avoidance.",
        "key_concepts": ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait", "Banker's Algorithm", "Semaphores & Mutex"],
        "code_example": "// Resource Ordering to Prevent Deadlock\nvoid acquireLocks(Mutex lockA, Mutex lockB) {\n    if (lockA.id < lockB.id) {\n        lockA.acquire();\n        lockB.acquire();\n    } else {\n        lockB.acquire();\n        lockA.acquire();\n    }\n}",
        "company_tags": ["Microsoft", "Google", "Intel", "Nvidia"],
        "options": [
            "Deadlock occurs when CPU utilization reaches 100%",
            "Deadlock requires 4 conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. Breaking any 1 prevents deadlock.",
            "Deadlock can only occur in single-threaded operating systems",
            "Bankers Algorithm guarantees 100% deadlock detection after crash"
        ],
        "correct_option": 1
    },
    {
        "id": 6,
        "category": "Operating Systems",
        "topic": "Memory Management",
        "difficulty": "Medium",
        "question": "What is Virtual Memory, Paging, and Page Fault Thrashing?",
        "explanation": "Virtual Memory provides an abstraction of huge contiguous memory space to processes using physical RAM and disk space. Paging divides virtual memory into fixed-size blocks (pages) and physical memory into page frames, mapped via a Page Table. A Page Fault occurs when a requested page is not in physical RAM. Thrashing happens when the OS spends more time swapping pages between RAM and disk than executing process instructions due to insufficient physical memory.",
        "key_concepts": ["Virtual Memory Mapping", "Page Table & TLB", "Page Fault Handling", "Thrashing & Working Set"],
        "code_example": "# Conceptual Virtual to Physical Address Translation\nVirtual Address = (Page Number << Page Shift) + Offset\nPage Frame = PageTable[Page Number]\nPhysical Address = (Page Frame << Page Shift) + Offset",
        "company_tags": ["Apple", "Qualcomm", "Amazon", "Microsoft"],
        "options": [
            "Thrashing occurs when CPU frequency is overclocked",
            "Thrashing happens when the OS constantly swaps pages in/out of disk due to high page fault frequency",
            "Virtual memory requires hardware without MMU",
            "Page faults cause permanent application termination"
        ],
        "correct_option": 1
    },
    {
        "id": 7,
        "category": "DBMS & SQL",
        "topic": "Transactions & ACID",
        "difficulty": "Hard",
        "question": "Explain ACID properties in relational databases and how isolation levels prevent anomalies like Dirty Read, Non-Repeatable Read, and Phantom Read.",
        "explanation": "ACID stands for Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions execution), and Durability (committed changes persist).\nIsolation Levels & Anomalies:\n- Read Uncommitted: Allows Dirty Reads (reading uncommitted changes).\n- Read Committed: Prevents Dirty Reads; allows Non-Repeatable Reads.\n- Repeatable Read: Prevents Dirty & Non-Repeatable Reads; allows Phantom Reads (new rows added concurrently).\n- Serializable: Prevents all anomalies using strict 2-Phase Locking or MVCC SSN.",
        "key_concepts": ["Atomicity, Consistency, Isolation, Durability", "Dirty Read", "Non-Repeatable Read", "Phantom Read", "MVCC"],
        "code_example": "-- Set transaction isolation level in PostgreSQL / MySQL\nSET TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nBEGIN;\nSELECT * FROM accounts WHERE balance > 1000;\n-- Concurrent inserts won't alter this snapshot in Repeatable Read\nCOMMIT;",
        "company_tags": ["Oracle", "Salesforce", "Uber", "Amazon"],
        "options": [
            "Serializable isolation level allows dirty reads for high speed",
            "Read Committed prevents Dirty Reads, Repeatable Read prevents Non-Repeatable Reads, and Serializable prevents Phantom Reads",
            "ACID properties apply exclusively to NoSQL MongoDB databases",
            "Atomicity guarantees database tables automatically create indexes"
        ],
        "correct_option": 1
    },
    {
        "id": 8,
        "category": "DBMS & SQL",
        "topic": "Indexing & Normalization",
        "difficulty": "Medium",
        "question": "How do B+ Trees optimize database indexing, and how does 3NF differ from BCNF?",
        "explanation": "B+ Trees store data pointers/records ONLY at leaf nodes, while internal nodes store only key routing indices. All leaf nodes are doubly linked, making range queries (BETWEEN val1 AND val2) fast with O(log N) point lookup and sequential disk scans. 3NF requires every non-prime attribute to depend ONLY on the primary key (no transitive dependency X -> Y -> Z). BCNF (Boyce-Codd Normal Form) is a stricter 3NF where for every functional dependency X -> Y, X MUST be a super key.",
        "key_concepts": ["B+ Tree Indexing", "Clustered vs Non-Clustered Index", "3NF vs BCNF", "Transitive Dependency"],
        "code_example": "-- SQL Index Creation on Multi-Columns\nCREATE INDEX idx_user_status_created \nON users (status, created_at);\n-- B+ Tree allows fast lookup for WHERE status='active' AND created_at >= '2026-01-01'",
        "company_tags": ["Meta", "Google", "Snowflake", "MongoDB"],
        "options": [
            "B+ Trees store all data records in the root node",
            "B+ Trees store data only at leaves linked sequentially; BCNF requires that for any X -> Y dependency, X must be a super key",
            "3NF requires no tables to have primary keys",
            "BCNF is weaker than 2NF"
        ],
        "correct_option": 1
    },
    {
        "id": 9,
        "category": "Computer Networks",
        "topic": "Protocols & TCP/IP",
        "difficulty": "Medium",
        "question": "What is the 3-Way Handshake in TCP, how does it differ from UDP, and what is the TLS 1.3 Handshake?",
        "explanation": "TCP 3-Way Handshake establishes a reliable connection:\n1. Client sends SYN (Synchronize sequence number)\n2. Server responds with SYN-ACK\n3. Client sends ACK (Acknowledge).\nUDP is connectionless, unreliable, and header-light (8 bytes vs TCP 20+ bytes), making it ideal for streaming and real-time gaming. TLS 1.3 reduces the security handshake to 1 round-trip time (1-RTT) by exchanging Diffie-Hellman keys alongside the initial ClientHello.",
        "key_concepts": ["SYN -> SYN-ACK -> ACK", "TCP Reliability vs UDP Speed", "TLS 1.3 1-RTT Handshake", "Flow Control & Congestion Window"],
        "code_example": "# Connection handshake flow\nClient -------- SYN (Seq=x) --------> Server\nClient <--- SYN-ACK (Seq=y,Ack=x+1) -- Server\nClient -------- ACK (Ack=y+1) -------> Server",
        "company_tags": ["Cisco", "Cloudflare", "Google", "AWS"],
        "options": [
            "TCP sends ACK -> SYN -> FIN; UDP uses 4-way handshake",
            "TCP establishes connection via SYN, SYN-ACK, ACK; UDP is connectionless; TLS 1.3 encrypts in 1 RTT",
            "UDP guarantees packet delivery order while TCP drops lost packets",
            "TLS 1.3 requires 5 round trips before sending application data"
        ],
        "correct_option": 1
    },
    {
        "id": 10,
        "category": "Computer Networks",
        "topic": "HTTP & Security",
        "difficulty": "Easy",
        "question": "What are HTTP Status Codes, RESTful principles, and how does HTTPS encrypt data?",
        "explanation": "HTTP Status Code categories: 1xx (Informational), 2xx (Success e.g. 200 OK, 201 Created), 3xx (Redirection e.g. 301 Moved, 304 Not Modified), 4xx (Client Error e.g. 400 Bad Req, 401 Unauthorized, 404 Not Found), 5xx (Server Error e.g. 500 Internal Error, 502 Bad Gateway). HTTPS uses SSL/TLS asymmetric encryption (RSA/ECC) during key exchange to establish a shared session key, followed by symmetric encryption (AES-GCM) for fast data payload transfer.",
        "key_concepts": ["HTTP Status Codes", "REST Statelessness", "Asymmetric Key Exchange", "Symmetric Session Encryption"],
        "code_example": "# Asymmetric + Symmetric Encryption in HTTPS\n1. Public Key (Asymmetric) -> Exchange Master Secret\n2. Session Key (Symmetric AES-256) -> Encrypt HTTP Requests/Responses",
        "company_tags": ["Cloudflare", "Akamai", "Meta", "Stripe"],
        "options": [
            "4xx indicates Server Error; 5xx indicates Client Error",
            "HTTPS uses Asymmetric key exchange to share a secret, then Symmetric AES encryption for speed during session",
            "RESTful APIs require maintaining server session state for all users",
            "Status 301 stands for Unauthorized Access"
        ],
        "correct_option": 1
    },
    {
        "id": 11,
        "category": "System Design",
        "topic": "Scalability & Load Balancing",
        "difficulty": "Hard",
        "question": "How do you design a scalable web application for millions of concurrent users using Load Balancers, Caching, and Database Sharding?",
        "explanation": "Scalable Architecture:\n1. Load Balancer (Nginx/HAProxy/AWS ALB): Distributes incoming requests across multiple stateless app servers using algorithms like Consistent Hashing or Least Connections.\n2. In-Memory Cache (Redis/Memcached): Caches hot read queries (Cache-Aside / Write-Through pattern) to reduce DB load by 90%+.\n3. Database Sharding & Read Replicas: Horizontally partition DB data by Shard Key (e.g. user_id hash) and route write queries to Master DB and read queries to Read Replicas.\n4. Asynchronous Queue (Kafka/RabbitMQ): Decouple heavy processing (email, video encoding).",
        "key_concepts": ["Horizontal vs Vertical Scaling", "Consistent Hashing", "Redis Cache-Aside", "Database Sharding", "Message Queues"],
        "code_example": "[ Clients ] ---> [ CDN / Cloudflare ]\n                    |\n            [ Load Balancer ]\n            /       |       \\\n      [App Svr1] [App Svr2] [App Svr3]\n          |         |         |\n      [ Redis Cache Cluster ] (Hot Reads)\n          |         |         |\n      [ Master DB (Writes) ] ---> [ Read Replicas (Reads) ]",
        "company_tags": ["Uber", "Netflix", "Amazon", "System Design Interview"],
        "options": [
            "Scale vertically by buying 1 single server with 1000 TB RAM",
            "Use Load Balancer for stateless servers, Redis caching for hot reads, Read Replicas & Database Sharding for DB scaling, and Kafka for async processing",
            "Never use caching because disk drives are faster than RAM",
            "Consistent Hashing requires remapping 100% of keys when a node is added"
        ],
        "correct_option": 1
    },
    {
        "id": 12,
        "category": "System Design",
        "topic": "Distributed Systems & CAP Theorem",
        "difficulty": "Hard",
        "question": "What is the CAP Theorem and how does Pacelc Theorem extend it for latency?",
        "explanation": "CAP Theorem states that a distributed data store can simultaneously satisfy at most 2 out of 3 guarantees: Consistency (all nodes see same data at same time), Availability (every request receives non-error response), Partition Tolerance (system continues operating despite network node drops). Since networks are always subject to partitions (P), distributed DBs choose between CP (e.g. HBase, MongoDB) or AP (e.g. Cassandra, DynamoDB). PACELC extends CAP: If there is a Partition (P), choose Availability (A) or Consistency (C); Else (E), choose Latency (L) or Consistency (C).",
        "key_concepts": ["Consistency", "Availability", "Partition Tolerance", "PACELC Theorem", "Eventual Consistency"],
        "code_example": "# CAP Trade-off Matrix\nCP Systems: MongoDB, HBase, Redis Cluster (Prioritizes strict data correctness)\nAP Systems: Apache Cassandra, Amazon DynamoDB, CouchDB (Prioritizes 99.999% uptime)",
        "company_tags": ["Google", "Amazon", "LinkedIn", "Databricks"],
        "options": [
            "CAP theorem guarantees you can get Consistency, Availability, and Partition Tolerance all at 100%",
            "In network partition (P), distributed systems must trade off Consistency (CP) vs Availability (AP); PACELC adds latency trade-off during normal operations",
            "Partition tolerance can be turned off in WAN cloud environments",
            "Eventual Consistency means data is never consistent"
        ],
        "correct_option": 1
    },
    {
        "id": 13,
        "category": "Software Engineering",
        "topic": "Git & CI/CD",
        "difficulty": "Easy",
        "question": "What is the difference between Git Rebase and Git Merge, and what constitutes a robust CI/CD pipeline?",
        "explanation": "Git Merge combines feature branch changes into target branch by creating a new merge commit, preserving exact branch history. Git Rebase moves/re-applies commits from feature branch on top of base branch, creating a clean linear project history (avoid rebasing public shared branches!). A robust CI/CD pipeline includes: Automated Testing (Unit, Integration), Static Code Analysis & Linter checks, Containerization (Docker), Artifact Building, and Zero-Downtime Deployment (Blue-Green / Canary Releases).",
        "key_concepts": ["Git Rebase vs Merge", "Linear History", "CI/CD Pipeline", "Blue-Green Deployment"],
        "code_example": "# Git Rebase Workflow\ngit checkout feature-branch\ngit fetch origin\ngit rebase origin/main\n# Resolve conflicts locally, then push clean linear commits",
        "company_tags": ["GitHub", "GitLab", "Atlassian", "Microsoft"],
        "options": [
            "Rebase creates extra merge commits; Merge deletes branch history",
            "Merge creates a merge commit preserving exact history; Rebase moves commits onto base for a linear history; CI/CD automates testing and deployment",
            "CI/CD replaces source control repositories",
            "Git rebase should always be executed on production main branch"
        ],
        "correct_option": 1
    },
    {
        "id": 14,
        "category": "Data Structures & Algorithms",
        "topic": "Trees & Graphs",
        "difficulty": "Medium",
        "question": "Compare Breadth-First Search (BFS) and Depth-First Search (DFS) in graph traversal and state when to use Dijkstra's Algorithm.",
        "explanation": "BFS uses a Queue data structure (FIFO) to explore nodes level-by-level, making it ideal for finding shortest path in unweighted graphs. Time: O(V + E), Space: O(V). DFS uses a Stack (or recursion) to explore as deep as possible along each branch, ideal for topological sort, cycle detection, and maze solving. Dijkstra's Algorithm finds the shortest path in weighted graphs with non-negative edge weights using a Min-Priority Queue in O((V + E) log V) time.",
        "key_concepts": ["BFS (Queue)", "DFS (Stack/Recursion)", "Dijkstra's Algorithm (Min Heap)", "Shortest Path in Weighted Graph"],
        "code_example": "# Dijkstra's Algorithm using heapq in Python\nimport heapq\n\ndef dijkstra(graph, start):\n    distances = {node: float('inf') for node in graph}\n    distances[start] = 0\n    pq = [(0, start)]\n    while pq:\n        curr_dist, u = heapq.heappop(pq)\n        if curr_dist > distances[u]: continue\n        for v, weight in graph[u]:\n            if distances[u] + weight < distances[v]:\n                distances[v] = distances[u] + weight\n                heapq.heappush(pq, (distances[v], v))\n    return distances",
        "company_tags": ["Google", "Uber", "Meta", "Amazon"],
        "options": [
            "BFS uses Stack; DFS uses Queue",
            "BFS explores level-by-level using Queue (shortest path unweighted); DFS explores deep using Stack; Dijkstra uses Min-Heap for non-negative weighted graphs",
            "Dijkstra works on graphs with negative weight cycles",
            "BFS takes O(V^3) time complexity"
        ],
        "correct_option": 1
    }
]


@app.get("/interview-prep/questions")
def get_interview_questions(category: str = "All", search: str = "", difficulty: str = "All"):
    filtered = CS_INTERVIEW_QUESTIONS
    if category != "All" and category != "":
        filtered = [q for q in filtered if q["category"].lower() == category.lower()]
    if difficulty != "All" and difficulty != "":
        filtered = [q for q in filtered if q["difficulty"].lower() == difficulty.lower()]
    if search:
        s = search.lower()
        filtered = [
            q for q in filtered
            if s in q["question"].lower()
            or s in q["topic"].lower()
            or s in q["category"].lower()
            or any(s in tag.lower() for tag in q["company_tags"])
        ]
    return {
        "count": len(filtered),
        "categories": [
            "All",
            "Data Structures & Algorithms",
            "Object-Oriented Programming",
            "Operating Systems",
            "DBMS & SQL",
            "Computer Networks",
            "System Design",
            "Software Engineering"
        ],
        "questions": filtered
    }


@app.post("/interview-prep/mock-test")
def generate_mock_test(payload: MockTestRequest):
    import random
    category = payload.category or "All"
    count = payload.count or 5
    filtered = CS_INTERVIEW_QUESTIONS
    if category != "All":
        filtered = [q for q in filtered if q["category"].lower() == category.lower()]
    
    if not filtered:
        filtered = CS_INTERVIEW_QUESTIONS
        
    selected = random.sample(filtered, min(count, len(filtered)))
    return {
        "test_id": f"mock_{random.randint(1000, 9999)}",
        "total_questions": len(selected),
        "questions": selected
    }


@app.post("/interview-prep/evaluate")
def evaluate_interview_answer(payload: InterviewEvalRequest):
    q_id = payload.question_id
    user_ans = payload.user_answer.strip()
    
    question = next((q for q in CS_INTERVIEW_QUESTIONS if q["id"] == q_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    if not user_ans or len(user_ans) < 5:
        return {
            "score": 2,
            "verdict": "Needs Improvement",
            "feedback": "Your answer is too short. Try to include theoretical fundamentals, complexity analysis, and real-world examples.",
            "key_points_covered": [],
            "key_points_missed": question["key_concepts"],
            "model_answer": question["explanation"]
        }
        
    # Evaluate key concept coverage
    user_ans_lower = user_ans.lower()
    covered = []
    missed = []
    
    for concept in question["key_concepts"]:
        words = [w.lower() for w in concept.split() if len(w) > 3]
        if any(w in user_ans_lower for w in words):
            covered.append(concept)
        else:
            missed.append(concept)
            
    coverage_ratio = len(covered) / len(question["key_concepts"]) if question["key_concepts"] else 1.0
    
    score = int(coverage_ratio * 7) + (3 if len(user_ans) > 50 else 1)
    score = min(10, max(1, score))
    
    if score >= 8:
        verdict = "Excellent!"
        feedback = "Outstanding response! You effectively hit key theoretical points and complexity parameters."
    elif score >= 5:
        verdict = "Good Effort"
        feedback = "Solid answer! Consider adding more specific terminology and complexity details."
    else:
        verdict = "Needs Improvement"
        feedback = "Your answer covers basic intuition but misses key Computer Science concepts and technical nuances."
        
    return {
        "score": score,
        "verdict": verdict,
        "feedback": feedback,
        "key_points_covered": covered,
        "key_points_missed": missed,
        "model_answer": question["explanation"]
    }

