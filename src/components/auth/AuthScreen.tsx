import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  TrendingUp,
  Sparkles,
  HeartPulse,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeatureSlide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  cardBg: string;
  accentColor: string;
  highlights: string[];
  metricTag: { label: string; value: string };
}

const FEATURE_SLIDES: FeatureSlide[] = [
  {
    id: 'wealth-fire',
    badge: 'WEALTH & FIRE ENGINE',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200/80',
    title: 'Total Wealth Command & FIRE Timeline',
    subtitle: 'Real-time Multi-Asset Portfolio Tracking',
    description:
      'Consolidate listed equities, mutual funds, gold, and real estate with automated tax-gain harvesting and an interactive FIRE milestone calculator.',
    icon: TrendingUp,
    gradient: 'from-[#17365d] via-[#10243f] to-[#0a1626]',
    cardBg: 'bg-white/10 border-white/15',
    accentColor: '#d4af37',
    highlights: [
      'Real-time Net Worth & Multi-Asset Allocation',
      'FIRE Number & Annual Step-Up Projection',
      'Instant Bank & CAS Statement Parsing',
    ],
    metricTag: { label: 'Projected FIRE Corpus', value: '₹4.85 Cr' },
  },
  {
    id: 'quantrix-ai',
    badge: 'QUANTRIX AI ASSISTANT',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200/80',
    title: 'Personalized Situational Intelligence',
    subtitle: 'Conversational Q&A on Your Real Data',
    description:
      'Quantrix queries your live financial ledgers, pending tasks, wellness vitals, and vault expirations to deliver instant synthesized insights.',
    icon: Sparkles,
    gradient: 'from-[#1e1b4b] via-[#2e1065] to-[#172554]',
    cardBg: 'bg-indigo-950/40 border-indigo-500/20',
    accentColor: '#a78bfa',
    highlights: [
      'Synthesizes live ledger, wellness & task data',
      'Natural language trade & expense execution',
      'Zero hallucination with deterministic verification',
    ],
    metricTag: { label: 'Quantrix Status', value: 'Active & Synced' },
  },
  {
    id: 'health-biometrics',
    badge: 'CLINICAL BIOMETRICS & NUTRITION',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200/80',
    title: 'Adaptive Metabolic Health & Fitness',
    subtitle: 'BMR, TDEE & Performance Tracking',
    description:
      'Scientifically structured macro breakdown, daily hydration trackers, workout logging, and biometric milestones calibrated to your physique.',
    icon: HeartPulse,
    gradient: 'from-[#064e3b] via-[#043628] to-[#022c22]',
    cardBg: 'bg-emerald-950/40 border-emerald-500/20',
    accentColor: '#34d399',
    highlights: [
      'Dynamic BMR / TDEE metabolic calculation',
      'Daily hydration & macronutrient tracking',
      'Physical workout logs with recovery metrics',
    ],
    metricTag: { label: 'Daily Energy Target', value: '2,350 kcal' },
  },
  {
    id: 'habits-community',
    badge: 'HABITS, TASKS & COMMUNITY',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200/80',
    title: 'Deep Work Flow & Peer Leaderboard',
    subtitle: 'Gamified Productivity & Real-Time Ranks',
    description:
      'Achieve compounding daily habit streaks, manage prioritized task boards, and compete in the verified real-time community leaderboard.',
    icon: Trophy,
    gradient: 'from-[#451a03] via-[#311302] to-[#1f0b00]',
    cardBg: 'bg-amber-950/40 border-amber-500/20',
    accentColor: '#fbbf24',
    highlights: [
      'Compounding streak tracking & task priorities',
      'Section-wise mastery points calculation',
      'Live peer rankings with zero mock data',
    ],
    metricTag: { label: 'Community Ranking', value: 'Top 5% • Master' },
  },
  {
    id: 'life-admin-vault',
    badge: 'ENCRYPTED LIFE ADMIN VAULT',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-200/80',
    title: 'Private Life Operations & Document Vault',
    subtitle: 'Zero-Knowledge Encrypted Storage',
    description:
      'Keep your passports, driving licenses, vehicle warranties, and insurance policies securely organized with timely automated renewal alerts.',
    icon: ShieldCheck,
    gradient: 'from-[#0f172a] via-[#1e293b] to-[#090d16]',
    cardBg: 'bg-slate-900/60 border-slate-700/30',
    accentColor: '#38bdf8',
    highlights: [
      'Client-side encrypted SQLite storage engine',
      'Automated document expiry & renewal warnings',
      'Warranty, policy & subscription oversight',
    ],
    metricTag: { label: 'Security Standard', value: 'AES-256 Encrypted' },
  },
];

export const AuthScreen: React.FC = () => {
  const { login, register, loginAsDemo } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Carousel State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Form State
  const [loginEmail, setLoginEmail] = useState('investor@quantra.io');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // UI Error / Feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-advance Carousel
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const result = await login(loginEmail, loginPassword);
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await loginAsDemo();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({
        fullName: regFullName,
        email: regEmail,
        phoneNumber: regPhone,
        password: regPassword,
      });

      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSlide = FEATURE_SLIDES[activeSlide];
  const SlideIcon = currentSlide.icon;

  return (
    <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans selection:bg-[#9e783e]/20 selection:text-[#6a5026]">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-[28px] border border-[#e8dfcf] bg-white shadow-2xl shadow-black/5 overflow-hidden"
      >
        {/* ============================================================== */}
        {/* LEFT COLUMN: INTERACTIVE FEATURE SHOWCASE CAROUSEL */}
        {/* ============================================================== */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className={`lg:col-span-6 bg-gradient-to-br ${currentSlide.gradient} p-6 sm:p-9 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-700 select-none min-h-[460px] lg:min-h-[620px]`}
        >
          {/* Subtle Ambient Background Mesh Glow */}
          <div
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-35 pointer-events-none transition-colors duration-1000"
            style={{ backgroundColor: currentSlide.accentColor }}
          />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none bg-white" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-md font-extrabold text-lg">
                Q
              </div>
              <div>
                <span className="font-heading text-lg font-bold tracking-tight text-white block leading-tight">
                  Quantra LifeOS
                </span>
                <span className="text-[11px] text-white/70 font-medium">
                  Autonomous Life Intelligence
                </span>
              </div>
            </div>

            {/* Slide Navigation Chevrons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Previous feature"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Next feature"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Carousel Slide Content with AnimatePresence */}
          <div className="relative z-10 my-auto py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Feature Pill & Live Metric Tag */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md shadow-xs ${currentSlide.badgeColor}`}
                  >
                    <SlideIcon className="h-3 w-3" />
                    <span>{currentSlide.badge}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 border border-white/15 text-white/90 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-white/60">{currentSlide.metricTag.label}:</span>
                    <strong className="text-white">{currentSlide.metricTag.value}</strong>
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white leading-tight">
                    {currentSlide.title}
                  </h2>
                  <p className="text-sm font-semibold text-white/80">
                    {currentSlide.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-white/70 leading-relaxed max-w-md">
                  {currentSlide.description}
                </p>

                {/* Feature Highlights Card */}
                <div
                  className={`mt-4 rounded-2xl p-4 border backdrop-blur-md ${currentSlide.cardBg} space-y-2.5 shadow-lg shadow-black/10`}
                >
                  {currentSlide.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-white/90">
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{
                          backgroundColor: `${currentSlide.accentColor}33`,
                          color: currentSlide.accentColor,
                        }}
                      >
                        ✓
                      </span>
                      <span className="font-medium leading-snug">{highlight}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Controls: Animated Progress Indicator Dots */}
          <div className="relative z-10 pt-4 flex items-center justify-between border-t border-white/10">
            <div className="flex items-center gap-2">
              {FEATURE_SLIDES.map((slide, idx) => {
                const isActive = idx === activeSlide;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${slide.badge}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'w-8 bg-white shadow-sm'
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                );
              })}
            </div>

            <span className="text-[11px] font-mono text-white/60">
              0{activeSlide + 1} / 0{FEATURE_SLIDES.length}
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: MINIMALIST AUTHENTICATION FORM */}
        {/* ============================================================== */}
        <div className="lg:col-span-6 p-6 sm:p-9 lg:p-10 flex flex-col justify-center bg-white">
          {/* Segmented Mode Switcher */}
          <div className="relative flex rounded-2xl bg-[#f4efe4]/80 p-1 border border-[#ded3bf] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`relative z-10 flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer text-center ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm border border-[#e8dfcf]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In (Existing)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`relative z-10 flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer text-center ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm border border-[#e8dfcf]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              First-Time Register
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-semibold"
            >
              {errorMessage}
            </motion.div>
          )}

          {/* High-Converting Preloaded Instant Demo Access */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            disabled={isSubmitting}
            onClick={handleDemoLogin}
            className="w-full mb-5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#9e783e] to-[#82602e] hover:from-[#8d6a34] hover:to-[#745527] text-white font-bold text-xs shadow-md shadow-[#9e783e]/20 flex items-center justify-center gap-2 cursor-pointer transition-all border border-[#b89557]/40"
          >
            <Zap className="h-3.5 w-3.5 fill-current text-amber-200" />
            <span>⚡ Instant Demo Access (Preloaded Portfolio)</span>
          </motion.button>

          {/* Form Switch Area */}
          {mode === 'login' ? (
            /* ============================================================== */
            /* FORM A: SIGN IN */
            /* ============================================================== */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">
                  Welcome Back
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign in to your synchronized life command dashboard
                </p>
              </div>

              <div className="space-y-3.5 text-xs pt-1">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-10 pr-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:ring-3 focus:ring-[#9e783e]/10 focus:outline-hidden font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-slate-700 font-bold">Password</label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(
                          'Password Recovery: In this local environment, your demo password is "password123". For custom accounts, please log in with your registered credentials.'
                        );
                      }}
                      className="text-xs text-[#9e783e] font-semibold hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-10 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:ring-3 focus:ring-[#9e783e]/10 focus:outline-hidden font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#17365d] hover:bg-[#122b4a] text-white text-xs font-bold transition-all shadow-md shadow-[#17365d]/20 mt-4 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In to LifeOS'}</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>

              <div className="text-center text-xs text-slate-500 pt-2 font-medium">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[#9e783e] font-bold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* ============================================================== */
            /* FORM B: REGISTER (FIRST-TIME INVESTOR) */
            /* ============================================================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">
                  Create Your Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set up your personalized LifeOS workspace in 30 seconds
                </p>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-10 pr-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:ring-3 focus:ring-[#9e783e]/10 focus:outline-hidden font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-10 pr-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:ring-3 focus:ring-[#9e783e]/10 focus:outline-hidden font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-10 pr-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:ring-3 focus:ring-[#9e783e]/10 focus:outline-hidden font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-10 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:ring-3 focus:ring-[#9e783e]/10 focus:outline-hidden font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-type password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#faf8f4] border border-[#e4d9c7] pl-10 pr-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:ring-3 focus:ring-[#9e783e]/10 focus:outline-hidden font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Zero spam guarantee. Encrypted client-side storage.</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#9e783e] hover:bg-[#866632] text-white text-xs font-bold transition-all shadow-md shadow-[#9e783e]/20 mt-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration'}</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>

              <div className="text-center text-xs text-slate-500 pt-1 font-medium">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#9e783e] font-bold hover:underline cursor-pointer"
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
