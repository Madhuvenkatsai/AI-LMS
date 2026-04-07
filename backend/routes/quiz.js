const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

const router = express.Router();

// ─── OpenRouter API Helper ─────────────────────────────────────
async function callOpenRouter(prompt, maxTokens = 4096) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  try {
    // Use a more reliable model for structured output
    const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.3, // Lower temperature for more consistent output
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'AI Quiz LMS',
        },
        timeout: 60000, // 60 second timeout
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenRouter API');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response) {
      // API returned an error response
      console.error('OpenRouter API error:', error.response.status, error.response.data);
      throw new Error(`OpenRouter API error: ${error.response.data?.error?.message || error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from OpenRouter API');
      throw new Error('No response from OpenRouter API - check your internet connection');
    } else {
      // Something else went wrong
      throw error;
    }
  }
}

// Configure multer for PDF upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `pdf-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'), false);
    }
  }
});

// Health check for quiz routes
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    openRouterConfigured: !!process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL 
  });
});

// Generate quiz using OpenRouter API (Faculty only)
router.post('/generate', auth(['faculty']), upload.single('file'), async (req, res) => {
  try {
    console.log('Quiz generation request received:', {
      courseId: req.body.courseId,
      numberOfQuestions: req.body.numberOfQuestions,
      difficulty: req.body.difficulty,
      hasFile: !!req.file,
      hasTextContent: !!req.body.textContent
    });

    const { courseId, numberOfQuestions = 10, difficulty = 'Medium', title, textContent } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    let extractedText = textContent || '';

    // Extract text from uploaded PDF
    if (req.file) {
      try {
        if (req.file.mimetype === 'application/pdf') {
          const dataBuffer = fs.readFileSync(req.file.path);
          const pdfData = await pdfParse(dataBuffer);
          extractedText = pdfData.text;
        } else {
          extractedText = fs.readFileSync(req.file.path, 'utf-8');
        }
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
      } catch (fileError) {
        console.error('File processing error:', fileError);
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: 'Failed to process uploaded file', error: fileError.message });
      }
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ message: 'No text content provided. Please upload a file or provide text.' });
    }

    console.log('Extracted text length:', extractedText.length);

    // Generate quiz using OpenRouter
    const prompt = `Generate ${numberOfQuestions} multiple-choice quiz questions based on this content. Difficulty: ${difficulty}.

CONTENT:
${extractedText.substring(0, 6000)}

Return your response in XML format ONLY (no extra text, no markdown):

<quiz>
  <question>
    <text>What is the primary purpose of time complexity?</text>
    <option>To measure exact execution time</option>
    <option>To compare algorithm efficiency</option>
    <option>To determine memory usage</option>
    <option>To predict code lines</option>
    <correct>To compare algorithm efficiency</correct>
    <explanation>Time complexity helps compare how algorithms scale with input size.</explanation>
  </question>
</quiz>

Generate exactly ${numberOfQuestions} questions with 4 options each. The <correct> tag must contain the exact text of one of the options.`;

    console.log('Calling OpenRouter API...');
    let responseText;
    try {
      responseText = await callOpenRouter(prompt, 3000);
      console.log('OpenRouter response received, length:', responseText.length);
      console.log('First 300 chars:', responseText.substring(0, 300));
    } catch (apiError) {
      console.error('OpenRouter API error:', apiError.response?.data || apiError.message);
      return res.status(500).json({ 
        message: 'Failed to connect to AI service', 
        error: apiError.response?.data?.error?.message || apiError.message 
      });
    }
    
    // Parse the XML response
    let questions;
    try {
      // Clean the response text
      let cleanedText = responseText.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```xml\s*/g, '').replace(/```\s*/g, '');
      
      // Extract quiz XML
      const quizMatch = cleanedText.match(/<quiz>[\s\S]*<\/quiz>/i);
      if (!quizMatch) {
        throw new Error('No <quiz> XML found in response');
      }
      
      const xmlText = quizMatch[0];
      console.log('Extracted XML length:', xmlText.length);
      
      // Parse questions using regex (simple XML parsing)
      const questionBlocks = xmlText.match(/<question>[\s\S]*?<\/question>/gi);
      
      if (!questionBlocks || questionBlocks.length === 0) {
        throw new Error('No questions found in XML');
      }
      
      console.log('Found question blocks:', questionBlocks.length);
      
      questions = questionBlocks.map((block, index) => {
        // Extract question text
        const textMatch = block.match(/<text>([\s\S]*?)<\/text>/i);
        const questionText = textMatch ? textMatch[1].trim() : '';
        
        // Extract options
        const optionMatches = block.match(/<option>([\s\S]*?)<\/option>/gi);
        const options = optionMatches ? optionMatches.map(opt => 
          opt.replace(/<\/?option>/gi, '').trim()
        ) : [];
        
        // Extract correct answer
        const correctMatch = block.match(/<correct>([\s\S]*?)<\/correct>/i);
        let correctAnswer = correctMatch ? correctMatch[1].trim() : '';
        
        // Extract explanation
        const explanationMatch = block.match(/<explanation>([\s\S]*?)<\/explanation>/i);
        const explanation = explanationMatch ? explanationMatch[1].trim() : 'Correct answer based on the content.';
        
        // Validate
        if (!questionText) {
          throw new Error(`Question ${index + 1}: Missing question text`);
        }
        
        if (options.length < 4) {
          throw new Error(`Question ${index + 1}: Need at least 4 options, found ${options.length}`);
        }
        
        // Ensure exactly 4 options
        const finalOptions = options.slice(0, 4);
        
        // If correct answer doesn't match any option, use the first one
        if (!finalOptions.includes(correctAnswer)) {
          console.warn(`Question ${index + 1}: Correct answer "${correctAnswer}" not in options, using first option`);
          correctAnswer = finalOptions[0];
        }
        
        return {
          question: questionText,
          options: finalOptions,
          correctAnswer: correctAnswer,
          explanation: explanation
        };
      });
      
      console.log('Successfully parsed XML!');
      console.log('Parsed questions:', questions.length);
      
      // Validate questions structure
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format: expected non-empty array');
      }
      
      // Validate and fix each question
      questions = questions.map((q, i) => {
        if (!q.question || !Array.isArray(q.options) || !q.correctAnswer) {
          throw new Error(`Invalid question format at index ${i}: missing required fields`);
        }
        
        // Ensure exactly 4 options
        if (q.options.length < 4) {
          throw new Error(`Question ${i} has only ${q.options.length} options, need 4`);
        }
        if (q.options.length > 4) {
          q.options = q.options.slice(0, 4);
        }
        
        // Ensure correctAnswer matches one of the options
        if (!q.options.includes(q.correctAnswer)) {
          console.warn(`Question ${i}: correctAnswer "${q.correctAnswer}" not in options, using first option`);
          q.correctAnswer = q.options[0];
        }
        
        // Ensure explanation exists
        if (!q.explanation) {
          q.explanation = 'Correct answer based on the content.';
        }
        
        return {
          question: q.question.trim(),
          options: q.options.map(opt => String(opt).trim()),
          correctAnswer: String(q.correctAnswer).trim(),
          explanation: String(q.explanation).trim()
        };
      });
      
      console.log('Validated questions:', questions.length);
      
    } catch (parseError) {
      console.error('Parse error:', parseError.message);
      console.error('Raw response (first 1500 chars):', responseText.substring(0, 1500));
      return res.status(500).json({ 
        message: 'Failed to parse quiz from AI response', 
        error: parseError.message,
        hint: 'The AI response was not in the expected XML format. Please try again.'
      });
    }

    // Create quiz in database
    try {
      const quiz = new Quiz({
        title: title || `Quiz - ${difficulty} Level`,
        courseId,
        facultyId: req.user.id,
        questions,
        difficulty,
        isActive: false // Save as draft by default
      });

      await quiz.save();
      console.log('Quiz saved successfully as draft:', quiz._id);

      res.status(201).json({
        message: 'Quiz generated and saved as draft',
        quiz
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
      return res.status(500).json({ 
        message: 'Failed to save quiz to database', 
        error: dbError.message 
      });
    }
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate quiz', 
      error: error.message || 'Unknown error occurred'
    });
  }
});

// Get all quizzes for a course
router.get('/course/:courseId', auth(['faculty', 'student']), async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId })
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all quizzes (for faculty - their quizzes, for students - all active)
router.get('/', auth(['faculty', 'student']), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'faculty') {
      query.facultyId = req.user.id;
    } else {
      query.isActive = true;
    }
    
    const quizzes = await Quiz.find(query)
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz by ID (students see without correct answers)
router.get('/:id', auth(['faculty', 'student']), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('courseId', 'title');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (req.user.role === 'student') {
      // Hide correct answers for students
      const sanitizedQuiz = quiz.toObject();
      sanitizedQuiz.questions = sanitizedQuiz.questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options
      }));
      return res.json(sanitizedQuiz);
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit quiz (Student only)
router.post('/submit', auth(['student']), async (req, res) => {
  try {
    const { quizId, answers, responseTime } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check previous attempts
    const previousAttempts = await QuizAttempt.countDocuments({
      studentId: req.user.id,
      quizId
    });

    // Grade the quiz
    let correctCount = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = question && answer.selectedAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    // Generate feedback using OpenRouter
    let feedback = '';
    try {
      const wrongQuestions = gradedAnswers
        .filter(a => !a.isCorrect)
        .map(a => {
          const q = quiz.questions[a.questionIndex];
          return `Q: ${q.question}\nYour answer: ${a.selectedAnswer}\nCorrect: ${q.correctAnswer}`;
        })
        .join('\n\n');

      const feedbackPrompt = `A student scored ${score}% on a quiz (${correctCount}/${quiz.questions.length} correct).
${wrongQuestions ? `\nQuestions they got wrong:\n${wrongQuestions}` : '\nThey got all questions correct!'}

Provide brief, encouraging feedback (2-3 sentences) and one specific tip for improvement. Keep it concise.`;

      feedback = await callOpenRouter(feedbackPrompt, 300);
    } catch (feedbackError) {
      console.error('Feedback generation error:', feedbackError.message);
      feedback = score >= 80 ? 'Great job! Keep up the excellent work!' : 
                 score >= 50 ? 'Good effort! Review the topics you missed and try again.' :
                 'Keep practicing! Focus on understanding the core concepts.';
    }

    const attempt = new QuizAttempt({
      studentId: req.user.id,
      quizId,
      courseId: quiz.courseId,
      answers: gradedAnswers,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      responseTime: responseTime || 0,
      attemptNumber: previousAttempts + 1,
      feedback
    });

    await attempt.save();

    // Return results with correct answers
    const resultsWithAnswers = quiz.questions.map((q, i) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      selectedAnswer: gradedAnswers[i]?.selectedAnswer,
      isCorrect: gradedAnswers[i]?.isCorrect
    }));

    res.json({
      message: 'Quiz submitted successfully',
      score,
      correctAnswers: correctCount,
      totalQuestions: quiz.questions.length,
      feedback,
      results: resultsWithAnswers,
      attemptId: attempt._id
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student's quiz attempts
router.get('/attempts/student/:studentId', auth(['faculty', 'student']), async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ studentId: req.params.studentId })
      .populate('quizId', 'title difficulty')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all attempts for a quiz (Faculty only)
router.get('/attempts/quiz/:quizId', auth(['faculty']), async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quizId: req.params.quizId })
      .populate('studentId', 'name registerNumber')
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle quiz active status (Faculty only)
router.patch('/:id/toggle-active', auth(['faculty']), async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      facultyId: req.user.id
    });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.isActive = !quiz.isActive;
    await quiz.save();

    res.json({ 
      message: `Quiz ${quiz.isActive ? 'published' : 'unpublished'} successfully`,
      quiz 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete quiz (Faculty only)
router.delete('/:id', auth(['faculty']), async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.user.id
    });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
