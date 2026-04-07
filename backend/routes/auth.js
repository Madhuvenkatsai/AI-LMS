const express = require('express');
const jwt = require('jsonwebtoken');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

const router = express.Router();

// Faculty Register
router.post('/faculty-register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({ message: 'Faculty with this email already exists' });
    }

    const faculty = new Faculty({ name, email, password });
    await faculty.save();

    const token = jwt.sign(
      { id: faculty._id, role: 'faculty', name: faculty.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Faculty registered successfully',
      token,
      user: { id: faculty._id, name: faculty.name, email: faculty.email, role: 'faculty' }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Faculty Login
router.post('/faculty-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await faculty.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: faculty._id, role: 'faculty', name: faculty.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: faculty._id, name: faculty.name, email: faculty.email, role: 'faculty' }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student Login
router.post('/student-login', async (req, res) => {
  try {
    const { registerNumber, password } = req.body;

    const student = await Student.findOne({ registerNumber });
    if (!student) {
      return res.status(400).json({ message: 'Invalid register number or password' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid register number or password' });
    }

    const token = jwt.sign(
      { id: student._id, role: 'student', name: student.name, facultyId: student.facultyId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: student._id, name: student.name, registerNumber: student.registerNumber, role: 'student' }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
