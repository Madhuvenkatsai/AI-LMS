import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { 
  HiUserGroup, HiBookOpen, HiClipboardDocumentList, HiChartBar,
  HiPlus, HiSparkles, HiArrowTrendingUp
} from 'react-icons/hi2';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuizzes: 0,
    publishedQuizzes: 0,
    draftQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, quizzesRes, analyticsRes] = await Promise.all([
        api.get('/students'),
        api.get('/quiz'),
        api.get('/prediction/analytics/summary').catch(() => ({ data: null })),
      ]);

      const students = studentsRes.data;
      const quizzes = quizzesRes.data;

      setStats({
        totalStudents: students.length,
        totalQuizzes: quizzes.length,
        publishedQuizzes: quizzes.filter(q => q.isActive).length,
        draftQuizzes: quizzes.filter(q => !q.isActive).length,
        totalAttempts: analyticsRes.data?.totalAttempts || 0,
        averageScore: analyticsRes.data?.averageScore || 0
      });

      setRecentStudents(students.slice(0, 5));
      setRecentQuizzes(quizzes.slice(0, 5));
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-heading-xl">
          Welcome back, <span className="gradient-text-faculty">{user?.name}</span> 👋
        </h1>
        <p className="text-body-sm mt-2 text-muted">Here's your teaching overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 mb-8">
        <div className="glass-card p-5 hover-faculty-lift">
          <div className="flex items-center gap-3">
            <div className="icon-box icon-box-faculty-primary">
              <HiUserGroup />
            </div>
            <div>
              <p className="text-caption text-muted">Total Students</p>
              <p className="text-heading-lg text-faculty-primary">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 hover-faculty-lift">
          <div className="flex items-center gap-3">
            <div className="icon-box icon-box-faculty-success">
              <HiClipboardDocumentList />
            </div>
            <div>
              <p className="text-caption text-muted">Total Quizzes</p>
              <p className="text-heading-lg text-faculty-success">{stats.totalQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 hover-faculty-lift">
          <div className="flex items-center gap-3">
            <div className="icon-box icon-box-faculty-warning">
              <HiChartBar />
            </div>
            <div>
              <p className="text-caption text-muted">Avg Score</p>
              <p className="text-heading-lg text-faculty-warning">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5 hover-faculty-lift">
          <div className="flex items-center gap-3">
            <div className="icon-box icon-box-faculty-primary">
              <HiArrowTrendingUp />
            </div>
            <div>
              <p className="text-caption text-muted">Quiz Attempts</p>
              <p className="text-heading-lg text-faculty-primary">{stats.totalAttempts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-heading-md mb-4">Quick Actions</h2>
        <div className="grid-3">
          <Link to="/faculty/quiz-generate" className="glass-card p-5 hover-faculty-lift">
            <div className="flex items-center gap-4">
              <div className="icon-box icon-box-faculty-primary" style={{ width: '3rem', height: '3rem' }}>
                <HiSparkles style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <p className="text-heading-sm text-faculty-primary">Generate Quiz</p>
                <p className="text-caption text-muted">Create AI-powered quizzes</p>
              </div>
            </div>
          </Link>

          <Link to="/faculty/students" className="glass-card p-5 hover-faculty-lift">
            <div className="flex items-center gap-4">
              <div className="icon-box icon-box-faculty-success" style={{ width: '3rem', height: '3rem' }}>
                <HiPlus style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <p className="text-heading-sm text-faculty-success">Add Students</p>
                <p className="text-caption text-muted">Manage your students</p>
              </div>
            </div>
          </Link>

          <Link to="/faculty/courses" className="glass-card p-5 hover-faculty-lift">
            <div className="flex items-center gap-4">
              <div className="icon-box icon-box-faculty-warning" style={{ width: '3rem', height: '3rem' }}>
                <HiBookOpen style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <p className="text-heading-sm text-faculty-warning">Manage Courses</p>
                <p className="text-caption text-muted">Organize your courses</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid-2 gap-6">
        {/* Recent Quizzes */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-heading-md">Recent Quizzes</h3>
            <Link to="/faculty/quiz-manage" className="text-body-sm text-faculty-primary hover:underline">
              View all →
            </Link>
          </div>
          {recentQuizzes.length > 0 ? (
            <div className="stack-3">
              {recentQuizzes.map((quiz) => (
                <div key={quiz._id} className="flex items-center justify-between p-3 rounded-lg bg-surface-light/30">
                  <div>
                    <p className="text-body-sm font-semibold">{quiz.title}</p>
                    <p className="text-caption text-muted">{quiz.questions?.length || 0} questions</p>
                  </div>
                  <span className={`badge ${quiz.isActive ? 'badge-faculty-success' : 'badge-faculty-secondary'}`}>
                    {quiz.isActive ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HiClipboardDocumentList className="text-4xl text-muted mx-auto mb-2" />
              <p className="text-body-sm text-muted">No quizzes yet</p>
            </div>
          )}
        </div>

        {/* Recent Students */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-heading-md">Recent Students</h3>
            <Link to="/faculty/students" className="text-body-sm text-faculty-primary hover:underline">
              View all →
            </Link>
          </div>
          {recentStudents.length > 0 ? (
            <div className="stack-3">
              {recentStudents.map((student) => (
                <div key={student._id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-light/30">
                  <div className="w-10 h-10 rounded-full bg-faculty-primary/20 text-faculty-primary flex items-center justify-center font-semibold">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-body-sm font-semibold">{student.name}</p>
                    <p className="text-caption text-muted">{student.registerNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HiUserGroup className="text-4xl text-muted mx-auto mb-2" />
              <p className="text-body-sm text-muted">No students yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
