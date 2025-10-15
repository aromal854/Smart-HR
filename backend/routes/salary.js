const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Salary = require("../models/Salary");

// @route   POST api/salary
// @desc    HR adds or updates an employee's salary
// @access  Private (HR only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: "Access denied." });
  }

  const { employeeId, amount, payCycle, effectiveDate } = req.body;

  try {
    const salaryFields = { employeeId, amount, payCycle, effectiveDate };
    
    // Find a salary by employeeId and update it, or create it if it doesn't exist
    let salary = await Salary.findOneAndUpdate(
        { employeeId: employeeId },
        { $set: salaryFields },
        { new: true, upsert: true } // 'upsert: true' creates the doc if it's not found
    );
    res.json(salary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/salary/my-salary
// @desc    An employee views their own salary
// @access  Private (Employee)
router.get("/my-salary", authMiddleware, async (req, res) => {
  try {
    const salary = await Salary.findOne({ employeeId: req.user.id });
    if (!salary) {
      return res.status(404).json({ message: 'No salary information found for your profile.' });
    }
    res.json(salary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/salary/:employeeId
// @desc    HR views a specific employee's salary
// @access  Private (HR only)
router.get("/:employeeId", authMiddleware, async (req, res) => {
    if (req.user.role !== 'hr') {
        return res.status(403).json({ message: "Access denied." });
    }
    try {
        const salary = await Salary.findOne({ employeeId: req.params.employeeId });
        if (!salary) {
            return res.status(404).json({ message: 'No salary information found for this employee.' });
        }
        res.json(salary);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;