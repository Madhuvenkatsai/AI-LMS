import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { HiPlus, HiTrash, HiBookOpen } from 'react-icons/hi2';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await api.post('/courses', formData);
      toast.success('Course created!');
      setFormData({ title: '', description: '' });
      setShowForm(false);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  if (loading) return <LoadingSpinner text="Loading courses..." />;

  return (
    <div className="page-container-md">
      <div className="flex-between mb-6">
        <div>
          <h1 className="text-heading-lg flex items-center gap-2">
            <HiBookOpen className="text-primary" /> Manage Courses
          </h1>
          <p className="text-body-sm mt-2">{courses.length} courses</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <HiPlus /> New Course
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-5 mb-6 fade-in">
          <h3 className="text-heading-md mb-4">Create Course</h3>
          <form onSubmit={handleCreate} className="stack-4">
            <input
              type="text"
              placeholder="Course Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="textarea"
            />
            <div className="flex gap-3">
              <button type="submit" disabled={addLoading} className="btn btn-success">
                {addLoading ? 'Creating...' : 'Create Course'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="course-grid">
        {courses.map((course, i) => (
          <div key={course._id} className="glass-card p-5 fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex-between mb-3" style={{ alignItems: 'flex-start' }}>
              <div className="action-icon action-icon-accent">
                <HiBookOpen />
              </div>
              <button onClick={() => handleDelete(course._id)} className="btn-icon btn-icon-danger">
                <HiTrash />
              </button>
            </div>
            <h3 className="text-heading-sm mb-2">{course.title}</h3>
            <p className="text-body-sm line-clamp-2 mb-3">{course.description || 'No description'}</p>
            <div className="flex-between">
              <span className="text-caption">{course.students?.length || 0} students enrolled</span>
              <span className="text-caption">{new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="glass-card empty-state">
          <HiBookOpen className="empty-icon" />
          <p className="empty-text">No courses yet. Create your first course!</p>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
