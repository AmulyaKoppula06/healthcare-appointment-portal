const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, default: 0 },
  qualification: { type: String, default: '' },
  consultationFee: { type: Number, default: 500 },
  rating: { type: Number, default: 4.5 },
  bio: { type: String, default: '' },
  availability: [{
    day: { type: String },
    slots: [{ type: String }]
  }],
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
