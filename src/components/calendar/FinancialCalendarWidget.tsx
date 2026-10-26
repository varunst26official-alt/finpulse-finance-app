import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Circle,
  Trash2,
  Gift,
  TrendingUp,
  Sparkles,
  X,
  Filter,
} from 'lucide-react';
import {
  CalendarEvent,
  CalendarEventType,
} from '@/types/finance';
import {
  formatCurrency,
  CALENDAR_EVENT_LABELS,
  CALENDAR_EVENT_COLORS,
  CURRENCY_CONFIGS,
} from '@/utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export const FinancialCalendarWidget: React.FC = () => {
  const {
    calendarEvents,
    currency,
    addCalendarEvent,
    deleteCalendarEvent,
    toggleEventCompleted,
  } = useFinanceStore();

  const currentRate = CURRENCY_CONFIGS[currency].rateFromUSD;

  // Active viewing date state (Defaults to November 2026 for rich mock data)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Nov 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-11-01');

  // Modal State for Adding New Calendar Event
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEventType>('PLANNED_EXPENSE');
  const [eventDate, setEventDate] = useState('2026-11-01');
  const [eventAmount, setEventAmount] = useState<number>(100);
  const [eventCategoryName, setEventCategoryName] = useState('General');
  const [eventNotes, setEventNotes] = useState('');

  // Date Range Filtering for Report
  const [reportRange, setReportRange] = useState<'THIS_MONTH' | 'NEXT_30_DAYS' | 'NEXT_90_DAYS' | 'CUSTOM'>('THIS_MONTH');
  const [customStartDate, setCustomStartDate] = useState('2026-10-01');
  const [customEndDate, setCustomEndDate] = useState('2026-12-31');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date(2026, 9, 26); // Anchor to current demo date
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Map of events keyed by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    calendarEvents.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [calendarEvents]);

  // Filtered Events based on report range
  const filteredReportEvents = useMemo(() => {
    return calendarEvents.filter((ev) => {
      const matchesType = filterType === 'ALL' || ev.type === filterType;
      let inRange = false;

      if (reportRange === 'THIS_MONTH') {
        const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        inRange = ev.date.startsWith(monthPrefix);
      } else if (reportRange === 'NEXT_30_DAYS') {
        inRange = ev.date >= '2026-10-26' && ev.date <= '2026-11-26';
      } else if (reportRange === 'NEXT_90_DAYS') {
        inRange = ev.date >= '2026-10-26' && ev.date <= '2027-01-26';
      } else {
        inRange = ev.date >= customStartDate && ev.date <= customEndDate;
      }

      return matchesType && inRange;
    });
  }, [calendarEvents, filterType, reportRange, year, month, customStartDate, customEndDate]);

  // Aggregate totals for the filtered range
  const rangeTotals = useMemo(() => {
    let totalInflowUSD = 0;
    let totalOutflowUSD = 0;
    let lifeEventsCount = 0;
    let medicalCount = 0;

    filteredReportEvents.forEach((ev) => {
      if (ev.type === 'EXPECTED_INCOME') {
        totalInflowUSD += ev.amount;
      } else {
        totalOutflowUSD += ev.amount;
      }

      if (ev.type === 'LIFE_EVENT') lifeEventsCount++;
      if (ev.type === 'MEDICAL_CHECKUP') medicalCount++;
    });

    const netSurplusUSD = totalInflowUSD - totalOutflowUSD;

    return {
      totalInflowUSD,
      totalOutflowUSD,
      netSurplusUSD,
      lifeEventsCount,
      medicalCount,
    };
  }, [filteredReportEvents]);

  // Projection Chart Data: Group by week / date
  const chartData = useMemo(() => {
    const grouped: Record<string, { date: string; inflow: number; outflow: number; net: number }> = {};

    filteredReportEvents.forEach((ev) => {
      // Format as DD MMM
      const dateParts = ev.date.split('-');
      const shortLabel = `${dateParts[2]} ${monthNames[parseInt(dateParts[1], 10) - 1].slice(0, 3)}`;

      if (!grouped[shortLabel]) {
        grouped[shortLabel] = { date: shortLabel, inflow: 0, outflow: 0, net: 0 };
      }

      const amountConverted = currency === 'INR' ? ev.amount * currentRate : ev.amount;

      if (ev.type === 'EXPECTED_INCOME') {
        grouped[shortLabel].inflow += amountConverted;
      } else {
        grouped[shortLabel].outflow += amountConverted;
      }

      grouped[shortLabel].net = grouped[shortLabel].inflow - grouped[shortLabel].outflow;
    });

    return Object.values(grouped).slice(0, 10);
  }, [filteredReportEvents, currency, currentRate, monthNames]);

  // Selected date events
  const selectedDateEvents = eventsByDate[selectedDateStr] || [];

  // Handle Event Creation
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const amountUSD = currency === 'INR' ? eventAmount / currentRate : eventAmount;

    addCalendarEvent({
      title: eventTitle || 'Scheduled Financial Event',
      date: eventDate,
      type: eventType,
      amount: amountUSD,
      categoryName: eventCategoryName || 'General',
      notes: eventNotes,
    });

    setIsAddModalOpen(false);
    setEventTitle('');
    setEventNotes('');
  };

  // CSV Export Engine
  const handleExportCSV = () => {
    const headers = ['Date', 'Event Title', 'Event Type', 'Category', `Amount (${currency})`, 'Status', 'Notes'];
    const rows = filteredReportEvents.map((ev) => {
      const amt = currency === 'INR' ? Math.round(ev.amount * currentRate) : ev.amount.toFixed(2);
      return [
        ev.date,
        `"${ev.title.replace(/"/g, '""')}"`,
        ev.type,
        `"${ev.categoryName}"`,
        ev.type === 'EXPECTED_INCOME' ? `+${amt}` : `-${amt}`,
        ev.isCompleted ? 'Completed' : 'Pending',
        `"${(ev.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinPulse_Financial_Report_${reportRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable Statement Engine
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedInflow = formatCurrency(rangeTotals.totalInflowUSD, currency);
    const formattedOutflow = formatCurrency(rangeTotals.totalOutflowUSD, currency);
    const formattedNet = formatCurrency(rangeTotals.netSurplusUSD, currency);

    const rowsHtml = filteredReportEvents
      .map(
        (ev) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-family: monospace;">${ev.date}</td>
          <td style="padding: 10px; font-weight: bold;">${ev.title}</td>
          <td style="padding: 10px;">${CALENDAR_EVENT_LABELS[ev.type]}</td>
          <td style="padding: 10px; text-align: right; font-family: monospace; font-weight: bold; color: ${
            ev.type === 'EXPECTED_INCOME' ? '#15803d' : '#b91c1c'
          };">
            ${ev.type === 'EXPECTED_INCOME' ? '+' : '-'}${formatCurrency(ev.amount, currency)}
          </td>
          <td style="padding: 10px; text-align: center;">${ev.isCompleted ? '✓ Completed' : 'Pending'}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>FinPulse - Financial & Event Planning Report</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #9e783e; padding-bottom: 16px; margin-bottom: 24px; }
            .kpis { display: flex; gap: 20px; margin-bottom: 30px; }
            .kpi-card { flex: 1; padding: 16px; background: #faf8f5; border: 1px solid #e8e0d1; border-radius: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { text-align: left; padding: 10px; background: #faf8f5; border-bottom: 2px solid #e8e0d1; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; font-size: 24px; color: #9e783e;">FinPulse Wealth & Event Schedule</h1>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Official Cash Flow Projection & Scheduled Life Events Statement</p>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              <div>Generated: ${new Date().toLocaleDateString()}</div>
              <div>Report Scope: ${reportRange}</div>
            </div>
          </div>

          <div class="kpis">
            <div class="kpi-card">
              <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Expected Inflow</div>
              <div style="font-size: 20px; font-weight: bold; color: #15803d; font-family: monospace; margin-top: 4px;">+${formattedInflow}</div>
            </div>
            <div class="kpi-card">
              <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Planned Outflow</div>
              <div style="font-size: 20px; font-weight: bold; color: #b91c1c; font-family: monospace; margin-top: 4px;">-${formattedOutflow}</div>
            </div>
            <div class="kpi-card">
              <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Net Projected Balance</div>
              <div style="font-size: 20px; font-weight: bold; color: #0f172a; font-family: monospace; margin-top: 4px;">${formattedNet}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Event / Obligation</th>
                <th>Classification</th>
                <th style="text-align: right;">Amount</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Strip */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9e783e] text-white shadow-md shadow-[#9e783e]/25">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              Financial Calendar & Life Events Planner
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Track planned expenses, SIP investments, birthdays, and medical checkups with cash flow projections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEventDate(selectedDateStr);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9e783e] text-white text-xs font-bold shadow-md shadow-[#9e783e]/25 hover:bg-[#866632] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Event / Payment</span>
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expected Inflow */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-emerald-800 uppercase text-[11px]">Expected Inflows</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            +{formatCurrency(rangeTotals.totalInflowUSD, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Salary, yields & payouts</span>
        </motion.div>

        {/* Planned Outflows */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50/40 to-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-rose-800 uppercase text-[11px]">Planned Outflows</span>
            <ArrowDownRight className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700">
            -{formatCurrency(rangeTotals.totalOutflowUSD, currency)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Rent, EMI, medical & events</span>
        </motion.div>

        {/* Net Projected Surplus */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-600 uppercase text-[11px]">Projected Net Balance</span>
            <Sparkles className="h-4 w-4 text-[#9e783e]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(rangeTotals.netSurplusUSD, currency)}
          </div>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">
            Net liquidity after obligations
          </span>
        </motion.div>

        {/* Life & Health Events */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-50/40 to-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-purple-800 uppercase text-[11px]">Events & Medical</span>
            <Gift className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-900">
            {rangeTotals.lifeEventsCount + rangeTotals.medicalCount} Events
          </div>
          <span className="text-xs text-purple-700 mt-1 block">
            {rangeTotals.lifeEventsCount} Celebrations • {rangeTotals.medicalCount} Checkups
          </span>
        </motion.div>
      </div>

      {/* Main Calendar & Inflow/Outflow Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Month Calendar Grid (7 cols) */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="lg:col-span-7 rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs space-y-4"
        >
          {/* Month Navigation Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e0d1]">
            <div className="flex items-center gap-2">
              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                {monthNames[month]} {year}
              </h4>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 rounded-lg bg-[#faf8f5] border border-[#e8e0d1] text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#f4efe4] transition-colors cursor-pointer"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-[#e8e0d1] text-slate-600 hover:text-slate-900 hover:bg-[#faf8f5] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-[#e8e0d1] text-slate-600 hover:text-slate-900 hover:bg-[#faf8f5] transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Previous month trailing days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div
                key={`prev-${i}`}
                className="h-16 rounded-xl border border-transparent p-1.5 text-xs text-slate-300 pointer-events-none"
              >
                <span>{prevMonthDays - firstDayIndex + i + 1}</span>
              </div>
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isSelected = selectedDateStr === dateStr;
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-18 rounded-2xl p-1.5 flex flex-col justify-between text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-[#9e783e] bg-[#faf8f5] shadow-xs ring-2 ring-[#9e783e]/20'
                      : hasEvents
                      ? 'border-[#e8e0d1] bg-white hover:border-[#9e783e] hover:bg-[#faf8f5]/50'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-[#9e783e] text-white'
                          : 'text-slate-800'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Badges / Dots on Day Cell */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const color = CALENDAR_EVENT_COLORS[ev.type];
                      return (
                        <span
                          key={ev.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: color.dot }}
                          title={`${ev.title} (${CALENDAR_EVENT_LABELS[ev.type]})`}
                        />
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-slate-400 font-bold leading-none">+</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#e8e0d1] text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#16a34a]" /> Expected Inflow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#e11d48]" /> Planned Expense
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0284c7]" /> Planned SIP
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#9333ea]" /> Life Event
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#d97706]" /> Medical Checkup
            </span>
          </div>
        </motion.div>

        {/* Right Column: Inflow vs Outflow Projection Chart (5 cols) */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="lg:col-span-5 rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#9e783e]" />
              Cash Flow Projection
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Scheduled inflows vs. planned outflows across key milestone dates
            </p>
          </div>

          {chartData.length === 0 ? (
            <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-[#faf8f5]/60 rounded-2xl border border-dashed border-[#e8e0d1]">
              <div className="p-3 rounded-2xl bg-white border border-[#e8e0d1] text-[#9e783e] mb-2 shadow-xs">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <h5 className="text-xs font-bold text-slate-900 mb-0.5">No Scheduled Cashflows</h5>
              <p className="text-[11px] text-slate-500 max-w-[240px] leading-snug font-medium mb-3">
                Log upcoming salary, dividend receipts, planned SIPs, or medical bills to project your cashflow.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] transition-all cursor-pointer shadow-xs"
              >
                + Add Calendar Event
              </button>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1ece1" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val) / (currency === 'INR' ? currentRate : 1), currency)}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e8e0d1' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="inflow" name="Expected Inflow" fill="#15803d" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outflow" name="Planned Outflow" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Selected Date Summary Box */}
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900">
                Selected: {selectedDateStr}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                {selectedDateEvents.length} Events Logged
              </span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <p className="text-slate-500 text-[11px]">No obligations or events recorded on this date.</p>
            ) : (
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {selectedDateEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">{ev.title}</span>
                    <span className={`font-mono font-bold ${ev.type === 'EXPECTED_INCOME' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {ev.type === 'EXPECTED_INCOME' ? '+' : '-'}{formatCurrency(ev.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Date Range Filter & Downloadable Report Hub */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e8e0d1] pb-4">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#9e783e]" />
              Financial Report & Event Schedule
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Filter by date range and download formatted statements in PDF or CSV spreadsheet
            </p>
          </div>

          {/* Date Range Presets */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] text-xs font-semibold">
            {[
              { id: 'THIS_MONTH', label: 'This Month' },
              { id: 'NEXT_30_DAYS', label: 'Next 30 Days' },
              { id: 'NEXT_90_DAYS', label: 'Next 90 Days' },
              { id: 'CUSTOM', label: 'Custom Range' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setReportRange(p.id as any)}
                className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                  reportRange === p.id
                    ? 'bg-[#9e783e] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#f4efe4]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Picker (If CUSTOM selected) */}
        {reportRange === 'CUSTOM' && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] text-xs">
            <span className="font-bold text-slate-700">From Date:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="rounded-xl bg-white border border-[#e8e0d1] px-3 py-1.5 text-xs text-slate-900 font-medium"
            />
            <span className="font-bold text-slate-700">To Date:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="rounded-xl bg-white border border-[#e8e0d1] px-3 py-1.5 text-xs text-slate-900 font-medium"
            />
          </div>
        )}

        {/* Download & Filter Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredReportEvents.length}</strong> events scheduled
            </span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-2.5 py-1 text-xs text-slate-700 font-semibold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Event Types</option>
              <option value="EXPECTED_INCOME">Expected Income</option>
              <option value="PLANNED_EXPENSE">Planned Expenses & Bills</option>
              <option value="PLANNED_INVESTMENT">Planned Investments / SIP</option>
              <option value="LIFE_EVENT">Life Events & Birthdays</option>
              <option value="MEDICAL_CHECKUP">Medical Checkups</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Export CSV */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e8e0d1] text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-[#faf8f5] transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
              <span>Export CSV</span>
            </motion.button>

            {/* Download / Print PDF */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9e783e] text-xs font-bold text-white shadow-md shadow-[#9e783e]/20 hover:bg-[#866632] transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Download PDF Statement</span>
            </motion.button>
          </div>
        </div>

        {/* Detailed Events Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8e0d1] text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="pb-3 pt-1">Status</th>
                <th className="pb-3 pt-1">Date</th>
                <th className="pb-3 pt-1">Event / Obligation</th>
                <th className="pb-3 pt-1">Classification</th>
                <th className="pb-3 pt-1">Category</th>
                <th className="pb-3 pt-1 text-right">Inflow / Outflow</th>
                <th className="pb-3 pt-1 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2ece1] text-slate-700">
              {filteredReportEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                    No scheduled obligations or events match the chosen date range.
                  </td>
                </tr>
              ) : (
                filteredReportEvents.map((ev) => {
                  const color = CALENDAR_EVENT_COLORS[ev.type];
                  const isInflow = ev.type === 'EXPECTED_INCOME';

                  return (
                    <tr key={ev.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-3.5">
                        <button
                          onClick={() => toggleEventCompleted(ev.id)}
                          className="cursor-pointer text-slate-400 hover:text-[#9e783e] transition-colors"
                          title={ev.isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                        >
                          {ev.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 font-mono text-slate-600 font-medium">{ev.date}</td>
                      <td className="py-3.5">
                        <div className={`font-bold ${ev.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {ev.title}
                        </div>
                        {ev.notes && <div className="text-[11px] text-slate-500 truncate max-w-xs">{ev.notes}</div>}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold ${color.badge}`}>
                          {CALENDAR_EVENT_LABELS[ev.type]}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">{ev.categoryName}</td>
                      <td className={`py-3.5 text-right font-extrabold font-mono text-sm ${isInflow ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isInflow ? '+' : '-'}{formatCurrency(ev.amount, currency)}
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => deleteCalendarEvent(ev.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Calendar Event Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#e8e0d1] pb-3">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[#9e783e]" />
                  Schedule Event or Payment
                </h4>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Event / Payment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sister's Birthday, Executive Health Checkup, Rent"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      <option value="PLANNED_EXPENSE">💳 Planned Expense / Bill</option>
                      <option value="PLANNED_INVESTMENT">📈 Planned SIP / Investment</option>
                      <option value="LIFE_EVENT">🎂 Life Event & Celebration</option>
                      <option value="MEDICAL_CHECKUP">🏥 Health & Medical Checkup</option>
                      <option value="EXPECTED_INCOME">💵 Expected Inflow / Income</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Event Date</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      Amount ({CURRENCY_CONFIGS[currency].symbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={eventAmount}
                      onChange={(e) => setEventAmount(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1">Category / Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Health, Family, Rent"
                      value={eventCategoryName}
                      onChange={(e) => setEventCategoryName(e.target.value)}
                      className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Notes / Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. appointment at 10 AM, Gift budget"
                    value={eventNotes}
                    onChange={(e) => setEventNotes(e.target.value)}
                    className="w-full rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e0d1]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#faf8f5] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#9e783e] text-xs font-bold text-white shadow-md shadow-[#9e783e]/20 hover:bg-[#866632] transition-all cursor-pointer"
                  >
                    Save Event
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
