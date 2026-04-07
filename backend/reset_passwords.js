const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');
const fs = require('fs');

async function resetPasswords() {
  await mongoose.connect('mongodb://127.0.0.1/ai_lms');
  let log = 'Connected to MongoDB\n';

  const students = await Student.find({});
  log += `Found ${students.length} students\n`;

  for (const student of students) {
    const hashedPassword = await bcrypt.hash(student.registerNumber, 12);
    await Student.updateOne(
      { _id: student._id },
      { $set: { password: hashedPassword } }
    );
    const verify = await bcrypt.compare(student.registerNumber, hashedPassword);
    log += `  ${student.name} (${student.registerNumber}) -> verify: ${verify}\n`;
  }

  log += 'Done! All passwords = register numbers now.\n';
  fs.writeFileSync('reset_log.txt', log);
  await mongoose.disconnect();
  process.exit(0);
}

resetPasswords().catch(err => {
  fs.writeFileSync('reset_log.txt', 'ERROR: ' + err.message);
  process.exit(1);
});
