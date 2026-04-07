import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiEnvelope, HiLockClosed, HiUser, HiEye, HiEyeSlash, HiArrowLeft } from 'react-icons/hi2';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/faculty-register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      login(response.data.user, response.data.token);
      toast.success('Registration successful! Welcome!');
      navigate('/faculty/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page gradient-bg">
      {/* Back to Home Button */}
      <Link to="/" className="back-to-home">
        <HiArrowLeft /> Back to Home
      </Link>

      <div className="auth-bg-orb auth-bg-orb-1" style={{ top: '30%', right: '25%', left: 'auto' }}></div>
      <div className="auth-bg-orb auth-bg-orb-2" style={{ bottom: '25%', left: '25%' }}></div>

      <div className="auth-container fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <HiAcademicCap />
          </div>
          <h1 className="auth-title gradient-text">Faculty Registration</h1>
          <p className="auth-subtitle">Create your faculty account to get started</p>
        </div>

        <div className="glass-card auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label className="label">Full Name</label>
              <div className="auth-field">
                <HiUser className="input-icon" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. John Smith"
                  className="input input-with-icon"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="auth-field">
                <HiEnvelope className="input-icon" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="faculty@university.edu"
                  className="input input-with-icon"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="auth-field">
                <HiLockClosed className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="input input-with-icon"
                  style={{ paddingRight: '3rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? <HiEyeSlash /> : <HiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="auth-field">
                <HiLockClosed className="input-icon" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  className="input input-with-icon"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-wide"
            >
              {loading ? (
                <>
                  <div className="spinner-sm"></div>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
