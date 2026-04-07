const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for CSV upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `csv-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Add single student (Faculty only)
router.post('/add', auth(['faculty']), async (req, res) => {
  try {
    const { name, registerNumber, password, email } = req.body;

    const existingStudent = await Student.findOne({ registerNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this register number already exists' });
    }

    const student = new Student({
      name,
      registerNumber,
      password: password || registerNumber,
      email: email || '',
      facultyId: req.user.id
    });

    await student.save();

    res.status(201).json({
      message: 'Student added successfully',
      student: {
        id: student._id,
        name: student.name,
        registerNumber: student.registerNumber,
        email: student.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk upload students via CSV (Faculty only)
router.post('/bulk-upload', auth(['faculty']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const students = [];
    const errors = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          const regNum = row.registerNumber || row.RegisterNumber || row.register_number;
          students.push({
            name: row.name || row.Name,
            registerNumber: regNum,
            password: row.password || row.Password || regNum,
            email: row.email || row.Email || '',
            facultyId: req.user.id
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const results = [];
    for (const studentData of students) {
      try {
        const existing = await Student.findOne({ registerNumber: studentData.registerNumber });
        if (existing) {
          errors.push({ registerNumber: studentData.registerNumber, error: 'Already exists' });
          continue;
        }
        const student = new Student(studentData);
        await student.save();
        results.push({
          name: student.name,
          registerNumber: student.registerNumber
        });
      } catch (err) {
        errors.push({ registerNumber: studentData.registerNumber, error: err.message });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: `${results.length} students added successfully`,
      added: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all students (Faculty only)
router.get('/', auth(['faculty']), async (req, res) => {
  try {
    const students = await Student.find({ facultyId: req.user.id })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student by ID
router.get('/:id', auth(['faculty', 'student']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete student (Faculty only)
router.delete('/:id', auth(['faculty']), async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({
      _id: req.params.id,
      facultyId: req.user.id
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = router;
