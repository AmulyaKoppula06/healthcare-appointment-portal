const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');

function useDb() { return mongoose.connection.readyState === 1; }

router.get('/', async (req, res) => {
  try {
    const { specialization, search } = req.query;
    if (useDb()) {
      const Doctor = require('../models/Doctor');
      let docs = await Doctor.find({ isAvailable: true }).populate('userId', 'name email phone');
      if (specialization) docs = docs.filter(d => d.specialization.toLowerCase() === specialization.toLowerCase());
      if (search) docs = docs.filter(d => d.userId?.name?.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase()));
      return res.json(docs);
    }
    const store = require('../memstore');
    res.json(store.allDoctors({ specialization, search }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (useDb()) {
      const Doctor = require('../models/Doctor');
      const doc = await Doctor.findById(req.params.id).populate('userId', 'name email phone');
      if (!doc) return res.status(404).json({ message: 'Doctor not found' });
      return res.json(doc);
    }
    const store = require('../memstore');
    const doc = store.findDoctorById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user/:userId', protect, async (req, res) => {
  try {
    if (useDb()) {
      const Doctor = require('../models/Doctor');
      const doc = await Doctor.findOne({ userId: req.params.userId }).populate('userId', 'name email phone');
      if (!doc) return res.status(404).json({ message: 'Doctor not found' });
      return res.json(doc);
    }
    const store = require('../memstore');
    const doc = store.findDoctorByUserId(req.params.userId);
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', protect, authorize('doctor'), async (req, res) => {
  try {
    if (useDb()) {
      const Doctor = require('../models/Doctor');
      const doc = await Doctor.findOneAndUpdate({ userId: req.user._id }, req.body, { new: true }).populate('userId', 'name email phone');
      return res.json(doc);
    }
    const store = require('../memstore');
    res.json(store.updateDoctor(req.user._id, req.body));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
