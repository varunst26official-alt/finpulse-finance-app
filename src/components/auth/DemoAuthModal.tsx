import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  X,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DemoAuthModal: React.FC = () => {
  const { authModalOpen, authModalFeatureName, closeAuthModal, login, register } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const result = await register({
        fullName,
        email,
        password,
      });
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-3xl border border-[#e8dfcf] bg-white shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-900"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header Icon & Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#17365d] to-[#0f233d] text-white shadow-md shadow-[#17365d]/25">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-200 mb-1">
                Demo Preview Mode
              </span>
              <h3 className="text-base sm:text-lg font-heading font-extrabold text-slate-900 leading-tight">
                Sign in to {authModalFeatureName}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            You are browsing LifeOS in <strong>read-only preview mode</strong>. Create a free account or sign in to save your personal data, execute trades, and track your daily habits.
          </p>

          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-[#f4efe4] p-1 border border-[#ded3bf] mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-3 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Quick Forms */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-9 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#17365d] hover:bg-[#122b4a] text-white text-xs font-bold transition-all shadow-md shadow-[#17365d]/20 mt-3 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Signing in...' : 'Sign In & Save'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-9 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#9e783e] hover:bg-[#866632] text-white text-xs font-bold transition-all shadow-md shadow-[#9e783e]/20 mt-3 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Creating profile...' : 'Create Account & Unlock'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Footer Dismiss Button */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={closeAuthModal}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium hover:underline cursor-pointer"
            >
              Continue exploring in Demo Mode
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
