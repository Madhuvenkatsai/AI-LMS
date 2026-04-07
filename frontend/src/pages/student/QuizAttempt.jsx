import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { HiClock, HiChevronLeft, HiChevronRight, HiCheck, HiXMark } from 'react-icons/hi2';

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuiz();
    return () => clearInterval(timerRef.current);
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quiz/${quizId}`);
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill({ selectedAnswer: '' }));
      timerRef.current = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    } catch (error) {
      toast.error('Failed to load quiz');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = { selectedAnswer: answer };
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const unanswered = answers.filter(a => !a.selectedAnswer).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }

    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const res = await api.post('/quiz/submit', {
        quizId,
        answers,
        responseTime: timeElapsed
      });
      setResult(res.data);
      toast.success(`Quiz submitted! Score: ${res.data.score}%`);
    } catch (error) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner text="Loading quiz..." />;

  // ─── RESULT VIEW ─────────────────────────────────────────────
  if (result) {
    const scoreClass = result.score >= 80 ? 'great' : result.score >= 50 ? 'good' : 'poor';

    return (
      <div className="page-container-sm fade-in">
        {/* Result Header */}
        <div className="glass-card p-6 text-center mb-6">
          <div className={`score-circle score-circle-${scoreClass}`} style={{ margin: '0 auto 1rem' }}>
            <span className={`score-value score-${scoreClass}`}>{result.score}%</span>
          </div>
          <h2 className="text-heading-lg mb-2">
            {result.score >= 80 ? '🎉 Excellent!' : result.score >= 50 ? '👍 Good effort!' : '📚 Keep practicing!'}
          </h2>
          <p className="text-body-sm">
            {result.correctAnswers} out of {result.totalQuestions} correct • Time: {formatTime(timeElapsed)}
          </p>

          {result.feedback && (
            <div className="item-row mt-4" style={{ textAlign: 'left', flexDirection: 'column', alignItems: 'stretch' }}>
              <p className="text-primary" style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>💡 AI Feedback</p>
              <p className="text-body-sm">{result.feedback}</p>
            </div>
          )}
        </div>

        {/* Detailed Results */}
        <div className="stack-3">
          {result.results?.map((r, i) => (
            <div key={i} className={`glass-card p-4 ${r.isCorrect ? 'result-correct' : 'result-wrong'}`}>
              <div className="flex items-start gap-3">
                <div className={`result-icon ${r.isCorrect ? 'result-icon-correct' : 'result-icon-wrong'}`}>
                  {r.isCorrect ? <HiCheck /> : <HiXMark />}
                </div>
                <div style={{ flex: 1 }}>
                  <p className="item-name mb-2">Q{i + 1}. {r.question}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.375rem', marginBottom: '0.5rem' }}>
                    {r.options.map((opt, j) => (
                      <div key={j} className={`option-chip ${
                        opt === r.correctAnswer ? 'option-chip-correct' :
                        opt === r.selectedAnswer && !r.isCorrect ? 'option-chip-wrong' :
                        'option-chip-neutral'
                      }`}>
                        {String.fromCharCode(65 + j)}. {opt}
                        {opt === r.correctAnswer && ' ✓'}
                        {opt === r.selectedAnswer && !r.isCorrect && ' ✗'}
                      </div>
                    ))}
                  </div>
                  {r.explanation && (
                    <p className="text-caption" style={{ fontStyle: 'italic' }}>💡 {r.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/student/dashboard')}
          className="btn btn-primary btn-lg btn-wide mt-6"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ─── QUIZ TAKING VIEW ────────────────────────────────────────
  const question = quiz?.questions[currentQ];
  const totalQ = quiz?.questions?.length || 0;
  const answeredCount = answers.filter(a => a.selectedAnswer).length;

  return (
    <div className="page-container-sm">
      {/* Quiz Header */}
      <div className="glass-card p-4 mb-6 flex-between">
        <div>
          <h2 className="text-heading-md">{quiz?.title}</h2>
          <p className="text-caption">{quiz?.difficulty} • {totalQ} questions</p>
        </div>
        <div className="flex items-center gap-2">
          <HiClock className="text-primary" />
          <span className="font-mono text-white" style={{ fontSize: '0.875rem' }}>{formatTime(timeElapsed)}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex-between mb-2">
          <span className="text-caption">Question {currentQ + 1} of {totalQ}</span>
          <span className="text-caption">{answeredCount} answered</span>
        </div>
        <div className="progress-track progress-track-sm">
          <div
            className="progress-fill progress-fill-primary"
            style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card p-6 mb-6 fade-in" key={currentQ}>
        <p className="text-heading-sm mb-5">
          <span className="text-primary" style={{ fontWeight: 800 }}>Q{currentQ + 1}.</span> {question?.question}
        </p>

        <div className="stack-3">
          {question?.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(opt)}
              className={`quiz-option ${answers[currentQ]?.selectedAnswer === opt ? 'quiz-option-selected' : ''}`}
            >
              <span className="quiz-option-letter">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-between">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="btn btn-ghost"
          style={{ opacity: currentQ === 0 ? 0.3 : 1 }}
        >
          <HiChevronLeft /> Previous
        </button>

        {currentQ === totalQ - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-success"
          >
            {submitting ? (
              <>
                <div className="spinner-sm"></div>
                Submitting...
              </>
            ) : (
              'Submit Quiz'
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQ(Math.min(totalQ - 1, currentQ + 1))}
            className="btn btn-primary"
          >
            Next <HiChevronRight />
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="glass-card p-4 mt-6">
        <p className="text-caption mb-2">Jump to question:</p>
        <div className="flex-wrap gap-2">
          {quiz?.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`quiz-nav-dot ${
                i === currentQ
                  ? 'quiz-nav-dot-current'
                  : answers[i]?.selectedAnswer
                    ? 'quiz-nav-dot-answered'
                    : ''
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
