import React, { useState, useEffect } from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { SectionHero } from '@/components/layout/SectionHero';
import {
  BookOpen,
  Award,
  Clock,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Star,
  CheckCircle2,
  Trash2,
  Check,
  X,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LearningWorkspace: React.FC = () => {
  const {
    learningItems,
    addLearningItem,
    learningBooks,
    addBook,
    updateBook,
    deleteBook,
  } = useLifeOSStore();

  // Active Sub-Tab: 'SKILLS' | 'STUDY_TIMER' | 'BOOKS'
  const [activeTab, setActiveTab] = useState<'SKILLS' | 'STUDY_TIMER' | 'BOOKS'>('SKILLS');

  // Modals
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Skill Form
  const [title, setTitle] = useState('');
  const [field, setField] = useState('Engineering');
  const [targetHours, setTargetHours] = useState(30);
  const [skillNotes, setSkillNotes] = useState('');

  // Book Form
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookCategory, setBookCategory] = useState('Technology');
  const [bookTotalPages, setBookTotalPages] = useState(400);
  const [bookNotes, setBookNotes] = useState('');

  // Live Study Stopwatch
  const [selectedSkillId, setSelectedSkillId] = useState(learningItems[0]?.id || '');
  const [studySeconds, setStudySeconds] = useState(0);
  const [isStudyTimerRunning, setIsStudyTimerRunning] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Stopwatch timer effect
  useEffect(() => {
    let interval: any = null;
    if (isStudyTimerRunning) {
      interval = setInterval(() => {
        setStudySeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudyTimerRunning]);

  const handleSaveStudySession = () => {
    if (studySeconds < 60) {
      alert('Please study for at least 1 minute before saving the session.');
      return;
    }
    const hours = Math.round((studySeconds / 3600) * 10) / 10;
    setIsStudyTimerRunning(false);
    setStudySeconds(0);
    showToast(`Logged ${hours} hours of deep learning!`);
  };

  const totalHoursSpent = learningItems.reduce((acc, item) => acc + item.hoursSpent, 0);

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addLearningItem({
      title: title.trim(),
      field,
      progressPercent: 10,
      hoursSpent: 0,
      targetHours: Number(targetHours) || 20,
      status: 'IN_PROGRESS',
      notes: skillNotes.trim() || undefined,
    });

    setTitle('');
    setSkillNotes('');
    setIsSkillModalOpen(false);
    showToast(`Learning goal "${title.trim()}" added to roadmap!`);
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) return;

    addBook({
      title: bookTitle.trim(),
      author: bookAuthor.trim() || 'Unknown Author',
      category: bookCategory,
      currentPage: 0,
      totalPages: Number(bookTotalPages) || 300,
      status: 'IN_PROGRESS',
      rating: 5,
      notes: bookNotes.trim() || undefined,
    });

    setBookTitle('');
    setBookAuthor('');
    setBookNotes('');
    setIsBookModalOpen(false);
    showToast(`"${bookTitle.trim()}" added to your bookshelf!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#17365d] text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-bold"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Purple Hero Banner */}
      <SectionHero
        section="learning"
        onPrimaryAction={() => setIsSkillModalOpen(true)}
        primaryActionLabel="+ Add Learning Goal"
        onSecondaryAction={() => setActiveTab('STUDY_TIMER')}
        secondaryActionLabel="Open Study Stopwatch"
      />

      {/* 2. Top 4 Learning Metric Cards */}
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
          <div className="text-[11px] text-indigo-600 mt-1 font-bold">Invested in compounding skills</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Books in library</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {learningBooks.length}
          </div>
          <div className="text-[11px] text-amber-600 mt-1 font-bold">
            {learningBooks.filter((b) => b.status === 'COMPLETED').length} books completed
          </div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Knowledge Domain</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            Level 4
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-bold">Senior Polymath Track</div>
        </article>
      </div>

      {/* 3. Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#e4e9f1] pb-2 text-xs font-bold overflow-x-auto scrollbar-none whitespace-nowrap">
        <button
          onClick={() => setActiveTab('SKILLS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'SKILLS'
              ? 'bg-[#8a5bd6] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Skill Roadmaps & Goals</span>
        </button>
        <button
          onClick={() => setActiveTab('STUDY_TIMER')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'STUDY_TIMER'
              ? 'bg-[#8a5bd6] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Active Study Stopwatch</span>
        </button>
        <button
          onClick={() => setActiveTab('BOOKS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'BOOKS'
              ? 'bg-[#8a5bd6] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Books & Course Vault ({learningBooks.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: SKILL TREES & ROADMAPS                         */}
      {/* ======================================================== */}
      {activeTab === 'SKILLS' && (
        <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#e4e9f1]">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
                Active Competency Roadmaps
              </h3>
              <p className="text-xs text-[#6f7c91]">
                Master technical, financial, and wellness disciplines with verified hours
              </p>
            </div>
            <button
              onClick={() => setIsSkillModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#8a5bd6] hover:bg-[#7747c4] text-white text-xs font-bold transition-all shadow-md shadow-[#8a5bd6]/20 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#f1eaff] text-[#8a5bd6] uppercase">
                      {item.field}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {item.progressPercent}%
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-800 mt-2">
                    {item.title}
                  </h4>
                  {item.notes && (
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{item.notes}</p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>
                      {item.hoursSpent} / {item.targetHours} hours completed
                    </span>
                    <span className="text-emerald-700">
                      {item.targetHours - item.hoursSpent > 0
                        ? `${item.targetHours - item.hoursSpent}h left`
                        : 'Mastered!'}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progressPercent}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-[#8a5bd6] rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: ACTIVE STUDY STOPWATCH                         */}
      {/* ======================================================== */}
      {activeTab === 'STUDY_TIMER' && (
        <section className="bg-white border border-[#e4e9f1] rounded-3xl p-8 shadow-xs max-w-xl mx-auto space-y-6 text-center">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#f1eaff] text-[#8a5bd6] text-xs font-extrabold">
              📖 Live Study Logger
            </span>
            <h3 className="text-xl font-extrabold text-[#243047] mt-2">
              Deep Study Session Stopwatch
            </h3>
            <p className="text-xs text-[#6f7c91]">
              Record focused learning time directly into your compounding knowledge database.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Skill Area to Credit:
            </label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
            >
              {learningItems.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.field}] {item.title}
                </option>
              ))}
            </select>
          </div>

          {/* Stopwatch Display */}
          <div className="py-4">
            <div className="text-4xl sm:text-6xl lg:text-7xl font-mono font-black text-[#8a5bd6] tracking-tight">
              {Math.floor(studySeconds / 3600)}:
              {Math.floor((studySeconds % 3600) / 60)
                .toString()
                .padStart(2, '0')}
              :{(studySeconds % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-2">Hours : Minutes : Seconds</div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsStudyTimerRunning(!isStudyTimerRunning)}
              className="px-6 py-3 rounded-2xl bg-[#8a5bd6] hover:bg-[#7747c4] text-white text-sm font-extrabold transition-all shadow-lg shadow-[#8a5bd6]/30 cursor-pointer flex items-center gap-2"
            >
              {isStudyTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isStudyTimerRunning ? 'Pause Stopwatch' : 'Start Study Timer'}</span>
            </button>
            <button
              onClick={handleSaveStudySession}
              disabled={studySeconds < 60}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Log Hours</span>
            </button>
            <button
              onClick={() => {
                setIsStudyTimerRunning(false);
                setStudySeconds(0);
              }}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
              title="Reset stopwatch"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: BOOKS & COURSE VAULT                           */}
      {/* ======================================================== */}
      {activeTab === 'BOOKS' && (
        <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#e4e9f1]">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#243047] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Personal Library & Reading Progress</span>
              </h3>
              <p className="text-xs text-[#6f7c91]">
                Track pages read, personal annotations, and ratings across core literature
              </p>
            </div>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#8a5bd6] hover:bg-[#7747c4] text-white text-xs font-bold transition-all shadow-md shadow-[#8a5bd6]/20 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningBooks.map((book) => {
              const readPercent = Math.min(
                100,
                Math.round((book.currentPage / Math.max(1, book.totalPages)) * 100)
              );

              return (
                <div
                  key={book.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 uppercase">
                        {book.category}
                      </span>
                      <button
                        onClick={() => deleteBook(book.id)}
                        className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-800 mt-2">{book.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">By {book.author}</p>
                    {book.notes && (
                      <p className="text-[11px] text-slate-600 italic mt-1 line-clamp-2">
                        "{book.notes}"
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>
                        Page {book.currentPage} of {book.totalPages} ({readPercent}%)
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-slate-700">{book.rating}/5</span>
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${readPercent}%` }}
                      />
                    </div>

                    {/* Quick page updater */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          const next = Math.min(book.totalPages, book.currentPage + 20);
                          updateBook(book.id, { currentPage: next });
                          showToast(`Logged +20 pages for "${book.title}"`);
                        }}
                        className="flex-1 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 transition-all cursor-pointer"
                      >
                        +20 Pages Read
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Add Skill Goal Modal */}
      <AnimatePresence>
        {isSkillModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e4e9f1] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="font-extrabold text-base text-[#243047]">Add Learning Goal</h3>
                <button
                  onClick={() => setIsSkillModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSkill} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Skill / Goal Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Cryptographic Protocols & Zero-Knowledge"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Knowledge Field</label>
                    <select
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Finance">Finance & Investing</option>
                      <option value="Health">Health & Physiology</option>
                      <option value="Leadership">Leadership & Management</option>
                      <option value="Design">Product Design</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Target Hours</label>
                    <input
                      type="number"
                      min="5"
                      max="1000"
                      value={targetHours}
                      onChange={(e) => setTargetHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Milestone Description / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Key syllabus topics or certification target..."
                    value={skillNotes}
                    onChange={(e) => setSkillNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e4e9f1]">
                  <button
                    type="button"
                    onClick={() => setIsSkillModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#8a5bd6] text-white font-bold"
                  >
                    Add Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Book Modal */}
      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e4e9f1] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="font-extrabold text-base text-[#243047]">Add Book to Vault</h3>
                <button
                  onClick={() => setIsBookModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBook} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Book Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Clean Architecture"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Author</label>
                    <input
                      type="text"
                      placeholder="e.g., Robert C. Martin"
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Total Pages</label>
                    <input
                      type="number"
                      min="10"
                      value={bookTotalPages}
                      onChange={(e) => setBookTotalPages(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineering"
                    value={bookCategory}
                    onChange={(e) => setBookCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Reading Notes / Takeaway</label>
                  <textarea
                    rows={2}
                    placeholder="Key concepts or reading plan..."
                    value={bookNotes}
                    onChange={(e) => setBookNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e4e9f1]">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#8a5bd6] text-white font-bold"
                  >
                    Add Book
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
