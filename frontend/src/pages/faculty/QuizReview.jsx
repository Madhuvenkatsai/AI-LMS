import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { 
  HiEye, HiCheckCircle, HiXCircle, HiArrowLeft, HiPencil, HiTrash 
} from 'react-icons/hi2';

const QuizReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quiz/${id}`);
      setQuiz(res.data);
    } catch (error) {
      toast.error('Failed to load quiz');
      navigate('/faculty/quiz-manage');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      await api.patch(`/quiz/${id}/toggle-active`);
      toast.success(quiz.isActive ? 'Quiz unpublished' : 'Quiz published successfully!');
      navigate('/faculty/quiz-manage');
    } catch (error) {
      toast.error('Failed to update quiz status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      await api.delete(`/quiz/${id}`);
      toast.success('Quiz deleted successfully');
      navigate('/faculty/quiz-manage');
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!quiz) return null;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/faculty/quiz-manage')}
          className="btn btn-faculty-secondary btn-sm mb-4"
        >
          <HiArrowLeft /> Back to Quiz Management
        </button>
        
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-heading-lg">{quiz.title}</h1>
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
            <div className="flex items-center gap-4 flex-wrap text-body-sm text-muted">
              <span>📚 {quiz.courseId?.title}</span>
              <span>📝 {quiz.questions.length} questions</span>
              <span>⏱️ {quiz.timeLimit} minutes</span>
              <span className={`badge ${
                quiz.difficulty === 'Easy' ? 'badge-success' :
                quiz.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'
              }`}>
                {quiz.difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePublish}
              className={`btn ${
                quiz.isActive ? 'btn-faculty-warning' : 'btn-faculty-success'
              }`}
            >
              {quiz.isActive ? <HiXCircle /> : <HiCheckCircle />}
              {quiz.isActive ? 'Unpublish' : 'Publish Quiz'}
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-faculty-danger"
            >
              <HiTrash /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="stack-4">
        {quiz.questions.map((q, i) => (
          <div key={i} className="glass-card p-5">
            <div className="mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-faculty-primary text-white flex items-center justify-center font-semibold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-heading-sm mb-3">{q.question}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {q.options.map((opt, j) => (
                      <div
                        key={j}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          opt === q.correctAnswer
                            ? 'border-faculty-success bg-faculty-success/10'
                            : 'border-surface-light bg-surface-light/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-faculty-primary">
                            {String.fromCharCode(65 + j)}.
                          </span>
                          <span>{opt}</span>
                          {opt === q.correctAnswer && (
                            <HiCheckCircle className="ml-auto text-faculty-success" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="p-3 rounded-lg bg-faculty-primary/10 border border-faculty-primary/20">
                      <p className="text-body-sm">
                        <span className="font-semibold text-faculty-primary">💡 Explanation:</span>{' '}
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={() => navigate('/faculty/quiz-manage')}
          className="btn btn-faculty-secondary"
        >
          <HiArrowLeft /> Back to Management
        </button>
        <button
          onClick={handlePublish}
          className={`btn ${
            quiz.isActive ? 'btn-faculty-warning' : 'btn-faculty-success'
          }`}
        >
          {quiz.isActive ? <HiXCircle /> : <HiCheckCircle />}
          {quiz.isActive ? 'Unpublish Quiz' : 'Publish Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuizReview;
