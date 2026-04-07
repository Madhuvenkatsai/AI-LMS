const express = require('express');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

const router = express.Router();

// Create course (Faculty only)
router.post('/', auth(['faculty']), async (req, res) => {
  try {
    const { title, description } = req.body;

    const course = new Course({
      title,
      description,
      facultyId: req.user.id
    });

    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all courses
router.get('/', auth(['faculty', 'student']), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'faculty') {
      query.facultyId = req.user.id;
    }
    
    const courses = await Course.find(query)
      .populate('facultyId', 'name email')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get course by ID
router.get('/:id', auth(['faculty', 'student']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('facultyId', 'name email')
      .populate('students', 'name registerNumber');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add students to course
router.post('/:id/add-students', auth(['faculty']), async (req, res) => {
  try {
    const { studentIds } = req.body;
    const course = await Course.findOne({ _id: req.params.id, facultyId: req.user.id });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const newStudents = studentIds.filter(id => !course.students.includes(id));
    course.students.push(...newStudents);
    await course.save();

    res.json({ message: 'Students added to course', course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete course (Faculty only)
router.delete('/:id', auth(['faculty']), async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.user.id
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
