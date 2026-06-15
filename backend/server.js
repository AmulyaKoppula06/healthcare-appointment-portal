const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 8000;

// Start server immediately, connect to DB in background
app.listen(PORT, 'localhost', () => console.log(`Server running on port ${PORT}`));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error (app still running):', err.message));

module.exports = app;
