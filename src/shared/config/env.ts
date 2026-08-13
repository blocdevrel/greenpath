import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Runtime env. Prefer Metro-inlined `EXPO_PUBLIC_*`; fall back to `expo.extra`
 * from app.config.js so keys still resolve after config load.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  googleMapsApiKey?: string;
  clerkPublishableKey?: string;
  apiUrl?: string;
  webUrl?: string;
  appEnv?: string;
};

const metroEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env;

/** Host running Metro (LAN IP / emulator bridge) — not usable as "localhost" on devices. */
function resolveDevMachineHost(): string | null {
  const expoConfig = Constants.expoConfig as { hostUri?: string } | null | undefined;
  const manifest2 = (Constants as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } })
    .manifest2;
  const legacyManifest = (Constants as { manifest?: { debuggerHost?: string; hostUri?: string } })
    .manifest;
  const expoGoConfig = (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig;

  const candidates = [
    expoConfig?.hostUri,
    manifest2?.extra?.expoClient?.hostUri,
    legacyManifest?.debuggerHost,
    legacyManifest?.hostUri,
    expoGoConfig?.debuggerHost,
  ];

  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    const host = raw
      .replace(/^[a-z]+:\/\//i, '')
      .split('/')[0]
      ?.split(':')[0]
      ?.trim();
    if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== '[::1]') {
      return host;
    }
  }

  // Android emulator: host loopback is 10.0.2.2
  if (Platform.OS === 'android') return '10.0.2.2';
  return null;
}

/**
 * `localhost` in EXPO_PUBLIC_API_URL only works on web / iOS simulator.
 * On a phone or Android emulator it must be the machine (or 10.0.2.2).
 */
function resolveApiUrl(configured: string): string {
  const base = configured.trim();
  if (!base) return '';

  const appEnv =
    metroEnv?.EXPO_PUBLIC_APP_ENV ?? extra.appEnv ?? 'development';
  if (appEnv === 'production') return base.replace(/\/+$/, '');

  // Windows browsers often resolve `localhost` to IPv6 (::1) while Nest
  // listens on IPv4 — that shows up as "Failed to fetch".
  if (Platform.OS === 'web') {
    return base.replace(/:\/\/localhost(?=[:/]|$)/gi, '://127.0.0.1');
  }

  const usesLoopback = /:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(base);
  if (!usesLoopback) return base;

  const host = resolveDevMachineHost();
  if (!host) return base;
  return base.replace(/localhost|127\.0\.0\.1|\[::1\]/gi, host);
}

export const env = {
  appEnv: metroEnv?.EXPO_PUBLIC_APP_ENV ?? extra.appEnv ?? 'development',
  apiUrl: resolveApiUrl(metroEnv?.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? ''),
  webUrl: (metroEnv?.EXPO_PUBLIC_WEB_URL ?? extra.webUrl ?? 'https://greenpath-delta.vercel.app').replace(
    /\/$/,
    '',
  ),
  googleMapsApiKey: metroEnv?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || extra.googleMapsApiKey || '',
  clerkPublishableKey:
    metroEnv?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || extra.clerkPublishableKey || '',
} as const;

export const isProduction = env.appEnv === 'production';

export const hasGoogleMapsKey = env.googleMapsApiKey.length > 0;
export const hasClerkKey = env.clerkPublishableKey.length > 0;
