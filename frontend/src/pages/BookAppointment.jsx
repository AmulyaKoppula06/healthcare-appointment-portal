import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, Star, AlertTriangle, CheckCircle, ArrowLeft, Stethoscope } from 'lucide-react';

const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
const priorities = [
  { value: 'normal', label: 'Normal', desc: 'Routine consultation', color: 'border-gray-200 hover:border-gray-400', selected: 'border-gray-500 bg-gray-50', icon: '✅' },
  { value: 'urgent', label: 'Urgent', desc: 'Needs attention soon', color: 'border-orange-200 hover:border-orange-400', selected: 'border-orange-500 bg-orange-50', icon: '⚠️' },
  { value: 'critical', label: 'Critical', desc: 'Immediate attention', color: 'border-red-200 hover:border-red-400', selected: 'border-red-500 bg-red-50', icon: '🚨' },
];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({ date: '', time: '', symptoms: '', priority: 'normal' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    api.get(`/doctors/${doctorId}`)
      .then(r => setDoctor(r.data))
      .catch(() => { toast.error('Doctor not found'); navigate('/patient'); });
  }, [doctorId]);

  const minDate = new Date().toISOString().split('T')[0];

  const handleBook = async () => {
    if (!form.date || !form.time) return toast.error('Please select date and time');
    setLoading(true);
    try {
      const res = await api.post('/appointments', { doctorId, ...form });
      setConfirmed(res.data);
      setStep(3);
      toast.success('Appointment booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (step === 3 && confirmed) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
        <p className="text-gray-500 mb-6">Your appointment has been booked successfully.</p>
        <div className="bg-blue-50 rounded-2xl p-5 text-left space-y-3 mb-6">
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Doctor</span><span className="font-semibold text-sm">Dr. {doctor.userId?.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Date</span><span className="font-semibold text-sm">{form.date}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Time</span><span className="font-semibold text-sm">{form.time}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Priority</span><span className="font-semibold text-sm capitalize">{form.priority}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 text-sm">Status</span><span className="badge-pending">Pending</span></div>
        </div>
        <button onClick={() => navigate('/patient')} className="btn-primary w-full">Go to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/patient')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Progress */}
        <div className="flex items-center mb-8">
          {[1, 2].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
              {i < 1 && <div className={`flex-1 h-1 mx-2 rounded ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
          <span className="ml-3 text-sm text-gray-500">{step === 1 ? 'Select Date & Time' : 'Confirm Booking'}</span>
        </div>

        {/* Doctor info card */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
              {doctor.userId?.name?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Dr. {doctor.userId?.name}</h2>
              <p className="text-blue-600 font-medium">{doctor.specialization}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{doctor.rating || '4.5'}</span>
                <span>•</span>
                <span>{doctor.experience || 0} years exp</span>
                <span>•</span>
                <span className="text-green-600 font-semibold">₹{doctor.consultationFee || 500}</span>
              </div>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Date */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" /> Select Date</h3>
              <input type="date" className="input" min={minDate} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>

            {/* Time Slots */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" /> Select Time Slot</h3>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(slot => (
                  <button key={slot} onClick={() => setForm({ ...form, time: slot })}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      form.time === slot ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >{slot}</button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-blue-600" /> Priority</h3>
              <div className="grid grid-cols-3 gap-3">
                {priorities.map(p => (
                  <button key={p.value} onClick={() => setForm({ ...form, priority: p.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${form.priority === p.value ? p.selected : p.color}`}
                  >
                    <div className="text-lg mb-1">{p.icon}</div>
                    <div className="font-bold text-sm">{p.label}</div>
                    <div className="text-xs text-gray-500">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Symptoms / Reason</h3>
              <textarea className="input resize-none" rows={3} placeholder="Describe your symptoms or reason for visit..."
                value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} />
            </div>

            <button onClick={() => { if (!form.date || !form.time) { toast.error('Please select date and time'); return; } setStep(2); }}
              className="btn-primary w-full py-3 text-base">
              Continue to Confirm
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h3 className="font-bold text-gray-900 text-xl mb-6">Confirm Appointment</h3>
            <div className="space-y-4 mb-6">
              {[
                { label: 'Doctor', value: `Dr. ${doctor.userId?.name}` },
                { label: 'Specialization', value: doctor.specialization },
                { label: 'Date', value: form.date },
                { label: 'Time', value: form.time },
                { label: 'Priority', value: form.priority },
                { label: 'Consultation Fee', value: `₹${doctor.consultationFee || 500}` },
                ...(form.symptoms ? [{ label: 'Symptoms', value: form.symptoms }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className="font-semibold text-sm text-right max-w-xs capitalize">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6 text-sm text-yellow-800">
              ⚠️ Please arrive 10 minutes before your appointment time. Bring relevant medical records.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Edit</button>
              <button onClick={handleBook} disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
