import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Stethoscope, Calendar, FileText, RefreshCw, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  const pieData = stats?.appointmentsByStatus?.map(s => ({
    name: s._id,
    value: s.count
  })) || [];

  const barData = [
    { name: 'Patients', count: stats?.totalUsers || 0 },
    { name: 'Doctors', count: stats?.totalDoctors || 0 },
    { name: 'Appointments', count: stats?.totalAppointments || 0 },
    { name: 'Prescriptions', count: stats?.totalPrescriptions || 0 },
  ];

  const statCards = [
    { label: 'Total Patients', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Doctors', value: stats?.totalDoctors || 0, icon: Stethoscope, color: 'text-green-600 bg-green-50' },
    { label: 'Total Appointments', value: stats?.totalAppointments || 0, icon: Calendar, color: 'text-orange-600 bg-orange-50' },
    { label: 'Prescriptions', value: stats?.totalPrescriptions || 0, icon: FileText, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header */}
      <div className="gradient-hero text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard 🛡️</h1>
          <p className="text-blue-100">Platform overview and analytics</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${color} rounded-xl mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm w-fit">
          {[{ key: 'overview', label: '📊 Analytics' }, { key: 'users', label: '👥 Users' }, { key: 'appointments', label: '📅 Appointments' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === t.key ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >{t.label}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600" /> Platform Stats</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-5">Appointment Status</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-gray-400">No appointment data yet</div>
              )}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Email', 'Role', 'Phone', 'Joined'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">{u.name[0]}</div>
                          <span className="font-semibold text-gray-900 text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4"><span className={`badge-${u.role === 'doctor' ? 'confirmed' : u.role === 'admin' ? 'pending' : 'completed'} capitalize`}>{u.role}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'appointments' && (
          <div className="space-y-4">
            {stats?.recentAppointments?.length === 0 ? (
              <div className="card text-center py-12 text-gray-400">No appointments yet</div>
            ) : stats?.recentAppointments?.map(appt => (
              <div key={appt._id} className="card flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{appt.patientId?.name} → Dr. {appt.doctorId?.userId?.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{appt.date} at {appt.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge-${appt.priority}`}>{appt.priority}</span>
                  <span className={`badge-${appt.status}`}>{appt.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
