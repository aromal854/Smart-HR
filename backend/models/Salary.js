const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Links to the employee
    required: true,
    unique: true, // Each employee can only have one salary document
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  payCycle: {
    type: String,
    enum: ['Monthly', 'Annual'],
    default: 'Monthly',
  },
  effectiveDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Salary', SalarySchema);