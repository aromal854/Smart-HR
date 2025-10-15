const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Links to the employee being reviewed
    required: true,
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Links to the HR manager who conducted the review
    required: true,
  },
  reviewDate: {
    type: Date,
    default: Date.now,
  },
  scores: {
    communication: { type: Number, min: 1, max: 10, required: true },
    teamwork: { type: Number, min: 1, max: 10, required: true },
    qualityOfWork: { type: Number, min: 1, max: 10, required: true },
    punctuality: { type: Number, min: 1, max: 10, required: true },
  },
  strengths: {
    type: String,
    trim: true,
  },
  areasForImprovement: {
    type: String,
    trim: true,
  },
  overallComments: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Performance', PerformanceSchema);