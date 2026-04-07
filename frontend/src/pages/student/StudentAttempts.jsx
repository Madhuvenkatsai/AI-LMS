import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { HiChartBar, HiClipboardDocumentList, HiCalendar, HiTrophy, HiBookOpen } from 'react-icons/hi2';

const StudentAttempts = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    totalQuizzes: 0
  });

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const res = await api.get(`/quiz/attempts/student/${user.id}`);
      setAttempts(res.data);
      calculateStats(res.data);
    } catch (error) {
      console.error('Failed to fetch attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attemptsData) => {
    if (attemptsData.length === 0) return;

    const totalScore = attemptsData.reduce((sum, a) => sum + a.score, 0);
    const uniqueQuizzes = new Set(attemptsData.map(a => a.quizId?._id)).size;

    setStats({
      totalAttempts: attemptsData.length,
      averageScore: Math.round(totalScore / attemptsData.length),
      bestScore: Math.max(...attemptsData.map(a => a.score)),
      totalQuizzes: uniqueQuizzes
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-heading-lg flex items-center gap-2">
          <HiChartBar className="text-primary" /> My Quiz Attempts
        </h1>
        <p className="text-body-sm mt-2">Track your quiz performance and progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-box icon-box-primary">
              <HiClipboardDocumentList />
            </div>
            <div>
              <p className="text-caption text-muted">Total Attempts</p>
              <p className="text-heading-lg">{stats.totalAttempts}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-box icon-box-success">
              <HiChartBar />
            </div>
            <div>
              <p className="text-caption text-muted">Average Score</p>
              <p className="text-heading-lg">{stats.averageScore}%</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-box icon-box-warning">
              <HiTrophy />
            </div>
            <div>
              <p className="text-caption text-muted">Best Score</p>
              <p className="text-heading-lg">{stats.bestScore}%</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="icon-box icon-box-info">
              <HiBookOpen />
            </div>
            <div>
              <p className="text-caption text-muted">Quizzes Taken</p>
              <p className="text-heading-lg">{stats.totalQuizzes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attempts List */}
      {attempts.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <HiClipboardDocumentList className="text-6xl text-muted mx-auto mb-4" />
          <p className="text-body-lg text-muted">No quiz attempts yet</p>
          <p className="text-body-sm text-muted mt-2">Start taking quizzes to see your progress here</p>
        </div>
      ) : (
        <div className="glass-card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Course</th>
                  <th>Score</th>
                  <th>Correct Answers</th>
                  <th>Attempt #</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <HiClipboardDocumentList className="text-primary" />
                        <span>{attempt.quizId?.title || 'Unknown Quiz'}</span>
                      </div>
                    </td>
                    <td>{attempt.courseId?.title || 'N/A'}</td>
                    <td>
                      <span className={`badge ${
                        attempt.score >= 80 ? 'badge-success' :
                        attempt.score >= 50 ? 'badge-warning' : 'badge-error'
                      }`}>
                        {attempt.score}%
                      </span>
                    </td>
                    <td>{attempt.correctAnswers}/{attempt.totalQuestions}</td>
                    <td>#{attempt.attemptNumber}</td>
                    <td>
                      <div className="flex items-center gap-1 text-body-sm text-muted">
                        <HiCalendar />
                        {formatDate(attempt.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttempts;
