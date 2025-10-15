const express = require("express");
const authMiddleware = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const router = express.Router();

// @route   POST api/auth/register
// @desc    HR registers a new employee
// @access  Private (HR only)
router.post("/register", authMiddleware, async (req, res) => {
  // Role check
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: "Forbidden: Only HR can register new employees." });
  }

  // --- FIX #1: Added 'team' to be read from the request body ---
  const { name, email, department, team, role, username, password } = req.body;

  try {
    // Check if username already exists
    let user = await Employee.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the new employee document
    const newEmp = new Employee({
      name,
      email,
      department,
      team, // --- FIX #2: Added 'team' to be saved to the database ---
      role: role || "employee",
      username,
      passwordHash,
    });

    await newEmp.save();

    res.status(201).json({ 
      message: "Employee registered successfully",
      employee: { id: newEmp._id, name: newEmp.name, username: newEmp.username, role: newEmp.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN route remains the same
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Employee.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role, name: user.name }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;