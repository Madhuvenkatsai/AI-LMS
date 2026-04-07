import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Public Pages
import Home from './pages/Home';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import ManageStudents from './pages/faculty/ManageStudents';
import ManageCourses from './pages/faculty/ManageCourses';
import QuizGenerate from './pages/faculty/QuizGenerate';
import QuizManage from './pages/faculty/QuizManage';
import QuizReview from './pages/faculty/QuizReview';
import Analytics from './pages/faculty/Analytics';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import QuizAttempt from './pages/student/QuizAttempt';
import StudentCourses from './pages/student/StudentCourses';
import StudentQuizzes from './pages/student/StudentQuizzes';
import StudentAttempts from './pages/student/StudentAttempts';

function App() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return (
      <div className="gradient-bg flex-center" style={{ minHeight: '100vh' }}>
        <LoadingSpinner text="Initializing..." />
      </div>
    );
  }

  const getDashboardRoute = () => {
    if (!isAuthenticated) return '/login';
    return user?.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard';
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh' }}>
      {/* Only show Navbar when authenticated (Home page has its own nav) */}
      {isAuthenticated && <Navbar />}

      <Routes>
        {/* Home / Landing Page */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Home />
        } />

        {/* Auth Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to={getDashboardRoute()} /> : <Register />
        } />

        {/* Faculty Routes */}
        <Route path="/faculty/dashboard" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/faculty/students" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <ManageStudents />
          </ProtectedRoute>
        } />
        <Route path="/faculty/courses" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <ManageCourses />
          </ProtectedRoute>
        } />
        <Route path="/faculty/quiz-generate" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <QuizGenerate />
          </ProtectedRoute>
        } />
        <Route path="/faculty/quiz-manage" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <QuizManage />
          </ProtectedRoute>
        } />
        <Route path="/faculty/quiz-review/:id" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <QuizReview />
          </ProtectedRoute>
        } />
        <Route path="/faculty/analytics" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <Analytics />
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/courses" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCourses />
          </ProtectedRoute>
        } />
        <Route path="/student/quizzes" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentQuizzes />
          </ProtectedRoute>
        } />
        <Route path="/student/attempts" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentAttempts />
          </ProtectedRoute>
        } />
        <Route path="/student/quiz/:quizId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <QuizAttempt />
          </ProtectedRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? getDashboardRoute() : '/'} replace />} />
      </Routes>
    </div>
  );
}

export default App;
