import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'अपूर्ण माहिती',
        text: 'कृपया सर्व आवश्यक माहिती भरा.'
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'पासवर्ड जुळत नाही',
        text: 'दोन्ही पासवर्ड एकसारखे असावेत.'
      });
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, fullName);
      Swal.fire({
        icon: 'success',
        title: 'खाते तयार झाले!',
        text: 'आपले खाते यशस्वीरित्या तयार झाले आहे.',
        confirmButtonColor: '#0f172a'
      });
      navigate('/');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'नोंदणी अयशस्वी',
        text: err.message || 'खाते तयार करता आले नाही.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center text-xl shadow-md">
            🏠
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            नवीन खाते तयार करा
          </h1>
          <p className="text-xs text-slate-500">
            घराचा संपूर्ण बांधकाम खर्च अचूकपणे ट्रॅक करा
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पूर्ण नाव
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="उदा. राहुल शिंदे"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ई-मेल
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="उदा. rahul@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पासवर्ड
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="किमान 6 अक्षरे"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              पासवर्ड पुन्हा टाका
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>नोंदणी होत आहे...</span>
              </>
            ) : (
              <span>नोंदणी पूर्ण करा</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          आधीपासून खाते आहे?{' '}
          <Link to="/login" className="font-bold text-slate-900 hover:underline">
            लॉगिन करा
          </Link>
        </div>
      </div>
    </div>
  );
}
