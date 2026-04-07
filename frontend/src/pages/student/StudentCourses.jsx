import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { HiBookOpen, HiAcademicCap, HiClipboardDocumentList } from 'react-icons/hi2';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="text-heading-lg flex items-center gap-2">
          <HiBookOpen className="text-primary" /> Available Courses
        </h1>
        <p className="text-body-sm mt-2">Browse all courses and view available quizzes</p>
      </div>

      {courses.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <HiBookOpen className="text-6xl text-muted mx-auto mb-4" />
          <p className="text-body-lg text-muted">No courses available yet</p>
        </div>
      ) : (
        <div className="grid-3">
          {courses.map((course) => (
            <div key={course._id} className="glass-card p-5 hover-lift">
              <div className="flex items-start gap-3 mb-4">
                <div className="icon-box icon-box-primary">
                  <HiAcademicCap />
                </div>
                <div className="flex-1">
                  <h3 className="text-heading-sm mb-1">{course.title}</h3>
                  <p className="text-caption">{course.code}</p>
                </div>
              </div>
              
              {course.description && (
                <p className="text-body-sm text-muted mb-4">{course.description}</p>
              )}
              
              <button
                onClick={() => navigate(`/student/quizzes?course=${course._id}`)}
                className="btn btn-secondary btn-sm btn-wide"
              >
                <HiClipboardDocumentList /> View Quizzes
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
