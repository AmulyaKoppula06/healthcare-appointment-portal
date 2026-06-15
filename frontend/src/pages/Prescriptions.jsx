import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Pill, Calendar, User, FileText, Download, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

function PrescriptionCard({ prescription }) {
  const [expanded, setExpanded] = useState(false);

  const handleDownload = () => {
    const doc = prescription;
    const doctorName = doc.doctorId?.userId?.name || 'Doctor';
    const lines = [
      '===== MEDICARE PRESCRIPTION =====',
      `Date: ${new Date(doc.createdAt).toLocaleDateString()}`,
      `Doctor: Dr. ${doctorName}`,
      `Patient: ${doc.patientId?.name || 'Patient'}`,
      '',
      `Diagnosis: ${doc.diagnosis || 'N/A'}`,
      '',
      'MEDICINES:',
      ...doc.medicines.map((m, i) =>
        `${i + 1}. ${m.name} - ${m.dosage}${m.frequency ? ` | ${m.frequency}` : ''}${m.duration ? ` | ${m.duration}` : ''}`
      ),
      '',
      `Notes: ${doc.notes || 'None'}`,
      '',
      '================================',
      'Keep this prescription for future reference.',
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${new Date(doc.createdAt).toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Prescription downloaded!');
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Pill className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Dr. {prescription.doctorId?.userId?.name}</h3>
            {prescription.diagnosis && (
              <p className="text-blue-600 text-sm font-medium">{prescription.diagnosis}</p>
            )}
            <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(prescription.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-gray-500 text-sm mt-0.5">
              {prescription.medicines.length} medicine{prescription.medicines.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide' : 'View'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-gray-100 animate-fade-in">
          <h4 className="font-bold text-gray-900 mb-3">Prescribed Medicines</h4>
          <div className="space-y-2 mb-4">
            {prescription.medicines.map((med, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-semibold text-gray-900">{med.name}</span>
                    <span className="text-blue-600 font-medium ml-2">- {med.dosage}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    {med.frequency && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{med.frequency}</span>}
                    {med.duration && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{med.duration}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {prescription.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-sm font-semibold text-yellow-800 mb-1">Doctor's Notes</p>
              <p className="text-sm text-yellow-700">{prescription.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prescriptions/my')
      .then(r => setPrescriptions(r.data))
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="gradient-hero text-white px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">My Prescriptions 💊</h1>
          <p className="text-blue-100">View and download your medical prescriptions</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {prescriptions.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Prescriptions Yet</h3>
            <p className="text-gray-500 text-sm">Your prescriptions will appear here after your doctor consultations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map(p => <PrescriptionCard key={p._id} prescription={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
