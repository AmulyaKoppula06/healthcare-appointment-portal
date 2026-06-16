const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');

function useDb() { return mongoose.connection.readyState === 1; }

router.post('/', protect, authorize('doctor'), async (req, res) => {
  try {
    const { patientId, appointmentId, medicines, notes, diagnosis } = req.body;
    if (useDb()) {
      const Prescription = require('../models/Prescription');
      const Doctor = require('../models/Doctor');
      const doc = await Doctor.findOne({ userId: req.user._id });
      if (!doc) return res.status(404).json({ message: 'Doctor profile not found' });
      const p = await Prescription.create({ patientId, doctorId: doc._id, appointmentId, medicines, notes, diagnosis });
      await p.populate([{ path: 'patientId', select: 'name email' }, { path: 'doctorId', populate: { path: 'userId', select: 'name' } }]);
      return res.status(201).json(p);
    }
    const store = require('../memstore');
    const doc = store.findDoctorByUserId(req.user._id);
    if (!doc) return res.status(404).json({ message: 'Doctor profile not found' });
    res.status(201).json(store.createPrescription({ patientId, doctorId: doc._id, appointmentId, medicines, notes, diagnosis }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    if (useDb()) {
      const Prescription = require('../models/Prescription');
      const list = await Prescription.find({ patientId: req.user._id })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
        .sort({ createdAt: -1 });
      return res.json(list);
    }
    const store = require('../memstore');
    res.json(store.patientPrescriptions(req.user._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/doctor', protect, authorize('doctor'), async (req, res) => {
  try {
    if (useDb()) {
      const Prescription = require('../models/Prescription');
      const Doctor = require('../models/Doctor');
      const doc = await Doctor.findOne({ userId: req.user._id });
      const list = await Prescription.find({ doctorId: doc._id }).populate('patientId', 'name email').sort({ createdAt: -1 });
      return res.json(list);
    }
    const store = require('../memstore');
    const doc = store.findDoctorByUserId(req.user._id);
    res.json(store.doctorPrescriptions(doc._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
