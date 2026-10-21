import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || extra?.apiUrl || 'http://localhost:8000/api';

type RequestOptions = {
  method?: string;
  token?: string;
  tenantId?: string;
  branchId?: string;
  body?: unknown;
};

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.tenantId) headers['x-tenant-id'] = options.tenantId;
  if (options.branchId) headers['x-branch-id'] = options.branchId;

  const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`, {
    method: options.method || (options.body ? 'POST' : 'GET'),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error((errBody as { message?: string }).message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function v1Health() {
  return apiRequest<{ ok: boolean; phase: number }>('/v1/health');
}
