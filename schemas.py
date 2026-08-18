from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from typing import List


# Register Schema
class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    phone: str
    dob: str
    gender: str
    address: str

    qualification: str
    college: str
    branch: str
    graduation_year: str
    cgpa: str

    experience: str
    preferred_role: str
    preferred_location: str

    linkedin: str
    github: str

    technical_skills: str
    soft_skills: str
    certifications: str

    expected_salary: str


# Login Schema
class UserLogin(BaseModel):
    email: str
    password: str


# Resume Response Schema
class ResumeResponse(BaseModel):
    id: int
    user_email: str
    resume_name: str
    resume_path: str
    name: str
    email: str
    phone: str
    education: str
    experience: str
    skills: str
    uploaded_at: datetime
    is_primary: bool
    resume_text:str
    uploaded_at: datetime 
    is_primary: bool

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True
#profileupdate
class ProfileUpdate(BaseModel):
    full_name: str
    email: str
    phone: str
    dob: str
    gender: str
    address: str

    qualification: str
    college: str
    branch: str
    graduation_year: str
    cgpa: str

    experience: str
    preferred_role: str
    preferred_location: str

    linkedin: str
    github: str

    technical_skills: str
    soft_skills: str
    certifications: str

    expected_salary: str

class ResumeImprovementRequest(BaseModel):
    resume_id: int

class ResumeImprovementResponse(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    improved_summary: str

class ATSRequest(BaseModel):
    resume_id: int
    job_description: str


class ATSResponse(BaseModel):
    score: int
    missing_skills: List[str]
    matching_skills: List[str]

class SkillGapAnalysisRequest(BaseModel):
    resume_id: int
    job_description: str
class SkillGapAnalysisResponse(BaseModel):
    score: int
    missing_skills: List[str]   
    matching_skills: List[str]

class CareerRecommendationRequest(BaseModel):
    resume_id: int


class CareerRecommendationResponse(BaseModel):
    id: int
    user_email: str
    resume_id: int
    recommended_role: str
    match_score: int
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True

class SkillGapAnalysisResponse(BaseModel):
    id: int
    user_email: str
    missing_skills: str

    class Config:
        from_attributes = True

class SalaryPredictionRequest(BaseModel):
    resume_id: int

class SalaryPredictionResponse(BaseModel):
    id: int
    user_email: str
    resume_id: int
    predicted_role: str
    predicted_salary: str
    experience: str
    education: str
    skills: str
    created_at: datetime

    class Config:
        from_attributes = True

class JobRecommendationRequest(BaseModel):
    resume_id: int


class JobRecommendationResponse(BaseModel):
    id: int
    user_email: str
    resume_id: int
    job_title: str
    company: str
    location: str
    salary: str
    match_score: Optional[int] = None
    skills_required: Optional[str] = None
    created_at: datetime
    apply_link: str

    class Config:
        from_attributes = True

class CourseRecommendationRequest(BaseModel):
    resume_id: int


class CourseRecommendationResponse(BaseModel):
    id: int
    user_email: str
    resume_id: int
    skill: str
    course_name: str
    platform: str
    course_link: str
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeBuilderRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    address: str

    linkedin: str
    github: str

    objective: str

    education: str
    technical_skills: str
    soft_skills: str

    experience: str
    projects: str
    certifications: str
    achievements: str
    languages: str

class ResumeBuilderResponse(BaseModel):
    id: int

    user_email: str

    full_name: str
    email: str
    phone: str
    address: str

    linkedin: str
    github: str

    objective: str

    education: str
    technical_skills: str
    soft_skills: str

    experience: str
    projects: str
    certifications: str
    achievements: str
    languages: str

    created_at: datetime

    class Config:
        from_attributes = True

class DashboardAnalyticsResponse(BaseModel):
    score: int
    resume_status: str
    job_description_status: str
    profile_completion: int

    matching_skills: List[str]
    missing_skills: List[str]

    recommended_careers: List[str]
    recommended_courses: List[str]

    total_resumes: int
    total_ats_analyses: int
    total_resume_improvements: int
    total_skill_gaps: int
    total_career_recommendations: int
    total_job_recommendations: int
    total_course_recommendations: int
    total_salary_predictions: int

    average_salary: float

    model_config = {
        "from_attributes": True
    }


class InterviewEvalRequest(BaseModel):
    question_id: int
    user_answer: str


class MockTestRequest(BaseModel):
    category: Optional[str] = "All"
    count: Optional[int] = 5

    