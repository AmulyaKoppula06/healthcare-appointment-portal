const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const { sendMail, templates } = require('../mailer');

const SECRET = process.env.JWT_SECRET || 'medicare_secret_2024';
const generateToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: '7d' });

function useDb() { return mongoose.connection.readyState === 1; }

// ─── Register ──────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, experience, qualification } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });

    let userId, userObj;

    if (useDb()) {
      const User = require('../models/User');
      const Doctor = require('../models/Doctor');
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });
      const user = await User.create({ name, email, password, role: role || 'patient', phone });
      userId = user._id.toString();
      userObj = { _id: userId, name: user.name, email: user.email, role: user.role };
      if (role === 'doctor') {
        await Doctor.create({ userId: user._id, specialization: specialization || 'General', experience: experience || 0, qualification: qualification || 'MBBS' });
      }
    } else {
      const store = require('../memstore');
      if (store.findUserByEmail(email)) return res.status(400).json({ message: 'Email already registered' });
      const user = store.createUser({ name, email, password, role: role || 'patient', phone });
      userId = user._id;
      userObj = { _id: userId, name: user.name, email: user.email, role: user.role };
      if (role === 'doctor') {
        store.createDoctor({ userId, specialization: specialization || 'General', experience: experience || 0, qualification: qualification || 'MBBS', consultationFee: 500 });
      }
    }

    // Send welcome email
    const tmpl = templates.welcome(name, email, userObj.role);
    sendMail({ to: email, ...tmpl });

    res.status(201).json({ ...userObj, token: generateToken(userId) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ─── Login ─────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    let userObj;

    if (useDb()) {
      const User = require('../models/User');
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
      userObj = { _id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    } else {
      const store = require('../memstore');
      const user = store.findUserByEmail(email);
      if (!user || !store.checkPassword(user, password)) return res.status(401).json({ message: 'Invalid email or password' });
      userObj = { _id: user._id, name: user.name, email: user.email, role: user.role };
    }

    // Send login alert email
    const tmpl = templates.loginAlert(userObj.name, userObj.email);
    sendMail({ to: userObj.email, ...tmpl });

    res.json({ ...userObj, token: generateToken(userObj._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get profile ───────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => res.json(req.user));

// ─── Update profile ────────────────────────────────────────────────────────
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (useDb()) {
      const User = require('../models/User');
      const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true }).select('-password');
      res.json(user);
    } else {
      const store = require('../memstore');
      const user = store.updateUser(req.user._id, { name, phone });
      res.json(user);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
