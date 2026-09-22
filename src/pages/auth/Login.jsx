import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Sparkles, Home } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'अपूर्ण माहिती',
        text: 'कृपया ई-मेल आणि पासवर्ड टाका.'
      });
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'लॉगिन अयशस्वी',
        text: err.message || 'ई-मेल किंवा पासवर्ड चुकीचा आहे.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginDemo();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center text-xl shadow-md">
            🏠
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            माझ्या घराचे बांधकाम
          </h1>
          <p className="text-xs text-slate-500">
            बांधकाम खर्चाचा सोपा, सुंदर आणि स्मार्ट हिशोब
          </p>
        </div>

        {/* 1-Click Demo Mode Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>⚡ 1-क्लिक डेमो लॉगिन (नमुना डेटा)</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 font-medium">
            किंवा ई-मेलने लॉगिन करा
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                पासवर्ड
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-slate-500 hover:text-slate-900 font-medium"
              >
                पासवर्ड विसरलात?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>लॉगिन होत आहे...</span>
              </>
            ) : (
              <span>लॉगिन करा</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          नवीन खाते तयार करायचे आहे?{' '}
          <Link
            to="/register"
            className="font-bold text-slate-900 hover:underline"
          >
            नोंदणी करा
          </Link>
        </div>
      </div>
    </div>
  );
}
