import React, { useState, useMemo, useEffect } from 'react';
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
  PieChart as PieChartIcon,
  BarChart3,
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
  EXPENSE_CATEGORY_LABELS,
  INCOME_CATEGORY_LABELS,
} from '@/utils/formatters';
import { normalizeDateToISO } from '@/services/gpayStatementService';
import { useModalDismiss } from '@/hooks/useModalDismiss';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const PIE_COLORS = [
  '#9e783e', // Warm gold
  '#17365d', // Deep navy
  '#059669', // Emerald
  '#dc2626', // Crimson
  '#7c3aed', // Purple
  '#d97706', // Amber
  '#2563eb', // Royal blue
  '#0891b2', // Teal
  '#db2777', // Pink
  '#475569', // Slate
];

const renderBarYAxisTick = ({ x, y, payload }: any) => {
  const full = String(payload?.value || '').trim();
  const truncated = full.length > 15 ? `${full.slice(0, 13)}…` : full;
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{full}</title>
      <text
        x={-6}
        y={3.5}
        textAnchor="end"
        fill="#334155"
        fontSize={10}
        fontWeight={600}
        fontFamily="sans-serif"
      >
        {truncated}
      </text>
    </g>
  );
};

export const FinancialCalendarWidget: React.FC = () => {
  const {
    calendarEvents,
    expenses,
    incomes,
    debts,
    policies,
    currency,
    addCalendarEvent,
    deleteCalendarEvent,
    toggleEventCompleted,
  } = useFinanceStore();

  const currentRate = CURRENCY_CONFIGS[currency].rateFromUSD;

  // Detect the best viewing month (Defaults to October 2026 or latest active statement month)
  const defaultYearMonth = useMemo(() => {
    const validIsoDates: string[] = [];

    const collectDate = (rawDate: any) => {
      const iso = normalizeDateToISO(rawDate);
      if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        validIsoDates.push(iso);
      }
    };

    expenses.forEach((e) => collectDate(e.date));
    incomes.forEach((i) => collectDate(i.date));
    calendarEvents.forEach((c) => collectDate(c.date));

    if (validIsoDates.length > 0) {
      validIsoDates.sort((a, b) => b.localeCompare(a));
      const latest = validIsoDates[0];
      const parts = latest.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m) && y >= 2024 && y <= 2030 && m >= 0 && m <= 11) {
        return { year: y, month: m, fullDate: latest };
      }
    }

    return { year: 2026, month: 9, fullDate: '2026-10-29' }; // October 2026
  }, [expenses, incomes, calendarEvents]);

  // Active viewing date state with fallback guards
  const [currentDate, setCurrentDate] = useState(() => {
    const y = defaultYearMonth.year || 2026;
    const m = typeof defaultYearMonth.month === 'number' && !isNaN(defaultYearMonth.month) ? defaultYearMonth.month : 9;
    return new Date(y, m, 1);
  });
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    () => defaultYearMonth.fullDate || '2026-10-29'
  );
  const [isDateInspectorOpen, setIsDateInspectorOpen] = useState(false);

  // Auto-sync when statements or new calendar events are imported
  useEffect(() => {
    if (defaultYearMonth && defaultYearMonth.year && !isNaN(defaultYearMonth.month)) {
      setCurrentDate(new Date(defaultYearMonth.year, defaultYearMonth.month, 1));
      setSelectedDateStr(defaultYearMonth.fullDate);
    }
  }, [defaultYearMonth.year, defaultYearMonth.month]);

  // Modal State for Adding New Calendar Event
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEventType>('PLANNED_EXPENSE');
  const [eventDate, setEventDate] = useState('2026-10-29');
  const [eventAmount, setEventAmount] = useState<number>(100);
  const [eventCategoryName, setEventCategoryName] = useState('General');
  const [eventNotes, setEventNotes] = useState('');

  // Date Range Filtering for Report
  const [reportRange, setReportRange] = useState<'THIS_MONTH' | 'NEXT_30_DAYS' | 'NEXT_90_DAYS' | 'CUSTOM'>('THIS_MONTH');
  const [customStartDate, setCustomStartDate] = useState('2026-04-01');
  const [customEndDate, setCustomEndDate] = useState('2026-11-30');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [chartMode, setChartMode] = useState<'PIE' | 'BAR'>('PIE');

  // Dismissal hooks for Inspector drawer and Add Event modal
  const { overlayProps: inspectorOverlayProps, contentProps: inspectorContentProps } = useModalDismiss(
    isDateInspectorOpen,
    () => setIsDateInspectorOpen(false)
  );
  const { overlayProps: addModalOverlayProps, contentProps: addModalContentProps } = useModalDismiss(
    isAddModalOpen,
    () => setIsAddModalOpen(false)
  );

  // Calendar calculations with NaN guards
  const year = isNaN(currentDate.getTime()) ? 2026 : currentDate.getFullYear();
  const month = isNaN(currentDate.getTime()) ? 9 : currentDate.getMonth();

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
    const targetY = defaultYearMonth.year || 2026;
    const targetM = typeof defaultYearMonth.month === 'number' ? defaultYearMonth.month : 9;
    setCurrentDate(new Date(targetY, targetM, 1));
    setSelectedDateStr(defaultYearMonth.fullDate || `${targetY}-${String(targetM + 1).padStart(2, '0')}-01`);
  };

  const handleJumpToActiveMonth = () => {
    const targetY = defaultYearMonth.year || 2026;
    const targetM = typeof defaultYearMonth.month === 'number' ? defaultYearMonth.month : 9;
    setCurrentDate(new Date(targetY, targetM, 1));
    setSelectedDateStr(defaultYearMonth.fullDate);
  };

  // Map of events keyed by YYYY-MM-DD (Unifying calendarEvents, expenses, incomes, debts EMIs & insurance renewals)
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};

    // 1. Base Calendar Events
    calendarEvents.forEach((ev) => {
      const d = normalizeDateToISO(ev.date);
      if (!map[d]) map[d] = [];
      map[d].push({ ...ev, date: d });
    });

    // 2. Spent Expenses
    expenses.forEach((exp) => {
      const d = normalizeDateToISO(exp.date);
      if (!d) return;
      if (!map[d]) map[d] = [];
      const already = map[d].some(
        (e) => e.title === exp.title && Math.abs(e.amount - exp.amount) < 0.01
      );
      if (!already) {
        map[d].push({
          id: `exp_${exp.id}`,
          title: exp.title,
          date: d,
          type: 'PLANNED_EXPENSE',
          amount: exp.amount,
          categoryName: EXPENSE_CATEGORY_LABELS[exp.category] || exp.category,
          isCompleted: true,
          notes: exp.notes,
        });
      }
    });

    // 3. Income Inflows
    incomes.forEach((inc) => {
      const d = normalizeDateToISO(inc.date);
      if (!d) return;
      if (!map[d]) map[d] = [];
      const already = map[d].some(
        (e) => e.title === inc.source && Math.abs(e.amount - inc.amount) < 0.01
      );
      if (!already) {
        map[d].push({
          id: `inc_${inc.id}`,
          title: inc.source,
          date: d,
          type: 'EXPECTED_INCOME',
          amount: inc.amount,
          categoryName: INCOME_CATEGORY_LABELS[inc.category] || inc.category,
          isCompleted: true,
          notes: inc.notes,
        });
      }
    });

    // 4. Debts & Loan EMI Commitments (Scheduled on debt.emiDueDay for the viewed month)
    (debts || []).forEach((debt) => {
      const dueDay = Math.min(Math.max(1, debt.emiDueDay || 5), daysInMonth);
      const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;
      if (!map[d]) map[d] = [];
      map[d].push({
        id: `debt_emi_${debt.id}_${year}_${month}`,
        title: `EMI: ${debt.title}`,
        date: d,
        type: 'PLANNED_EXPENSE',
        amount: debt.monthlyEmi,
        categoryName: 'Debt EMI',
        isCompleted: false,
        notes: `${debt.lender} • ${debt.category} monthly installment (Outstanding: $${debt.currentOutstanding.toFixed(0)})`,
      });
    });

    // 5. Protection & Insurance Renewals
    (policies || []).forEach((policy) => {
      if (policy.renewalDueDate) {
        const d = normalizeDateToISO(policy.renewalDueDate);
        if (d) {
          if (!map[d]) map[d] = [];
          map[d].push({
            id: `policy_renewal_${policy.id}`,
            title: `Insurance: ${policy.policyName}`,
            date: d,
            type: 'PLANNED_EXPENSE',
            amount: policy.annualPremium,
            categoryName: 'Insurance Renewal',
            isCompleted: policy.status === 'ACTIVE',
            notes: `${policy.provider} • Policy #${policy.policyNumber} (${policy.type})`,
          });
        }
      }
    });

    return map;
  }, [calendarEvents, expenses, incomes, debts, policies, year, month, daysInMonth]);

  const allUnifiedEvents = useMemo(() => {
    return Object.values(eventsByDate).flat();
  }, [eventsByDate]);

  // 1. Available Categories in current range
  const availableCategories = useMemo(() => {
    const catMap: Record<string, number> = {};
    allUnifiedEvents.forEach((ev) => {
      let inRange = false;
      if (reportRange === 'THIS_MONTH') {
        const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        inRange = ev.date.startsWith(monthPrefix);
      } else if (reportRange === 'NEXT_30_DAYS') {
        inRange = ev.date >= '2026-09-01' && ev.date <= '2026-10-31';
      } else if (reportRange === 'NEXT_90_DAYS') {
        inRange = ev.date >= '2026-08-01' && ev.date <= '2026-11-30';
      } else {
        inRange = ev.date >= customStartDate && ev.date <= customEndDate;
      }
      if (inRange && ev.categoryName) {
        catMap[ev.categoryName] = (catMap[ev.categoryName] || 0) + 1;
      }
    });

    return Object.entries(catMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [allUnifiedEvents, reportRange, year, month, customStartDate, customEndDate]);

  // 2. Events matching primary filter (Event Type or Category)
  const eventsMatchingPrimaryFilter = useMemo(() => {
    return allUnifiedEvents.filter((ev) => {
      let inRange = false;
      if (reportRange === 'THIS_MONTH') {
        const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        inRange = ev.date.startsWith(monthPrefix);
      } else if (reportRange === 'NEXT_30_DAYS') {
        inRange = ev.date >= '2026-09-01' && ev.date <= '2026-10-31';
      } else if (reportRange === 'NEXT_90_DAYS') {
        inRange = ev.date >= '2026-08-01' && ev.date <= '2026-11-30';
      } else {
        inRange = ev.date >= customStartDate && ev.date <= customEndDate;
      }
      if (!inRange) return false;

      if (filterType === 'ALL') return true;
      if (filterType.startsWith('CAT:')) {
        return ev.categoryName === filterType.slice(4);
      }
      return ev.type === filterType;
    });
  }, [allUnifiedEvents, filterType, reportRange, year, month, customStartDate, customEndDate]);

  // 3. Dynamic Secondary Filter: entities/merchants calculated from transactions matching primary filter
  const availableEntities = useMemo(() => {
    const entMap: Record<string, { name: string; count: number; amount: number }> = {};
    eventsMatchingPrimaryFilter.forEach((ev) => {
      const rawName = (ev.title || '').trim();
      if (!rawName) return;
      if (!entMap[rawName]) {
        entMap[rawName] = { name: rawName, count: 0, amount: 0 };
      }
      entMap[rawName].count += 1;
      entMap[rawName].amount += ev.amount;
    });

    return Object.values(entMap).sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
  }, [eventsMatchingPrimaryFilter]);

  // 4. Digital Breakdown Data for Pie/Bar Chart: Outflow distribution across merchants for selected event
  const merchantBreakdownData = useMemo(() => {
    const outflowEvents = eventsMatchingPrimaryFilter.filter(
      (ev) => ev.type !== 'EXPECTED_INCOME'
    );

    const map: Record<string, { name: string; amount: number; count: number }> = {};
    let totalOutflow = 0;

    outflowEvents.forEach((ev) => {
      const name = (ev.title || 'Other').trim();
      if (!map[name]) {
        map[name] = { name, amount: 0, count: 0 };
      }
      map[name].amount += ev.amount;
      map[name].count += 1;
      totalOutflow += ev.amount;
    });

    const items = Object.values(map)
      .sort((a, b) => b.amount - a.amount)
      .map((item) => ({
        ...item,
        value: item.amount,
        percentage: totalOutflow > 0 ? (item.amount / totalOutflow) * 100 : 0,
      }));

    return {
      items,
      totalOutflow,
      totalCount: outflowEvents.length,
      topMerchant: items[0] || null,
    };
  }, [eventsMatchingPrimaryFilter]);

  // 5. Final Filtered Report Events: accounts for secondary merchant filter
  const filteredReportEvents = useMemo(() => {
    if (selectedEntity === 'ALL') return eventsMatchingPrimaryFilter;
    return eventsMatchingPrimaryFilter.filter(
      (ev) => (ev.title || '').trim().toLowerCase() === selectedEntity.toLowerCase()
    );
  }, [eventsMatchingPrimaryFilter, selectedEntity]);

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

  // Projection Chart Data: Grouped day-by-day across the viewed month
  const chartData = useMemo(() => {
    const grouped: Record<string, { date: string; fullDate: string; inflow: number; outflow: number; net: number }> = {};

    filteredReportEvents.forEach((ev) => {
      const dateParts = ev.date.split('-');
      if (dateParts.length < 3) return;
      const mIdx = parseInt(dateParts[1], 10) - 1;
      const shortLabel = `${dateParts[2]} ${(monthNames[mIdx] || '').slice(0, 3)}`;

      if (!grouped[ev.date]) {
        grouped[ev.date] = { date: shortLabel, fullDate: ev.date, inflow: 0, outflow: 0, net: 0 };
      }

      const amountConverted = currency === 'INR' ? ev.amount * currentRate : ev.amount;

      if (ev.type === 'EXPECTED_INCOME') {
        grouped[ev.date].inflow += amountConverted;
      } else {
        grouped[ev.date].outflow += amountConverted;
      }

      grouped[ev.date].net = grouped[ev.date].inflow - grouped[ev.date].outflow;
    });

    return Object.values(grouped).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [filteredReportEvents, currency, currentRate, monthNames]);

  // Selected date events & Day Totals
  const selectedDateEvents = eventsByDate[selectedDateStr] || [];
  const selectedDayTotals = useMemo(() => {
    let inflowUSD = 0;
    let outflowUSD = 0;
    selectedDateEvents.forEach((ev) => {
      if (ev.type === 'EXPECTED_INCOME') inflowUSD += ev.amount;
      else outflowUSD += ev.amount;
    });
    return {
      inflowUSD,
      outflowUSD,
      netUSD: inflowUSD - outflowUSD,
    };
  }, [selectedDateEvents]);

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
    link.setAttribute('download', `LifeOS_Financial_Report_${reportRange}.csv`);
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
          <title>LifeOS - Financial & Event Planning Report</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #17365d; padding-bottom: 16px; margin-bottom: 24px; }
            .kpis { display: flex; gap: 20px; margin-bottom: 30px; }
            .kpi-card { flex: 1; padding: 16px; background: #faf8f5; border: 1px solid #e8e0d1; border-radius: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { text-align: left; padding: 10px; background: #faf8f5; border-bottom: 2px solid #e8e0d1; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; font-size: 24px; color: #17365d;">LifeOS Wealth & Event Schedule</h1>
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
        className="rounded-3xl border border-[#e8e0d1] bg-white p-3.5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-[#9e783e] text-white shadow-md shadow-[#9e783e]/25 shrink-0">
            <CalendarIcon className="h-4.5 w-4.5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              Financial Calendar & Life Events
            </h3>
            <p className="hidden sm:block text-xs text-slate-600 mt-0.5">
              Track planned expenses, SIP investments, birthdays, and medical checkups with cash flow projections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEventDate(selectedDateStr);
              setIsAddModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#9e783e] text-white text-xs font-bold shadow-md shadow-[#9e783e]/25 hover:bg-[#866632] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Event / Payment</span>
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
          {/* Active Month Alert if viewing an empty month */}
          {allUnifiedEvents.length > 0 && rangeTotals.totalInflowUSD === 0 && rangeTotals.totalOutflowUSD === 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  No entries recorded for <strong>{monthNames[month]} {year}</strong>. Active records found in <strong>{monthNames[defaultYearMonth.month]} {defaultYearMonth.year}</strong>.
                </span>
              </div>
              <button
                onClick={handleJumpToActiveMonth}
                className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 text-center"
              >
                Jump to {monthNames[defaultYearMonth.month]} {defaultYearMonth.year} →
              </button>
            </div>
          )}

          {/* Month Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e0d1]">
            <div className="flex flex-wrap items-center gap-2">
              {/* Month Selector Dropdown */}
              <select
                value={month}
                onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value, 10), 1))}
                className="rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-2.5 py-1 text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Selector Dropdown */}
              <select
                value={year}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value, 10), month, 1))}
                className="rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-2 py-1 text-xs font-bold text-slate-800 cursor-pointer focus:outline-hidden"
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                onClick={handleToday}
                className="px-2.5 py-1 rounded-lg bg-[#faf8f5] border border-[#e8e0d1] text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-[#f4efe4] transition-colors cursor-pointer"
              >
                Active Date
              </button>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-[#e8e0d1] text-slate-600 hover:text-slate-900 hover:bg-[#faf8f5] transition-colors cursor-pointer"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-[#e8e0d1] text-slate-600 hover:text-slate-900 hover:bg-[#faf8f5] transition-colors cursor-pointer"
                title="Next Month"
                aria-label="Next Month"
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
                  onClick={() => {
                    setSelectedDateStr(dateStr);
                    if (dayEvents.length > 0) setIsDateInspectorOpen(true);
                  }}
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
          className="lg:col-span-5 rounded-3xl border border-[#e8e0d1] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 w-full min-w-0 max-w-full overflow-hidden"
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
            <div className="h-64 w-full min-w-0">
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
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                Selected: {selectedDateStr}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                {selectedDateEvents.length} Items Logged
              </span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <p className="text-slate-500 text-[11px]">No obligations or transactions recorded on this date.</p>
            ) : (
              <>
                {/* Day Summary KPIs */}
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-white border border-[#e8e0d1] text-center text-[10px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Inflows</span>
                    <span className="font-mono font-bold text-emerald-700">
                      +{formatCurrency(selectedDayTotals.inflowUSD, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Outflows</span>
                    <span className="font-mono font-bold text-rose-700">
                      -{formatCurrency(selectedDayTotals.outflowUSD, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Net</span>
                    <span
                      className={`font-mono font-bold ${
                        selectedDayTotals.netUSD >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {selectedDayTotals.netUSD >= 0 ? '+' : ''}
                      {formatCurrency(selectedDayTotals.netUSD, currency)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedDateEvents.slice(0, 5).map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-white border border-[#e8e0d1]/60">
                      <div className="truncate max-w-[160px]">
                        <span className="font-bold text-slate-800 block truncate">{ev.title}</span>
                        <span className="text-[9px] text-slate-500">{ev.categoryName}</span>
                      </div>
                      <span className={`font-mono font-bold whitespace-nowrap ${ev.type === 'EXPECTED_INCOME' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {ev.type === 'EXPECTED_INCOME' ? '+' : '-'}{formatCurrency(ev.amount, currency)}
                      </span>
                    </div>
                  ))}
                  {selectedDateEvents.length > 5 && (
                    <p className="text-[10px] text-slate-500 text-center font-medium">
                      +{selectedDateEvents.length - 5} more entries on this date
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setIsDateInspectorOpen(true)}
                  className="w-full py-2 rounded-xl bg-[#17365d] hover:bg-[#204575] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🔍 View Full Day Details ({selectedDateEvents.length})</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                setEventDate(selectedDateStr);
                setIsAddModalOpen(true);
              }}
              className="w-full py-1.5 rounded-xl bg-white border border-[#e8e0d1] text-slate-700 hover:text-slate-900 hover:bg-[#f4efe4] text-xs font-bold transition-all cursor-pointer text-center"
            >
              + Add Transaction / Event to Date
            </button>
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
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredReportEvents.length}</strong> events
            </span>

            {/* Primary Filter: Event Classification or Category */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setSelectedEntity('ALL');
              }}
              className="rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-2.5 py-1 text-xs text-slate-800 font-semibold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
              title="Filter by Event Category or Classification"
            >
              <optgroup label="Event Classifications">
                <option value="ALL">All Event Types</option>
                <option value="EXPECTED_INCOME">Expected Income</option>
                <option value="PLANNED_EXPENSE">Planned Expenses & Bills</option>
                <option value="PLANNED_INVESTMENT">Planned Investments / SIP</option>
                <option value="LIFE_EVENT">Life Events & Birthdays</option>
                <option value="MEDICAL_CHECKUP">Medical Checkups</option>
              </optgroup>
              {availableCategories.length > 0 && (
                <optgroup label="Event Categories">
                  {availableCategories.map((cat) => (
                    <option key={`CAT:${cat.name}`} value={`CAT:${cat.name}`}>
                      {cat.name} ({cat.count})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Secondary Filter: Calculated dynamically from transaction data */}
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-2.5 py-1 text-xs text-slate-800 font-semibold focus:border-[#9e783e] focus:bg-white focus:outline-hidden max-w-[220px] truncate"
              title="Secondary Filter: Filter by Payee or Merchant"
            >
              <option value="ALL">All Payees / Merchants ({availableEntities.length})</option>
              {availableEntities.map((ent) => (
                <option key={ent.name} value={ent.name}>
                  {ent.name} ({ent.count}) - {formatCurrency(ent.amount, currency)}
                </option>
              ))}
            </select>

            {/* Quick Reset Merchant Tag */}
            {selectedEntity !== 'ALL' && (
              <button
                onClick={() => setSelectedEntity('ALL')}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Clear Payee filter"
              >
                <span>Merchant: {selectedEntity}</span>
                <span className="text-xs font-extrabold">×</span>
              </button>
            )}
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

        {/* ============================================================== */}
        {/* DIGITAL EXPENSE VISUALIZATION CARD (Donut / Pie & Bar Breakdown) */}
        {/* ============================================================== */}
        {merchantBreakdownData.items.length > 0 && (
          <div
            id="digital-expense-breakdown-card"
            data-testid="digital-expense-breakdown-card"
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#faf8f5] via-white to-[#faf8f5] border border-[#e8e0d1] shadow-2xs space-y-4"
          >
            {/* Card Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f0eae1]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#9e783e]/10 text-[#9e783e]">
                  <PieChartIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 font-heading">
                      Digital Expense Breakdown
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#17365d]/10 text-[#17365d]">
                      {filterType.startsWith('CAT:')
                        ? filterType.slice(4)
                        : filterType === 'ALL'
                        ? 'All Events'
                        : CALENDAR_EVENT_LABELS[filterType as CalendarEventType] || filterType}
                    </span>
                    {selectedEntity !== 'ALL' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Filtered: {selectedEntity}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Calculated in real-time from your transactions · Click any slice or merchant to isolate
                  </p>
                </div>
              </div>

              {/* Toggle: Donut Pie vs Bar Breakdown */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#e8e0d1]">
                <button
                  type="button"
                  onClick={() => setChartMode('PIE')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    chartMode === 'PIE'
                      ? 'bg-[#17365d] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PieChartIcon className="h-3.5 w-3.5" />
                  <span>Donut Pie</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('BAR')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    chartMode === 'BAR'
                      ? 'bg-[#17365d] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Bar Breakdown</span>
                </button>
              </div>
            </div>

            {/* Metric KPI Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-[#e8e0d1]">
                <span className="text-[10px] text-slate-500 font-semibold block">Total Event Outflow</span>
                <span className="font-extrabold text-sm text-rose-700 font-mono">
                  {formatCurrency(merchantBreakdownData.totalOutflow, currency)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#e8e0d1]">
                <span className="text-[10px] text-slate-500 font-semibold block">Transactions In Event</span>
                <span className="font-extrabold text-sm text-slate-800">
                  {merchantBreakdownData.totalCount} entries
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#e8e0d1]">
                <span className="text-[10px] text-slate-500 font-semibold block">Unique Entities</span>
                <span className="font-extrabold text-sm text-slate-800">
                  {merchantBreakdownData.items.length} merchants
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#e8e0d1]">
                <span className="text-[10px] text-slate-500 font-semibold block">Top Outflow Entity</span>
                <span className="font-extrabold text-xs text-[#9e783e] truncate block" title={merchantBreakdownData.topMerchant?.name}>
                  {merchantBreakdownData.topMerchant?.name || 'N/A'} (
                  {merchantBreakdownData.topMerchant?.percentage.toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Visual Canvas & Interactive Merchant Legend */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
              {/* Graphic Representation */}
              <div className="md:col-span-5 h-[220px] w-full min-w-0 relative">
                {chartMode === 'PIE' ? (
                  <div className="h-[220px] w-full min-w-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          formatter={(val: any, name: any, item: any) => [
                            `${formatCurrency(Number(val), currency)} (${item.payload.percentage.toFixed(1)}%)`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e8e0d1',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        />
                        <Pie
                          data={merchantBreakdownData.items}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          isAnimationActive={false}
                          onClick={(data) => {
                            if (data && data.name) {
                              setSelectedEntity(selectedEntity === data.name ? 'ALL' : data.name);
                            }
                          }}
                          cursor="pointer"
                        >
                          {merchantBreakdownData.items.map((entry, index) => {
                            const isSelected = selectedEntity.toLowerCase() === entry.name.toLowerCase();
                            const isDimmed = selectedEntity !== 'ALL' && !isSelected;
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                opacity={isDimmed ? 0.35 : 1}
                                stroke={isSelected ? '#17365d' : '#ffffff'}
                                strokeWidth={isSelected ? 3 : 1.5}
                              />
                            );
                          })}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outflow</span>
                      <span className="text-xs font-mono font-extrabold text-slate-900">
                        {formatCurrency(merchantBreakdownData.totalOutflow, currency)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full min-w-0" style={{ height: Math.max(160, Math.min(merchantBreakdownData.items.length, 7) * 36 + 24) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={merchantBreakdownData.items.slice(0, 7)}
                        layout="vertical"
                        margin={{ top: 6, right: 60, left: 4, bottom: 6 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0eae1" />
                        <XAxis
                          type="number"
                          hide
                          domain={[0, (dataMax: number) => Math.max(dataMax * 1.35, 10)]}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={renderBarYAxisTick}
                          width={102}
                          interval={0}
                          axisLine={{ stroke: '#e8e0d1' }}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(val: any, _name: any, item: any) => [
                            `${formatCurrency(Number(val), currency)} (${item.payload.percentage?.toFixed(1)}%)`,
                            item.payload.name || 'Outflow',
                          ]}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e8e0d1',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        />
                        <Bar
                          dataKey="amount"
                          radius={[0, 6, 6, 0]}
                          barSize={18}
                          isAnimationActive={false}
                        >
                          <LabelList
                            dataKey="amount"
                            position="right"
                            offset={8}
                            formatter={(val: any) => formatCurrency(Number(val), currency)}
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              fill: '#17365d',
                              fontFamily: 'monospace',
                            }}
                          />
                          {merchantBreakdownData.items.slice(0, 7).map((entry, index) => {
                            const isSelected = selectedEntity.toLowerCase() === entry.name.toLowerCase();
                            const isDimmed = selectedEntity !== 'ALL' && !isSelected;
                            return (
                              <Cell
                                key={`bar-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                opacity={isDimmed ? 0.35 : 1}
                                stroke={isSelected ? '#17365d' : undefined}
                                strokeWidth={isSelected ? 2 : 0}
                                onClick={() => {
                                  setSelectedEntity(selectedEntity === entry.name ? 'ALL' : entry.name);
                                }}
                                cursor="pointer"
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Interactive Legend & Merchant Slices List */}
              <div className="md:col-span-7 space-y-1.5 max-h-60 overflow-y-auto pr-1 text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-1">
                  <span>Payee / Merchant</span>
                  <span>Share • Expense Outflow</span>
                </div>
                {merchantBreakdownData.items.map((ent, idx) => {
                  const color = PIE_COLORS[idx % PIE_COLORS.length];
                  const isSelected = selectedEntity.toLowerCase() === ent.name.toLowerCase();
                  return (
                    <div
                      key={ent.name}
                      onClick={() => setSelectedEntity(isSelected ? 'ALL' : ent.name)}
                      className={`p-2 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-white border-[#17365d] shadow-xs ring-1 ring-[#17365d]'
                          : 'bg-white/60 hover:bg-white border-[#e8e0d1]'
                      }`}
                      title={`Click to filter table by ${ent.name}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className={`font-semibold truncate text-[11px] ${isSelected ? 'text-[#17365d]' : 'text-slate-800'}`}>
                          {ent.name}
                        </span>
                        <span className="text-[10px] text-slate-400">({ent.count})</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, ent.percentage)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 w-10 text-right">
                          {ent.percentage.toFixed(1)}%
                        </span>
                        <span className="font-mono font-extrabold text-[11px] text-slate-900 w-20 text-right">
                          {formatCurrency(ent.amount, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Events Schedule Card List (Thumb-friendly) */}
        <div className="sm:hidden space-y-2.5">
          {filteredReportEvents.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-medium text-xs">
              No scheduled obligations or events match the chosen date range.
            </div>
          ) : (
            filteredReportEvents.map((ev) => {
              const color = CALENDAR_EVENT_COLORS[ev.type];
              const isInflow = ev.type === 'EXPECTED_INCOME';

              return (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-2xl border border-[#e8e0d1] bg-[#faf8f5]/60 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={() => toggleEventCompleted(ev.id)}
                      className="cursor-pointer text-slate-400 hover:text-[#9e783e] transition-colors mt-0.5 shrink-0"
                      title={ev.isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                    >
                      {ev.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate">{ev.title}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 flex-wrap">
                        <span className="font-mono">{ev.date}</span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${color.badge}`}>
                          {CALENDAR_EVENT_LABELS[ev.type]}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">{ev.categoryName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono font-extrabold text-sm ${
                        isInflow ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isInflow ? '+' : '-'}
                      {formatCurrency(ev.amount, currency)}
                    </div>
                    <button
                      onClick={() => deleteCalendarEvent(ev.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer mt-0.5"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detailed Events Schedule Table */}
        <div className="hidden sm:block overflow-x-auto scrollbar-none">
          <table className="w-full min-w-[650px] text-left text-xs">
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
                        <div className="font-bold text-slate-900">
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

      {/* Date Financial Details Inspector Modal */}
      <AnimatePresence>
        {isDateInspectorOpen && (
          <div
            {...inspectorOverlayProps}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs cursor-pointer"
          >
            <motion.div
              {...inspectorContentProps}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e8e0d1] overflow-hidden flex flex-col max-h-[88vh]"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-[#e8e0d1] flex items-center justify-between bg-gradient-to-r from-[#faf8f5] to-white">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-[#9e783e]">
                      <CalendarIcon className="w-4 h-4" />
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Transactions & Events on {selectedDateStr}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Date-wise breakdown of all bank statement debits, credits, and scheduled events
                  </p>
                </div>
                <button
                  onClick={() => setIsDateInspectorOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#faf8f5] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Day Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-[#faf8f5] border-b border-[#e8e0d1] text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Day Inflow (Credits)</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-emerald-700">
                    +{formatCurrency(
                      selectedDateEvents
                        .filter((e) => e.type === 'EXPECTED_INCOME')
                        .reduce((sum, e) => sum + e.amount, 0),
                      currency
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Day Outflow (Debits)</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-rose-700">
                    -{formatCurrency(
                      selectedDateEvents
                        .filter((e) => e.type !== 'EXPECTED_INCOME')
                        .reduce((sum, e) => sum + e.amount, 0),
                      currency
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Entries</span>
                  <span className="text-sm sm:text-base font-bold font-mono text-slate-900">
                    {selectedDateEvents.length} Recorded
                  </span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-2.5 flex-1 max-h-[50vh]">
                {selectedDateEvents.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No transactions or events recorded for this date.
                  </div>
                ) : (
                  selectedDateEvents.map((ev) => {
                    const isCredit = ev.type === 'EXPECTED_INCOME';
                    return (
                      <div
                        key={ev.id}
                        className="p-3.5 rounded-2xl border border-[#e8e0d1] bg-white hover:bg-[#faf8f5]/60 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-xl text-white shrink-0 ${
                              isCredit ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {ev.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  isCredit
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-[#faf8f5] text-slate-700 border-[#e8e0d1]'
                                }`}
                              >
                                {ev.categoryName}
                              </span>
                              {ev.notes && (
                                <span className="text-[10px] text-slate-400 truncate max-w-xs">
                                  {ev.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`font-mono font-bold text-xs sm:text-sm ${
                              isCredit ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isCredit ? '+' : '-'}{formatCurrency(ev.amount, currency)}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {ev.isCompleted ? '✓ Reconciled' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#e8e0d1] bg-[#faf8f5] flex items-center justify-between">
                <button
                  onClick={() => {
                    setEventDate(selectedDateStr);
                    setIsDateInspectorOpen(false);
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#9e783e] hover:bg-[#866632] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Entry on {selectedDateStr}</span>
                </button>
                <button
                  onClick={() => setIsDateInspectorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#e8e0d1] text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Calendar Event Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div
            {...addModalOverlayProps}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs cursor-pointer"
          >
            <motion.div
              {...addModalContentProps}
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
                    placeholder="e.g. Rent Payment, Health Checkup, Scheduled Bill"
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
                      placeholder="e.g. Utilities, Housing, Personal"
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
                    placeholder="e.g. Appointment details or budget notes"
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
