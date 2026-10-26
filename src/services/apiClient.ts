import {
  Asset,
  Transaction,
  DebtItem,
  InsurancePolicy,
  GoalItem,
  CalendarEvent,
  Currency,
} from '@/types/finance';
import { UserProfile } from '@/stores/authStore';

const API_BASE = '/api';
const TOKEN_KEY = 'finpulse_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to update auth token in storage:', err);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth Endpoints
  auth: {
    login: async (email: string, password: string): Promise<{ success: boolean; user: UserProfile; token: string }> => {
      const res = await request<{ success: boolean; user: UserProfile; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },

    register: async (data: {
      fullName: string;
      email: string;
      password: string;
      phoneNumber?: string;
    }): Promise<{ success: boolean; user: UserProfile; token: string }> => {
      const res = await request<{ success: boolean; user: UserProfile; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },

    demo: async (): Promise<{ success: boolean; user: UserProfile; token: string }> => {
      const res = await request<{ success: boolean; user: UserProfile; token: string }>('/auth/demo', {
        method: 'POST',
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },

    me: async (): Promise<{ success: boolean; user: UserProfile & { currency: Currency; emergencyTargetMonths: number } }> => {
      return request('/auth/me');
    },

    logout: () => {
      setStoredToken(null);
    },
  },

  // Portfolio & Wealth Synchronization
  portfolio: {
    fetchData: async (): Promise<{
      success: boolean;
      data: {
        assets: Asset[];
        transactions: Transaction[];
        debts: DebtItem[];
        policies: InsurancePolicy[];
        goals: GoalItem[];
        calendarEvents: CalendarEvent[];
        currency: Currency;
        emergencyTargetMonths: number;
      };
    }> => {
      return request('/portfolio/data');
    },

    addAsset: async (asset: Partial<Asset>): Promise<{ success: boolean; assetId: string }> => {
      return request('/portfolio/assets', {
        method: 'POST',
        body: JSON.stringify(asset),
      });
    },

    deleteAsset: async (id: string): Promise<{ success: boolean }> => {
      return request(`/portfolio/assets/${id}`, {
        method: 'DELETE',
      });
    },

    resetToFresh: async (): Promise<{ success: boolean; message: string }> => {
      return request('/portfolio/reset', {
        method: 'POST',
      });
    },

    seedDemo: async (): Promise<{ success: boolean; message: string }> => {
      return request('/portfolio/seed-demo', {
        method: 'POST',
      });
    },
  },

  // Transactions
  transactions: {
    create: async (tx: Partial<Transaction>): Promise<{ success: boolean; transactionId: string }> => {
      return request('/transactions', {
        method: 'POST',
        body: JSON.stringify(tx),
      });
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return request(`/transactions/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Debts & Repayments
  debts: {
    create: async (debt: Partial<DebtItem>): Promise<{ success: boolean; debtId: string }> => {
      return request('/debts', {
        method: 'POST',
        body: JSON.stringify(debt),
      });
    },

    repay: async (
      debtId: string,
      payload: { amount: number; date?: string; type?: string; notes?: string }
    ): Promise<{ success: boolean; repaymentId: string; newOutstandingBalance: number }> => {
      return request(`/debts/${debtId}/repay`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return request(`/debts/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Insurance Policies
  policies: {
    create: async (policy: Partial<InsurancePolicy>): Promise<{ success: boolean; policyId: string }> => {
      return request('/policies', {
        method: 'POST',
        body: JSON.stringify(policy),
      });
    },

    update: async (id: string, payload: Partial<InsurancePolicy>): Promise<{ success: boolean }> => {
      return request(`/policies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return request(`/policies/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Goals
  goals: {
    create: async (goal: Partial<GoalItem>): Promise<{ success: boolean; goalId: string }> => {
      return request('/goals', {
        method: 'POST',
        body: JSON.stringify(goal),
      });
    },

    contribute: async (id: string, amount: number): Promise<{ success: boolean; newSaved: number; isAchieved: boolean }> => {
      return request(`/goals/${id}/contribute`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return request(`/goals/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Financial Calendar
  calendar: {
    create: async (event: Partial<CalendarEvent>): Promise<{ success: boolean; eventId: string }> => {
      return request('/calendar', {
        method: 'POST',
        body: JSON.stringify(event),
      });
    },

    toggle: async (id: string): Promise<{ success: boolean }> => {
      return request(`/calendar/${id}/toggle`, {
        method: 'PUT',
      });
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return request(`/calendar/${id}`, {
        method: 'DELETE',
      });
    },
  },
};
