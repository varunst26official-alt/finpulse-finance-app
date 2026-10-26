import React, { useState } from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { SectionHero } from '@/components/layout/SectionHero';
import { BookOpen, Award, Clock, Plus, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LearningWorkspace: React.FC = () => {
  const { learningItems, addLearningItem } = useLifeOSStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [field, setField] = useState('Engineering');
  const [targetHours, setTargetHours] = useState(30);

  const totalHoursSpent = learningItems.reduce((acc, item) => acc + item.hoursSpent, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addLearningItem({
      title: title.trim(),
      field,
      progressPercent: 10,
      hoursSpent: 0,
      targetHours: Number(targetHours) || 20,
      status: 'IN_PROGRESS',
    });

    setTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Purple Hero Banner */}
      <SectionHero
        section="learning"
        onPrimaryAction={() => setIsModalOpen(true)}
        primaryActionLabel="+ Add Learning Goal"
        onSecondaryAction={() => alert('Viewing your active certificates and verified credentials.')}
        secondaryActionLabel="View Completed Credentials"
      />

      {/* 2. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Active goals</span>
            <div className="w-9 h-9 rounded-xl bg-[#f1eaff] text-[#8a5bd6] flex items-center justify-center font-bold text-sm">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {learningItems.length}
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Skills in active progression</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Study time</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {totalHoursSpent} hrs
          </div>
          <div className="text-[11px] text-indigo-600 mt-1 font-bold">Invested this quarter</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Milestones</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            8
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Across active roadmaps</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Certificates</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            3
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Verified credentials</div>
        </article>
      </div>

      {/* 3. Skill & Career Roadmap Panel */}
      <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
              Active Skill Roadmaps & Milestone Progress
            </h3>
            <p className="text-[11px] text-[#6f7c91]">
              Track practical projects, deep learning sessions, and certifications
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#8a5bd6] text-white text-xs font-bold hover:bg-[#7849c4] shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Skill</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {learningItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-[#e4e9f1] bg-[#fafcfe] space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-extrabold text-[#8a5bd6] uppercase">
                  <span>{item.field}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#f1eaff]">
                    {item.progressPercent}%
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#243047] mt-2 leading-snug">
                  {item.title}
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-[#6f7c91] font-medium">
                  <span>{item.hoursSpent} hrs completed</span>
                  <span>{item.targetHours} hrs target</span>
                </div>

                <div className="h-2 rounded-full bg-[#edf0f5] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-[#8a5bd6] rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#e4e9f1] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="text-sm font-extrabold text-[#243047]">
                  + Add Learning Goal
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 text-slate-600">Goal / Skill Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced AI Model Fine-Tuning"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-bold focus:border-[#8a5bd6] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Discipline / Field</label>
                  <select
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-bold focus:border-[#8a5bd6] focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Engineering">Software Engineering</option>
                    <option value="Finance">Quantitative Finance</option>
                    <option value="Product">Product Management</option>
                    <option value="Data">Data Science & AI</option>
                    <option value="Leadership">Executive Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Target Study Hours</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={targetHours}
                    onChange={(e) => setTargetHours(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-bold focus:border-[#8a5bd6] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e4e9f1]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#e4e9f1] text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#8a5bd6] text-white text-xs font-bold hover:bg-[#7849c4] shadow-md shadow-[#8a5bd6]/20 cursor-pointer"
                  >
                    Save Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
