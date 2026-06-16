const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');

function useDb() { return mongoose.connection.readyState === 1; }

router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    if (useDb()) {
      const User = require('../models/User');
      const Doctor = require('../models/Doctor');
      const Appointment = require('../models/Appointment');
      const Prescription = require('../models/Prescription');
      const [totalUsers, totalDoctors, totalAppointments, totalPrescriptions] = await Promise.all([
        User.countDocuments({ role: 'patient' }),
        Doctor.countDocuments(),
        Appointment.countDocuments(),
        Prescription.countDocuments()
      ]);
      const appointmentsByStatus = await Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
      const recentAppointments = await Appointment.find()
        .populate('patientId', 'name')
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
        .sort({ createdAt: -1 }).limit(10);
      return res.json({ totalUsers, totalDoctors, totalAppointments, totalPrescriptions, appointmentsByStatus, recentAppointments });
    }
    const store = require('../memstore');
    res.json(store.stats());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    if (useDb()) {
      const User = require('../models/User');
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json(users);
    }
    const store = require('../memstore');
    res.json(store.allUsers());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
