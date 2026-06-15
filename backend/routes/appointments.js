const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');

// Book appointment (patient)
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, date, time, symptoms, priority } = req.body;
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      time,
      symptoms,
      priority: priority || 'normal'
    });
    await appointment.populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'doctorId', populate: { path: 'userId', select: 'name' } }
    ]);
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get patient's appointments
router.get('/my', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get doctor's appointments
router.get('/doctor', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email phone')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update appointment status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'doctorId', populate: { path: 'userId', select: 'name' } }
    ]);
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
