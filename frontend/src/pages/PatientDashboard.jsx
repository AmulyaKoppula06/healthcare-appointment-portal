import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Calendar, Clock, User, Star, Filter, MapPin, ArrowRight, RefreshCw, X } from 'lucide-react';

const specializations = ['All', 'General', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Psychiatry', 'Gynecology'];

function StatusBadge({ status }) {
  return <span className={`badge-${status}`}>{status}</span>;
}
function PriorityBadge({ priority }) {
  return <span className={`badge-${priority}`}>{priority}</span>;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');
  const [tab, setTab] = useState('doctors');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, apptRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/appointments/my')
      ]);
      setDoctors(docRes.data);
      setAppointments(apptRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppt = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Appointment cancelled');
      fetchData();
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const filteredDocs = doctors.filter(d => {
    const matchSearch = !search || d.userId?.name?.toLowerCase().includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = spec === 'All' || d.specialization === spec;
    return matchSearch && matchSpec;
  });

  const upcoming = appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed');
  const history = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header */}
      <div className="gradient-hero text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Good day, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-blue-100">Manage your health appointments and records</p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Upcoming', value: upcoming.length, color: 'bg-white/20' },
              { label: 'Completed', value: history.filter(a => a.status === 'completed').length, color: 'bg-white/20' },
              { label: 'Doctors', value: doctors.length, color: 'bg-white/20' },
            ].map(s => (
              <div key={s.label} className={`${s.color} backdrop-blur-sm rounded-2xl p-4 text-center`}>
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
            { key: 'doctors', label: '🔍 Find Doctors' },
            { key: 'upcoming', label: '📅 Upcoming' },
            { key: 'history', label: '📋 History' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === t.key ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* FIND DOCTORS */}
        {tab === 'doctors' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input pl-10" placeholder="Search doctors by name or specialization..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {specializations.map(s => (
                  <button key={s} onClick={() => setSpec(s)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                      spec === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >{s}</button>
                ))}
              </div>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No doctors found. Try a different search.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDocs.map(doc => (
                  <div key={doc._id} className="card hover:shadow-lg transition-all group">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {doc.userId?.name?.[0] || 'D'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">Dr. {doc.userId?.name}</h3>
                        <p className="text-blue-600 text-sm font-medium">{doc.specialization}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{doc.rating || '4.5'}</span>
                          <span className="text-gray-300 mx-1">•</span>
                          <span className="text-sm text-gray-500">{doc.experience || 0}yrs exp</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>🎓 {doc.qualification || 'MBBS'}</span>
                      <span className="font-semibold text-green-600">₹{doc.consultationFee || 500}</span>
                    </div>
                    <Link to={`/book/${doc._id}`} className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                      Book Appointment <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* UPCOMING */}
        {tab === 'upcoming' && (
          <div className="space-y-4">
            {upcoming.length === 0 ? (
              <div className="text-center py-16 text-gray-400 card">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No upcoming appointments</p>
                <button onClick={() => setTab('doctors')} className="btn-primary mt-4 text-sm">Find a Doctor</button>
              </div>
            ) : upcoming.map(appt => (
              <div key={appt._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                      {appt.doctorId?.userId?.name?.[0] || 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Dr. {appt.doctorId?.userId?.name || 'Doctor'}</h3>
                      <p className="text-blue-600 text-sm">{appt.doctorId?.specialization}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {appt.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {appt.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={appt.status} />
                    <PriorityBadge priority={appt.priority} />
                    {appt.status === 'pending' && (
                      <button onClick={() => cancelAppt(appt._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {appt.symptoms && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500"><span className="font-medium">Symptoms:</span> {appt.symptoms}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* HISTORY */}
        {tab === 'history' && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-16 text-gray-400 card">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No appointment history yet</p>
              </div>
            ) : history.map(appt => (
              <div key={appt._id} className="card opacity-90 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-bold">
                      {appt.doctorId?.userId?.name?.[0] || 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Dr. {appt.doctorId?.userId?.name || 'Doctor'}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span><Calendar className="w-3.5 h-3.5 inline mr-1" />{appt.date}</span>
                        <span><Clock className="w-3.5 h-3.5 inline mr-1" />{appt.time}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
