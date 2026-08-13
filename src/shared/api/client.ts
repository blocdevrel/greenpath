import { Platform } from 'react-native';

import { env } from '@/shared/config/env';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type TokenGetter = () => Promise<string | null | undefined>;

let tokenGetter: TokenGetter | null = null;

/** Register Clerk `getToken` so all API calls send a Bearer JWT. */
export function setApiTokenGetter(getter: TokenGetter | null) {
  tokenGetter = getter;
}

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export { joinUrl };

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const base = env.apiUrl.trim();
  if (!base) {
    throw new ApiError(
      'EXPO_PUBLIC_API_URL is not set. Point it at greenserver (e.g. http://localhost:3001/api/v1).',
      0,
    );
  }

  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    } catch {
      // Clerk refresh can fail offline; still attempt the API call.
    }
  }

  const url = joinUrl(base, path);
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'network error';
    const loopbackHint =
      Platform.OS !== 'web' && /localhost|127\.0\.0\.1/i.test(url)
        ? ' On a phone, use your PC LAN IP (same Wi‑Fi as Metro) in EXPO_PUBLIC_API_URL, or restart Expo so localhost auto-rewrites.'
        : '';
    throw new ApiError(
      `Can’t reach ${url} (${detail}). Is greenserver running?${loopbackHint}`,
      0,
      err,
    );
  }
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      typeof data === 'object' &&
      data &&
      'message' in data &&
      (typeof (data as { message: unknown }).message === 'string' ||
        Array.isArray((data as { message: unknown }).message))
        ? Array.isArray((data as { message: unknown }).message)
          ? ((data as { message: string[] }).message).join(', ')
          : String((data as { message: string }).message)
        : `Request failed (${res.status})`;
    const friendly =
      res.status === 404 && /Cannot (GET|POST|PATCH|PUT|DELETE)/i.test(msg)
        ? 'This feature is not available on the server yet. Please try again after the API updates.'
        : msg;
    throw new ApiError(friendly, res.status, data);
  }

  return data as T;
}
