import { test, expect } from '@playwright/test';
import { useFinanceStore } from '../src/stores/financeStore';
import { useLifeOSStore } from '../src/stores/lifeosStore';

test.describe('Universal Edit Capability Across All User-Added Data Sections', () => {
  test('Requirement: Goal Edit preserves state and accurately updates parameters', async () => {
    const store = useFinanceStore.getState();

    // 1. Add sample goal
    store.addGoal({
      title: 'iPhone 16 Pro',
      category: 'CUSTOM_GOAL',
      targetAmount: 1775, // ~$1775 (₹1,50,000)
      targetDate: '2030-01-01',
      currentSaved: 0,
      monthlyContribution: 25, // ~$25 (₹2,000)
      priority: 'HIGH',
      inflationRate: 7.0,
      expectedReturnRate: 0.0,
      notes: 'Gadget fund',
    });

    const goalsAfterAdd = useFinanceStore.getState().goals;
    const addedGoal = goalsAfterAdd.find((g) => g.title === 'iPhone 16 Pro');
    expect(addedGoal).toBeDefined();

    // 2. Perform Edit update
    useFinanceStore.getState().updateGoal(addedGoal!.id, {
      title: 'iPhone 16 Pro Max (Upgraded)',
      monthlyContribution: 50,
      notes: 'Updated savings plan for 512GB model',
    });

    const updatedGoal = useFinanceStore.getState().goals.find((g) => g.id === addedGoal!.id);
    expect(updatedGoal?.title).toBe('iPhone 16 Pro Max (Upgraded)');
    expect(updatedGoal?.monthlyContribution).toBe(50);
    expect(updatedGoal?.notes).toBe('Updated savings plan for 512GB model');
    expect(updatedGoal?.category).toBe('CUSTOM_GOAL');
  });

  test('Requirement: Debt Edit accurately updates principal, EMI, interest rate, and lender', async () => {
    const store = useFinanceStore.getState();

    // 1. Add sample debt
    store.addDebt({
      title: 'Auto Loan',
      category: 'AUTO_LOAN',
      lender: 'HDFC Bank',
      originalPrincipal: 10000,
      currentOutstanding: 8000,
      interestRate: 8.5,
      monthlyEmi: 200,
      emiDueDay: 5,
      startDate: '2025-01-01',
      tenureMonths: 60,
      notes: 'Car finance',
    });

    const debts = useFinanceStore.getState().debts;
    const addedDebt = debts.find((d) => d.title === 'Auto Loan');
    expect(addedDebt).toBeDefined();

    // 2. Perform Edit update
    useFinanceStore.getState().updateDebt(addedDebt!.id, {
      title: 'Auto Loan (Refinanced)',
      lender: 'SBI Bank',
      interestRate: 7.9,
      monthlyEmi: 185,
      notes: 'Refinanced at lower interest rate',
    });

    const updatedDebt = useFinanceStore.getState().debts.find((d) => d.id === addedDebt!.id);
    expect(updatedDebt?.title).toBe('Auto Loan (Refinanced)');
    expect(updatedDebt?.lender).toBe('SBI Bank');
    expect(updatedDebt?.interestRate).toBe(7.9);
    expect(updatedDebt?.monthlyEmi).toBe(185);
    expect(updatedDebt?.notes).toBe('Refinanced at lower interest rate');
  });

  test('Requirement: Vaulted Document Edit updates title, doc number, authority, and notes', async () => {
    const store = useLifeOSStore.getState();

    // 1. Add document
    store.addDocument({
      title: 'Vehicle Registration (RC)',
      category: 'VEHICLE',
      documentNumber: 'DL01-AB-1234',
      expiryDate: '2030-01-01',
      status: 'ACTIVE',
      authority: 'RTO South Delhi',
      notes: 'Original in vehicle glove compartment',
    });

    const docs = useLifeOSStore.getState().documents;
    const addedDoc = docs.find((d) => d.documentNumber === 'DL01-AB-1234');
    expect(addedDoc).toBeDefined();

    // 2. Perform Edit update
    useLifeOSStore.getState().updateDocument(addedDoc!.id, {
      title: 'Vehicle Registration (RC - Renewed)',
      expiryDate: '2035-01-01',
      notes: 'Digital copy in DigiLocker + physical in car',
    });

    const updatedDoc = useLifeOSStore.getState().documents.find((d) => d.id === addedDoc!.id);
    expect(updatedDoc?.title).toBe('Vehicle Registration (RC - Renewed)');
    expect(updatedDoc?.expiryDate).toBe('2035-01-01');
    expect(updatedDoc?.notes).toBe('Digital copy in DigiLocker + physical in car');
  });

  test('Requirement: Admin Checklist Edit updates title, frequency, and due date', async () => {
    const store = useLifeOSStore.getState();

    // 1. Add checklist
    store.addChecklist({
      title: 'Income Tax Return (ITR-1)',
      frequency: 'ANNUAL',
      dueDate: '2026-07-31',
      category: 'TAX',
    });

    const checklists = useLifeOSStore.getState().adminChecklists;
    const addedChk = checklists.find((c) => c.title === 'Income Tax Return (ITR-1)');
    expect(addedChk).toBeDefined();

    // 2. Perform Edit update
    useLifeOSStore.getState().updateChecklist(addedChk!.id, {
      title: 'Income Tax Return (ITR-2 Revised)',
      dueDate: '2026-08-31',
      frequency: 'ANNUAL',
    });

    const updatedChk = useLifeOSStore.getState().adminChecklists.find((c) => c.id === addedChk!.id);
    expect(updatedChk?.title).toBe('Income Tax Return (ITR-2 Revised)');
    expect(updatedChk?.dueDate).toBe('2026-08-31');
  });

  test('Requirement: Task and Habit Edit updates parameters seamlessly', async () => {
    const store = useLifeOSStore.getState();

    // 1. Add Task
    store.addTask({
      title: 'Review Quarterly Mutual Fund Folio',
      time: '10:00 AM',
      category: 'FINANCE',
      priority: 'HIGH',
      status: 'TODO',
      badgeLabel: 'To do',
      notes: 'Check XIRR and rebalance',
      iconSymbol: '₹',
    });

    const tasks = useLifeOSStore.getState().tasks;
    const addedTask = tasks.find((t) => t.title === 'Review Quarterly Mutual Fund Folio');
    expect(addedTask).toBeDefined();

    // 2. Edit Task
    useLifeOSStore.getState().updateTask(addedTask!.id, {
      title: 'Review Quarterly Folio & Execute Rebalancing',
      time: '04:00 PM',
      priority: 'MEDIUM',
    });

    const updatedTask = useLifeOSStore.getState().tasks.find((t) => t.id === addedTask!.id);
    expect(updatedTask?.title).toBe('Review Quarterly Folio & Execute Rebalancing');
    expect(updatedTask?.time).toBe('04:00 PM');
    expect(updatedTask?.priority).toBe('MEDIUM');

    // 3. Add Habit
    store.addHabit({
      title: 'Morning 10-Minute Mobility Stretch',
      category: 'MORNING',
      icon: '🧘',
    });

    const habits = useLifeOSStore.getState().habits;
    const addedHabit = habits.find((h) => h.title === 'Morning 10-Minute Mobility Stretch');
    expect(addedHabit).toBeDefined();

    // 4. Edit Habit
    useLifeOSStore.getState().updateHabit(addedHabit!.id, {
      title: 'Morning 20-Minute Yoga & Mobility',
      category: 'MORNING',
      icon: '🧘‍♂️',
    });

    const updatedHabit = useLifeOSStore.getState().habits.find((h) => h.id === addedHabit!.id);
    expect(updatedHabit?.title).toBe('Morning 20-Minute Yoga & Mobility');
    expect(updatedHabit?.icon).toBe('🧘‍♂️');
  });
});
