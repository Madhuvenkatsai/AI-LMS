import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { HiSparkles, HiArrowUpTray, HiDocumentText, HiCog6Tooth } from 'react-icons/hi2';

const QuizGenerate = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [config, setConfig] = useState({
    courseId: '',
    title: '',
    numberOfQuestions: 10,
    difficulty: 'Medium',
    textContent: ''
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  useEffect(() => {
    api.get('/courses').then(res => {
      setCourses(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!config.courseId) return toast.error('Please select a course');
    if (!pdfFile && !config.textContent.trim()) return toast.error('Please upload a PDF or paste content');

    setGenerating(true);
    setGeneratedQuiz(null);

    try {
      const formData = new FormData();
      if (pdfFile) formData.append('file', pdfFile);
      formData.append('courseId', config.courseId);
      formData.append('title', config.title || `Quiz - ${config.difficulty}`);
      formData.append('numberOfQuestions', config.numberOfQuestions);
      formData.append('difficulty', config.difficulty);
      formData.append('textContent', config.textContent);

      const res = await api.post('/quiz/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setGeneratedQuiz(res.data.quiz);
      toast.success('Quiz saved as draft! Review and publish when ready.');
      
      // Redirect to quiz management after 2 seconds
      setTimeout(() => {
        navigate('/faculty/quiz-manage');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container-sm">
      <div className="mb-6">
        <h1 className="text-heading-lg flex items-center gap-2">
          <HiSparkles className="text-faculty-primary" /> AI Quiz Generator
        </h1>
        <p className="text-body-sm mt-2">Upload content and let AI create quizzes for you. Quizzes are saved as drafts.</p>
      </div>

      <form onSubmit={handleGenerate}>
        {/* Quiz Configuration */}
        <div className="glass-card p-5 mb-6">
          <h3 className="text-heading-sm mb-4 flex items-center gap-2">
            <HiCog6Tooth className="text-faculty-primary" /> Quiz Configuration
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="label">Course *</label>
              <select
                value={config.courseId}
                onChange={(e) => setConfig({ ...config, courseId: e.target.value })}
                className="select"
                required
              >
                <option value="">Select a course</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Quiz Title</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Auto-generated if blank"
                className="input"
              />
            </div>
            <div>
              <label className="label">Number of Questions</label>
              <select
                value={config.numberOfQuestions}
                onChange={(e) => setConfig({ ...config, numberOfQuestions: parseInt(e.target.value) })}
                className="select"
              >
                {[5, 10, 15, 20, 25, 30].map(n => (
                  <option key={n} value={n}>{n} questions</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Difficulty</label>
              <div className="diff-group">
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setConfig({ ...config, difficulty: d })}
                    className={`diff-btn ${
                      config.difficulty === d
                        ? d === 'Easy' ? 'diff-btn-easy-active' : d === 'Medium' ? 'diff-btn-medium-active' : 'diff-btn-hard-active'
                        : ''
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Input */}
        <div className="glass-card p-5 mb-6">
          <h3 className="text-heading-sm mb-4 flex items-center gap-2">
            <HiDocumentText className="text-faculty-primary" /> Content Source
          </h3>

          {/* PDF Upload */}
          <div className="mb-4">
            <label className="label">Upload PDF / Text File</label>
            <div className="file-drop">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setPdfFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <div className="file-drop-icon"><HiArrowUpTray /></div>
                {pdfFile ? (
                  <p className="file-drop-selected">{pdfFile.name}</p>
                ) : (
                  <p className="file-drop-text">Click to upload PDF or text file</p>
                )}
              </label>
            </div>
          </div>

          {/* Or text content */}
          <div>
            <label className="label">Or paste content directly</label>
            <textarea
              value={config.textContent}
              onChange={(e) => setConfig({ ...config, textContent: e.target.value })}
              placeholder="Paste your study material here..."
              rows={6}
              className="textarea"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={generating}
          className="btn btn-faculty-primary btn-lg btn-wide"
        >
          {generating ? (
            <>
              <div className="spinner-sm"></div>
              Generating quiz with AI...
            </>
          ) : (
            <>
              <HiSparkles /> Generate Quiz (Save as Draft)
            </>
          )}
        </button>
      </form>

      {/* Generated Quiz Preview */}
      {generatedQuiz && (
        <div className="glass-card p-5 mt-8 fade-in">
          <h3 className="text-heading-md mb-2">
            ✅ Quiz Generated: {generatedQuiz.title}
          </h3>
          <p className="text-body-sm mb-4">
            {generatedQuiz.questions.length} questions • {generatedQuiz.difficulty} difficulty
          </p>
          <div className="stack-4 overflow-y-auto" style={{ maxHeight: 500, paddingRight: '0.5rem' }}>
            {generatedQuiz.questions.map((q, i) => (
              <div key={i} className="item-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <p className="item-name mb-2">
                  <span className="text-primary" style={{ fontWeight: 700 }}>Q{i + 1}.</span> {q.question}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {q.options.map((opt, j) => (
                    <div
                      key={j}
                      className={opt === q.correctAnswer ? 'option-chip option-chip-correct' : 'option-chip option-chip-neutral'}
                    >
                      {String.fromCharCode(65 + j)}. {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-caption mt-2" style={{ fontStyle: 'italic' }}>💡 {q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerate;
