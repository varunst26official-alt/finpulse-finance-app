# SubscriptionManager – Pending Items

**Date:** 2026-10-30
**Component:** `src/components/finance/SubscriptionManager.tsx`
**Status:** Incomplete. The file is a partial scaffold and does not compile.

---

## 1. Current State

| Item | State |
|---|---|
| `SubscriptionManager.tsx` | Untracked. Only lines 1–53 exist (imports, props, state, filter/total logic, `saveSubscription`). The component has **no `return`, no closing `};` and no JSX**. |
| `src/stores/preferencesStore.ts` | Untracked. Provides `autoDetectionEnabled` and `setAutoDetectionEnabled`. Done. |
| `financeStore.ts` | Already has `addSubscription`, `deleteSubscription`, `updateSubscription` and `markSubscriptionPaid(id, paidDate?)`. Also declares `detectRecurringExpenses`. |
| `types/finance.ts` | `Subscription`, `SubscriptionStatus` and `BillingCycle` exist. |
| `fix-subscription.ps1` | Untracked leftover helper script (see R2). |
| Usage | **Nothing imports `SubscriptionManager`.** It is not reachable from the UI. |

Reference type (`src/types/finance.ts`):

```ts
export interface Subscription {
  id: string; name: string; category: ExpenseCategory; amount: number; // USD base
  currency: Currency; billingCycle: BillingCycle; nextDueDate: string; // YYYY-MM-DD
  lastPaidDate?: string; paymentMethod: PaymentMethod; status: SubscriptionStatus;
  platform?: string; notes?: string; autoDetected: boolean; createdAt: string;
}
```

---

## 2. Pending Items

Priority: **P0** = blocks compile or render, **P1** = needed for a working feature, **P2** = cleanup and polish.

### P0 – Blocking

| # | Item | Details |
|---|---|---|
| P0-1 | Finish the component body | Add the `return (...)` JSX and close the component with `};`. Parts to build: header with an "Add Subscription" button, search input, tabs (All / Active / Expired), monthly-recurring total, list or empty state, and the auto-detection toggle. |
| P0-2 | Build `SubscriptionCard` | Show name, billing cycle, category label (`EXPENSE_CATEGORY_LABELS`), amount, status badge and next due date. Actions: Edit, Delete, Mark Paid. |
| P0-3 | Build `SubscriptionForm` | Create and edit modal. Fields: name, category, amount, currency, billing cycle, payment method, next due date, platform, notes. |
| P0-4 | Wire the form into the manager | Render the form when `showCreateModal` or `editingSub` is set. Pass `onSave={saveSubscription}` and `onClose={closeEditingModal}`. The state and handlers already exist but nothing uses them yet. |
| P0-5 | Fix invalid imports | `CloseCircle`, `Edit`, `Trash` and others are not valid lucide names or are not imported. See section 3. |

### P1 – Functional

| # | Item | Details |
|---|---|---|
| P1-1 | Mount the component | Import it and add an entry point (button or tab) in `src/components/finance/FinanceWorkspace.tsx`. Pass `isOpen` and `onClose`. |
| P1-2 | Use real data on save | `addSubscription` takes `Omit<Subscription,'id'>`, so `createdAt` is required. Check `financeStore.ts` around line 677 to confirm it sets `createdAt`. If it doesn't, set it in `saveSubscription`. |
| P1-3 | Mark Paid | `markSubscriptionPaid(id, paidDate?)` accepts a date. Use one clear control (a button, or a date picker). Don't call it from every `<select>` change. |
| P1-4 | Currency display | Amounts are stored in USD base. Use `formatCurrency` from `@/utils/formatters` instead of hard-coded `$`. |
| P1-5 | Auto-detect | Wire `detectRecurringExpenses()` and the `autoDetectionEnabled` toggle. Copy the toggle markup from `SmartIngestionHubModal.tsx` (about lines 890–900). |
| P1-6 | Form validation | Require a non-empty name and `amount > 0`. Default `nextDueDate` to today when it is empty. |
| P1-7 | Delete confirmation | Ask for confirmation before `deleteSubscription`. |

### P2 – Cleanup and Polish

| # | Item | Details |
|---|---|---|
| P2-1 | Unused imports | Remove `useRef`, `useEffect`, `motion`, `IncomeCategory`, `ExpenseCategory`, `PaymentMethod`, `SubscriptionStatus`, `BillingCycle` and the unused lucide icons. Keep only what the JSX uses. |
| P2-2 | Unused variables | `totalMonthlyRecurring`, `autoDetectionEnabled` and `setAutoDetectionEnabled` are currently unused. Display them or remove them. |
| P2-3 | UTF-8 BOM | Line 1 starts with an invisible BOM. Strip it. |
| P2-4 | Weekly, quarterly and yearly totals | The total only counts `MONTHLY`. Normalise other cycles to a monthly equivalent (weekly ×52/12, quarterly ÷3, yearly ÷12). |
| P2-5 | Expired tab semantics | "Expired" currently means `status !== 'ACTIVE'`, which includes PAUSED and CANCELLED. Rename the tab ("Inactive") or filter to `EXPIRED`. |
| P2-6 | Styling consistency | Match the rest of the app: cream and gold tokens such as `#faf8f5`, `#e8e0d1`, `#9e783e`, as in `AddTransactionModal.tsx`. The earlier draft used indigo and purple gradients. |
| P2-7 | Accessibility | Add `aria-label` to icon-only buttons and `htmlFor`/`id` on form labels and inputs. |

---

## 3. Known Defects in the Earlier Draft

The previous draft (written in chat, not saved to disk) had these bugs. Don't reuse it as-is.

| Defect | Fix |
|---|---|
| `className` followed by a template literal, with no `=` or `{}` | `className={\`...\`}` |
| `"w-8 h-8 rounded-bg ${statusColor} ..."` is a plain string, so `${}` is not interpolated. `rounded-bg` is also not a Tailwind class. | Use a template literal in `{}` and `rounded-lg` |
| `CloseCircle` is not exported by lucide-react 1.61 (verified), so the import fails | Use `XCircle` or `CircleX` (both exist) |
| `Edit` is used in `SubscriptionCard` but missing from the import list | Import `Pencil` (verified), or `Edit2` |
| `Trash` is imported, but the rest of the app and lucide convention use `Trash2` | Optional: switch to `Trash2` (verified). `Trash` also exists. |
| Typo `HEALTHCARE_INSORANCE` | Correct key is `HEALTHCARE_INSURANCE` |
| Category list hard-coded in the form | Use `Object.entries(EXPENSE_CATEGORY_LABELS)`, as `AddTransactionModal.tsx` does |
| Payment method list hard-coded | Use `PAYMENT_METHOD_LABELS` from `formatters.ts` |
| `SubscriptionCard` and `SubscriptionForm` defined inside `SubscriptionManager` | Move them to module level. Otherwise they remount on every render, and form inputs lose focus. |
| Form `handleSave` calls `onSave` then `onClose`, but `saveSubscription` already closes the modal | Call only `onSave` |
| Form state is initialised from `initialData` once | Render it with `key={editingSub?.id ?? 'new'}` so it resets between records |
| `<select onChange={onMarkPaid}>` fires on any option, including the blank placeholder, and duplicates the Mark Paid button | One control only (P1-3) |

---

## 4. Related Issues Found in the Repo

| # | File | Issue |
|---|---|---|
| R1 | `src/types/finance.ts` lines 404 and 440 | `BillingCycle` is exported twice. This is a duplicate-identifier TypeScript error. Remove one declaration. Check this before anything else. |
| R2 | `fix-subscription.ps1` | Stray script. `-replace` uses regex, so `"bg-[#16836b]"` is treated as a character class and would corrupt the file. It also rewrites every `OTHER_EXPENSE` to `ENTERTAINMENT_SUBS`. **Delete it. Do not run it.** |
| R3 | `quantra_product_demo_30s.webm` | Untracked binary in the repo root. Unrelated to this task. Decide whether to commit it, ignore it or delete it. |

---

## 5. Suggested Implementation Order

1. Resolve R1 (duplicate `BillingCycle`) and delete the script (R2).
2. Rewrite the file's header and imports (P0-5, P2-1, P2-3).
3. Add `SubscriptionCard` at module level (P0-2).
4. Add `SubscriptionForm` at module level (P0-3, P1-6).
5. Complete the manager's `return` and wire the form (P0-1, P0-4, P1-3, P1-4, P1-7).
6. Add the auto-detect toggle and totals (P1-5, P2-2, P2-4, P2-5).
7. Mount in `FinanceWorkspace.tsx` (P1-1).
8. Style and accessibility pass (P2-6, P2-7).

**Editing note:** Large single edits time out (the editor limit is about 6000 characters per call). Earlier attempts to write the file through PowerShell here-strings also failed on quoting. Append in chunks of 6000 characters or fewer with the `editor` tool and `insert_line`. Re-read the file after each chunk to get the correct next line number.


---

## 6. Verification Checklist

- [ ] `npx tsc -b` passes with no errors in `SubscriptionManager.tsx` or `types/finance.ts`. There is no separate typecheck script. `npm run build` runs `tsc -b && vite build`.
- [ ] `npm run lint` (oxlint) reports no unused imports or variables.
- [ ] `npm run build` succeeds.
- [ ] Manual: open the modal, then add, edit, mark paid and delete a subscription. Check that the search and tab filters work and that the data persists after a reload.
- [ ] Manual: Esc and overlay click close the modal. The form modal does not close the parent unexpectedly.
- [ ] Manual: amounts display correctly after switching currency.

