import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { 
  HiClipboardDocumentList, HiEye, HiTrash, HiCalendar, 
  HiCheckCircle, HiXCircle, HiPencil, HiRocketLaunch 
} from 'react-icons/hi2';

const QuizManage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, draft, scheduled, published
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/quiz');
      setQuizzes(res.data);
    } catch (error) {
      toast.error('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      await api.delete(`/quiz/${id}`);
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  const handleToggleActive = async (quiz) => {
    try {
      await api.patch(`/quiz/${quiz._id}/toggle-active`);
      toast.success(quiz.isActive ? 'Quiz unpublished' : 'Quiz published');
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to update quiz status');
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    if (filter === 'published') return q.isActive;
    if (filter === 'draft') return !q.isActive;
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-heading-lg flex items-center gap-2">
              <HiClipboardDocumentList className="text-faculty-primary" /> Quiz Management
            </h1>
            <p className="text-body-sm mt-2">Manage, schedule, and publish your quizzes</p>
          </div>
          <button
            onClick={() => navigate('/faculty/quiz-generate')}
            className="btn btn-faculty-primary"
          >
            <HiRocketLaunch /> Generate New Quiz
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card p-2 mb-6 inline-flex gap-2">
        {[
          { key: 'all', label: 'All Quizzes' },
          { key: 'published', label: 'Published' },
          { key: 'draft', label: 'Drafts' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-body-sm transition-all ${
              filter === tab.key
                ? 'bg-faculty-primary text-white'
                : 'text-muted hover:bg-surface-light'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quizzes List */}
      {filteredQuizzes.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiClipboardDocumentList className="text-6xl text-muted mx-auto mb-4" />
          <p className="text-body-lg text-muted mb-2">No quizzes found</p>
          <p className="text-body-sm text-muted mb-6">
            {filter === 'draft' ? 'All your quizzes are published' : 'Create your first quiz to get started'}
          </p>
          <button
            onClick={() => navigate('/faculty/quiz-generate')}
            className="btn btn-faculty-primary"
          >
            <HiRocketLaunch /> Generate Quiz
          </button>
        </div>
      ) : (
        <div className="stack-4">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz._id} className="glass-card p-5 hover-lift">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-heading-md">{quiz.title}</h3>
                    {quiz.isActive ? (
                      <span className="badge badge-faculty-success">
                        <HiCheckCircle /> Published
                      </span>
                    ) : (
                      <span className="badge badge-faculty-secondary">
                        <HiPencil /> Draft
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap text-body-sm text-muted mb-3">
                    <span>📚 {quiz.courseId?.title || 'Unknown Course'}</span>
                    <span>📝 {quiz.questions?.length || 0} questions</span>
                    <span>⏱️ {quiz.timeLimit || 30} min</span>
                    <span className={`badge ${
                      quiz.difficulty === 'Easy' ? 'badge-success' :
                      quiz.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {quiz.difficulty}
                    </span>
                  </div>

                  <p className="text-caption text-muted">
                    Created {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/faculty/quiz-review/${quiz._id}`)}
                    className="btn btn-faculty-secondary btn-sm"
                    title="Review Quiz"
                  >
                    <HiEye /> Review
                  </button>
                  
                  <button
                    onClick={() => handleToggleActive(quiz)}
                    className={`btn btn-sm ${
                      quiz.isActive ? 'btn-faculty-warning' : 'btn-faculty-success'
                    }`}
                    title={quiz.isActive ? 'Unpublish' : 'Publish'}
                  >
                    {quiz.isActive ? <HiXCircle /> : <HiCheckCircle />}
                    {quiz.isActive ? 'Unpublish' : 'Publish'}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(quiz._id)}
                    className="btn btn-faculty-danger btn-sm"
                    title="Delete Quiz"
                  >
                    <HiTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizManage;
