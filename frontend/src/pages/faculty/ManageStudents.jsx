import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { HiPlus, HiTrash, HiArrowUpTray, HiMagnifyingGlass, HiUserGroup } from 'react-icons/hi2';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', registerNumber: '', password: '', email: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await api.post('/students/add', formData);
      toast.success('Student added successfully!');
      setFormData({ name: '', registerNumber: '', password: '', email: '' });
      setShowAddForm(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
    } finally {
      setAddLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return toast.error('Please select a CSV file');
    setUploadLoading(true);
    const fd = new FormData();
    fd.append('file', csvFile);
    try {
      const res = await api.post('/students/bulk-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data.message);
      setCsvFile(null);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student removed');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.registerNumber.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading students..." />;

  return (
    <div className="page-container-md">
      {/* Header */}
      <div className="flex-between mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-heading-lg flex items-center gap-2">
            <HiUserGroup className="text-primary" /> Manage Students
          </h1>
          <p className="text-body-sm mt-2">{students.length} total students</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <HiPlus /> Add Student
        </button>
      </div>

      {/* Add Student Form */}
      {showAddForm && (
        <div className="glass-card p-5 mb-6 fade-in">
          <h3 className="text-heading-md mb-4">Add New Student</h3>
          <form onSubmit={handleAddStudent}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Register Number (e.g., REG2024001)"
                value={formData.registerNumber}
                onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                className="input"
                required
              />
              <input
                type="text"
                placeholder="Password (defaults to register number)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={addLoading} className="btn btn-success">
                {addLoading ? 'Adding...' : 'Add Student'}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </form>

          {/* CSV Upload */}
          <hr className="divider" />
          <h4 className="text-heading-sm mb-3 flex items-center gap-2">
            <HiArrowUpTray className="text-primary" /> Bulk Upload via CSV
          </h4>
          <p className="text-caption mb-3">
            CSV format: name, registerNumber, password, email (headers required)
          </p>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              className="file-input-styled"
            />
            {csvFile && (
              <button
                onClick={handleBulkUpload}
                disabled={uploadLoading}
                className="btn btn-success"
              >
                {uploadLoading ? 'Uploading...' : 'Upload'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-wrapper">
        <HiMagnifyingGlass className="search-icon" />
        <input
          type="text"
          placeholder="Search by name or register number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-with-icon"
        />
      </div>

      {/* Student List */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {filtered.length > 0 ? (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Register No.</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, i) => (
                  <tr key={student._id} className="slide-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-sm avatar-gradient-blue shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <span className="item-name">{student.name}</span>
                      </div>
                    </td>
                    <td><span className="font-mono text-body-sm">{student.registerNumber}</span></td>
                    <td><span className="text-body-sm">{student.email || '—'}</span></td>
                    <td><span className="text-body-sm">{new Date(student.createdAt).toLocaleDateString()}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="btn-icon btn-icon-danger"
                        title="Delete student"
                      >
                        <HiTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <HiUserGroup className="empty-icon" />
            <p className="empty-text">{search ? 'No matching students found' : 'No students yet. Add your first student!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
