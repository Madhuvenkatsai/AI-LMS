import { Link } from 'react-router-dom';
import {
  HiAcademicCap, HiSparkles, HiChartBar, HiUserGroup,
  HiShieldCheck, HiCpuChip, HiArrowRight, HiBookOpen,
  HiLightBulb, HiRocketLaunch, HiCheckCircle
} from 'react-icons/hi2';

const Home = () => {
  const features = [
    {
      icon: HiCpuChip,
      title: 'AI Quiz Generation',
      description: 'Upload PDFs or paste content — our AI generates comprehensive, high-quality quizzes instantly with explanations.',
      color: 'var(--primary-400)',
      bg: 'rgba(59, 130, 246, 0.12)',
    },
    {
      icon: HiChartBar,
      title: 'Performance Analytics',
      description: 'Deep insights into student performance with visual dashboards, score distributions, and trend analysis.',
      color: 'var(--accent-400)',
      bg: 'rgba(6, 182, 212, 0.12)',
    },
    {
      icon: HiSparkles,
      title: 'Smart Predictions',
      description: 'Machine learning models predict student performance and identify at-risk learners before it\'s too late.',
      color: '#a78bfa',
      bg: 'rgba(139, 92, 246, 0.12)',
    },
    {
      icon: HiUserGroup,
      title: 'Student Management',
      description: 'Seamlessly manage students with bulk CSV uploads, role-based access, and organized course assignments.',
      color: 'var(--success-400)',
      bg: 'rgba(16, 185, 129, 0.12)',
    },
    {
      icon: HiBookOpen,
      title: 'Course Organization',
      description: 'Create and structure courses, assign quizzes, and track enrollment — all from one unified dashboard.',
      color: 'var(--warning-400)',
      bg: 'rgba(245, 158, 11, 0.12)',
    },
    {
      icon: HiShieldCheck,
      title: 'Secure & Role-Based',
      description: 'Separate faculty and student experiences with JWT authentication and protected role-based routing.',
      color: 'var(--danger-400)',
      bg: 'rgba(244, 63, 94, 0.12)',
    },
  ];

  const stats = [
    { value: 'AI', label: 'Powered by Gemini' },
    { value: 'ML', label: 'Performance Prediction' },
    { value: '100%', label: 'Automated Grading' },
    { value: '24/7', label: 'Always Available' },
  ];

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh' }}>
      {/* ─── Navbar ─────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo">
            <div className="navbar-logo-icon">
              <HiAcademicCap />
            </div>
            <span className="gradient-text navbar-logo-text">AI Quiz LMS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.875rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
              Get Started <HiArrowRight />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background orbs */}
        <div className="auth-bg-orb" style={{ width: '30rem', height: '30rem', background: 'rgba(59,130,246,0.06)', top: '-5rem', left: '-10rem' }}></div>
        <div className="auth-bg-orb" style={{ width: '25rem', height: '25rem', background: 'rgba(6,182,212,0.05)', bottom: '-5rem', right: '-5rem' }}></div>
        <div className="auth-bg-orb" style={{ width: '18rem', height: '18rem', background: 'rgba(139,92,246,0.04)', top: '30%', right: '20%' }}></div>

        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '8rem 1.5rem 5rem', textAlign: 'center', position: 'relative' }}>
          {/* Pill badge */}
          <div className="fade-in" style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-primary" style={{ padding: '0.375rem 1rem', fontSize: '0.8125rem', borderRadius: '9999px' }}>
              <HiRocketLaunch style={{ marginRight: '0.375rem', verticalAlign: 'middle' }} />
              AI-Powered Learning Platform
            </span>
          </div>

          <h1 className="fade-in" style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            maxWidth: '52rem',
            margin: '0 auto 1.5rem',
            animationDelay: '0.1s'
          }}>
            Transform Learning with{' '}
            <span className="gradient-text">Intelligent Quizzes</span>{' '}
            & Predictive Analytics
          </h1>

          <p className="fade-in text-body" style={{
            maxWidth: '38rem',
            margin: '0 auto 2.5rem',
            fontSize: '1.125rem',
            color: 'var(--surface-300)',
            animationDelay: '0.2s',
            lineHeight: 1.7
          }}>
            Generate quizzes from any content using AI, track student performance with real-time dashboards,
            and predict at-risk learners — all in one seamless platform.
          </p>

          <div className="fade-in flex-center gap-4" style={{ animationDelay: '0.3s', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              <HiSparkles /> Start for Free
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Sign In <HiArrowRight />
            </Link>
          </div>

          {/* Stats row */}
          <div className="fade-in" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            maxWidth: '48rem',
            margin: '4rem auto 0',
            animationDelay: '0.4s'
          }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {stat.value}
                </p>
                <p className="text-caption" style={{ marginTop: '0.25rem' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ───────────────────────── */}
      <section style={{ maxWidth: '72rem', margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-accent" style={{ padding: '0.375rem 1rem', fontSize: '0.8125rem', borderRadius: '9999px', marginBottom: '1rem', display: 'inline-flex' }}>
            <HiLightBulb style={{ marginRight: '0.375rem' }} /> Features
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: '0.75rem 0'
          }}>
            Everything You Need to Teach Smarter
          </h2>
          <p className="text-body" style={{ maxWidth: '32rem', margin: '0 auto', fontSize: '1rem' }}>
            A complete suite of tools designed for modern educators and engaged learners.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem'
        }}>
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-card p-5 fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-xl)',
                background: feature.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                fontSize: '1.25rem',
                color: feature.color
              }}>
                <feature.icon />
              </div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
                {feature.title}
              </h3>
              <p className="text-body-sm" style={{ lineHeight: 1.6 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────── */}
      <section style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem'
          }}>
            How It Works
          </h2>
          <p className="text-body" style={{ maxWidth: '30rem', margin: '0 auto' }}>
            Get started in minutes with three simple steps.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            {
              step: '01',
              title: 'Upload Content',
              desc: 'Upload a PDF, paste text, or choose from your course materials. Our AI does the rest.',
              icon: HiBookOpen,
            },
            {
              step: '02',
              title: 'AI Generates Quizzes',
              desc: 'Advanced AI creates well-structured questions with multiple difficulty levels and explanations.',
              icon: HiSparkles,
            },
            {
              step: '03',
              title: 'Track & Predict',
              desc: 'Monitor student performance in real-time and get ML-powered predictions on learning outcomes.',
              icon: HiChartBar,
            },
          ].map((item, i) => (
            <div key={i} className="glass-card p-6 fade-in" style={{ textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, var(--primary-400), var(--accent-400))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1rem',
                letterSpacing: '-0.03em',
              }}>
                {item.step}
              </div>
              <div style={{
                width: '3.5rem', height: '3.5rem', borderRadius: '50%',
                background: 'rgba(59,130,246,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', fontSize: '1.25rem', color: 'var(--primary-400)'
              }}>
                <item.icon />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                {item.title}
              </h3>
              <p className="text-body-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ────────────────────────────── */}
      <section style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>
        <div className="glass-card" style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.12), rgba(6, 182, 212, 0.08))',
          borderColor: 'rgba(59, 130, 246, 0.2)',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '1rem'
          }}>
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-body" style={{ maxWidth: '28rem', margin: '0 auto 2rem', fontSize: '1rem' }}>
            Join educators who are already using AI to create better learning experiences.
          </p>
          <div className="flex-center gap-4" style={{ flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '0.875rem 2rem' }}>
              <HiSparkles /> Create Free Account
            </Link>
          </div>
          <div className="flex-center gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
            {['No credit card required', 'Free to get started', 'Setup in under a minute'].map((text, i) => (
              <span key={i} className="flex items-center gap-2 text-body-sm">
                <HiCheckCircle style={{ color: 'var(--success-400)' }} /> {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '2rem 1.5rem',
        textAlign: 'center'
      }}>
        <div className="flex-center gap-2" style={{ marginBottom: '0.5rem' }}>
          <div className="navbar-logo-icon" style={{ width: '1.5rem', height: '1.5rem', fontSize: '0.75rem', borderRadius: '0.375rem' }}>
            <HiAcademicCap />
          </div>
          <span className="gradient-text" style={{ fontWeight: 700, fontSize: '0.9375rem' }}>AI Quiz LMS</span>
        </div>
        <p className="text-caption">
          © {new Date().getFullYear()} AI Quiz LMS. Built with React, Node.js, and ❤️
        </p>
      </footer>
    </div>
  );
};

export default Home;
