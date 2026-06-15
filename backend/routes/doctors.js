const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { specialization, search } = req.query;
    let doctors = await Doctor.find({ isAvailable: true }).populate('userId', 'name email phone');

    if (specialization) {
      doctors = doctors.filter(d => d.specialization.toLowerCase() === specialization.toLowerCase());
    }
    if (search) {
      doctors = doctors.filter(d =>
        d.userId.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase())
      );
    }
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get doctor by userId
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.userId }).populate('userId', 'name email phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update doctor profile
router.put('/profile', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true }
    ).populate('userId', 'name email phone');
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
