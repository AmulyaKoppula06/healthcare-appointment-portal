import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, Search, ArrowRight, RefreshCw, Info } from 'lucide-react';

const symptomDatabase = {
  'fever': { conditions: ['Influenza', 'COVID-19', 'Common Cold', 'Malaria', 'Typhoid'], severity: 'moderate', specialist: 'General' },
  'headache': { conditions: ['Tension Headache', 'Migraine', 'Hypertension', 'Sinusitis', 'Dehydration'], severity: 'mild', specialist: 'Neurology' },
  'chest pain': { conditions: ['Angina', 'Heart Attack', 'Acid Reflux', 'Muscle Strain', 'Pneumonia'], severity: 'critical', specialist: 'Cardiology' },
  'cough': { conditions: ['Common Cold', 'Bronchitis', 'Asthma', 'COVID-19', 'Allergies'], severity: 'mild', specialist: 'General' },
  'shortness of breath': { conditions: ['Asthma', 'COPD', 'Heart Failure', 'Anxiety', 'Pneumonia'], severity: 'critical', specialist: 'Cardiology' },
  'stomach pain': { conditions: ['Gastritis', 'Appendicitis', 'IBS', 'Food Poisoning', 'GERD'], severity: 'moderate', specialist: 'General' },
  'back pain': { conditions: ['Muscle Strain', 'Herniated Disc', 'Sciatica', 'Kidney Stone', 'Poor Posture'], severity: 'mild', specialist: 'Orthopedics' },
  'dizziness': { conditions: ['Vertigo', 'Low Blood Pressure', 'Anemia', 'Inner Ear Infection', 'Dehydration'], severity: 'moderate', specialist: 'Neurology' },
  'rash': { conditions: ['Eczema', 'Psoriasis', 'Allergic Reaction', 'Chickenpox', 'Contact Dermatitis'], severity: 'mild', specialist: 'Dermatology' },
  'fatigue': { conditions: ['Anemia', 'Thyroid Disorder', 'Diabetes', 'Depression', 'Sleep Apnea'], severity: 'moderate', specialist: 'General' },
  'joint pain': { conditions: ['Arthritis', 'Gout', 'Lupus', 'Bursitis', 'Rheumatism'], severity: 'moderate', specialist: 'Orthopedics' },
  'nausea': { conditions: ['Gastroenteritis', 'Food Poisoning', 'Migraine', 'Pregnancy', 'Motion Sickness'], severity: 'mild', specialist: 'General' },
  'vision problems': { conditions: ['Glaucoma', 'Cataracts', 'Diabetic Retinopathy', 'Migraine Aura', 'Eye Strain'], severity: 'moderate', specialist: 'Ophthalmology' },
  'anxiety': { conditions: ['Generalized Anxiety Disorder', 'Panic Disorder', 'PTSD', 'OCD', 'Social Anxiety'], severity: 'moderate', specialist: 'Psychiatry' },
};

const severityConfig = {
  mild: { color: 'bg-green-100 text-green-800 border-green-200', label: '🟢 Mild', desc: 'Monitor symptoms. See a doctor if they persist.', urgency: 'low' },
  moderate: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: '🟡 Moderate', desc: 'Schedule an appointment within a few days.', urgency: 'medium' },
  critical: { color: 'bg-red-100 text-red-800 border-red-200', label: '🔴 Critical', desc: 'Seek immediate medical attention!', urgency: 'high' },
};

const commonSymptoms = ['fever', 'headache', 'cough', 'fatigue', 'back pain', 'stomach pain', 'dizziness', 'joint pain', 'nausea', 'rash', 'anxiety', 'chest pain'];

export default function SymptomChecker() {
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setResult(null);
  };

  const analyzeSymptoms = () => {
    const allSymptoms = [...selected];
    if (input.trim()) {
      const words = input.toLowerCase().split(/[\s,]+/);
      words.forEach(w => {
        const match = Object.keys(symptomDatabase).find(k => k.includes(w) || w.includes(k.split(' ')[0]));
        if (match && !allSymptoms.includes(match)) allSymptoms.push(match);
      });
    }

    if (allSymptoms.length === 0) return;

    setLoading(true);
    setTimeout(() => {
      const analyses = allSymptoms.map(s => symptomDatabase[s]).filter(Boolean);
      const allConditions = [...new Set(analyses.flatMap(a => a.conditions))];
      const severities = analyses.map(a => a.severity);
      const worstSeverity = severities.includes('critical') ? 'critical' : severities.includes('moderate') ? 'moderate' : 'mild';
      const specialists = [...new Set(analyses.map(a => a.specialist))];

      setResult({ conditions: allConditions.slice(0, 6), severity: worstSeverity, specialists, symptoms: allSymptoms });
      setLoading(false);
    }, 1500);
  };

  const reset = () => { setInput(''); setSelected([]); setResult(null); };

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="gradient-hero text-white px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">AI Symptom Checker 🔬</h1>
          <p className="text-blue-100">Enter your symptoms and get instant health insights</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Medical Disclaimer</p>
            <p className="text-amber-700 text-sm mt-0.5">This tool is for informational purposes only and does not replace professional medical advice. Always consult a qualified doctor for diagnosis and treatment.</p>
          </div>
        </div>

        {/* Input */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Describe Your Symptoms</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              className="input pl-10 resize-none"
              rows={3}
              placeholder="Type your symptoms here (e.g., headache, fever, fatigue)..."
              value={input}
              onChange={e => { setInput(e.target.value); setResult(null); }}
            />
          </div>

          <h4 className="text-sm font-semibold text-gray-700 mb-3">Or select common symptoms:</h4>
          <div className="flex flex-wrap gap-2 mb-5">
            {commonSymptoms.map(s => (
              <button key={s} onClick={() => toggleSymptom(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all capitalize ${
                  selected.includes(s) ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >{s}</button>
            ))}
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="text-sm text-gray-500 font-medium">Selected:</span>
              {selected.map(s => (
                <span key={s} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">{s}</span>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={analyzeSymptoms}
              disabled={loading || (selected.length === 0 && !input.trim())}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Analyze Symptoms'}
            </button>
            {(selected.length > 0 || input || result) && (
              <button onClick={reset} className="btn-secondary px-4">Reset</button>
            )}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-fade-in">
            {/* Severity */}
            <div className={`card border-2 ${severityConfig[result.severity].color}`}>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Severity: {severityConfig[result.severity].label}</h3>
              </div>
              <p className="font-medium">{severityConfig[result.severity].desc}</p>
            </div>

            {/* Possible Conditions */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Possible Conditions</h3>
              <div className="grid grid-cols-2 gap-2">
                {result.conditions.map(c => (
                  <div key={c} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">{c}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">* These are possible conditions based on reported symptoms, not a diagnosis.</p>
            </div>

            {/* Recommended Specialists */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Recommended Specialists</h3>
              <div className="flex flex-wrap gap-2 mb-5">
                {result.specialists.map(s => (
                  <span key={s} className="bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-full">{s}</span>
                ))}
              </div>
              <Link
                to="/patient"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Find & Book a {result.specialists[0]} Doctor <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* General Tips */}
            <div className="card bg-blue-50 border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-3">💡 General Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Stay well hydrated and get adequate rest</li>
                <li>• Monitor your symptoms and track any changes</li>
                <li>• Avoid self-medication without doctor's advice</li>
                <li>• Seek emergency care if symptoms worsen rapidly</li>
                {result.severity === 'critical' && <li className="font-bold text-red-700">⚠️ Your symptoms may require IMMEDIATE medical attention!</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
