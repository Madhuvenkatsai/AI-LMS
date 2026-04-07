import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiArrowLeft } from 'react-icons/hi2';

const Login = () => {
  const [loginType, setLoginType] = useState('faculty');
  const [formData, setFormData] = useState({ email: '', password: '', registerNumber: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (loginType === 'faculty') {
        response = await api.post('/auth/faculty-login', {
          email: formData.email,
          password: formData.password,
        });
      } else {
        response = await api.post('/auth/student-login', {
          registerNumber: formData.registerNumber,
          password: formData.password,
        });
      }

      login(response.data.user, response.data.token);
      toast.success(`Welcome back, ${response.data.user.name}!`);
      navigate(loginType === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
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

      {/* Background decoration */}
      <div className="auth-bg-orb auth-bg-orb-1"></div>
      <div className="auth-bg-orb auth-bg-orb-2"></div>

      <div className="auth-container fade-in">
        {/* Logo */}
        <div className="auth-header">
          <div className="auth-logo">
            <HiAcademicCap />
          </div>
          <h1 className="auth-title gradient-text">AI Quiz LMS</h1>
          <p className="auth-subtitle">Your AI-powered learning companion</p>
        </div>

        {/* Login Card */}
        <div className="glass-card auth-card">
          {/* Role Toggle */}
          <div className="auth-toggle">
            <button
              onClick={() => setLoginType('faculty')}
              className={`auth-toggle-btn ${loginType === 'faculty' ? 'auth-toggle-btn-active' : ''}`}
            >
              👨‍🏫 Faculty
            </button>
            <button
              onClick={() => setLoginType('student')}
              className={`auth-toggle-btn ${loginType === 'student' ? 'auth-toggle-btn-active' : ''}`}
            >
              🎓 Student
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {loginType === 'faculty' ? (
              <div>
                <label className="label">Email</label>
                <div className="auth-field">
                  <HiEnvelope className="input-icon" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="faculty@email.com"
                    className="input input-with-icon"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="label">Register Number</label>
                <div className="auth-field">
                  <HiAcademicCap className="input-icon" />
                  <input
                    type="text"
                    value={formData.registerNumber}
                    onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                    placeholder="REG2024001"
                    className="input input-with-icon"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label">Password</label>
              <div className="auth-field">
                <HiLockClosed className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-wide"
            >
              {loading ? (
                <>
                  <div className="spinner-sm"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {loginType === 'faculty' && (
            <p className="auth-footer">
              New faculty?{' '}
              <Link to="/register">Create an account</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
