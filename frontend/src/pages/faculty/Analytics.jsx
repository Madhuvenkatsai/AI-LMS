import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import {
  HiChartBar, HiUserGroup, HiClipboardDocumentList, HiTrophy,
  HiMagnifyingGlass, HiArrowTrendingUp, HiArrowTrendingDown,
  HiMinusSmall, HiChevronDown, HiChevronUp, HiClock,
  HiAcademicCap, HiExclamationTriangle, HiStar, HiFunnel,
  HiArrowPath, HiEye
} from 'react-icons/hi2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from 'recharts';

const COLORS = {
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
  orange: '#f97316'
};

const CATEGORY_COLORS = {
  'High Performing': '#10b981',
  'Average': '#f59e0b',
  'At Risk': '#f43f5e'
};

const DIFFICULTY_COLORS = {
  'Easy': '#10b981',
  'Medium': '#f59e0b',
  'Hard': '#f43f5e'
};

const CustomTooltipStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  color: '#0f172a',
  padding: '12px 16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  zIndex: 1000
};

const Analytics = () => {
  const [summaryStats, setSummaryStats] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('avgScore');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [summaryRes, studentsRes] = await Promise.all([
        api.get('/prediction/analytics/summary'),
        api.get('/prediction/analytics/students')
      ]);
      setSummaryStats(summaryRes.data);
      setStudentData(studentsRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    if (!studentData?.students) return [];
    let result = [...studentData.students];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.student.name.toLowerCase().includes(q) ||
        s.student.registerNumber.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(s => {
        if (filterCategory === 'active') return s.totalAttempts > 0;
        if (filterCategory === 'inactive') return s.totalAttempts === 0;
        if (filterCategory === 'improving') return s.trend === 'up';
        if (filterCategory === 'declining') return s.trend === 'down';
        if (filterCategory === 'at-risk') return s.prediction?.category === 'At Risk' || s.avgScore < 50;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'name': aVal = a.student.name; bVal = b.student.name; break;
        case 'avgScore': aVal = a.avgScore; bVal = b.avgScore; break;
        case 'totalAttempts': aVal = a.totalAttempts; bVal = b.totalAttempts; break;
        case 'bestScore': aVal = a.bestScore; bVal = b.bestScore; break;
        case 'consistency': aVal = a.consistency; bVal = b.consistency; break;
        case 'trend': aVal = a.trendValue; bVal = b.trendValue; break;
        default: aVal = a.avgScore; bVal = b.avgScore;
      }
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [studentData, searchQuery, sortField, sortDir, filterCategory]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <HiChevronUp className="inline ml-1" /> : <HiChevronDown className="inline ml-1" />;
  };

  if (loading) return <LoadingSpinner />;

  const categoryData = summaryStats?.categoryDistribution
    ? Object.entries(summaryStats.categoryDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const scoreData = summaryStats?.scoreDistribution
    ? Object.entries(summaryStats.scoreDistribution).map(([range, count]) => ({ range, count }))
    : [];

  const difficultyData = studentData?.classStats?.difficultyBreakdown || [];

  // Student comparison data for bar chart
  const studentComparisonData = filteredStudents
    .filter(s => s.totalAttempts > 0)
    .slice(0, 15)
    .map(s => ({
      name: s.student.name.length > 12 ? s.student.name.substring(0, 12) + '...' : s.student.name,
      fullName: s.student.name,
      avgScore: s.avgScore,
      bestScore: s.bestScore,
      classAvg: studentData?.classStats?.classAvg || 0
    }));

  const getScoreColor = (score) => {
    if (score >= 80) return COLORS.emerald;
    if (score >= 60) return COLORS.sky;
    if (score >= 40) return COLORS.amber;
    return COLORS.rose;
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'badge-faculty-success';
    if (score >= 60) return 'badge-faculty-primary';
    if (score >= 40) return 'badge-faculty-warning';
    return 'badge-faculty-danger';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <HiArrowTrendingUp style={{ color: COLORS.emerald, fontSize: '1.1rem' }} />;
    if (trend === 'down') return <HiArrowTrendingDown style={{ color: COLORS.rose, fontSize: '1.1rem' }} />;
    return <HiMinusSmall style={{ color: COLORS.amber, fontSize: '1.1rem' }} />;
  };

  const getCategoryBadge = (category) => {
    const colorMap = {
      'High Performing': 'badge-faculty-success',
      'Average': 'badge-faculty-warning',
      'At Risk': 'badge-faculty-danger'
    };
    return colorMap[category] || 'badge-faculty-secondary';
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  // Custom tooltip for charts
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="analytics-tooltip" style={CustomTooltipStyle}>
        <p style={{ fontWeight: 600, marginBottom: 6, color: '#059669' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: 13, color: '#334155' }}>
            {p.name}: <strong>{p.value}%</strong>
          </p>
        ))}
      </div>
    );
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="analytics-tooltip" style={CustomTooltipStyle}>
        <p style={{ fontWeight: 600, color: payload[0].payload.fill || '#059669' }}>
          {payload[0].name}
        </p>
        <p style={{ fontSize: 13, color: '#334155' }}>Count: <strong>{payload[0].value}</strong></p>
      </div>
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6 fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-heading-lg flex items-center gap-2">
              <HiChartBar className="text-faculty-primary" /> Analytics & Insights
            </h1>
            <p className="text-body-sm mt-2 text-muted">
              Comprehensive view of student performance, trends, and predictions
            </p>
          </div>
          <button
            onClick={() => { setLoading(true); fetchAllData(); }}
            className="btn btn-faculty-outline flex items-center gap-2"
            style={{ padding: '8px 16px', borderRadius: 10 }}
          >
            <HiArrowPath /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs mb-6" style={{
        display: 'flex', gap: 4, padding: 4,
        background: '#f1f5f9',
        borderRadius: 14, border: '1px solid #e2e8f0',
        width: 'fit-content'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: HiChartBar },
          { id: 'students', label: 'Student-Wise', icon: HiUserGroup },
          { id: 'leaderboard', label: 'Leaderboard', icon: HiTrophy }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.25s ease',
              background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.08))' : 'transparent',
              color: activeTab === tab.id ? '#059669' : '#64748b',
              boxShadow: activeTab === tab.id ? '0 2px 12px rgba(16,185,129,0.1)' : 'none'
            }}
          >
            <tab.icon style={{ fontSize: 16 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="fade-in">
          {/* Stats Cards */}
          <div className="grid-4 mb-8">
            <StatCard
              icon={HiUserGroup}
              label="Total Students"
              value={summaryStats?.totalStudents || 0}
              iconClass="icon-box-faculty-primary"
              color="#86efac"
            />
            <StatCard
              icon={HiClipboardDocumentList}
              label="Quiz Attempts"
              value={summaryStats?.totalAttempts || 0}
              iconClass="icon-box-faculty-success"
              color="#10b981"
            />
            <StatCard
              icon={HiTrophy}
              label="Class Average"
              value={`${summaryStats?.averageScore || 0}%`}
              iconClass="icon-box-faculty-warning"
              color="#f59e0b"
            />
            <StatCard
              icon={HiExclamationTriangle}
              label="At Risk Students"
              value={summaryStats?.atRiskStudents || 0}
              iconClass="icon-box-faculty-danger"
              color="#f43f5e"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid-2 gap-6 mb-6">
            {/* Score Distribution */}
            <div className="glass-card p-5">
              <h3 className="text-heading-md mb-1">Score Distribution</h3>
              <p className="text-caption text-muted mb-4">How students score across all quizzes</p>
              {scoreData.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreData} barSize={40}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#86efac" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="range" tick={{ fill: '#97a8be', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                    <YAxis tick={{ fill: '#97a8be', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="analytics-tooltip" style={CustomTooltipStyle}>
                          <p style={{ fontWeight: 600, color: '#059669' }}>Score Range: {label}</p>
                          <p style={{ fontSize: 13, color: '#334155' }}>Students: <strong>{payload[0].value}</strong></p>
                        </div>
                      );
                    }} />
                    <Bar dataKey="count" fill="url(#scoreGrad)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No score data available" />
              )}
            </div>

            {/* Performance Categories Donut */}
            <div className="glass-card p-5">
              <h3 className="text-heading-md mb-1">Performance Categories</h3>
              <p className="text-caption text-muted mb-4">AI-predicted student categories</p>
              {categoryData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[entry.name] || COLORS.sky}
                          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span style={{ color: '#c8d5e2', fontSize: 13 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No prediction categories available" />
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid-2 gap-6 mb-6">
            {/* Difficulty Breakdown */}
            <div className="glass-card p-5">
              <h3 className="text-heading-md mb-1">Difficulty Performance</h3>
              <p className="text-caption text-muted mb-4">Average scores by quiz difficulty level</p>
              {difficultyData.some(d => d.totalAttempts > 0) ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={difficultyData} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="difficulty" tick={{ fill: '#97a8be', fontSize: 13 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#97a8be', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="analytics-tooltip" style={CustomTooltipStyle}>
                          <p style={{ fontWeight: 600, color: DIFFICULTY_COLORS[label] || '#059669' }}>{label}</p>
                          <p style={{ fontSize: 13, color: '#334155' }}>Avg Score: <strong>{payload[0].value}%</strong></p>
                          <p style={{ fontSize: 12, color: '#64748b' }}>Attempts: {difficultyData.find(d => d.difficulty === label)?.totalAttempts || 0}</p>
                        </div>
                      );
                    }} />
                    <Bar dataKey="avgScore" radius={[8, 8, 0, 0]}>
                      {difficultyData.map((entry, index) => (
                        <Cell key={index} fill={DIFFICULTY_COLORS[entry.difficulty] || COLORS.sky} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No difficulty data available" />
              )}
            </div>

            {/* Student Score Comparison */}
            <div className="glass-card p-5">
              <h3 className="text-heading-md mb-1">Student Comparison</h3>
              <p className="text-caption text-muted mb-4">Average scores vs class average</p>
              {studentComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={studentComparisonData} barGap={2}>
                    <defs>
                      <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#97a8be', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} angle={-35} textAnchor="end" height={60} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#97a8be', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="avgScore" name="Avg Score" fill="url(#studentGrad)" radius={[6, 6, 0, 0]} barSize={20} />
                    <Bar dataKey="classAvg" name="Class Avg" fill="rgba(134,239,172,0.3)" radius={[6, 6, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No student data available for comparison" />
              )}
            </div>
          </div>

          {/* Quick Insights Row */}
          <div className="grid-2 gap-6">
            {/* Top Performers */}
            <div className="glass-card p-5">
              <h3 className="text-heading-md mb-4 flex items-center gap-2">
                <HiStar style={{ color: '#f59e0b' }} /> Top Performers
              </h3>
              {studentData?.classStats?.topPerformers?.length > 0 ? (
                <div className="stack-3">
                  {studentData.classStats.topPerformers.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{
                      background: i === 0 ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                      border: i === 0 ? '1px solid rgba(245,158,11,0.15)' : '1px solid transparent'
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14,
                        background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #f97316)' :
                                    i === 1 ? 'linear-gradient(135deg, #97a8be, #cbd5e1)' :
                                    i === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' :
                                    'rgba(255,255,255,0.08)',
                        color: i < 3 ? '#0f172a' : '#97a8be'
                      }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-body-sm font-semibold">{s.name}</p>
                        <p className="text-caption text-muted">{s.registerNumber} • {s.totalAttempts} quizzes</p>
                      </div>
                      <span className={`badge ${getScoreBadgeClass(s.avgScore)}`}>{s.avgScore}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="No performers data yet" />
              )}
            </div>

            {/* Needs Attention */}
            <div className="glass-card p-5">
              <h3 className="text-heading-md mb-4 flex items-center gap-2">
                <HiExclamationTriangle style={{ color: '#f43f5e' }} /> Needs Attention
              </h3>
              {studentData?.classStats?.needsAttention?.length > 0 ? (
                <div className="stack-3">
                  {studentData.classStats.needsAttention.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{
                      background: 'rgba(244,63,94,0.05)',
                      border: '1px solid rgba(244,63,94,0.1)'
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(244,63,94,0.15)', color: '#f43f5e',
                        fontSize: 14
                      }}>
                        <HiExclamationTriangle />
                      </div>
                      <div className="flex-1">
                        <p className="text-body-sm font-semibold">{s.name}</p>
                        <p className="text-caption text-muted">{s.registerNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-faculty-danger">{s.avgScore}%</span>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          {getTrendIcon(s.trend)}
                          <span className="text-caption" style={{
                            color: s.trend === 'down' ? COLORS.rose : '#97a8be'
                          }}>
                            {s.trendValue > 0 ? '+' : ''}{s.trendValue}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-center" style={{ height: 150, flexDirection: 'column' }}>
                  <HiAcademicCap style={{ fontSize: 40, color: '#10b981', marginBottom: 8 }} />
                  <p className="text-body-sm" style={{ color: '#10b981' }}>All students performing well! 🎉</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── STUDENT-WISE TAB ─────────────────────────────── */}
      {activeTab === 'students' && (
        <div className="fade-in">
          {/* Search & Filter Bar */}
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1" style={{ minWidth: 250, position: 'relative' }}>
                <HiMagnifyingGlass style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#97a8be', fontSize: 16
                }} />
                <input
                  type="text"
                  placeholder="Search by name or register number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 40, width: '100%' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <HiFunnel style={{ color: '#97a8be', fontSize: 16 }} />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input"
                  style={{ minWidth: 160 }}
                >
                  <option value="all">All Students</option>
                  <option value="active">Active (Has Attempts)</option>
                  <option value="inactive">Inactive (No Attempts)</option>
                  <option value="improving">Improving (↑)</option>
                  <option value="declining">Declining (↓)</option>
                  <option value="at-risk">At Risk</option>
                </select>
              </div>
              <div className="text-caption text-muted">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {[
                      { field: 'name', label: 'Student' },
                      { field: 'avgScore', label: 'Avg Score' },
                      { field: 'bestScore', label: 'Best' },
                      { field: 'totalAttempts', label: 'Attempts' },
                      { field: 'consistency', label: 'Consistency' },
                      { field: 'trend', label: 'Trend' },
                      { field: null, label: 'Category' },
                      { field: null, label: '' }
                    ].map((col, i) => (
                      <th
                        key={i}
                        onClick={() => col.field && handleSort(col.field)}
                        style={{
                          padding: '14px 16px',
                          textAlign: i === 0 ? 'left' : 'center',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: col.field ? 'pointer' : 'default',
                          whiteSpace: 'nowrap',
                          background: '#f8fafc',
                          userSelect: 'none'
                        }}
                      >
                        {col.label}{col.field && getSortIcon(col.field)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <StudentRow
                      key={s.student.id}
                      data={s}
                      index={idx}
                      isExpanded={expandedStudent === s.student.id}
                      onToggle={() => setExpandedStudent(
                        expandedStudent === s.student.id ? null : s.student.id
                      )}
                      getScoreColor={getScoreColor}
                      getScoreBadgeClass={getScoreBadgeClass}
                      getTrendIcon={getTrendIcon}
                      getCategoryBadge={getCategoryBadge}
                      formatTime={formatTime}
                      formatDate={formatDate}
                      classAvg={studentData?.classStats?.classAvg || 0}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStudents.length === 0 && (
              <div className="flex-center" style={{ padding: '60px 20px', flexDirection: 'column' }}>
                <HiUserGroup style={{ fontSize: 48, color: '#97a8be', marginBottom: 12 }} />
                <p className="text-body-sm text-muted">No students match your filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── LEADERBOARD TAB ─────────────────────────────── */}
      {activeTab === 'leaderboard' && (
        <div className="fade-in">
          <div className="grid-2 gap-6">
            {/* Leaderboard */}
            <div className="glass-card p-6">
              <h3 className="text-heading-md mb-6 flex items-center gap-2">
                <HiTrophy style={{ color: '#f59e0b' }} /> Performance Leaderboard
              </h3>
              {filteredStudents.filter(s => s.totalAttempts > 0).length > 0 ? (
                <div className="stack-3">
                  {[...filteredStudents]
                    .filter(s => s.totalAttempts > 0)
                    .sort((a, b) => b.avgScore - a.avgScore)
                    .map((s, i) => (
                      <div key={s.student.id} className="flex items-center gap-4 p-4 rounded-xl" style={{
                        background: i < 3 ? `rgba(${i === 0 ? '245,158,11' : i === 1 ? '151,168,190' : '217,119,6'},0.06)` : 'rgba(255,255,255,0.02)',
                        border: `1px solid rgba(${i === 0 ? '245,158,11' : i === 1 ? '151,168,190' : i === 2 ? '217,119,6' : '255,255,255'},${i < 3 ? '0.15' : '0.04'})`,
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 16,
                          background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #f97316)' :
                                      i === 1 ? 'linear-gradient(135deg, #97a8be, #cbd5e1)' :
                                      i === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' :
                                      'rgba(255,255,255,0.06)',
                          color: i < 3 ? '#0f172a' : '#97a8be',
                          boxShadow: i < 3 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                        }}>
                          {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-body-sm font-semibold">{s.student.name}</p>
                          <p className="text-caption text-muted">{s.student.registerNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-heading-sm" style={{ color: getScoreColor(s.avgScore) }}>
                            {s.avgScore}%
                          </p>
                          <div className="flex items-center gap-1 justify-end">
                            {getTrendIcon(s.trend)}
                            <span className="text-caption text-muted">{s.totalAttempts} quizzes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <EmptyState text="No quiz attempts recorded yet" />
              )}
            </div>

            {/* Leaderboard Chart */}
            <div className="glass-card p-6">
              <h3 className="text-heading-md mb-6 flex items-center gap-2">
                <HiChartBar style={{ color: '#8b5cf6' }} /> Score Rankings
              </h3>
              {studentComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart data={studentComparisonData} layout="vertical" barGap={2}>
                    <defs>
                      <linearGradient id="rankGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#97a8be', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#c8d5e2', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="avgScore" name="Avg Score" fill="url(#rankGrad)" radius={[0, 8, 8, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No ranking data available yet" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── STAT CARD COMPONENT ─────────────────────────── */
const StatCard = ({ icon: Icon, label, value, iconClass, color }) => (
  <div className="glass-card p-5 hover-faculty-lift" style={{
    borderTop: `2px solid ${color}22`
  }}>
    <div className="flex items-center gap-3">
      <div className={`icon-box ${iconClass}`}>
        <Icon />
      </div>
      <div>
        <p className="text-caption text-muted">{label}</p>
        <p className="text-heading-lg" style={{ color }}>{value}</p>
      </div>
    </div>
  </div>
);

/* ─── EMPTY STATE ─────────────────────────────────── */
const EmptyState = ({ text }) => (
  <div className="flex-center" style={{ height: 200, flexDirection: 'column' }}>
    <HiChartBar style={{ fontSize: 40, color: '#97a8be', marginBottom: 8, opacity: 0.4 }} />
    <p className="text-body-sm text-muted">{text}</p>
  </div>
);

/* ─── STUDENT ROW (TABLE + EXPANDABLE DETAIL) ─────── */
const StudentRow = ({
  data: s, index, isExpanded, onToggle,
  getScoreColor, getScoreBadgeClass, getTrendIcon, getCategoryBadge,
  formatTime, formatDate, classAvg
}) => {
  const rowBg = index % 2 === 0 ? 'transparent' : '#f8fafc';

  return (
    <>
      <tr
        onClick={onToggle}
        style={{
          borderBottom: '1px solid #e2e8f0',
          background: isExpanded ? '#f0fdf4' : rowBg,
          cursor: 'pointer',
          transition: 'background 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#f0fdf4'}
        onMouseOut={(e) => e.currentTarget.style.background = isExpanded ? '#f0fdf4' : rowBg}
      >
        {/* Student Name */}
        <td style={{ padding: '14px 16px' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, ${getScoreColor(s.avgScore)}22, ${getScoreColor(s.avgScore)}11)`,
              border: `1px solid ${getScoreColor(s.avgScore)}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, color: getScoreColor(s.avgScore),
              flexShrink: 0
            }}>
              {s.student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-body-sm font-semibold" style={{ lineHeight: 1.3 }}>{s.student.name}</p>
              <p className="text-caption text-muted">{s.student.registerNumber}</p>
            </div>
          </div>
        </td>
        {/* Avg Score */}
        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 20,
            fontWeight: 700, fontSize: 14,
            background: `${getScoreColor(s.avgScore)}18`,
            color: getScoreColor(s.avgScore),
            border: `1px solid ${getScoreColor(s.avgScore)}30`
          }}>
            {s.avgScore}%
          </span>
        </td>
        {/* Best Score */}
        <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: '#e1e8ef' }}>
          {s.totalAttempts > 0 ? `${s.bestScore}%` : '—'}
        </td>
        {/* Attempts */}
        <td style={{ padding: '14px 16px', textAlign: 'center', color: '#c8d5e2' }}>
          {s.totalAttempts}
        </td>
        {/* Consistency */}
        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
          {s.totalAttempts > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{
                width: 60, height: 6, borderRadius: 3,
                background: '#e2e8f0',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${s.consistency}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: s.consistency >= 80 ? COLORS.emerald :
                              s.consistency >= 50 ? COLORS.amber : COLORS.rose,
                  transition: 'width 0.6s ease'
                }} />
              </div>
              <span className="text-caption" style={{ color: '#97a8be', minWidth: 32 }}>
                {Math.round(s.consistency)}%
              </span>
            </div>
          ) : '—'}
        </td>
        {/* Trend */}
        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-1">
            {getTrendIcon(s.trend)}
            {s.totalAttempts >= 2 && (
              <span className="text-caption" style={{
                color: s.trend === 'up' ? COLORS.emerald :
                       s.trend === 'down' ? COLORS.rose : '#97a8be'
              }}>
                {s.trendValue > 0 ? '+' : ''}{s.trendValue}
              </span>
            )}
          </div>
        </td>
        {/* Category */}
        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
          {s.prediction ? (
            <span className={`badge ${getCategoryBadge(s.prediction.category)}`}>
              {s.prediction.category}
            </span>
          ) : (
            <span className="badge badge-faculty-secondary" style={{ opacity: 0.5 }}>N/A</span>
          )}
        </td>
        {/* Expand Toggle */}
        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#97a8be', fontSize: 18, padding: 4
          }}>
            {isExpanded ? <HiChevronUp /> : <HiEye />}
          </button>
        </td>
      </tr>

      {/* Expanded Detail Panel */}
      {isExpanded && (
        <tr>
          <td colSpan={8} style={{ padding: 0 }}>
            <StudentDetailPanel
              data={s}
              getScoreColor={getScoreColor}
              getScoreBadgeClass={getScoreBadgeClass}
              formatTime={formatTime}
              formatDate={formatDate}
              classAvg={classAvg}
            />
          </td>
        </tr>
      )}
    </>
  );
};

/* ─── STUDENT DETAIL PANEL ────────────────────────── */
const StudentDetailPanel = ({ data: s, getScoreColor, getScoreBadgeClass, formatTime, formatDate, classAvg }) => {
  const scoreHistoryChart = s.scoreHistory.map((h, i) => ({
    ...h,
    index: i + 1,
    label: `Q${i + 1}`,
    classAvg
  }));

  return (
    <div style={{
      background: '#f0fdf4',
      borderTop: '1px solid #bbf7d0',
      borderBottom: '2px solid #86efac',
      padding: '24px 20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 24
      }}>
        {[
          { label: 'Average Score', value: `${s.avgScore}%`, color: getScoreColor(s.avgScore) },
          { label: 'Best Score', value: `${s.bestScore}%`, color: COLORS.emerald },
          { label: 'Worst Score', value: `${s.worstScore}%`, color: COLORS.rose },
          { label: 'Last Score', value: `${s.lastScore}%`, color: COLORS.sky },
          { label: 'Avg Time', value: formatTime(s.avgResponseTime), color: COLORS.violet },
          { label: 'Consistency', value: `${Math.round(s.consistency)}%`, color: s.consistency >= 70 ? COLORS.emerald : COLORS.amber }
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '12px 14px',
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <p className="text-caption text-muted" style={{ marginBottom: 4 }}>{stat.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Score History */}
        <div style={{
          padding: 16, borderRadius: 12,
          background: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}>
          <h4 className="text-heading-sm mb-3" style={{ fontSize: 14 }}>Score Progress</h4>
          {scoreHistoryChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={scoreHistoryChart}>
                <defs>
                  <linearGradient id={`areaGrad-${s.student.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: '#97a8be', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#97a8be', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                <Tooltip
                  contentStyle={CustomTooltipStyle}
                  itemStyle={{ color: '#334155' }}
                  labelStyle={{ color: '#059669', fontWeight: 600 }}
                  formatter={(value, name) => [
                    `${value}%`,
                    name === 'score' ? 'Score' : 'Class Avg'
                  ]}
                  labelFormatter={(label) => {
                    const item = scoreHistoryChart.find(h => h.label === label);
                    return item?.quizTitle || label;
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} fill={`url(#areaGrad-${s.student.id})`} dot={{ r: 4, fill: '#8b5cf6', stroke: '#1a2538', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="classAvg" stroke="#86efac" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-center" style={{ height: 200 }}>
              <p className="text-caption text-muted">No attempts yet</p>
            </div>
          )}
        </div>

        {/* Course Breakdown */}
        <div style={{
          padding: 16, borderRadius: 12,
          background: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}>
          <h4 className="text-heading-sm mb-3" style={{ fontSize: 14 }}>Course Performance</h4>
          {s.courseBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={s.courseBreakdown} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="courseTitle"
                  tick={{ fill: '#97a8be', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} tick={{ fill: '#97a8be', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                <Tooltip contentStyle={CustomTooltipStyle} itemStyle={{ color: '#334155' }} labelStyle={{ color: '#059669', fontWeight: 600 }} formatter={(value) => [`${value}%`, 'Avg Score']} />
                <Bar dataKey="avgScore" radius={[6, 6, 0, 0]}>
                  {s.courseBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={[COLORS.violet, COLORS.cyan, COLORS.pink, COLORS.teal, COLORS.indigo][idx % 5]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-center" style={{ height: 200 }}>
              <p className="text-caption text-muted">No course data</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Attempts Table */}
      {s.recentAttempts.length > 0 && (
        <div style={{
          padding: 16, borderRadius: 12,
          background: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}>
          <h4 className="text-heading-sm mb-3" style={{ fontSize: 14 }}>Recent Attempts</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {['Quiz', 'Course', 'Score', 'Correct', 'Time', 'Difficulty', 'Date'].map((h, i) => (
                    <th key={i} style={{
                      padding: '8px 12px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: i === 0 || i === 1 ? 'left' : 'center'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.recentAttempts.map((a, i) => (
                  <tr key={a.id || i} style={{
                    borderBottom: '1px solid #f1f5f9'
                  }}>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: '#e1e8ef' }}>{a.quizTitle}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: '#97a8be' }}>{a.courseTitle}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 700, fontSize: 13,
                        color: getScoreColor(a.score)
                      }}>
                        {a.score}%
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 13, color: '#c8d5e2' }}>
                      {a.correctAnswers}/{a.totalQuestions}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 13, color: '#97a8be' }}>
                      {formatTime(a.responseTime)}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: `${DIFFICULTY_COLORS[a.difficulty] || COLORS.sky}18`,
                        color: DIFFICULTY_COLORS[a.difficulty] || COLORS.sky,
                        border: `1px solid ${DIFFICULTY_COLORS[a.difficulty] || COLORS.sky}30`
                      }}>
                        {a.difficulty}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#97a8be' }}>
                      {formatDate(a.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
