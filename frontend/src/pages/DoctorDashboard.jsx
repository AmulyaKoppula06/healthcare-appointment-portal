import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, CheckCircle, XCircle, RefreshCw, Pill, X, Plus } from 'lucide-react';

function StatusBadge({ status }) {
  return <span className={`badge-${status} capitalize`}>{status}</span>;
}

function PrescriptionModal({ appt, onClose, onSaved }) {
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);

  const addMed = () => setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  const removeMed = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMed = (i, key, val) => setMedicines(medicines.map((m, idx) => idx === i ? { ...m, [key]: val } : m));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (medicines.some(m => !m.name || !m.dosage)) return toast.error('Fill all medicine fields');
    setLoading(true);
    try {
      await api.post('/prescriptions', {
        patientId: appt.patientId._id,
        appointmentId: appt._id,
        medicines, notes, diagnosis
      });
      await api.put(`/appointments/${appt._id}/status`, { status: 'completed' });
      toast.success('Prescription saved!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg animate-fade-in shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-900">Write Prescription</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-gray-500 text-sm mb-5">Patient: <strong>{appt.patientId?.name}</strong></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Diagnosis</label>
            <input className="input" placeholder="Primary diagnosis..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">Medicines</label>
              <button type="button" onClick={addMed} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            {medicines.map((m, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 mb-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500">Medicine {i + 1}</span>
                  {medicines.length > 1 && (
                    <button type="button" onClick={() => removeMed(i)} className="text-red-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input text-sm" placeholder="Medicine name *" value={m.name} onChange={e => updateMed(i, 'name', e.target.value)} />
                  <input className="input text-sm" placeholder="Dosage * (e.g. 500mg)" value={m.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} />
                  <input className="input text-sm" placeholder="Frequency (e.g. 2x daily)" value={m.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} />
                  <input className="input text-sm" placeholder="Duration (e.g. 7 days)" value={m.duration} onChange={e => updateMed(i, 'duration', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="Additional notes..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? 'Saving...' : 'Save Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('today');
  const [prescModal, setPrescModal] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments/doctor');
      setAppointments(res.data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today && a.status !== 'cancelled');
  const upcoming = appointments.filter(a => a.date > today && a.status !== 'cancelled' && a.status !== 'completed');
  const completed = appointments.filter(a => a.status === 'completed');
  const pending = appointments.filter(a => a.status === 'pending');

  const displayAppts = tab === 'today' ? todayAppts : tab === 'upcoming' ? upcoming : completed;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {prescModal && <PrescriptionModal appt={prescModal} onClose={() => setPrescModal(null)} onSaved={fetchData} />}

      {/* Header */}
      <div className="gradient-hero text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Dr. {user?.name?.split(' ')[0]}'s Dashboard 🩺</h1>
          <p className="text-blue-100">Manage your appointments and patients</p>
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { label: "Today's", value: todayAppts.length },
              { label: 'Upcoming', value: upcoming.length },
              { label: 'Pending', value: pending.length },
              { label: 'Completed', value: completed.length },
            ].map(s => (
              <div key={s.label} className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-blue-100 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm w-fit">
          {[
            { key: 'today', label: "📅 Today" },
            { key: 'upcoming', label: '🔜 Upcoming' },
            { key: 'completed', label: '✅ Completed' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === t.key ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >{t.label}</button>
          ))}
        </div>

        {displayAppts.length === 0 ? (
          <div className="text-center py-16 card text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No appointments for this section</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayAppts.map(appt => (
              <div key={appt._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {appt.patientId?.name?.[0] || 'P'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{appt.patientId?.name}</h3>
                      <p className="text-gray-500 text-sm">{appt.patientId?.email}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{appt.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{appt.time}</span>
                        <span className={`badge-${appt.priority}`}>{appt.priority}</span>
                      </div>
                      {appt.symptoms && (
                        <p className="text-sm text-gray-500 mt-1.5">💬 {appt.symptoms}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={appt.status} />
                    {appt.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(appt._id, 'confirmed')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Confirm
                        </button>
                        <button onClick={() => updateStatus(appt._id, 'cancelled')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </>
                    )}
                    {appt.status === 'confirmed' && (
                      <button onClick={() => setPrescModal(appt)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        <Pill className="w-3.5 h-3.5" /> Add Prescription
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
