/**
 * In-memory store — used as fallback when MongoDB is not connected.
 * Pre-seeded with demo doctors, a patient and an admin.
 */
const bcrypt = require('bcryptjs');

const hash = (pw) => bcrypt.hashSync(pw, 10);
const compare = (pw, h) => bcrypt.compareSync(pw, h);

let users = [
  { _id: 'u1', name: 'Admin User',      email: 'admin@medicare.com',   password: hash('admin123'),   role: 'admin',   phone: '' },
  { _id: 'u2', name: 'John Patient',    email: 'patient@medicare.com', password: hash('patient123'), role: 'patient', phone: '+1-555-111-2222' },
  { _id: 'u3', name: 'Sarah Mitchell',  email: 'sarah@medicare.com',   password: hash('doctor123'),  role: 'doctor',  phone: '' },
  { _id: 'u4', name: 'James Wilson',    email: 'james@medicare.com',   password: hash('doctor123'),  role: 'doctor',  phone: '' },
  { _id: 'u5', name: 'Emily Chen',      email: 'emily@medicare.com',   password: hash('doctor123'),  role: 'doctor',  phone: '' },
  { _id: 'u6', name: 'Robert Kumar',    email: 'robert@medicare.com',  password: hash('doctor123'),  role: 'doctor',  phone: '' },
  { _id: 'u7', name: 'Priya Sharma',    email: 'priya@medicare.com',   password: hash('doctor123'),  role: 'doctor',  phone: '' },
  { _id: 'u8', name: 'Michael Brown',   email: 'michael@medicare.com', password: hash('doctor123'),  role: 'doctor',  phone: '' },
];

let doctors = [
  { _id: 'd1', userId: 'u3', specialization: 'Cardiology',   experience: 12, qualification: 'MD, FACC',  consultationFee: 800, rating: 4.8, bio: 'Expert cardiologist with 12 years experience.', isAvailable: true, availability: defaultAvailability() },
  { _id: 'd2', userId: 'u4', specialization: 'Neurology',    experience: 8,  qualification: 'MD, PhD',    consultationFee: 750, rating: 4.7, bio: 'Specialist in brain and nervous system disorders.', isAvailable: true, availability: defaultAvailability() },
  { _id: 'd3', userId: 'u5', specialization: 'Pediatrics',   experience: 6,  qualification: 'MBBS, DCH',  consultationFee: 500, rating: 4.9, bio: 'Caring pediatrician for children of all ages.', isAvailable: true, availability: defaultAvailability() },
  { _id: 'd4', userId: 'u6', specialization: 'Orthopedics',  experience: 15, qualification: 'MS Ortho',   consultationFee: 700, rating: 4.6, bio: 'Bone and joint specialist with 15 years experience.', isAvailable: true, availability: defaultAvailability() },
  { _id: 'd5', userId: 'u7', specialization: 'Dermatology',  experience: 5,  qualification: 'MD Derma',   consultationFee: 600, rating: 4.5, bio: 'Skin care specialist and cosmetic dermatologist.', isAvailable: true, availability: defaultAvailability() },
  { _id: 'd6', userId: 'u8', specialization: 'General',      experience: 10, qualification: 'MBBS, MD',   consultationFee: 400, rating: 4.7, bio: 'General physician for all primary care needs.', isAvailable: true, availability: defaultAvailability() },
];

let appointments = [];
let prescriptions = [];
let _idCounter = 100;

function defaultAvailability() {
  return ['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day => ({
    day, slots: ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30']
  }));
}

function newId() { return String(++_idCounter); }

function populateUser(obj) {
  if (!obj) return null;
  const u = users.find(u => u._id === (obj.userId || obj._id));
  return u ? { _id: u._id, name: u.name, email: u.email, phone: u.phone } : null;
}

function populateDoctor(d) {
  if (!d) return null;
  const user = users.find(u => u._id === d.userId);
  return { ...d, userId: user ? { _id: user._id, name: user.name, email: user.email, phone: user.phone } : null };
}

const store = {
  // ─── USERS ───────────────────────────────────────────────────────────────
  findUserByEmail(email) { return users.find(u => u.email === email.toLowerCase()); },
  findUserById(id) { return users.find(u => u._id === id); },
  createUser(data) {
    const user = { _id: newId(), name: data.name, email: data.email.toLowerCase(), password: hash(data.password), role: data.role || 'patient', phone: data.phone || '' };
    users.push(user);
    return user;
  },
  updateUser(id, data) {
    const idx = users.findIndex(u => u._id === id);
    if (idx >= 0) users[idx] = { ...users[idx], ...data };
    return users[idx];
  },
  checkPassword(user, pw) { return compare(pw, user.password); },
  allUsers() { return users.map(({ password, ...u }) => u); },

  // ─── DOCTORS ─────────────────────────────────────────────────────────────
  allDoctors(filters = {}) {
    let list = doctors.filter(d => d.isAvailable);
    if (filters.specialization) list = list.filter(d => d.specialization.toLowerCase() === filters.specialization.toLowerCase());
    if (filters.search) list = list.filter(d => {
      const u = users.find(u => u._id === d.userId);
      return u && (u.name.toLowerCase().includes(filters.search.toLowerCase()) || d.specialization.toLowerCase().includes(filters.search.toLowerCase()));
    });
    return list.map(populateDoctor);
  },
  findDoctorById(id) { const d = doctors.find(d => d._id === id); return d ? populateDoctor(d) : null; },
  findDoctorByUserId(userId) { const d = doctors.find(d => d.userId === userId); return d ? populateDoctor(d) : null; },
  createDoctor(data) {
    const d = { _id: newId(), ...data, rating: 4.5, isAvailable: true, availability: data.availability || defaultAvailability() };
    doctors.push(d);
    return populateDoctor(d);
  },
  updateDoctor(userId, data) {
    const idx = doctors.findIndex(d => d.userId === userId);
    if (idx >= 0) doctors[idx] = { ...doctors[idx], ...data };
    return populateDoctor(doctors[idx]);
  },

  // ─── APPOINTMENTS ─────────────────────────────────────────────────────────
  createAppointment(data) {
    const a = { _id: newId(), ...data, status: 'pending', createdAt: new Date().toISOString() };
    appointments.push(a);
    return this._populateAppointment(a);
  },
  patientAppointments(patientId) {
    return appointments.filter(a => a.patientId === patientId).map(a => this._populateAppointment(a)).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
  },
  doctorAppointments(doctorId) {
    return appointments.filter(a => a.doctorId === doctorId).map(a => this._populateAppointment(a));
  },
  allAppointments() { return appointments.map(a => this._populateAppointment(a)); },
  updateAppointmentStatus(id, status) {
    const idx = appointments.findIndex(a => a._id === id);
    if (idx >= 0) appointments[idx].status = status;
    return this._populateAppointment(appointments[idx]);
  },
  findAppointmentById(id) { const a = appointments.find(a => a._id === id); return a ? this._populateAppointment(a) : null; },
  _populateAppointment(a) {
    if (!a) return null;
    const patient = users.find(u => u._id === a.patientId);
    const doctor = doctors.find(d => d._id === a.doctorId);
    const doctorUser = doctor ? users.find(u => u._id === doctor.userId) : null;
    return {
      ...a,
      patientId: patient ? { _id: patient._id, name: patient.name, email: patient.email, phone: patient.phone } : a.patientId,
      doctorId: doctor ? { ...doctor, userId: doctorUser ? { _id: doctorUser._id, name: doctorUser.name } : null } : a.doctorId,
    };
  },

  // ─── PRESCRIPTIONS ────────────────────────────────────────────────────────
  createPrescription(data) {
    const p = { _id: newId(), ...data, createdAt: new Date().toISOString() };
    prescriptions.push(p);
    return this._populatePrescription(p);
  },
  patientPrescriptions(patientId) {
    return prescriptions.filter(p => p.patientId === patientId).map(p => this._populatePrescription(p)).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
  },
  doctorPrescriptions(doctorId) {
    return prescriptions.filter(p => p.doctorId === doctorId).map(p => this._populatePrescription(p));
  },
  _populatePrescription(p) {
    if (!p) return null;
    const patient = users.find(u => u._id === p.patientId);
    const doctor = doctors.find(d => d._id === p.doctorId);
    const doctorUser = doctor ? users.find(u => u._id === doctor.userId) : null;
    return {
      ...p,
      patientId: patient ? { _id: patient._id, name: patient.name, email: patient.email } : p.patientId,
      doctorId: doctor ? { ...doctor, userId: doctorUser ? { _id: doctorUser._id, name: doctorUser.name } : null } : p.doctorId,
    };
  },

  // ─── STATS ────────────────────────────────────────────────────────────────
  stats() {
    const byStatus = {};
    appointments.forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
    return {
      totalUsers: users.filter(u => u.role === 'patient').length,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      totalPrescriptions: prescriptions.length,
      appointmentsByStatus: Object.entries(byStatus).map(([_id, count]) => ({ _id, count })),
      recentAppointments: appointments.slice(-10).reverse().map(a => this._populateAppointment(a)),
    };
  },
};

module.exports = store;
