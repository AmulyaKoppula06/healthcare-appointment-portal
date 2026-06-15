import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Menu, X, LogOut, User, Calendar, Pill, Activity } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const dashboardLink = user ? `/${user.role}` : '/';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Heart className="w-6 h-6 fill-blue-600" />
            MediCare
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            ) : (
              <>
                <Link to={dashboardLink} className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  <Activity className="w-4 h-4" /> Dashboard
                </Link>
                {user.role === 'patient' && (
                  <>
                    <Link to="/prescriptions" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                      <Pill className="w-4 h-4" /> Prescriptions
                    </Link>
                    <Link to="/symptom-checker" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                      <Heart className="w-4 h-4" /> Symptom Checker
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-blue-600 capitalize">{user.role}</p>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 animate-fade-in">
          {!user ? (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium py-2">Home</Link>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium py-2">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block btn-primary text-center">Get Started</Link>
            </>
          ) : (
            <>
              <Link to={dashboardLink} onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium py-2">Dashboard</Link>
              {user.role === 'patient' && (
                <>
                  <Link to="/prescriptions" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium py-2">Prescriptions</Link>
                  <Link to="/symptom-checker" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium py-2">Symptom Checker</Link>
                </>
              )}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user.name} <span className="text-blue-600 capitalize">({user.role})</span></p>
                <button onClick={handleLogout} className="mt-2 text-red-500 font-medium text-sm flex items-center gap-1">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
