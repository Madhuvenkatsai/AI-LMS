import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import {
  HiClipboardDocumentList, HiChartBar, HiAcademicCap,
  HiArrowTrendingUp, HiSparkles, HiClock
} from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_TOOLTIP = {
  contentStyle: {
    background: '#1a2538',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: '12px',
    color: '#e1e8ef',
    fontSize: '0.8125rem',
    fontFamily: "'Inter', sans-serif",
  },
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quizzesRes, attemptsRes] = await Promise.all([
        api.get('/quiz'),
        api.get(`/quiz/attempts/student/${user.id}`),
      ]);

      setQuizzes(quizzesRes.data);
      setAttempts(attemptsRes.data);

      try {
        const predRes = await api.get(`/prediction/${user.id}`);
        setPrediction(predRes.data?.prediction);
      } catch {}
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / attempts.length)
    : 0;

  const recentScores = attempts.slice(0, 10).reverse().map((a, i) => ({
    name: `Q${i + 1}`,
    score: a.score
  }));

  const attemptedQuizIds = new Set(attempts.map(a => a.quizId?._id || a.quizId));
  const pendingQuizzes = quizzes.filter(q => !attemptedQuizIds.has(q._id));

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'High Performing': return 'badge-success';
      case 'Average': return 'badge-warning';
      case 'At Risk': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  const getProgressClass = (category) => {
    switch (category) {
      case 'High Performing': return 'progress-fill-success';
      case 'Average': return 'progress-fill-warning';
      case 'At Risk': return 'progress-fill-danger';
      default: return 'progress-fill-primary';
    }
  };

  const statCards = [
    { icon: HiClipboardDocumentList, label: 'Quizzes Taken', value: attempts.length, iconClass: 'stat-icon-blue' },
    { icon: HiChartBar, label: 'Avg Score', value: `${avgScore}%`, iconClass: 'stat-icon-green' },
    { icon: HiClock, label: 'Pending', value: pendingQuizzes.length, iconClass: 'stat-icon-purple' },
    {
      icon: HiArrowTrendingUp,
      label: 'Performance',
      value: prediction?.category || 'N/A',
      iconClass: prediction?.category === 'High Performing' ? 'stat-icon-green' :
                 prediction?.category === 'At Risk' ? 'stat-icon-red' : 'stat-icon-amber'
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-heading-xl">
          Welcome, <span className="gradient-text">{user?.name}</span> 🎓
        </h1>
        <p className="text-body-sm mt-2">Track your progress and attempt quizzes</p>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card stat-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`stat-icon ${stat.iconClass}`}>
              <stat.icon />
            </div>
            <p className="stat-value" style={{ fontSize: stat.label === 'Performance' ? '1.125rem' : undefined }}>
              {stat.value}
            </p>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Prediction Card */}
      {prediction && (
        <div className="glass-card p-5 mb-8 fade-in">
          <h3 className="section-title mb-3">
            <HiSparkles className="text-primary" /> AI Performance Prediction
          </h3>
          <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`badge ${getCategoryBadge(prediction.category)}`}>
                  {prediction.category}
                </span>
                <span className="stat-value">{prediction.score}%</span>
              </div>
              <p className="text-body-sm">Based on your quiz performance, attendance, and consistency</p>
            </div>
            <div style={{ width: '12rem' }}>
              <div className="progress-track">
                <div
                  className={`progress-fill ${getProgressClass(prediction.category)}`}
                  style={{ width: `${prediction.score}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Score Chart */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">
            <HiChartBar className="text-primary" /> Recent Quiz Scores
          </h3>
          {recentScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recentScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#97a8be', fontSize: 12, fontFamily: 'Inter' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#97a8be', fontSize: 12, fontFamily: 'Inter' }} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="score" fill="url(#studentGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-center" style={{ height: 220 }}>
              <p className="text-body-sm">No quiz attempts yet</p>
            </div>
          )}
        </div>

        {/* Pending Quizzes */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">
            <HiClipboardDocumentList className="text-primary" /> Available Quizzes
          </h3>
          {pendingQuizzes.length > 0 ? (
            <div className="stack-3 overflow-y-auto" style={{ maxHeight: 300, paddingRight: '0.25rem' }}>
              {pendingQuizzes.map((quiz, i) => (
                <Link
                  key={quiz._id}
                  to={`/student/quiz/${quiz._id}`}
                  className="item-row item-row-link slide-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div>
                    <p className="item-name">{quiz.title}</p>
                    <p className="item-meta">
                      {quiz.questions?.length || 0} questions • {quiz.difficulty}
                    </p>
                  </div>
                  <span className={`badge ${
                    quiz.difficulty === 'Easy' ? 'badge-success' :
                    quiz.difficulty === 'Medium' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {quiz.difficulty}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-center" style={{ height: 220 }}>
              <p className="text-body-sm">
                {quizzes.length === 0 ? 'No quizzes available yet' : 'All quizzes completed! 🎉'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Attempts */}
      {attempts.length > 0 && (
        <div className="glass-card p-5 mt-6">
          <h3 className="section-title mb-4">Recent Attempts</h3>
          <div className="stack-2">
            {attempts.slice(0, 5).map((attempt, i) => (
              <div key={attempt._id} className="item-row slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div>
                  <p className="item-name">{attempt.quizId?.title || 'Quiz'}</p>
                  <p className="item-meta">
                    {attempt.correctAnswers}/{attempt.totalQuestions} correct • {new Date(attempt.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`stat-value ${
                  attempt.score >= 80 ? 'score-great' : attempt.score >= 50 ? 'score-good' : 'score-poor'
                }`} style={{ fontSize: '1.25rem' }}>
                  {attempt.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
