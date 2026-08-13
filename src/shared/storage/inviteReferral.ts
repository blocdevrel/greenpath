import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const STORAGE_KEY = 'greenpath.invite.ref.v1';

let memoryRef: string | null = null;

function normalizeCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  return code.length >= 3 ? code : null;
}

/** Pull invite code from a full URL or query string. */
export function parseInviteCodeFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = Linking.parse(url);
    const q = parsed.queryParams ?? {};
    const fromQuery =
      (typeof q.ref === 'string' && q.ref) ||
      (typeof q.invite === 'string' && q.invite) ||
      (typeof q.code === 'string' && q.code) ||
      null;
    if (fromQuery) return normalizeCode(fromQuery);

    // /join/GPABCDEF or path containing join
    const path = (parsed.path || '').replace(/^\/+/, '');
    const joinMatch = path.match(/^join\/([^/?#]+)/i);
    if (joinMatch?.[1]) return normalizeCode(joinMatch[1]);
  } catch {
    /* ignore */
  }

  // Fallback for web absolute URLs Linking.parse can miss
  try {
    if (/^https?:\/\//i.test(url)) {
      const u = new URL(url);
      const q = u.searchParams.get('ref') || u.searchParams.get('invite');
      if (q) return normalizeCode(q);
      const m = u.pathname.match(/\/join\/([^/]+)/i);
      if (m?.[1]) return normalizeCode(m[1]);
    }
  } catch {
    /* ignore */
  }

  return null;
}

export async function rememberInviteCode(code: string | null | undefined): Promise<void> {
  const normalized = normalizeCode(code);
  memoryRef = normalized;
  try {
    if (normalized) await AsyncStorage.setItem(STORAGE_KEY, normalized);
    else await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode */
  }
}

export async function readInviteCode(): Promise<string | null> {
  if (memoryRef) return memoryRef;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    memoryRef = normalizeCode(stored);
    return memoryRef;
  } catch {
    return null;
  }
}

/** Capture ?ref= / /join/CODE from the current web location or cold-start deep link. */
export async function captureInviteFromLaunch(): Promise<string | null> {
  let found: string | null = null;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    found = parseInviteCodeFromUrl(window.location.href);
    if (found) {
      // Keep URL shareable but drop query clutter after capture
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('ref') || url.searchParams.has('invite')) {
          url.searchParams.delete('ref');
          url.searchParams.delete('invite');
          url.searchParams.delete('code');
          window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
        }
      } catch {
        /* ignore */
      }
    }
  }

  if (!found) {
    try {
      const initial = await Linking.getInitialURL();
      found = parseInviteCodeFromUrl(initial);
    } catch {
      /* ignore */
    }
  }

  if (found) await rememberInviteCode(found);
  return found ?? (await readInviteCode());
}
