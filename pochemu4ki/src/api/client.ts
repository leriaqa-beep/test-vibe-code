const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'auth_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.error || 'Ошибка', code: data.code };
  return data as T;
}

export const api = {
  auth: {
    me: () => request<import('../types').User>('/auth/me'),
  },

  children: {
    list: () => request<import('../types').ChildProfile[]>('/children'),
    create: (data: Partial<import('../types').ChildProfile>) =>
      request<import('../types').ChildProfile>('/children', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<import('../types').ChildProfile>) =>
      request<import('../types').ChildProfile>(`/children/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/children/${id}`, { method: 'DELETE' }),
  },

  stories: {
    list: (childId?: string) =>
      request<import('../types').Story[]>(`/stories${childId ? `?childId=${childId}` : ''}`),
    get: (id: string) => request<import('../types').Story>(`/stories/${id}`),
    generate: (childId: string, question: string, context: string) =>
      request<import('../types').Story>('/stories/generate', {
        method: 'POST',
        body: JSON.stringify({ childId, question, context }),
      }),
    update: (id: string, data: { isSaved?: boolean; rating?: number }) =>
      request<import('../types').Story>(`/stories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/stories/${id}`, { method: 'DELETE' }),
  },

  users: {
    activatePremium: () =>
      request<{ success: boolean; message: string }>('/users/activate-premium', { method: 'POST' }),
    subscriptionStatus: () =>
      request<{ isPremium: boolean; storiesUsed: number; freeLimit: number }>('/users/subscription-status'),
    deleteAccount: () =>
      request<{ success: boolean }>('/users/me', { method: 'DELETE' }),
  },
};
