import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiAcademicCap, HiArrowRightOnRectangle, HiHome, HiUser,
  HiUserGroup, HiBookOpen, HiSparkles, HiClipboardDocumentList, HiChartBar
} from 'react-icons/hi2';

const Navbar = () => {
  const { user, logout, isAuthenticated, isFaculty } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const dashPath = isFaculty ? '/faculty/dashboard' : '/student/dashboard';

  const isActive = (path) => location.pathname === path;

  // Faculty nav items
  const facultyLinks = [
    { to: '/faculty/dashboard', icon: HiHome, label: 'Dashboard' },
    { to: '/faculty/students', icon: HiUserGroup, label: 'Students' },
    { to: '/faculty/courses', icon: HiBookOpen, label: 'Courses' },
    { to: '/faculty/quiz-manage', icon: HiClipboardDocumentList, label: 'Quizzes' },
    { to: '/faculty/quiz-generate', icon: HiSparkles, label: 'Generate' },
    { to: '/faculty/analytics', icon: HiChartBar, label: 'Analytics' },
  ];

  // Student nav items
  const studentLinks = [
    { to: '/student/dashboard', icon: HiHome, label: 'Dashboard' },
    { to: '/student/courses', icon: HiBookOpen, label: 'Courses' },
    { to: '/student/quizzes', icon: HiClipboardDocumentList, label: 'Quizzes' },
    { to: '/student/attempts', icon: HiChartBar, label: 'My Attempts' },
  ];

  const navLinks = isFaculty ? facultyLinks : studentLinks;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={dashPath} className="navbar-logo">
          <div className="navbar-logo-icon">
            <HiAcademicCap />
          </div>
          <span className="gradient-text navbar-logo-text hidden-mobile">AI Quiz LMS</span>
        </Link>

        {/* Nav Links */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'nav-link-active' : ''}`}
            >
              <link.icon style={{ fontSize: '1rem' }} />
              <span className="hidden-mobile">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* User Info */}
        <div className="nav-user">
          <div className="nav-user-info">
            <div className="nav-user-avatar">
              <HiUser />
            </div>
            <div>
              <p className="nav-user-name">{user?.name}</p>
              <p className="nav-user-role">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-logout">
            <HiArrowRightOnRectangle style={{ fontSize: '1rem' }} />
            <span className="hidden-mobile nav-logout-text">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
