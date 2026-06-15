const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');

// Create prescription (doctor)
router.post('/', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    const { patientId, appointmentId, medicines, notes, diagnosis } = req.body;
    const prescription = await Prescription.create({
      patientId,
      doctorId: doctor._id,
      appointmentId,
      medicines,
      notes,
      diagnosis
    });
    await prescription.populate([
      { path: 'patientId', select: 'name email' },
      { path: 'doctorId', populate: { path: 'userId', select: 'name' } }
    ]);
    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get patient's prescriptions
router.get('/my', protect, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.user._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get doctor's prescriptions
router.get('/doctor', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
