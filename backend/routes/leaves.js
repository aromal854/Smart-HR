const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const Holiday = require("../models/Holiday"); // Make sure Holiday model is imported

// @route   POST api/leaves
// @desc    Employee applies for a new leave
router.post("/", authMiddleware, async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  try {
    const newLeave = new Leave({
      employeeId: req.user.id,
      startDate,
      endDate,
      reason,
    });
    await newLeave.save();
    res.status(201).json(newLeave);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/leaves/my-leaves
// @desc    Get all leaves for the logged-in employee
router.get("/my-leaves", authMiddleware, async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/leaves
// @desc    HR gets all leaves for all employees
router.get("/", authMiddleware, async (req, res) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: "Access denied." });
  }
  try {
    const leaves = await Leave.find().populate('employeeId', 'name email').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/leaves/:id/status
// @desc    HR updates leave status
router.put("/:id/status", authMiddleware, async (req, res) => {
    if (req.user.role !== 'hr') {
        return res.status(403).json({ message: "Access denied." });
    }
    try {
        const { status } = req.body;
        if (status !== 'approved' && status !== 'rejected') {
            return res.status(400).json({ message: "Invalid status value." });
        }
        const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!leave) {
            return res.status(404).json({ message: "Leave request not found." });
        }
        res.json(leave);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   POST api/leaves/suggestions
// @desc    Get smart suggestions for a leave request
router.post("/suggestions", authMiddleware, async (req, res) => {
  const { startDate, endDate } = req.body;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Please provide a start and end date." });
  }

  try {
    const currentUser = await Employee.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    // 1. Find overlapping holidays
    const overlappingHolidays = await Holiday.find({
      date: { $gte: requestedStart, $lte: requestedEnd },
    });

    // --- CORRECTED LOGIC FOR TEAMMATE CONFLICTS ---
    // 2. First, find all teammates of the current user
    const teammates = await Employee.find({ 
        team: currentUser.team, 
        _id: { $ne: req.user.id } // Exclude the current user
    }).select('_id');

    const teammateIds = teammates.map(t => t._id); // Create an array of just their IDs

    // 3. Now, find conflicting leaves submitted by those teammates
    const teammateConflicts = await Leave.find({
      employeeId: { $in: teammateIds }, // Find leaves where the employeeId is in our list of teammates
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: requestedEnd, $gte: requestedStart } },
        { endDate: { $lte: requestedEnd, $gte: requestedStart } },
      ],
    });
    // --- END OF CORRECTED LOGIC ---

    // 4. Formulate the suggestion
    let suggestion = "This looks like a good time to take leave.";
    if (overlappingHolidays.length > 0 || teammateConflicts.length > 0) {
      suggestion = `Suggestion: Please note, your request includes ${overlappingHolidays.length} holiday(s) and conflicts with ${teammateConflicts.length} teammate(s)' leave requests. You may want to adjust your dates.`;
    }

    res.json({
      overlappingHolidays: overlappingHolidays.map(h => h.name),
      teammateConflictCount: teammateConflicts.length,
      suggestion: suggestion,
      alternativeDates: null, // We can enhance this again later
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;