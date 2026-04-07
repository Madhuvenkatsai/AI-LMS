const express = require('express');
const axios = require('axios');
const QuizAttempt = require('../models/QuizAttempt');
const Student = require('../models/Student');
const PredictionResult = require('../models/PredictionResult');
const auth = require('../middleware/auth');

const router = express.Router();

// Get prediction for a student
router.get('/:studentId', auth(['faculty', 'student']), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch student data
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch all quiz attempts
    const attempts = await QuizAttempt.find({ studentId });

    if (attempts.length === 0) {
      return res.json({
        message: 'No quiz attempts found for prediction',
        prediction: null
      });
    }

    // Calculate features
    const scores = attempts.map(a => a.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const avgResponseTime = attempts.reduce((a, b) => a + b.responseTime, 0) / attempts.length;
    const totalAttempts = attempts.length;
    
    // Calculate consistency (inverse of standard deviation)
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - stdDev);

    const features = {
      avg_score: avgScore,
      attendance: student.attendance || 85,
      avg_response_time: avgResponseTime,
      total_attempts: totalAttempts,
      consistency: consistency
    };

    let prediction;

    try {
      // Try ML service first
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, features, {
        timeout: 5000
      });
      prediction = mlResponse.data;
    } catch (mlError) {
      // Fallback: simple rule-based prediction
      console.log('ML service unavailable, using fallback prediction');
      let predictionScore, category;
      
      const weightedScore = (avgScore * 0.4) + (consistency * 0.3) + ((student.attendance || 85) * 0.2) + (Math.min(totalAttempts * 10, 100) * 0.1);
      predictionScore = Math.round(weightedScore * 100) / 100;
      
      if (predictionScore >= 75) {
        category = 'High Performing';
      } else if (predictionScore >= 50) {
        category = 'Average';
      } else {
        category = 'At Risk';
      }

      prediction = {
        prediction_score: predictionScore,
        category,
        model_used: 'Rule-Based Fallback'
      };
    }

    // Save prediction
    const predictionResult = new PredictionResult({
      studentId,
      predictionScore: prediction.prediction_score,
      category: prediction.category,
      features: {
        avgScore,
        attendance: student.attendance || 85,
        avgResponseTime,
        totalAttempts,
        consistency
      },
      modelUsed: prediction.model_used || 'Random Forest'
    });

    await predictionResult.save();

    res.json({
      prediction: {
        score: prediction.prediction_score,
        category: prediction.category,
        modelUsed: prediction.model_used || 'Random Forest',
        features
      }
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all predictions for faculty's students
router.get('/all/faculty', auth(['faculty']), async (req, res) => {
  try {
    const students = await Student.find({ facultyId: req.user.id }).select('-password');
    
    const predictions = [];
    for (const student of students) {
      const latestPrediction = await PredictionResult.findOne({ studentId: student._id })
        .sort({ createdAt: -1 });
      
      const attempts = await QuizAttempt.find({ studentId: student._id });
      const avgScore = attempts.length > 0 
        ? attempts.reduce((a, b) => a + b.score, 0) / attempts.length 
        : 0;

      predictions.push({
        student: {
          id: student._id,
          name: student.name,
          registerNumber: student.registerNumber
        },
        prediction: latestPrediction ? {
          score: latestPrediction.predictionScore,
          category: latestPrediction.category,
          updatedAt: latestPrediction.createdAt
        } : null,
        stats: {
          totalAttempts: attempts.length,
          avgScore: Math.round(avgScore * 100) / 100
        }
      });
    }

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics summary for faculty dashboard
router.get('/analytics/summary', auth(['faculty']), async (req, res) => {
  try {
    const students = await Student.find({ facultyId: req.user.id });
    const studentIds = students.map(s => s._id);

    const allAttempts = await QuizAttempt.find({ studentId: { $in: studentIds } });
    
    const latestPredictions = [];
    for (const student of students) {
      const pred = await PredictionResult.findOne({ studentId: student._id })
        .sort({ createdAt: -1 });
      if (pred) latestPredictions.push(pred);
    }

    const categoryCount = {
      'High Performing': 0,
      'Average': 0,
      'At Risk': 0
    };
    latestPredictions.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });

    const avgScores = allAttempts.length > 0 
      ? allAttempts.reduce((a, b) => a + b.score, 0) / allAttempts.length 
      : 0;

    // Score distribution
    const scoreRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    allAttempts.forEach(a => {
      if (a.score <= 20) scoreRanges['0-20']++;
      else if (a.score <= 40) scoreRanges['21-40']++;
      else if (a.score <= 60) scoreRanges['41-60']++;
      else if (a.score <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });

    res.json({
      totalStudents: students.length,
      totalAttempts: allAttempts.length,
      averageScore: Math.round(avgScores * 100) / 100,
      categoryDistribution: categoryCount,
      scoreDistribution: scoreRanges,
      atRiskStudents: latestPredictions
        .filter(p => p.category === 'At Risk')
        .length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student-wise detailed analytics for faculty
router.get('/analytics/students', auth(['faculty']), async (req, res) => {
  try {
    const students = await Student.find({ facultyId: req.user.id }).select('-password');
    const studentIds = students.map(s => s._id);

    const allAttempts = await QuizAttempt.find({ studentId: { $in: studentIds } })
      .populate('quizId', 'title difficulty courseId')
      .populate('courseId', 'title')
      .sort({ createdAt: 1 });

    const courses = await require('../models/Course').find({ facultyId: req.user.id });

    const studentAnalytics = [];

    for (const student of students) {
      const attempts = allAttempts.filter(a => a.studentId.toString() === student._id.toString());

      if (attempts.length === 0) {
        studentAnalytics.push({
          student: {
            id: student._id,
            name: student.name,
            registerNumber: student.registerNumber,
            email: student.email
          },
          totalAttempts: 0,
          avgScore: 0,
          bestScore: 0,
          worstScore: 0,
          lastScore: 0,
          trend: 'neutral',
          trendValue: 0,
          avgResponseTime: 0,
          consistency: 100,
          scoreHistory: [],
          courseBreakdown: [],
          recentAttempts: [],
          prediction: null
        });
        continue;
      }

      const scores = attempts.map(a => a.score);
      const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
      const bestScore = Math.max(...scores);
      const worstScore = Math.min(...scores);
      const lastScore = scores[scores.length - 1];
      const avgResponseTime = Math.round(attempts.reduce((a, b) => a + b.responseTime, 0) / attempts.length);

      // Calculate trend (compare last 3 attempts avg vs previous 3)
      let trend = 'neutral';
      let trendValue = 0;
      if (scores.length >= 4) {
        const recent3 = scores.slice(-3);
        const prev3 = scores.slice(-6, -3);
        if (prev3.length > 0) {
          const recentAvg = recent3.reduce((a, b) => a + b, 0) / recent3.length;
          const prevAvg = prev3.reduce((a, b) => a + b, 0) / prev3.length;
          trendValue = Math.round((recentAvg - prevAvg) * 100) / 100;
          trend = trendValue > 2 ? 'up' : trendValue < -2 ? 'down' : 'neutral';
        }
      } else if (scores.length >= 2) {
        trendValue = scores[scores.length - 1] - scores[0];
        trend = trendValue > 2 ? 'up' : trendValue < -2 ? 'down' : 'neutral';
      }

      // Consistency (inverse of coefficient of variation)
      const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
      const stdDev = Math.sqrt(variance);
      const consistency = Math.round(Math.max(0, 100 - stdDev) * 100) / 100;

      // Score history for line chart
      const scoreHistory = attempts.map(a => ({
        date: a.createdAt,
        score: a.score,
        quizTitle: a.quizId?.title || 'Unknown Quiz',
        difficulty: a.quizId?.difficulty || 'Medium'
      }));

      // Course-wise breakdown
      const courseMap = {};
      attempts.forEach(a => {
        const courseTitle = a.courseId?.title || 'Unknown';
        const courseId = a.courseId?._id?.toString() || 'unknown';
        if (!courseMap[courseId]) {
          courseMap[courseId] = { courseTitle, scores: [], attempts: 0 };
        }
        courseMap[courseId].scores.push(a.score);
        courseMap[courseId].attempts++;
      });

      const courseBreakdown = Object.entries(courseMap).map(([courseId, data]) => ({
        courseId,
        courseTitle: data.courseTitle,
        avgScore: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 100) / 100,
        totalAttempts: data.attempts,
        bestScore: Math.max(...data.scores),
        worstScore: Math.min(...data.scores)
      }));

      // Recent attempts (last 5)
      const recentAttempts = attempts.slice(-5).reverse().map(a => ({
        id: a._id,
        quizTitle: a.quizId?.title || 'Unknown',
        courseTitle: a.courseId?.title || 'Unknown',
        score: a.score,
        totalQuestions: a.totalQuestions,
        correctAnswers: a.correctAnswers,
        responseTime: a.responseTime,
        date: a.createdAt,
        difficulty: a.quizId?.difficulty || 'Medium'
      }));

      // Get latest prediction
      const latestPrediction = await PredictionResult.findOne({ studentId: student._id })
        .sort({ createdAt: -1 });

      studentAnalytics.push({
        student: {
          id: student._id,
          name: student.name,
          registerNumber: student.registerNumber,
          email: student.email
        },
        totalAttempts: attempts.length,
        avgScore,
        bestScore,
        worstScore,
        lastScore,
        trend,
        trendValue,
        avgResponseTime,
        consistency,
        scoreHistory,
        courseBreakdown,
        recentAttempts,
        prediction: latestPrediction ? {
          score: latestPrediction.predictionScore,
          category: latestPrediction.category,
          updatedAt: latestPrediction.createdAt
        } : null
      });
    }

    // Overall class statistics for comparison
    const allScores = allAttempts.map(a => a.score);
    const classAvg = allScores.length > 0
      ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 100) / 100
      : 0;

    // Difficulty-wise breakdown
    const difficultyMap = { Easy: [], Medium: [], Hard: [] };
    allAttempts.forEach(a => {
      const diff = a.quizId?.difficulty || 'Medium';
      if (difficultyMap[diff]) difficultyMap[diff].push(a.score);
    });
    const difficultyBreakdown = Object.entries(difficultyMap).map(([difficulty, scores]) => ({
      difficulty,
      avgScore: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0,
      totalAttempts: scores.length
    }));

    // Top performers
    const sortedByAvg = [...studentAnalytics]
      .filter(s => s.totalAttempts > 0)
      .sort((a, b) => b.avgScore - a.avgScore);

    const topPerformers = sortedByAvg.slice(0, 5).map(s => ({
      name: s.student.name,
      registerNumber: s.student.registerNumber,
      avgScore: s.avgScore,
      totalAttempts: s.totalAttempts
    }));

    // Students needing attention (lowest scores or declining trends)
    const needsAttention = sortedByAvg
      .filter(s => s.avgScore < 50 || s.trend === 'down')
      .slice(0, 5)
      .map(s => ({
        name: s.student.name,
        registerNumber: s.student.registerNumber,
        avgScore: s.avgScore,
        trend: s.trend,
        trendValue: s.trendValue
      }));

    res.json({
      students: studentAnalytics,
      classStats: {
        classAvg,
        totalStudents: students.length,
        totalAttempts: allAttempts.length,
        difficultyBreakdown,
        topPerformers,
        needsAttention
      }
    });
  } catch (error) {
    console.error('Student analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
