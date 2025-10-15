const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const authMiddleware = require("../middleware/auth");

// GET all employees (no change)
router.get("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "hr") {
    return res.status(403).json({ message: "Access denied. HR role required." });
  }
  try {
    const employees = await Employee.find().select("-passwordHash");
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET current user's profile (no change)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select("-passwordHash");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- CORRECTED: ROUTE TO UPDATE AN EMPLOYEE ---
// REPLACE your existing 'PUT /:id' route with this one in routes/employees.js

// @route   PUT api/employees/:id
// @desc    HR updates an employee's details
// @access  Private (HR only)
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "hr") {
    return res.status(403).json({ message: "Access denied." });
  }
  try {
    // --- UPDATED: Added 'lastPromotionDate' to the list of editable fields ---
    const { name, email, department, team, lastPromotionDate } = req.body;
    
    const updateFields = { name, email, department, team, lastPromotionDate };

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    ).select("-passwordHash");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// --- CORRECTED: ROUTE TO DELETE AN EMPLOYEE ---
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "hr") {
    return res.status(403).json({ message: "Access denied." });
  }
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    await employee.deleteOne(); // A more robust way to delete

    res.json({ message: "Employee successfully removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// --- ADD THIS TEMPORARY ROUTE ---
// @route   POST api/employees/update-dates
// @desc    One-time script to set lastPromotionDate
// @access  Private (HR only)
router.post("/update-dates", authMiddleware, async (req, res) => {
  if (req.user.role !== "hr") {
    return res.status(403).json({ message: "Access denied." });
  }
  try {
    // Find all employees where lastPromotionDate does not exist
    const employeesToUpdate = await Employee.find({ 
      lastPromotionDate: { $exists: false } 
    });

    if (employeesToUpdate.length === 0) {
      return res.json({ message: "No employees needed updating." });
    }

    // Loop through them and update
    for (const employee of employeesToUpdate) {
      employee.lastPromotionDate = employee.dateOfJoining;
      await employee.save();
    }

    res.json({ message: `Successfully updated ${employeesToUpdate.length} employee(s).` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// --- END OF TEMPORARY ROUTE ---
module.exports = router;