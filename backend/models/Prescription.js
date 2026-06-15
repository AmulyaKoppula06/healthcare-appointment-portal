const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, default: '' },
    duration: { type: String, default: '' }
  }],
  notes: { type: String, default: '' },
  diagnosis: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
