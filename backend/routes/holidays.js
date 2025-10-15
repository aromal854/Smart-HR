const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Holiday = require("../models/Holiday");

// @route   POST api/holidays
// @desc    HR adds a new holiday
// @access  Private (HR only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: "Access denied." });
  }
  const { name, date } = req.body;
  try {
    const newHoliday = new Holiday({ name, date });
    await newHoliday.save();
    res.status(201).json(newHoliday);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   GET api/holidays
// @desc    Get all holidays
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;