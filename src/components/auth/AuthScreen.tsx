import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AuthScreen: React.FC = () => {
  const { login, register, loginAsDemo } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // UI Error / Feedback
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const result = await login(loginEmail, loginPassword);
    if (!result.success && result.error) {
      setErrorMessage(result.error);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    const result = await register({
      fullName: regFullName,
      email: regEmail,
      phoneNumber: regPhone,
      password: regPassword,
    });

    if (!result.success && result.error) {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-[#e8e0d1] bg-white shadow-xl shadow-[#dfd5c0]/30 overflow-hidden"
      >
        {/* Left Side: Brand & Value Proposition */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#f5eee1] via-[#ece2cd] to-[#e4d6bc] p-5 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#e4d7bf]">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#17365d] text-white shadow-md shadow-[#17365d]/30 font-extrabold text-xl sm:text-2xl">
                L
              </div>
              <div>
                <span className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  LifeOS
                </span>
                <span className="block text-xs text-[#866632] font-bold">
                  Personal Life Command Centre
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 leading-snug">
                One Operating System for Your Whole Life
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Unifying your Finances, Fitness & Clinical Nutrition, Deep Work Productivity,
                Learning Roadmaps, and Life Administration into a high-performance command centre.
              </p>
            </div>

            {/* Feature Checkpoints */}
            <div className="mt-6 sm:mt-8 space-y-3 text-xs text-slate-800 font-semibold">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#9e783e] shrink-0" />
                <span>6 connected lifecycle command workspaces</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#9e783e] shrink-0" />
                <span>Adaptive AI Blueprint (BMR, TDEE, macro split)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#9e783e] shrink-0" />
                <span>Cross-domain situational LifeOS AI Copilot</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#9e783e] shrink-0" />
                <span>Persistent encrypted SQLite storage engine</span>
              </div>
            </div>
          </div>

          {/* Quick Demo CTA */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#dfd2ba]">
            <span className="text-xs text-slate-600 block mb-2 font-medium">
              Evaluating as a recruiter or visitor?
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={loginAsDemo}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-[#d9bf8f]" />
              <span>1-Click Investor Demo Access</span>
            </motion.button>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="md:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#f4efe4] p-1.5 border border-[#ded3bf] mb-6">
            <button
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In (Existing)
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              First-Time Register
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-semibold">
              {errorMessage}
            </div>
          )}

          {/* FORM A: SIGN IN */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-heading font-bold text-slate-900">
                  Welcome Back, Investor
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sign in to access your synchronized wealth dashboard
                </p>
              </div>

              <div className="space-y-3.5 text-xs pt-2">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. varun@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-10 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-800 font-bold">Password</label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Demo mode: Click "1-Click Investor Demo Access" on the left!');
                      }}
                      className="text-xs text-[#9e783e] font-semibold hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-10 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#17365d] text-white text-xs font-bold hover:bg-[#132c4d] transition-all shadow-md shadow-[#17365d]/20 mt-4 cursor-pointer"
              >
                <span>Sign In to LifeOS</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>

              <div className="text-center text-xs text-slate-600 pt-2 font-medium">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[#9e783e] font-bold hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* FORM B: REGISTER (FIRST-TIME USER) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-xl font-heading font-bold text-slate-900">
                  Create Your Investor Profile
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Set up your portfolio tracker in under 30 seconds
                </p>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Varun S T"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-10 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-10 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-10 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-10 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-10 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Zero spam guarantee. Encrypted client-side storage.</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] transition-all shadow-md shadow-[#9e783e]/20 mt-2 cursor-pointer"
              >
                <span>Complete Registration & Open Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>

              <div className="text-center text-xs text-slate-600 pt-1 font-medium">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#9e783e] font-bold hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
