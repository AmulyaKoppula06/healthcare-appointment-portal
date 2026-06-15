import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Clock, Star, CheckCircle, Users, Calendar, Award, ArrowRight, Phone, Stethoscope, Activity } from 'lucide-react';

const stats = [
  { label: 'Patients Served', value: '50,000+', icon: Users },
  { label: 'Expert Doctors', value: '500+', icon: Stethoscope },
  { label: 'Appointments', value: '100,000+', icon: Calendar },
  { label: 'Success Rate', value: '98%', icon: Award },
];

const features = [
  { icon: Calendar, title: 'Easy Scheduling', desc: 'Book appointments in seconds with our intuitive scheduling system.', color: 'bg-blue-50 text-blue-600' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your health data is encrypted and protected with enterprise-grade security.', color: 'bg-green-50 text-green-600' },
  { icon: Clock, title: '24/7 Access', desc: 'Access your health records and appointments anytime, anywhere.', color: 'bg-purple-50 text-purple-600' },
  { icon: Activity, title: 'Health Tracking', desc: 'Monitor your health journey with detailed history and prescriptions.', color: 'bg-orange-50 text-orange-600' },
  { icon: Star, title: 'Top Specialists', desc: 'Connect with verified, experienced specialists across all fields.', color: 'bg-pink-50 text-pink-600' },
  { icon: Heart, title: 'AI Symptom Check', desc: 'Get instant insights on your symptoms with our AI-powered checker.', color: 'bg-red-50 text-red-600' },
];

const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Psychiatry', 'General', 'Gynecology'];

const testimonials = [
  { name: 'Sarah Johnson', role: 'Patient', rating: 5, text: 'MediCare made it incredibly easy to find and book appointments with top specialists. The platform is intuitive and the doctors are excellent.' },
  { name: 'Dr. Michael Chen', role: 'Cardiologist', rating: 5, text: 'As a doctor, MediCare helps me manage my schedule efficiently and provide better care to my patients. Highly recommended!' },
  { name: 'Emily Rodriguez', role: 'Patient', rating: 5, text: 'The prescription management feature is fantastic. I can access all my prescriptions in one place and never miss a medication.' },
];

const healthTips = [
  '💧 Drink at least 8 glasses of water daily to stay hydrated.',
  '🚶 Walk 30 minutes daily to boost cardiovascular health.',
  '😴 Get 7-9 hours of quality sleep each night for optimal health.',
  '🥗 Eat a balanced diet rich in fruits and vegetables.',
  '🧘 Practice mindfulness to reduce stress and improve mental health.',
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4 fill-white" /> Your Health, Our Priority
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Healthcare at Your<br />
            <span className="text-cyan-300">Fingertips</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Connect with top doctors, book appointments instantly, manage prescriptions, and take control of your health journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="border-2 border-white text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" /> Book Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-16 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-3">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose MediCare?</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Everything you need for a complete healthcare experience, all in one place.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card hover:shadow-md transition-shadow group">
                <div className={`inline-flex items-center justify-center w-12 h-12 ${color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Specializations</h2>
          <p className="text-gray-500 mb-10">Expert care across all medical disciplines</p>
          <div className="flex flex-wrap justify-center gap-3">
            {specializations.map(s => (
              <span key={s} className="bg-blue-50 text-blue-700 font-semibold px-6 py-3 rounded-full hover:bg-blue-100 transition-colors cursor-pointer">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Health Tips */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center">Daily Health Tips</h2>
          <div className="space-y-4">
            {healthTips.map((tip, i) => (
              <div key={i} className="card flex items-start gap-4 hover:shadow-md transition-shadow">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, rating, text }) => (
              <div key={name} className="card hover:shadow-md transition-shadow">
                <div className="flex mb-3">
                  {[...Array(rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{name}</p>
                  <p className="text-blue-600 text-sm">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-20 px-4 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-blue-100 text-lg mb-8">Join 50,000+ patients and 500+ doctors on MediCare today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=patient" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-lg">
              I'm a Patient
            </Link>
            <Link to="/register?role=doctor" className="border-2 border-white text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
              I'm a Doctor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart className="w-5 h-5 fill-blue-500 text-blue-500" />
          <span className="text-white font-bold text-lg">MediCare</span>
        </div>
        <p className="text-sm">© 2024 MediCare. All rights reserved. Built with ❤️ for better healthcare.</p>
      </footer>
    </div>
  );
}
