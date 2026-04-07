# 🎓 AI-Powered Learning Management System (LMS)

> An intelligent educational platform featuring AI-powered quiz generation, student performance prediction, and comprehensive analytics dashboard.

## 📋 Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [AI/ML Features](#aiml-features)
- [User Workflows](#user-workflows)
- [Environment Configuration](#environment-configuration)
- [Presentation Talking Points](#presentation-talking-points)

---

## 🎯 Overview

This AI-powered LMS is a full-stack web application designed to revolutionize the educational experience through intelligent automation and predictive analytics. The system serves two primary user roles:

### Faculty Features
- **AI Quiz Generation**: Upload PDFs or paste content to automatically generate multiple-choice quizzes using OpenRouter AI
- **Student Management**: Add students individually or bulk upload via CSV
- **Course Management**: Create and organize courses with student enrollment
- **Analytics Dashboard**: Visualize student performance with interactive charts
- **Performance Prediction**: Identify at-risk students using ML models
- **Quiz Management**: Publish/unpublish quizzes, review student attempts

### Student Features
- **Interactive Quiz Taking**: Attempt quizzes with real-time feedback
- **Performance Tracking**: View scores, trends, and progress over time
- **AI-Powered Feedback**: Receive personalized study recommendations
- **Performance Prediction**: See AI-predicted performance category
- **Attempt History**: Review past quiz attempts with detailed results

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│         React 19 + Vite 8 + TailwindCSS v4                  │
│              (Port 5173 - Development)                       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                         │
│              Express 5 + MongoDB + JWT Auth                  │
│                    (Port 5000)                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Routes  │  │ Quiz Routes  │  │ Prediction   │     │
│  │              │  │              │  │ Routes       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │         OpenRouter AI Integration                 │      │
│  │  (Quiz Generation + Feedback Generation)          │      │
│  └──────────────────────────────────────────────────┘      │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│   MongoDB Atlas  │    │   ML Backend (Python)│
│   (Database)     │    │   FastAPI + sklearn  │
│                  │    │   (Port 8000)        │
│  • Students      │    │                      │
│  • Faculty       │    │  • Random Forest     │
│  • Courses       │    │  • Logistic Reg.     │
│  • Quizzes       │    │  • TF-IDF Similarity │
│  • Attempts      │    │  • NLTK Processing   │
│  • Predictions   │    │                      │
└──────────────────┘    └──────────────────────┘
```

---

## ✨ Key Features

### 1. **AI-Powered Quiz Generation**
- Upload PDF documents or paste text content
- AI automatically generates multiple-choice questions with:
  - 4 options per question
  - Correct answer identification
  - Detailed explanations
- Configurable difficulty levels (Easy, Medium, Hard)
- Customizable number of questions (5-30)
- Quizzes saved as drafts for review before publishing

### 2. **Student Performance Prediction**
- Machine Learning models predict student performance categories:
  - **High Performing**: 70%+ predicted score
  - **Average**: 45-70% predicted score
  - **At Risk**: <45% predicted score
- Features used for prediction:
  - Average quiz scores
  - Attendance percentage
  - Average response time
  - Total quiz attempts
  - Score consistency (standard deviation)
- Dual model approach: Random Forest (primary) + Logistic Regression (backup)

### 3. **Intelligent Feedback System**
- AI-generated personalized feedback after each quiz
- Identifies weak topics and provides study recommendations
- Contextual suggestions based on performance level
- Encourages continuous improvement

### 4. **Comprehensive Analytics**
- **Faculty Dashboard**:
  - Student performance distribution
  - Score trends over time
  - At-risk student identification
  - Course-wise performance breakdown
  - Difficulty-level analysis
- **Student Dashboard**:
  - Personal score history
  - Performance trends
  - Pending quizzes
  - Recent attempts

### 5. **Secure Authentication**
- JWT-based authentication
- Role-based access control (Faculty/Student)
- Password hashing with bcrypt
- Protected API routes

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | UI framework |
| Vite | 8.0.4 | Build tool & dev server |
| React Router | 7.14.0 | Client-side routing |
| Axios | 1.14.0 | HTTP client |
| Recharts | 3.8.1 | Data visualization |
| React Hot Toast | 2.6.0 | Notifications |
| React Icons | 5.6.0 | Icon library |
| TailwindCSS | v4 | Styling (custom design system) |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | Runtime environment |
| Express | 5.2.1 | Web framework |
| MongoDB | - | NoSQL database |
| Mongoose | 9.4.1 | ODM for MongoDB |
| JWT | 9.0.3 | Authentication tokens |
| bcryptjs | 3.0.3 | Password hashing |
| Multer | 2.1.1 | File upload handling |
| pdf-parse | 2.4.5 | PDF text extraction |
| Axios | 1.14.0 | HTTP client (OpenRouter API) |
| dotenv | 17.4.1 | Environment variables |
| CORS | 2.8.6 | Cross-origin requests |

### ML Backend (Python)
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115.12 | API framework |
| Uvicorn | 0.34.2 | ASGI server |
| scikit-learn | 1.6.1 | ML models |
| NumPy | 2.2.5 | Numerical computing |
| NLTK | 3.9.1 | NLP processing |
| Pydantic | 2.11.3 | Data validation |

### AI Integration
- **OpenRouter API**: AI quiz generation and feedback
  - Model: `meta-llama/llama-3.1-8b-instruct:free` (configurable)
  - Structured XML output parsing
  - Fallback error handling

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+ and npm
- Python 3.9+
- MongoDB (local or Atlas)
- OpenRouter API Key ([Get one here](https://openrouter.ai/))

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd capstone_ai_quiz
```

### Step 2: Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_lms
JWT_SECRET=your_super_secret_jwt_key_change_this
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
ML_SERVICE_URL=http://localhost:8000
EOL

# Start backend server
npm run dev
```

### Step 3: ML Backend Setup
```bash
cd ml_backend
pip install -r requirements.txt

# Start ML service
python main.py
```

### Step 4: Frontend Setup
```bash
cd frontend
npm install

# Update vite.config.js proxy if needed (already configured)
npm run dev
```

### Step 5: Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (FastAPI auto-generated)

---

## 📁 Project Structure

```
capstone_ai_quiz/
│
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   └── shared/         # Reusable components
│   │   │       ├── Navbar.jsx
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state
│   │   ├── pages/
│   │   │   ├── auth/           # Login & Register
│   │   │   ├── faculty/        # Faculty pages (7 pages)
│   │   │   └── student/        # Student pages (5 pages)
│   │   ├── services/
│   │   │   └── api.js          # Axios instance with interceptors
│   │   ├── App.jsx             # Main routing
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # TailwindCSS + custom styles
│   ├── vite.config.js          # Vite configuration
│   └── package.json
│
├── backend/                     # Node.js backend
│   ├── models/                 # Mongoose schemas
│   │   ├── Student.js
│   │   ├── Faculty.js
│   │   ├── Course.js
│   │   ├── Quiz.js
│   │   ├── QuizAttempt.js
│   │   └── PredictionResult.js
│   ├── routes/                 # API endpoints
│   │   ├── auth.js            # Authentication
│   │   ├── students.js        # Student management
│   │   ├── courses.js         # Course management
│   │   ├── quiz.js            # Quiz CRUD + generation
│   │   └── prediction.js      # ML predictions
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── uploads/               # Temporary file storage
│   ├── server.js              # Express app entry
│   ├── .env                   # Environment variables
│   └── package.json
│
├── ml_backend/                 # Python ML service
│   ├── main.py                # FastAPI app with ML models
│   └── requirements.txt
│
└── README.md                   # This file
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Faculty Register
```http
POST /api/auth/faculty-register
Content-Type: application/json

{
  "name": "Dr. John Smith",
  "email": "john@university.edu",
  "password": "securepass123"
}

Response: { token, user }
```

#### Faculty Login
```http
POST /api/auth/faculty-login
Content-Type: application/json

{
  "email": "john@university.edu",
  "password": "securepass123"
}

Response: { token, user }
```

#### Student Login
```http
POST /api/auth/student-login
Content-Type: application/json

{
  "registerNumber": "CS2024001",
  "password": "student123"
}

Response: { token, user }
```

### Quiz Endpoints

#### Generate Quiz (AI)
```http
POST /api/quiz/generate
Authorization: Bearer <faculty_token>
Content-Type: multipart/form-data

FormData:
- file: PDF/TXT file (optional)
- courseId: string (required)
- title: string (optional)
- numberOfQuestions: number (5-30)
- difficulty: "Easy" | "Medium" | "Hard"
- textContent: string (optional)

Response: { message, quiz }
```

#### Get All Quizzes
```http
GET /api/quiz
Authorization: Bearer <token>

Response: Quiz[] (faculty: all their quizzes, student: active quizzes only)
```

#### Submit Quiz
```http
POST /api/quiz/submit
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "quizId": "quiz_id",
  "answers": [
    { "selectedAnswer": "Option A" },
    { "selectedAnswer": "Option C" }
  ],
  "responseTime": 180
}

Response: { score, correctAnswers, feedback, results }
```

### Prediction Endpoints

#### Get Student Prediction
```http
GET /api/prediction/:studentId
Authorization: Bearer <token>

Response: {
  prediction: {
    score: 75.5,
    category: "High Performing",
    modelUsed: "Random Forest",
    features: { ... }
  }
}
```

#### Get Faculty Analytics
```http
GET /api/prediction/analytics/summary
Authorization: Bearer <faculty_token>

Response: {
  totalStudents, totalAttempts, averageScore,
  categoryDistribution, scoreDistribution, atRiskStudents
}
```

### ML Service Endpoints

#### Predict Performance
```http
POST http://localhost:8000/predict
Content-Type: application/json

{
  "avg_score": 75.5,
  "attendance": 85.0,
  "avg_response_time": 120.0,
  "total_attempts": 5,
  "consistency": 80.0
}

Response: {
  prediction_score, category, model_used, confidence, probabilities
}
```

---

## 🗄️ Database Schema

### Student Model
```javascript
{
  name: String (required),
  registerNumber: String (unique, required),
  password: String (hashed, required),
  facultyId: ObjectId (ref: Faculty),
  attendance: Number (0-100, default: 85),
  email: String,
  timestamps: true
}
```

### Faculty Model
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  timestamps: true
}
```

### Course Model
```javascript
{
  title: String (required),
  description: String,
  facultyId: ObjectId (ref: Faculty),
  students: [ObjectId] (ref: Student),
  timestamps: true
}
```

### Quiz Model
```javascript
{
  title: String (required),
  courseId: ObjectId (ref: Course),
  facultyId: ObjectId (ref: Faculty),
  questions: [{
    question: String,
    options: [String] (4 options),
    correctAnswer: String,
    explanation: String
  }],
  difficulty: "Easy" | "Medium" | "Hard",
  timeLimit: Number (minutes, default: 30),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### QuizAttempt Model
```javascript
{
  studentId: ObjectId (ref: Student),
  quizId: ObjectId (ref: Quiz),
  courseId: ObjectId (ref: Course),
  answers: [{
    questionIndex: Number,
    selectedAnswer: String,
    isCorrect: Boolean
  }],
  score: Number (0-100),
  totalQuestions: Number,
  correctAnswers: Number,
  responseTime: Number (seconds),
  attemptNumber: Number,
  feedback: String (AI-generated),
  timestamps: true
}
```

### PredictionResult Model
```javascript
{
  studentId: ObjectId (ref: Student),
  predictionScore: Number (0-100),
  category: "High Performing" | "Average" | "At Risk",
  features: {
    avgScore, attendance, avgResponseTime,
    totalAttempts, consistency
  },
  modelUsed: String (default: "Random Forest"),
  timestamps: true
}
```

---

## 🤖 AI/ML Features

### 1. Quiz Generation (OpenRouter AI)

**Process Flow:**
1. Faculty uploads PDF or pastes text content
2. Backend extracts text using `pdf-parse`
3. Constructs structured prompt for AI:
   ```
   Generate N questions based on content
   Difficulty: [Easy/Medium/Hard]
   Return XML format with <quiz><question>...</question></quiz>
   ```
4. OpenRouter API processes with Llama 3.1 model
5. Backend parses XML response
6. Validates questions (4 options, correct answer match)
7. Saves quiz as draft in MongoDB

**Error Handling:**
- Fallback for API failures
- XML parsing validation
- Option count verification
- Correct answer matching

### 2. Performance Prediction (ML Models)

**Training Data:**
- 500 synthetic student records
- Features: avg_score, attendance, avg_response_time, total_attempts, consistency
- Labels: High Performing (0), Average (1), At Risk (2)

**Models:**
- **Random Forest Classifier** (Primary)
  - 100 estimators, max_depth=10
  - Handles non-linear relationships
  - Feature importance analysis
- **Logistic Regression** (Backup)
  - Multinomial classification
  - Faster inference
  - Interpretable coefficients

**Feature Engineering:**
- **Consistency**: `100 - standard_deviation(scores)`
- **Weighted Score**: Combines all features with weights
- **StandardScaler**: Normalizes features before prediction

**Prediction Categories:**
- **High Performing**: Weighted score ≥ 70%
- **Average**: Weighted score 45-70%
- **At Risk**: Weighted score < 45%

### 3. Answer Evaluation (NLP)

**TF-IDF + Cosine Similarity:**
- Converts text to TF-IDF vectors
- Calculates cosine similarity (0-1)
- Thresholds:
  - ≥ 0.9: Excellent match
  - ≥ 0.7: Good match (correct)
  - ≥ 0.5: Partial match
  - < 0.5: Incorrect

**NLTK Processing:**
- Tokenization
- Stop word removal
- Lowercasing

### 4. Feedback Generation (AI)

**Process:**
- Analyzes quiz performance
- Identifies wrong questions
- Generates personalized feedback using OpenRouter
- Provides specific study recommendations
- Encourages improvement

---

## 👥 User Workflows

### Faculty Workflow

1. **Registration & Login**
   - Register with email and password
   - Login to faculty dashboard

2. **Course Setup**
   - Create courses (e.g., "Data Structures", "Machine Learning")
   - Add descriptions

3. **Student Management**
   - Add students individually (name, register number, password)
   - Bulk upload via CSV (name, registerNumber, password)
   - Assign students to courses

4. **Quiz Creation**
   - Navigate to "Generate Quiz"
   - Select course
   - Upload PDF or paste content
   - Configure: number of questions, difficulty
   - AI generates quiz (saved as draft)
   - Review questions
   - Publish quiz (toggle active status)

5. **Monitor Performance**
   - View analytics dashboard
   - Check student-wise performance
   - Identify at-risk students
   - Review quiz attempts
   - Track score trends

### Student Workflow

1. **Login**
   - Login with register number and password

2. **Dashboard Overview**
   - View performance prediction
   - See pending quizzes
   - Check recent scores

3. **Attempt Quiz**
   - Select available quiz
   - Read questions and select answers
   - Submit quiz
   - Receive instant feedback
   - View correct answers and explanations

4. **Track Progress**
   - View attempt history
   - Analyze score trends
   - Check performance prediction
   - Review weak areas

---

## ⚙️ Environment Configuration

### Backend (.env)
```env
# Server Configuration
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/ai_lms
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_lms

# Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# AI Service (OpenRouter)
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free

# ML Service
ML_SERVICE_URL=http://localhost:8000
```

### Frontend (vite.config.js)
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

---

## 🎤 Presentation Talking Points

### 1. Problem Statement
"Traditional LMS platforms lack intelligent automation and predictive analytics. Faculty spend hours creating quizzes manually, and identifying struggling students is reactive rather than proactive."

### 2. Solution Overview
"Our AI-powered LMS automates quiz generation using advanced language models, predicts student performance using machine learning, and provides personalized feedback to enhance learning outcomes."

### 3. Technical Highlights

**Architecture:**
- "We built a microservices architecture with three main components: React frontend, Node.js backend, and Python ML service"
- "This separation allows independent scaling and technology optimization"

**AI Integration:**
- "Quiz generation uses OpenRouter's Llama 3.1 model with structured XML output"
- "We parse and validate AI responses to ensure question quality"
- "Fallback mechanisms handle API failures gracefully"

**ML Models:**
- "Random Forest classifier trained on 500 synthetic student records"
- "Predicts performance categories with 5 key features"
- "Achieves high accuracy through feature engineering and ensemble methods"

**Security:**
- "JWT-based authentication with role-based access control"
- "Password hashing using bcrypt with salt rounds"
- "Protected API routes with middleware validation"

### 4. Key Features Demo

**For Faculty:**
1. Show quiz generation from PDF
2. Demonstrate analytics dashboard
3. Highlight at-risk student identification

**For Students:**
1. Show quiz attempt interface
2. Display instant feedback
3. Demonstrate performance prediction

### 5. Impact & Benefits

**For Faculty:**
- "Reduces quiz creation time from hours to minutes"
- "Provides data-driven insights for intervention"
- "Automates grading and feedback generation"

**For Students:**
- "Personalized learning experience"
- "Immediate feedback for faster improvement"
- "Early warning system for performance issues"

### 6. Technical Challenges & Solutions

**Challenge 1: AI Response Parsing**
- Problem: Inconsistent AI output format
- Solution: Structured XML prompts + robust parsing with validation

**Challenge 2: ML Model Accuracy**
- Problem: Limited real training data
- Solution: Synthetic data generation with realistic distributions

**Challenge 3: Real-time Performance**
- Problem: API latency for quiz generation
- Solution: Async processing + loading states + fallback mechanisms

### 7. Future Enhancements
- "Adaptive difficulty based on student performance"
- "Multi-language support for global accessibility"
- "Integration with video content for multimedia quizzes"
- "Collaborative learning features (discussion forums)"
- "Mobile app for on-the-go learning"
- "Advanced analytics with deep learning models"

### 8. Conclusion
"Our AI-powered LMS demonstrates how modern AI/ML technologies can transform education by automating tedious tasks, providing predictive insights, and personalizing the learning experience. This system is scalable, secure, and ready for real-world deployment."

---

## 📊 Demo Credentials

### Faculty Account
```
Email: faculty@test.com
Password: faculty123
```

### Student Account
```
Register Number: STU001
Password: student123
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://...
```

### OpenRouter API Errors
- Verify API key is valid
- Check API quota/limits
- Review model availability

### ML Service Not Responding
```bash
# Check if service is running
curl http://localhost:8000/health

# Restart service
cd ml_backend
python main.py
```

### Frontend Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```
