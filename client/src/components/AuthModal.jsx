'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, User, Building, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { signInWithGooglePopup } from '@/lib/firebase';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab, loginUser } = useAuth();
  const router = useRouter();

  const [roleTab, setRoleTab] = useState('patient'); // 'patient' | 'receptionist'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [uniqueClinicId, setUniqueClinicId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setEmail(''); setPassword(''); setName(''); setUniqueClinicId(''); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authModalTab === 'login') {
        const res = await api.login({ email, password });
        if (res?.success && res.data) {
          loginUser(res.data.user, res.data.token);
          closeAuthModal();
          resetForm();
          const role = res.data.user?.role;
          if (role === 'admin') router.push('/admin');
          else if (role === 'receptionist') router.push('/receptionist');
          else router.push('/dashboard');
        } else {
          setError(res?.message || 'Login failed. Please check your credentials.');
        }
      } else {
        // Signup
        if (roleTab === 'patient') {
          const res = await api.registerPatient({ name, email, password });
          if (res?.success && res.data) {
            loginUser(res.data.user, res.data.token);
            closeAuthModal();
            resetForm();
            router.push('/dashboard');
          } else {
            setError(res?.message || 'Patient registration failed.');
          }
        } else if (roleTab === 'receptionist') {
          if (!uniqueClinicId.trim()) {
            setError('Unique Clinic ID is required for receptionist registration.');
            setLoading(false);
            return;
          }
          const res = await api.registerReceptionist({
            name,
            email,
            password,
            uniqueClinicId: uniqueClinicId.trim(),
          });
          if (res?.success && res.data) {
            loginUser(res.data.user, res.data.token);
            closeAuthModal();
            resetForm();
            router.push('/receptionist');
          } else {
            setError(res?.message || 'Receptionist registration failed.');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Trigger real Firebase Google Popup in browser
      const { user: fbUser, idToken } = await signInWithGooglePopup();
      
      // 2. Send Firebase ID token to backend for verification & user registration/login
      const res = await api.googleAuthPatient(idToken, fbUser);
      
      if (res?.success && res.data) {
        loginUser(res.data.user, res.data.token);
        closeAuthModal();
        resetForm();

        // Redirect based on role returned from backend
        const role = res.data.user?.role;
        if (role === 'admin') router.push('/admin');
        else if (role === 'receptionist') router.push('/receptionist');
        else router.push('/dashboard');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      const code = err?.code || '';
      const msg = err?.message || '';
      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setError('This domain is not authorized in Firebase Console yet. Please add your Vercel URL to Authorized Domains in Firebase Authentication Settings.');
      } else {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          'Google authentication failed or was cancelled.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D5C46] flex items-center justify-center text-white font-bold">💚</div>
            <h3 className="text-lg font-bold text-slate-800">
              {authModalTab === 'login' ? 'Welcome Back to MediArca' : 'Join MediArca'}
            </h3>
          </div>
          <button
            onClick={() => { closeAuthModal(); resetForm(); }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Login / Sign Up Tab */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setAuthModalTab('login'); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition ${authModalTab === 'login' ? 'bg-white text-[#0D5C46] shadow-sm' : 'text-slate-500'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalTab('signup'); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition ${authModalTab === 'signup' ? 'bg-white text-[#0D5C46] shadow-sm' : 'text-slate-500'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Role Sub-tabs for Signup */}
        {authModalTab === 'signup' && (
          <div className="flex justify-center gap-4 mb-4 border-b border-slate-100 pb-3 text-xs font-semibold">
            <button
              onClick={() => { setRoleTab('patient'); setError(''); }}
              className={`pb-1 border-b-2 transition ${roleTab === 'patient' ? 'border-[#0D5C46] text-[#0D5C46] font-bold' : 'border-transparent text-slate-400'}`}
            >
              Patient Signup
            </button>
            <button
              onClick={() => { setRoleTab('receptionist'); setError(''); }}
              className={`pb-1 border-b-2 transition ${roleTab === 'receptionist' ? 'border-[#0D5C46] text-[#0D5C46] font-bold' : 'border-transparent text-slate-400'}`}
            >
              Receptionist Signup
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                  placeholder="Enter full name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {authModalTab === 'signup' && roleTab === 'receptionist' ? 'Authorized Clinic Email' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {authModalTab === 'signup' && roleTab === 'receptionist' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Unique Clinic ID <span className="text-slate-400 font-normal">(given by Admin)</span></label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={uniqueClinicId}
                  onChange={(e) => setUniqueClinicId(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46] font-mono"
                  placeholder="MED-CLN-XXXXXX"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0D5C46] hover:bg-[#083E2F] text-white font-bold rounded-xl text-sm shadow-md transition mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Processing...' : authModalTab === 'login' ? 'Login' : 'Complete Signup'}
          </button>
        </form>

        {/* Google Sign-In (Patient & Login only; removed for Receptionist signup) */}
        {!(authModalTab === 'signup' && roleTab === 'receptionist') && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or continue with</span></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              type="button"
              disabled={loading}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </>
        )}

        {/* Admin login hint */}
        <p className="text-center text-[11px] text-slate-400 mt-3">
          Admin? Login with your admin credentials and you'll be redirected automatically.
        </p>
      </div>
    </div>
  );
}
