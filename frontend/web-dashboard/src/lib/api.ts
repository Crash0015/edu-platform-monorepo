import { getAccessToken } from './auth';

const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000';

export type ApiError = {
  message?: string;
  details?: string[];
};

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const url = `${gatewayUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const errorPayload = payload as ApiError | string;
    const message = typeof errorPayload === 'string' ? errorPayload : errorPayload.message || 'Request failed';
    const details = typeof errorPayload === 'string' ? [] : errorPayload.details || [];
    throw new Error(details.length ? `${message}: ${details.join(', ')}` : message);
  }

  return payload as T;
};

export const apiFetchAuth = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Sesión no encontrada.');
  }
  return apiFetch<T>(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
};

export const apiFetchAuthForm = async <T>(path: string, formData: FormData, options: RequestInit = {}): Promise<T> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Sesión no encontrada.');
  }
  const url = `${gatewayUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...options,
    method: options.method || 'POST',
    body: formData,
    credentials: 'include',
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const errorPayload = payload as ApiError | string;
    const message = typeof errorPayload === 'string' ? errorPayload : errorPayload.message || 'Request failed';
    const details = typeof errorPayload === 'string' ? [] : errorPayload.details || [];
    throw new Error(details.length ? `${message}: ${details.join(', ')}` : message);
  }

  return payload as T;
};
