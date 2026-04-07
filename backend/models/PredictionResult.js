const mongoose = require('mongoose');

const predictionResultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  predictionScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    enum: ['High Performing', 'Average', 'At Risk'],
    required: true
  },
  features: {
    avgScore: Number,
    attendance: Number,
    avgResponseTime: Number,
    totalAttempts: Number,
    consistency: Number
  },
  modelUsed: {
    type: String,
    default: 'Random Forest'
  }
}, { timestamps: true });

module.exports = mongoose.model('PredictionResult', predictionResultSchema);
