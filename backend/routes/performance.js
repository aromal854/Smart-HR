const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Performance = require("../models/Performance");
const Employee = require("../models/Employee");

// @route   POST api/performance
// @desc    HR creates a new performance review
// @access  Private (HR only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: "Access denied." });
  }

  const { employeeId, scores, strengths, areasForImprovement, overallComments } = req.body;

  try {
    const newReview = new Performance({
      employeeId,
      reviewerId: req.user.id, // The HR user creating the review
      scores,
      strengths,
      areasForImprovement,
      overallComments,
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/performance/employee/:employeeId
// @desc    HR gets all reviews for a specific employee
// @access  Private (HR only)
router.get("/employee/:employeeId", authMiddleware, async (req, res) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: "Access denied." });
  }
  try {
    const reviews = await Performance.find({ employeeId: req.params.employeeId })
      .populate('reviewerId', 'name') // Show the name of the HR person who reviewed
      .sort({ reviewDate: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/performance/my-performance
// @desc    Employee gets their own performance reviews
// @access  Private (Employee)
router.get("/my-performance", authMiddleware, async (req, res) => {
  try {
    const reviews = await Performance.find({ employeeId: req.user.id })
      .populate('reviewerId', 'name')
      .sort({ reviewDate: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;