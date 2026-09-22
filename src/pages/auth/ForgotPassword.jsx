import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      }
      setSent(true);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'त्रुटी',
        text: err.message || 'ई-मेल पाठवता आला नाही.'
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
            🔐
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            पासवर्ड विसरलात?
          </h1>
          <p className="text-xs text-slate-500">
            आपला नोंदणीकृत ई-मेल टाका, आम्ही पासवर्ड रिसेट लिंक पाठवू.
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-800 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-sm">रिसेट लिंक पाठवली!</p>
            <p className="text-emerald-700">
              कृपया आपला <strong>{email}</strong> ई-मेल इनबॉक्स तपासा.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 font-bold text-slate-900 hover:underline text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>लॉगिन पृष्ठावर परत जा</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>पाठवत आहे...</span>
                </>
              ) : (
                <span>रिसेट लिंक पाठवा</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>लॉगिन पृष्ठावर परत जा</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
