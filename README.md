# 🚀 AI Career Intelligence & CS Interview Preparation Platform

An end-to-end AI-powered career guidance, resume analytics, ATS optimization, and Computer Science interview preparation ecosystem.

---

## 🌟 Key Features & Modules

### 🧠 1. Computer Science Interview Preparation Module
- **7 Core CS Domains Covered**:
  - **Data Structures & Algorithms (DSA)**: Two Pointers, Dynamic Programming, Trees, Graphs, Dijkstra.
  - **Object-Oriented Programming (OOPs)**: Pillars of OOPs, Encapsulation vs Abstraction, SOLID & Liskov Substitution Principle.
  - **Operating Systems (OS)**: Deadlocks & Coffman Conditions, Virtual Memory, Paging & Thrashing.
  - **Database Management Systems (DBMS & SQL)**: ACID Properties, Transaction Isolation Levels, B+ Tree Indexing, 3NF & BCNF.
  - **Computer Networks (CN)**: TCP 3-Way Handshake, UDP, TLS 1.3, HTTP Status Codes & HTTPS Security.
  - **System Design (HLD & LLD)**: Scalability, Load Balancing, Redis Caching, DB Sharding, CAP & PACELC Theorem.
  - **Software Engineering**: Git Rebase vs Merge, CI/CD Pipeline Best Practices.
- **3 Practice Modes**:
  - 📚 **Concept Explorer & Q&A**: Deep dives with difficulty tags, company badges (*Google, Amazon, Meta, Microsoft, Uber*), and syntax-highlighted code snippets.
  - 🎴 **Interactive Flashcards**: Flip cards to test memory recall.
  - ⚡ **AI Mock Quiz Challenge**: 5-question timed multiple choice quiz with instant scoring and detailed explanations.
- **🎯 AI Answer Evaluator**: Type out your explanation to any interview question and get instant score out of 10, feedback, and breakdown of key technical concepts covered vs missed.

### 📊 2. Dashboard Analytics & Interactive Charts
- **Recharts Visual Telemetry**:
  - 📊 **Skill Match vs Gap Distribution**: Bar chart comparing matching vs missing skills.
  - 🍩 **Skill Compatibility Share**: Donut chart visualizing match rate percentage.
  - ⚡ **Feature Activity Breakdown**: Telemetry across ATS Scans, Skill Gap, Career Recs, Job Recs, Course Recs, and Salary Predictions.
  - 📈 **Estimated Salary Growth Trajectory**: Experience-level benchmark curve (Fresher -> 1-3 Yrs -> 3-5 Yrs -> 5-8 Yrs -> 8+ Yrs).
- **6 Real-time KPI Cards**: ATS Score %, Resume Status, JD Alignment, Profile Readiness %, Predicted Salary (LPA), and Career Recommendations.

### 🛡️ 3. Admin Console & Management Dashboard
- **User Management**: Live search, paginated user table, user details drawer, and safe account deletion.
- **Resume & Telemetry Monitoring**: Recent upload logs, skill detection breakdown, and primary resume tags.
- **System & API Health**: Live latency monitors, DB connection status, and active admin sessions.

### 📄 4. Resume Intelligence & Career Optimization
- **ATS Resume Analysis**: Upload PDF resumes to compute ATS compatibility scores against target Job Descriptions.
- **Skill Gap Discovery**: Identifies missing skills required for target roles.
- **Career & Course Recommendations**: Tailored role recommendations and skill improvement courses.
- **Salary Prediction Engine**: Role and experience-based salary predictions.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, React Router DOM v6, Recharts, Vanilla CSS (Glassmorphism UI) |
| **Backend** | Python 3, FastAPI, Uvicorn, SQLAlchemy, Pydantic |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) |
| **Authentication & Security** | Passlib (BCrypt hashing), Admin Session tokens, CORS Middleware |
| **PDF Processing** | PyMuPDF (fitz) |

---

## 🏗️ Project Architecture

```text
my-career-intelligence-platform/
├── backend/                        # FastAPI Backend Application
│   ├── main.py                     # API Routes, CS Datasets & Endpoints
│   ├── models.py                   # SQLAlchemy Database Models
│   ├── schemas.py                  # Pydantic Schemas
│   ├── database.py                 # DB Engine Setup
│   ├── skills.py                   # Skills Dictionary
│   └── requirements.txt            # Python Dependencies
│
└── frontend/                       # React Frontend Application
    ├── src/
    │   ├── pages/
    │   │   ├── InterviewPrep.js    # CS Interview Prep Module
    │   │   ├── AdminDashboard.js   # Admin Console & Recharts Analytics
    │   │   ├── DashboardAnalytics.js # User Telemetry & Charts
    │   │   ├── ATSAnalysis.js      # ATS Compatibility Calculator
    │   │   └── ...
    │   ├── components/
    │   │   ├── AnalyticsCharts.js  # Recharts Visualizations
    │   │   ├── Sidebar.js          # Navigation Menu
    │   │   └── Layout.js           # Page Wrapper Layout
    │   ├── App.js                  # React Router Route Registry
    │   └── index.js
    ├── public/
    └── package.json
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Set Up & Run Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- 🌐 **Backend API Status**: `http://127.0.0.1:8000/status`
- 📖 **Interactive OpenAPI Docs**: `http://127.0.0.1:8000/docs`

---

### 2. Set Up & Run Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```
- 🌐 **Frontend URL**: `http://localhost:3000` (or `http://localhost:3001`)

---

## ☁️ Deployment Summary

### Frontend (Vercel / Netlify / Firebase)
1. Set Root Directory: `frontend`
2. Build Command: `npm run build`
3. Environment Variable: `REACT_APP_API_URL` = `https://your-backend.onrender.com`

### Backend (Render / Railway / Cloud Run)
1. Set Root Directory: `backend`
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
