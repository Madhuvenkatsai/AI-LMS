from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import nltk
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json

# Download NLTK data
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', quiet=True)
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

app = FastAPI(title="AI LMS - ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Pre-trained Models (trained on synthetic data)
# ============================================

def create_and_train_models():
    """Create and train models on synthetic student data."""
    np.random.seed(42)
    n_samples = 500
    
    # Generate synthetic training data
    avg_scores = np.random.uniform(10, 100, n_samples)
    attendance = np.random.uniform(40, 100, n_samples)
    avg_response_time = np.random.uniform(30, 600, n_samples)
    total_attempts = np.random.randint(1, 50, n_samples)
    consistency = np.random.uniform(20, 100, n_samples)
    
    X = np.column_stack([avg_scores, attendance, avg_response_time, total_attempts, consistency])
    
    # Create labels based on realistic rules
    labels = []
    for i in range(n_samples):
        weighted = (avg_scores[i] * 0.35 + attendance[i] * 0.2 + 
                   consistency[i] * 0.25 + min(total_attempts[i] * 2, 100) * 0.1 +
                   max(0, 100 - avg_response_time[i] / 6) * 0.1)
        noise = np.random.normal(0, 5)
        weighted += noise
        
        if weighted >= 70:
            labels.append(0)  # High Performing
        elif weighted >= 45:
            labels.append(1)  # Average
        else:
            labels.append(2)  # At Risk
    
    y = np.array(labels)
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train Random Forest
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    rf_model.fit(X_scaled, y)
    
    # Train Logistic Regression
    lr_model = LogisticRegression(random_state=42, max_iter=1000, multi_class='multinomial')
    lr_model.fit(X_scaled, y)
    
    return rf_model, lr_model, scaler

# Train models on startup
rf_model, lr_model, scaler = create_and_train_models()
category_map = {0: "High Performing", 1: "Average", 2: "At Risk"}

# ============================================
# Request/Response Models
# ============================================

class PredictionRequest(BaseModel):
    avg_score: float
    attendance: float = 85.0
    avg_response_time: float = 120.0
    total_attempts: int = 1
    consistency: float = 75.0

class PredictionResponse(BaseModel):
    prediction_score: float
    category: str
    model_used: str
    confidence: float
    probabilities: dict

class AnswerEvalRequest(BaseModel):
    student_answer: str
    correct_answer: str

class AnswerEvalResponse(BaseModel):
    similarity_score: float
    is_correct: bool
    feedback: str

class FeedbackRequest(BaseModel):
    score: float
    total_questions: int
    correct_answers: int
    wrong_topics: list[str] = []

class FeedbackResponse(BaseModel):
    feedback: str
    recommendations: list[str]

# ============================================
# Endpoints
# ============================================

@app.get("/")
async def root():
    return {"status": "ok", "service": "AI LMS ML Service", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_performance(request: PredictionRequest):
    """Predict student performance using trained ML models."""
    
    features = np.array([[
        request.avg_score,
        request.attendance,
        request.avg_response_time,
        request.total_attempts,
        request.consistency
    ]])
    
    features_scaled = scaler.transform(features)
    
    # Random Forest prediction
    rf_prediction = rf_model.predict(features_scaled)[0]
    rf_probabilities = rf_model.predict_proba(features_scaled)[0]
    
    # Logistic Regression prediction
    lr_prediction = lr_model.predict(features_scaled)[0]
    lr_probabilities = lr_model.predict_proba(features_scaled)[0]
    
    # Use Random Forest as primary, with confidence from probabilities
    category = category_map[rf_prediction]
    confidence = float(max(rf_probabilities))
    
    # Calculate prediction score (weighted average of probabilities)
    prediction_score = float(
        rf_probabilities[0] * 90 +  # High performing weight
        rf_probabilities[1] * 60 +  # Average weight
        rf_probabilities[2] * 25    # At risk weight
    )
    prediction_score = round(prediction_score, 2)
    
    return PredictionResponse(
        prediction_score=prediction_score,
        category=category,
        model_used="Random Forest",
        confidence=round(confidence, 4),
        probabilities={
            "High Performing": round(float(rf_probabilities[0]), 4),
            "Average": round(float(rf_probabilities[1]), 4),
            "At Risk": round(float(rf_probabilities[2]), 4)
        }
    )

@app.post("/evaluate-answer", response_model=AnswerEvalResponse)
async def evaluate_answer(request: AnswerEvalRequest):
    """Evaluate student answer using TF-IDF and cosine similarity."""
    
    student_answer = request.student_answer.strip().lower()
    correct_answer = request.correct_answer.strip().lower()
    
    if not student_answer:
        return AnswerEvalResponse(
            similarity_score=0.0,
            is_correct=False,
            feedback="No answer provided."
        )
    
    # Exact match check
    if student_answer == correct_answer:
        return AnswerEvalResponse(
            similarity_score=1.0,
            is_correct=True,
            feedback="Perfect answer! Exactly matches the expected answer."
        )
    
    # TF-IDF + Cosine Similarity
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform([correct_answer, student_answer])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    except ValueError:
        similarity = 0.0
    
    similarity = round(float(similarity), 4)
    
    is_correct = similarity >= 0.7
    
    if similarity >= 0.9:
        feedback = "Excellent! Your answer closely matches the expected answer."
    elif similarity >= 0.7:
        feedback = "Good answer! Your response captures the key points."
    elif similarity >= 0.5:
        feedback = "Partial match. Your answer has some relevant points but is missing key elements."
    elif similarity >= 0.3:
        feedback = "Your answer has minimal overlap with the expected answer. Review the material."
    else:
        feedback = "Your answer doesn't match the expected answer. Please review this topic."
    
    return AnswerEvalResponse(
        similarity_score=similarity,
        is_correct=is_correct,
        feedback=feedback
    )

@app.post("/generate-feedback", response_model=FeedbackResponse)
async def generate_feedback(request: FeedbackRequest):
    """Generate personalized feedback based on quiz performance."""
    
    percentage = (request.correct_answers / request.total_questions * 100) if request.total_questions > 0 else 0
    
    if percentage >= 90:
        feedback = f"Outstanding performance! You scored {percentage:.0f}% ({request.correct_answers}/{request.total_questions}). You have an excellent grasp of the material."
        recommendations = [
            "Challenge yourself with harder difficulty levels",
            "Help peers who are struggling with the material",
            "Explore advanced topics related to this subject"
        ]
    elif percentage >= 75:
        feedback = f"Great job! You scored {percentage:.0f}% ({request.correct_answers}/{request.total_questions}). You demonstrate a solid understanding."
        recommendations = [
            "Review the questions you got wrong",
            "Practice more questions at this difficulty level",
            "Focus on strengthening weak areas"
        ]
    elif percentage >= 50:
        feedback = f"Good effort! You scored {percentage:.0f}% ({request.correct_answers}/{request.total_questions}). There's room for improvement."
        recommendations = [
            "Review the study material thoroughly",
            "Practice with easier questions first, then gradually increase difficulty",
            "Create notes on the topics you found challenging"
        ]
    else:
        feedback = f"You scored {percentage:.0f}% ({request.correct_answers}/{request.total_questions}). Don't be discouraged - this is a learning opportunity!"
        recommendations = [
            "Re-read the study material before attempting again",
            "Start with the Easy difficulty level",
            "Seek help from your faculty or peers",
            "Break down the subject into smaller topics and master each one"
        ]
    
    if request.wrong_topics:
        feedback += f" Focus on these topics: {', '.join(request.wrong_topics)}."
    
    return FeedbackResponse(
        feedback=feedback,
        recommendations=recommendations
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
