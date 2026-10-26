import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  Wallet,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const result = login(loginEmail, loginPassword);
    if (!result.success && result.error) {
      setErrorMessage(result.error);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    const result = register({
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
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-[#e8dfcf] bg-white shadow-xl shadow-[#dfd5c0]/30 overflow-hidden">
        {/* Left Side: Editorial Brand & Value Proposition in Sandal / Warm Tones */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#f5eee1] via-[#ece2cd] to-[#e4d6bc] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#e4d7bf]">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9c783e] text-white shadow-md shadow-[#9c783e]/30">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <span className="font-heading text-xl font-bold tracking-tight text-[#2b2823]">
                  FinPulse
                </span>
                <span className="block text-[11px] font-mono text-[#786e5e] font-semibold">
                  Personal Wealth OS
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-heading font-extrabold text-[#2b2823] leading-snug">
                One-Stop Wealth & Fund Intelligence
              </h2>
              <p className="text-xs text-[#5e574c] leading-relaxed">
                Track personal equity, mutual funds, gold bonds, fixed deposits, and crypto with
                built-in AI forecasting and capital gains tax optimization.
              </p>
            </div>

            {/* Feature Checkpoints */}
            <div className="mt-8 space-y-3 font-mono text-xs text-[#443f36]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#9c783e]" />
                <span>Multi-currency real-time conversion (₹, د.إ, $)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#9c783e]" />
                <span>Context-aware AI Wealth Copilot assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#9c783e]" />
                <span>FY 2026-27 automated tax harvesting engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#9c783e]" />
                <span>100% Private local encrypted storage</span>
              </div>
            </div>
          </div>

          {/* Quick Demo CTA */}
          <div className="mt-8 pt-6 border-t border-[#dfd2ba]">
            <span className="text-[11px] font-mono text-[#786e5e] block mb-2">
              Evaluating as a recruiter or visitor?
            </span>
            <button
              onClick={loginAsDemo}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2b2823] text-white text-xs font-mono font-bold hover:bg-[#443f36] active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-[#d9bf8f]" />
              <span>1-Click Investor Demo Access</span>
            </button>
          </div>
        </div>

        {/* Right Side: Auth Forms (Clean White, Soft Sandal Accents) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#f4efe4] p-1 border border-[#e6dcce] mb-6">
            <button
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#2b2823] shadow-xs'
                  : 'text-[#786e5e] hover:text-[#2b2823]'
              }`}
            >
              Sign In (Existing)
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#2b2823] shadow-xs'
                  : 'text-[#786e5e] hover:text-[#2b2823]'
              }`}
            >
              First-Time Register
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-mono">
              {errorMessage}
            </div>
          )}

          {/* FORM A: SIGN IN */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-heading font-bold text-[#2b2823]">
                  Welcome Back, Investor
                </h3>
                <p className="text-xs text-[#786e5e] mt-0.5">
                  Sign in to access your synchronized wealth dashboard
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs pt-2">
                <div>
                  <label className="block text-[#443f36] font-semibold mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-[#9c9384]" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. varun@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-9 pr-3 text-xs text-[#2b2823] placeholder-[#aba090] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[#443f36] font-semibold">Password</label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Demo mode: Click "1-Click Investor Demo Access" on the left!');
                      }}
                      className="text-[11px] text-[#9c783e] hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-[#9c9384]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-9 pr-3 text-xs text-[#2b2823] placeholder-[#aba090] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#9c783e] text-white text-xs font-mono font-bold hover:bg-[#866632] active:scale-95 transition-all shadow-md shadow-[#9c783e]/20 mt-4 cursor-pointer"
              >
                <span>Sign In to FinPulse</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center text-xs text-[#786e5e] pt-2">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[#9c783e] font-bold hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* FORM B: REGISTER (FIRST-TIME USER) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-xl font-heading font-bold text-[#2b2823]">
                  Create Your Investor Profile
                </h3>
                <p className="text-xs text-[#786e5e] mt-0.5">
                  Set up your portfolio tracker in under 30 seconds
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs pt-1">
                <div>
                  <label className="block text-[#443f36] font-semibold mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#9c9384]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Varun S T"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-9 pr-3 text-xs text-[#2b2823] placeholder-[#aba090] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#443f36] font-semibold mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-[#9c9384]" />
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-9 pr-3 text-xs text-[#2b2823] placeholder-[#aba090] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#443f36] font-semibold mb-1">
                      Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-[#9c9384]" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-9 pr-3 text-xs text-[#2b2823] placeholder-[#aba090] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#443f36] font-semibold mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-[#9c9384]" />
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-9 pr-3 text-xs text-[#2b2823] placeholder-[#aba090] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#443f36] font-semibold mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-[#9c9384]" />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full h-10 rounded-xl bg-[#faf8f5] border border-[#e4d9c7] pl-9 pr-3 text-xs text-[#2b2823] placeholder-[#aba090] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#786e5e] font-mono">
                <ShieldCheck className="h-4 w-4 text-[#2d6a4f] shrink-0" />
                <span>Zero spam guarantee. Encrypted client-side storage.</span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#9c783e] text-white text-xs font-mono font-bold hover:bg-[#866632] active:scale-95 transition-all shadow-md shadow-[#9c783e]/20 mt-2 cursor-pointer"
              >
                <span>Complete Registration & Open Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center text-xs text-[#786e5e] pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#9c783e] font-bold hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
