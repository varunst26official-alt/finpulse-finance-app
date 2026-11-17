import { getApiBaseCandidates } from './apiClient';

async function fetchFromAiEndpoint<T>(endpoint: string, body: any): Promise<T> {
  const candidates = getApiBaseCandidates();
  let lastError: Error | null = null;

  for (const base of candidates) {
    try {
      const url = `${base}/ai/${endpoint.replace(/^\//, '')}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return json.data;
        }
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  // Fallback direct relative path for web
  const fallbackUrl = `/api/ai/${endpoint.replace(/^\//, '')}`;
  const res = await fetch(fallbackUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.success) return json.data;
  throw lastError || new Error(`Failed to call AI endpoint: ${endpoint}`);
}

export const aiService = {
  /**
   * Parse a physical receipt or bill
   */
  async parseBill(rawText: string) {
    return fetchFromAiEndpoint<any>('parse-bill', { rawText });
  },

  /**
   * Parse a bank or credit card statement text
   */
  async parseStatement(statementText: string) {
    return fetchFromAiEndpoint<any>('parse-statement', { statementText });
  },

  /**
   * Generate personalized fitness and meal plan
   */
  async getFitnessPlan(profile: {
    weightKg: number;
    heightCm: number;
    age: number;
    gender?: string;
    activityLevel?: string;
    goal?: string;
    dietaryPreference?: string;
    allergies?: string[];
    daysPerWeek?: number;
  }) {
    return fetchFromAiEndpoint<any>('fitness-plan', profile);
  },

  /**
   * Interact with the Quantra AI Co-pilot
   */
  async askCopilot(message: string, userContext?: any) {
    return fetchFromAiEndpoint<any>('copilot', { message, userContext });
  },
};
