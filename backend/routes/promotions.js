const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Employee = require("../models/Employee");
const Performance = require("../models/Performance");

// @route   GET api/promotions/suggestions
// @desc    HR gets AI-powered promotion suggestions
// @access  Private (HR only)
router.get("/suggestions", authMiddleware, async (req, res) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: "Access denied." });
  }

  try {
    const employees = await Employee.find({ role: 'employee' });
    let suggestions = [];

    for (const employee of employees) {
      const reviews = await Performance.find({ employeeId: employee._id });
      if (reviews.length === 0) continue;

      let totalScore = 0;
      let scoreCount = 0;
      reviews.forEach(review => {
        const scores = Object.values(review.scores);
        totalScore += scores.reduce((a, b) => a + b, 0);
        scoreCount += scores.length;
      });
      const avgScore = totalScore / scoreCount;

      const tenureDate = employee.lastPromotionDate || employee.dateOfJoining;
      const monthsInRole = (new Date() - new Date(tenureDate)) / (1000 * 60 * 60 * 24 * 30.44);

      if (avgScore >= 8 && monthsInRole >= 12) {
        suggestions.push({
          employeeId: employee._id,
          name: employee.name,
          department: employee.department,
          team: employee.team,
          readinessScore: (avgScore * 10 + monthsInRole).toFixed(2),
          reason: `High average performance (${avgScore.toFixed(2)}/10) and ${monthsInRole.toFixed(0)} months in current role.`
        });
      }
    }
    
    suggestions.sort((a, b) => b.readinessScore - a.readinessScore);
    
    res.json(suggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- NEW ROUTE ADDED ---
// @route   GET api/promotions/my-status
// @desc    An employee checks their own promotion suggestion status
// @access  Private (Employee)
router.get("/my-status", authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const reviews = await Performance.find({ employeeId: employee._id });
    
    let isRecommended = false;
    let reason = "Continue to excel in your current role to be considered for future opportunities.";

    if (reviews.length > 0) {
      let totalScore = 0;
      let scoreCount = 0;
      reviews.forEach(review => {
        const scores = Object.values(review.scores);
        totalScore += scores.reduce((a, b) => a + b, 0);
        scoreCount += scores.length;
      });
      const avgScore = totalScore / scoreCount;

      const tenureDate = employee.lastPromotionDate || employee.dateOfJoining;
      const monthsInRole = (new Date() - new Date(tenureDate)) / (1000 * 60 * 60 * 24 * 30.44);

      if (avgScore >= 8 && monthsInRole >= 12) {
        isRecommended = true;
        reason = `Based on your high average performance (${avgScore.toFixed(2)}/10) and tenure of ${monthsInRole.toFixed(0)} months in your role, you are a strong candidate for promotion.`;
      }
    }

    res.json({
      isRecommended: isRecommended,
      reason: reason,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// --- END OF NEW ROUTE ---

module.exports = router;