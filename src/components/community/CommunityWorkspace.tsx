import React, { useState, useMemo, useEffect } from 'react';
import { useMasteryStore } from '@/stores/masteryStore';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { MasteryCategory, MasteryLeague } from '@/types/mastery';
import {
  Flame,
  Award,
  Crown,
  Shield,
  Heart,
  EyeOff,
  Sparkles,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  PieChart,
  Settings,
  Landmark,
  HeartPulse,
  CheckSquare,
  GraduationCap,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LEAGUE_THEMES: Record<
  MasteryLeague,
  { name: string; gradient: string; text: string; bg: string; border: string; icon: string }
> = {
  DIAMOND: {
    name: 'Diamond League',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    text: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    icon: '💎',
  },
  PLATINUM: {
    name: 'Platinum League',
    gradient: 'from-slate-700 via-slate-800 to-teal-700',
    text: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    icon: '🌟',
  },
  GOLD: {
    name: 'Gold League',
    gradient: 'from-amber-600 to-yellow-500',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '🥇',
  },
  SILVER: {
    name: 'Silver League',
    gradient: 'from-slate-500 to-slate-400',
    text: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    icon: '🥈',
  },
  BRONZE: {
    name: 'Bronze League',
    gradient: 'from-amber-800 to-amber-700',
    text: 'text-amber-800',
    bg: 'bg-amber-100/60',
    border: 'border-amber-300',
    icon: '🥉',
  },
};

const SECTION_METADATA: Record<
  MasteryCategory,
  { label: string; icon: LucideIcon; color: string; bg: string; border: string; desc: string; route: string }
> = {
  FINANCE: {
    label: 'Finance & Ledger',
    icon: Landmark,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: 'Budgeting hygiene, SIP funding, and FIRE planning',
    route: 'finance',
  },
  WELLNESS: {
    label: 'Fitness & Health',
    icon: HeartPulse,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    desc: 'Hydration targets, workouts, and nutrition logs',
    route: 'wellness',
  },
  PRODUCTIVITY: {
    label: 'Focus & Tasks',
    icon: CheckSquare,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: 'Agenda completion, Pomodoro blocks, and routines',
    route: 'productivity',
  },
  LEARNING: {
    label: 'Learning & Skills',
    icon: GraduationCap,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    desc: 'Certifications, reading hours, and skill trees',
    route: 'learning',
  },
  LIFEADMIN: {
    label: 'Life Admin & Vault',
    icon: ShieldCheck,
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Document renewals, insurance vault, and checklists',
    route: 'lifeadmin',
  },
};

export const CommunityWorkspace: React.FC = () => {
  const {
    sectionPoints,
    streakDays,
    displayNameMode,
    customAlias,
    isGhostMode,
    badges,
    pinnedBadgeIds,
    leaderboard,
    giveKudos,
    setDisplayNameMode,
    setCustomAlias,
    setGhostMode,
    togglePinBadge,
    getUserRank,
    getComputedLevel,
    awardPoints,
    fetchRealtimeLeaderboard,
    isLoadingLeaderboard,
  } = useMasteryStore();

  const { setCurrentSection } = useLifeOSStore();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<MasteryCategory | 'OVERALL'>('OVERALL');
  const [selectedLeague, setSelectedLeague] = useState<MasteryLeague | 'ALL'>('ALL');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [aliasDraft, setAliasDraft] = useState(customAlias);

  // Sync and fetch real-time community data on mount
  useEffect(() => {
    fetchRealtimeLeaderboard();
  }, [fetchRealtimeLeaderboard]);

  const { level, currentXp, nextLevelXp, progressPercent } = getComputedLevel();
  const { rank, totalMembers } = getUserRank();

  const theme =
    selectedLeague === 'ALL'
      ? {
          name: 'Platform Leaderboard',
          gradient: 'from-slate-800 to-indigo-900',
          text: 'text-indigo-400',
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          icon: '🌐',
        }
      : LEAGUE_THEMES[selectedLeague];

  const totalPoints = useMemo(() => {
    return Object.values(sectionPoints).reduce((a, b) => a + b, 0);
  }, [sectionPoints]);

  // Filter and sort leaderboard based on selected view
  const sortedMembers = useMemo(() => {
    let list = [...leaderboard];
    if (selectedLeague !== 'ALL') {
      list = list.filter((m) => m.league === selectedLeague);
    }
    return list.sort((a, b) => {
      if (activeCategoryFilter === 'OVERALL') {
        return b.totalPoints - a.totalPoints;
      }
      return (b.sectionPoints[activeCategoryFilter] || 0) - (a.sectionPoints[activeCategoryFilter] || 0);
    });
  }, [leaderboard, activeCategoryFilter, selectedLeague]);

  const top3 = sortedMembers.slice(0, Math.min(3, sortedMembers.length));
  const remainingMembers = sortedMembers.slice(3);

  const handleSaveAlias = (e: React.FormEvent) => {
    e.preventDefault();
    if (aliasDraft.trim()) {
      setCustomAlias(aliasDraft.trim());
      setIsPrivacyModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* 1. Hero Sprint & League Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121c2e] via-[#1a2942] to-[#243b5e] text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-gradient-to-br from-amber-500/20 to-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                {theme.name} · Sprint 42
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                3 Days, 11 Hours Left
              </span>
              {isGhostMode && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <EyeOff className="w-3 h-3" /> Incognito Mode
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Life Mastery League & Community</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
              Discipline and consistency over raw wealth. Earn section-wise points through daily execution, rise across
              weekly 30-person sprints, and stay accountable.
            </p>
          </div>

          {/* Quick Metrics Badges in Hero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                Your Rank
              </span>
              <span className="text-2xl font-black text-amber-400">
                #{rank} <span className="text-xs font-bold text-slate-300">/ {totalMembers}</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Top 15% · Safe Tier</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                Mastery Level
              </span>
              <span className="text-2xl font-black text-white">Lvl {level}</span>
              <span className="text-[10px] text-cyan-300 font-bold block mt-0.5">
                {currentXp} / {nextLevelXp} XP
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                Active Streak
              </span>
              <span className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                {streakDays}d
              </span>
              <span className="text-[10px] text-orange-300 font-bold block mt-0.5">Daily Habit Unbroken</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                Privacy Mode
              </span>
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold text-white transition-all cursor-pointer mt-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{displayNameMode === 'ALIAS' ? 'Alias' : displayNameMode === 'REAL_NAME' ? 'Real Name' : 'Ghost'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-xl">
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
              <span>Level {level} Progress</span>
              <span>
                {currentXp} / {nextLevelXp} XP to Level {level + 1} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-white/15 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                awardPoints('WELLNESS', 25, 'Quick test check-in completed!');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-extrabold border border-amber-400/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Daily Habit (+25 XP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Section-wise Points Breakdown Strip (5 Pillars of LifeOS) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <span>Your Section-Wise Mastery Index</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Every action across Quantra feeds your overall discipline index. Click any card to enter that module.
            </p>
          </div>
          <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
            Total XP: {totalPoints.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {(Object.keys(SECTION_METADATA) as MasteryCategory[]).map((cat) => {
            const meta = SECTION_METADATA[cat];
            const pts = sectionPoints[cat] || 0;
            const pctOfTotal = totalPoints > 0 ? Math.round((pts / totalPoints) * 100) : 20;

            return (
              <motion.div
                whileHover={{ y: -3 }}
                key={cat}
                onClick={() => setCurrentSection(meta.route as any)}
                className={`p-4 rounded-2xl border ${meta.border} ${meta.bg} shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-xl bg-white shadow-2xs border border-slate-200/80 ${meta.color}`}>
                      <meta.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-700">
                      {pctOfTotal}% Share
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900">{meta.label}</h3>
                  <p className="text-[11px] text-slate-600 font-medium line-clamp-2 mt-0.5 leading-tight">
                    {meta.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-bold block">Score</span>
                    <span className={`text-base font-black ${meta.color}`}>{pts.toLocaleString()} XP</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-800 flex items-center">
                    Enter <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Community Leaderboard & League Standings */}
      <div className="bg-white rounded-3xl border border-[#e4e9f1] p-5 sm:p-7 shadow-sm space-y-6">
        {/* Controls: League Switcher + Section Category Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          {/* League Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedLeague('ALL')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedLeague === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🌐</span>
              <span>All Real Members ({leaderboard.length})</span>
            </button>
            {(Object.keys(LEAGUE_THEMES) as MasteryLeague[]).map((lg) => {
              const info = LEAGUE_THEMES[lg];
              const isSelected = selectedLeague === lg;
              const countInLeague = leaderboard.filter((m) => m.league === lg).length;
              return (
                <button
                  key={lg}
                  onClick={() => setSelectedLeague(lg)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span>{info.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-700'
                  }`}>
                    {countInLeague}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sectional Specialty Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveCategoryFilter('OVERALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === 'OVERALL'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌐 Overall Mastery
            </button>
            <button
              onClick={() => setActiveCategoryFilter('FINANCE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === 'FINANCE'
                  ? 'bg-white text-emerald-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💰 Finance
            </button>
            <button
              onClick={() => setActiveCategoryFilter('WELLNESS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === 'WELLNESS'
                  ? 'bg-white text-rose-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💪 Wellness
            </button>
            <button
              onClick={() => setActiveCategoryFilter('PRODUCTIVITY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === 'PRODUCTIVITY'
                  ? 'bg-white text-blue-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ Focus
            </button>
            <button
              onClick={() => setActiveCategoryFilter('LEARNING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === 'LEARNING'
                  ? 'bg-white text-purple-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📚 Learning
            </button>
            <button
              onClick={() => setActiveCategoryFilter('LIFEADMIN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === 'LIFEADMIN'
                  ? 'bg-white text-amber-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗂 Admin
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoadingLeaderboard && (
          <div className="py-12 text-center text-xs font-bold text-slate-500">
            <Sparkles className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
            Syncing real-time community leaderboard from database...
          </div>
        )}

        {/* Empty State */}
        {!isLoadingLeaderboard && sortedMembers.length === 0 && (
          <div className="py-12 text-center text-slate-500 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No registered members found in this view</p>
            <p className="text-xs text-slate-400 mt-1">
              Select "All Real Members" to view all registered users across the platform.
            </p>
          </div>
        )}

        {/* Podium for Top 3 Leaders */}
        {!isLoadingLeaderboard && top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {top3.map((member, index) => {
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
              const medalBorder =
                index === 0
                  ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-white ring-2 ring-amber-300'
                  : index === 1
                  ? 'border-slate-300 bg-gradient-to-b from-slate-50 to-white'
                  : 'border-amber-700/30 bg-gradient-to-b from-amber-50/50 to-white';

              const score =
                activeCategoryFilter === 'OVERALL'
                  ? member.totalPoints
                  : member.sectionPoints[activeCategoryFilter] || 0;

              return (
                <motion.div
                  key={member.id}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl p-5 border ${medalBorder} shadow-sm relative flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black">{medal}</span>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        Rank #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
                          <span>{member.isCurrentUser && displayNameMode === 'ALIAS' ? member.alias : member.name}</span>
                          {member.isCurrentUser && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              You
                            </span>
                          )}
                        </h4>
                        <span className="text-xs text-slate-500 font-semibold truncate block">
                          @{member.alias} · {member.location}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic bg-white/70 p-2.5 rounded-xl border border-slate-100 mb-3 line-clamp-2">
                      "{member.statusMessage}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {activeCategoryFilter === 'OVERALL' ? 'Total Mastery XP' : `${activeCategoryFilter} XP`}
                      </span>
                      <span className="text-lg font-black text-slate-900">{score.toLocaleString()} XP</span>
                    </div>

                    <button
                      onClick={() => giveKudos(member.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        member.hasGivenKudo
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          member.hasGivenKudo ? 'text-rose-600 fill-rose-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{member.kudosCount}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full Leaderboard Table (Ranks 4+) */}
        {!isLoadingLeaderboard && remainingMembers.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                <th className="py-3 px-4 w-14 text-center">Rank</th>
                <th className="py-3 px-4">Member / Alias</th>
                <th className="py-3 px-4 hidden sm:table-cell">Active Streak</th>
                <th className="py-3 px-4 hidden md:table-cell">Section Pill</th>
                <th className="py-3 px-4 text-right">Mastery XP</th>
                <th className="py-3 px-4 text-center w-24">Kudos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {remainingMembers.map((member) => {
                const isUser = member.isCurrentUser;
                const score =
                  activeCategoryFilter === 'OVERALL'
                    ? member.totalPoints
                    : member.sectionPoints[activeCategoryFilter] || 0;

                return (
                  <tr
                    key={member.id}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-amber-50/70 font-extrabold ring-1 ring-amber-400/50'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center font-black text-slate-700">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200/60 text-xs">
                        {member.rank}
                      </span>
                    </td>

                    {/* Member */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-xs shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-slate-900 block truncate">
                            {isUser && displayNameMode === 'ALIAS' ? member.alias : member.name}
                            {isUser && (
                              <span className="ml-1.5 text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                                You
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium block truncate">
                            @{member.alias} · Lvl {member.level}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 font-black text-xs border border-orange-200">
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        {member.streakDays}d
                      </span>
                    </td>

                    {/* Section Pill */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          ₹ {member.sectionPoints.FINANCE}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          ♡ {member.sectionPoints.WELLNESS}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                          ☑ {member.sectionPoints.PRODUCTIVITY}
                        </span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                      {score.toLocaleString()} XP
                    </td>

                    {/* Kudos */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => giveKudos(member.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          member.hasGivenKudo
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
                        }`}
                      >
                        <Heart
                          className={`w-3 h-3 ${
                            member.hasGivenKudo ? 'text-rose-600 fill-rose-600' : 'text-slate-400'
                          }`}
                        />
                        <span>{member.kudosCount}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* 4. Badges & Achievement Showcase Shelf */}
      <div className="bg-white rounded-3xl border border-[#e4e9f1] p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Mastery Badges & Milestones</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Unlock badges by maintaining discipline across each life area. Pin up to 3 showcase badges to your community card.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {badges.filter((b) => b.isUnlocked).length} of {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {badges.map((badge) => {
            const isPinned = pinnedBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all ${
                  badge.isUnlocked
                    ? 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-xs'
                    : 'border-slate-100 bg-slate-50/70 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>{badge.name}</span>
                        {badge.isUnlocked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Lock className="w-3 h-3 text-slate-400" />
                        )}
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {badge.category}
                      </span>
                    </div>
                  </div>

                  {badge.isUnlocked && (
                    <button
                      onClick={() => togglePinBadge(badge.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        isPinned
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isPinned ? 'Pinned ★' : 'Pin'}
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
                  {badge.description}
                </p>

                {badge.isUnlocked ? (
                  <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60 inline-block">
                    ✓ Unlocked on {badge.unlockedAt}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>{badge.requirementText}</span>
                      <span>{badge.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-700 rounded-full"
                        style={{ width: `${badge.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Privacy & Identity Settings Modal */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-slate-900">Privacy & Identity</h3>
                </div>
                <button
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Choose how your profile and mastery progress appear on the public community leaderboard.
              </p>

              {/* Display Name Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Display Name Format</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setDisplayNameMode('REAL_NAME')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      displayNameMode === 'REAL_NAME'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Real Name
                  </button>
                  <button
                    onClick={() => setDisplayNameMode('ALIAS')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      displayNameMode === 'ALIAS'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Custom Alias
                  </button>
                  <button
                    onClick={() => setDisplayNameMode('ANONYMOUS')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      displayNameMode === 'ANONYMOUS'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Anonymous
                  </button>
                </div>
              </div>

              {/* Alias Draft Input */}
              {displayNameMode === 'ALIAS' && (
                <form onSubmit={handleSaveAlias} className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Your Custom Alias</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aliasDraft}
                      onChange={(e) => setAliasDraft(e.target.value)}
                      placeholder="e.g. AuraNavigator #512"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              {/* Ghost Mode Toggle */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Incognito / Ghost Mode</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Hide completely from public leaderboards.
                  </span>
                </div>
                <button
                  onClick={() => setGhostMode(!isGhostMode)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    isGhostMode ? 'bg-purple-600 justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <motion.div
                    layout
                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
