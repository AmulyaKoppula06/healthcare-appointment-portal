const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Doctor = require('./models/Doctor');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare');
  console.log('Connected to MongoDB');

  // Clear existing
  await User.deleteMany({});
  await Doctor.deleteMany({});

  // Create admin
  const admin = await User.create({ name: 'Admin User', email: 'admin@medicare.com', password: 'admin123', role: 'admin', phone: '+1-000-000-0000' });
  console.log('Admin created:', admin.email);

  // Create doctors
  const doctorData = [
    { name: 'Dr. Sarah Mitchell', email: 'sarah@medicare.com', specialization: 'Cardiology', experience: 12, qualification: 'MD, FACC', fee: 800 },
    { name: 'Dr. James Wilson', email: 'james@medicare.com', specialization: 'Neurology', experience: 8, qualification: 'MD, PhD', fee: 750 },
    { name: 'Dr. Emily Chen', email: 'emily@medicare.com', specialization: 'Pediatrics', experience: 6, qualification: 'MBBS, DCH', fee: 500 },
    { name: 'Dr. Robert Kumar', email: 'robert@medicare.com', specialization: 'Orthopedics', experience: 15, qualification: 'MS Ortho', fee: 700 },
    { name: 'Dr. Priya Sharma', email: 'priya@medicare.com', specialization: 'Dermatology', experience: 5, qualification: 'MD Derma', fee: 600 },
    { name: 'Dr. Michael Brown', email: 'michael@medicare.com', specialization: 'General', experience: 10, qualification: 'MBBS, MD', fee: 400 },
  ];

  for (const d of doctorData) {
    const user = await User.create({ name: d.name, email: d.email, password: 'doctor123', role: 'doctor', phone: '+1-555-000-0000' });
    await Doctor.create({
      userId: user._id,
      specialization: d.specialization,
      experience: d.experience,
      qualification: d.qualification,
      consultationFee: d.fee,
      rating: (4.3 + Math.random() * 0.7).toFixed(1),
      bio: `Experienced ${d.specialization} specialist with ${d.experience} years of practice.`,
      availability: ['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => ({
        day,
        slots: ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30']
      }))
    });
    console.log('Doctor created:', d.email);
  }

  // Create a sample patient
  await User.create({ name: 'John Patient', email: 'patient@medicare.com', password: 'patient123', role: 'patient', phone: '+1-555-111-2222' });
  console.log('Sample patient created: patient@medicare.com');

  console.log('\n=== SEED COMPLETE ===');
  console.log('Credentials:');
  console.log('  Admin:   admin@medicare.com / admin123');
  console.log('  Patient: patient@medicare.com / patient123');
  console.log('  Doctor:  sarah@medicare.com / doctor123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
