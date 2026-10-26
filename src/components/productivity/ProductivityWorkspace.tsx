import React, { useState } from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { SectionHero } from '@/components/layout/SectionHero';
import { FinancialCalendarWidget } from '@/components/calendar/FinancialCalendarWidget';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductivityWorkspace: React.FC = () => {
  const { tasks, toggleTaskComplete, addTask, deleteTask } = useLifeOSStore();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Task Form
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newCategory, setNewCategory] = useState<'FINANCE' | 'WELLNESS' | 'PRODUCTIVITY' | 'LEARNING' | 'LIFEADMIN'>('PRODUCTIVITY');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newNotes, setNewNotes] = useState('');

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingCount = tasks.length - completedCount;

  const filteredTasks = tasks.filter((t) =>
    filterCategory === 'ALL' ? true : t.category === filterCategory
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
      priority: newPriority,
      status: 'TODO',
      badgeLabel: 'To do',
      notes: newNotes.trim() || undefined,
      iconSymbol:
        newCategory === 'FINANCE'
          ? '₹'
          : newCategory === 'WELLNESS'
          ? '♡'
          : newCategory === 'LEARNING'
          ? '▧'
          : newCategory === 'LIFEADMIN'
          ? '◇'
          : '☑',
    });

    setNewTitle('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Indigo Hero Banner */}
      <SectionHero
        section="productivity"
        onPrimaryAction={() => setIsAddModalOpen(true)}
        primaryActionLabel="+ Add a Task"
        onSecondaryAction={() => {
          const el = document.getElementById('unified-calendar');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        secondaryActionLabel="View Unified Calendar"
      />

      {/* 2. Top 4 Productivity Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Tasks due today</span>
            <div className="w-9 h-9 rounded-xl bg-[#edf0ff] text-[#5574d9] flex items-center justify-center font-bold text-sm">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {tasks.length}
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Across all life areas</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {completedCount}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-bold">
            {Math.round((completedCount / Math.max(1, tasks.length)) * 100)}% daily completion rate
          </div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Pending actions</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {pendingCount}
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Remaining to finish</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Active routines</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            4
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Daily recurring habits</div>
        </article>
      </div>

      {/* 3. Task Manager List & Category Filters */}
      <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e4e9f1]">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
              Today's Focus & Action Checklist
            </h3>
            <p className="text-[11px] text-[#6f7c91]">
              Manage daily tasks and link obligations to your schedule
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#f5f7fb] p-1 rounded-xl text-xs font-bold text-[#6f7c91]">
              {(['ALL', 'FINANCE', 'WELLNESS', 'PRODUCTIVITY', 'LEARNING'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-white text-[#243047] shadow-xs'
                      : 'hover:text-[#243047]'
                  }`}
                >
                  {cat.toLowerCase()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#5574d9] text-white text-xs font-bold hover:bg-[#4360bf] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Task</span>
            </button>
          </div>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-[#e4e9f1]">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6f7c91] font-medium">
              No tasks found in this category. Click "+ Add Task" to create one.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'COMPLETED';

              return (
                <div
                  key={task.id}
                  className="py-3.5 flex items-center gap-3.5 group hover:bg-[#fafcfe] px-2 rounded-xl transition-colors"
                >
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="shrink-0 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-[#5574d9]" />
                    )}
                  </button>

                  <div className="w-9 h-9 rounded-xl bg-[#f5f7fb] text-[#243047] font-bold text-sm flex items-center justify-center shrink-0">
                    {task.iconSymbol || '☑'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isCompleted ? 'line-through text-slate-400' : 'text-[#243047]'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.time && (
                        <span className="text-[10px] font-semibold text-[#6f7c91]">
                          {task.time}
                        </span>
                      )}
                    </div>
                    {task.notes && (
                      <div className="text-[11px] text-[#6f7c91] truncate font-medium mt-0.5">
                        {task.notes}
                      </div>
                    )}
                  </div>

                  {/* Priority Tag */}
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      task.priority === 'HIGH'
                        ? 'bg-rose-50 text-rose-700'
                        : task.priority === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 4. Unified Calendar Section */}
      <div id="unified-calendar" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#243047]">
              Unified Calendar & Scheduled Life Inflows / Outflows
            </h3>
            <p className="text-xs text-[#6f7c91]">
              Cross-module timeline combining salary credits, loan EMIs, insurance renewals, and planned events
            </p>
          </div>
        </div>

        <FinancialCalendarWidget />
      </div>

      {/* 5. Create Task Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#e4e9f1] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="text-sm font-extrabold text-[#243047]">
                  + Add New Task / Agenda Item
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 text-slate-600">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule Annual Health Checkup"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-bold focus:border-[#5574d9] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">Scheduled Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-bold focus:border-[#5574d9] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-bold focus:border-[#5574d9] focus:bg-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Life Domain Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-bold focus:border-[#5574d9] focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="PRODUCTIVITY">Productivity & Routines</option>
                    <option value="FINANCE">Finance & Bills</option>
                    <option value="WELLNESS">Fitness & Health</option>
                    <option value="LEARNING">Learning & Career</option>
                    <option value="LIFEADMIN">Life Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Notes / Context (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bring dental insurance card"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-medium focus:border-[#5574d9] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e4e9f1]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#e4e9f1] text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#5574d9] text-white text-xs font-bold hover:bg-[#4360bf] shadow-md shadow-[#5574d9]/20 cursor-pointer"
                  >
                    Save Task
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
