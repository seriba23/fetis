const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
export const UPLOADS_BASE = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4001';

type FetchInit = Omit<RequestInit, 'body'> & { body?: any };

class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fetis-access-token');
}

export async function apiFetch<T = any>(path: string, init: FetchInit = {}): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: Record<string, string> = {
    ...((init.headers as Record<string, string>) || {}),
  };

  const isFormData = init.body instanceof FormData;
  const body = init.body != null && !isFormData ? JSON.stringify(init.body) : init.body;
  if (init.body != null && !isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body,
    cache: (init as any).cache ?? 'no-store',
  });
  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
  if (!res.ok) {
    const message = (isJson && data?.message) || `Error ${res.status}`;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message, data);
  }
  return data as T;
}

export const publicApi = {
  gallery: (category?: string, limit?: number) =>
    apiFetch<any[]>(`/public/gallery${category ? `?category=${category}` : ''}${limit ? `${category ? '&' : '?'}limit=${limit}` : ''}`),
  categories: () => apiFetch<any[]>('/public/gallery-categories'),
  furnitureTypes: () => apiFetch<any[]>('/public/furniture-types'),
  business: () => apiFetch<Record<string, string>>('/public/business'),
  contact: (data: any) => apiFetch<{ ok: boolean; message: string }>('/public/contact', { method: 'POST', body: data }),
};

export { ApiError };
