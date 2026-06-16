const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');
const { sendMail, templates } = require('../mailer');

function useDb() { return mongoose.connection.readyState === 1; }

// ─── Book appointment ──────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, date, time, symptoms, priority } = req.body;
    let appt, patientEmail, patientName, doctorName, specialization;

    if (useDb()) {
      const Appointment = require('../models/Appointment');
      const Doctor = require('../models/Doctor');
      const doc = await Doctor.findById(doctorId).populate('userId', 'name');
      appt = await Appointment.create({ patientId: req.user._id, doctorId, date, time, symptoms, priority: priority || 'normal' });
      await appt.populate([
        { path: 'patientId', select: 'name email phone' },
        { path: 'doctorId', populate: { path: 'userId', select: 'name' } }
      ]);
      patientEmail = req.user.email;
      patientName = req.user.name;
      doctorName = doc?.userId?.name || 'Doctor';
      specialization = doc?.specialization || '';
    } else {
      const store = require('../memstore');
      appt = store.createAppointment({ patientId: req.user._id, doctorId, date, time, symptoms, priority: priority || 'normal' });
      patientEmail = req.user.email;
      patientName = req.user.name;
      doctorName = appt.doctorId?.userId?.name || 'Doctor';
      specialization = appt.doctorId?.specialization || '';
    }

    // Send confirmation email
    const tmpl = templates.appointmentConfirmed(patientName, patientEmail, doctorName, specialization, date, time, priority || 'normal');
    sendMail({ to: patientEmail, ...tmpl });

    res.status(201).json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ─── Patient: my appointments ──────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    if (useDb()) {
      const Appointment = require('../models/Appointment');
      const list = await Appointment.find({ patientId: req.user._id })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
        .sort({ createdAt: -1 });
      return res.json(list);
    }
    const store = require('../memstore');
    res.json(store.patientAppointments(req.user._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Doctor: their appointments ────────────────────────────────────────────
router.get('/doctor', protect, authorize('doctor'), async (req, res) => {
  try {
    if (useDb()) {
      const Appointment = require('../models/Appointment');
      const Doctor = require('../models/Doctor');
      const doc = await Doctor.findOne({ userId: req.user._id });
      if (!doc) return res.status(404).json({ message: 'Doctor profile not found' });
      const list = await Appointment.find({ doctorId: doc._id })
        .populate('patientId', 'name email phone')
        .sort({ date: 1 });
      return res.json(list);
    }
    const store = require('../memstore');
    const doc = store.findDoctorByUserId(req.user._id);
    if (!doc) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(store.doctorAppointments(doc._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Update status ─────────────────────────────────────────────────────────
router.put('/:id/status', protect, async (req, res) => {
  try {
    if (useDb()) {
      const Appointment = require('../models/Appointment');
      const appt = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
        .populate([{ path: 'patientId', select: 'name email phone' }, { path: 'doctorId', populate: { path: 'userId', select: 'name' } }]);
      return res.json(appt);
    }
    const store = require('../memstore');
    res.json(store.updateAppointmentStatus(req.params.id, req.body.status));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Cancel ────────────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    if (useDb()) {
      const Appointment = require('../models/Appointment');
      await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    } else {
      const store = require('../memstore');
      store.updateAppointmentStatus(req.params.id, 'cancelled');
    }
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
