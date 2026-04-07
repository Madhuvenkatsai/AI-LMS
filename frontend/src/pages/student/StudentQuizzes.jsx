import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { HiClipboardDocumentList, HiPlay, HiBookOpen, HiClock } from 'react-icons/hi2';

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const courseId = searchParams.get('course');
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [quizzesRes, coursesRes] = await Promise.all([
        api.get('/quiz'),
        api.get('/courses')
      ]);
      setQuizzes(quizzesRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = selectedCourse
    ? quizzes.filter(q => q.courseId?._id === selectedCourse)
    : quizzes;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-heading-lg flex items-center gap-2">
          <HiClipboardDocumentList className="text-primary" /> Available Quizzes
        </h1>
        <p className="text-body-sm mt-2">Take quizzes to test your knowledge</p>
      </div>

      {/* Filter */}
      <div className="glass-card p-4 mb-6">
        <label className="label">Filter by Course</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="select"
        >
          <option value="">All Courses</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <HiClipboardDocumentList className="text-6xl text-muted mx-auto mb-4" />
          <p className="text-body-lg text-muted">No quizzes available</p>
        </div>
      ) : (
        <div className="stack-4">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz._id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <h3 className="text-heading-md mb-2">{quiz.title}</h3>
                  <div className="flex items-center gap-4 flex-wrap text-body-sm text-muted">
                    <span className="flex items-center gap-1">
                      <HiBookOpen /> {quiz.courseId?.title || 'Unknown Course'}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiClipboardDocumentList /> {quiz.questions?.length || 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <HiClock /> {quiz.timeLimit || 30} minutes
                    </span>
                    <span className={`badge ${
                      quiz.difficulty === 'Easy' ? 'badge-success' :
                      quiz.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/student/quiz/${quiz._id}`)}
                  className="btn btn-primary"
                >
                  <HiPlay /> Start Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentQuizzes;
