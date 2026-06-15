const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { protect, authorize } = require('../middleware/auth');

// Admin stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalDoctors, totalAppointments, totalPrescriptions] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Prescription.countDocuments()
    ]);
    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const recentAppointments = await Appointment.find()
      .populate('patientId', 'name')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ totalUsers, totalDoctors, totalAppointments, totalPrescriptions, appointmentsByStatus, recentAppointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
