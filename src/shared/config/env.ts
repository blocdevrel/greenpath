import Constants from 'expo-constants';

/**
 * Runtime env. Prefer Metro-inlined `EXPO_PUBLIC_*`; fall back to `expo.extra`
 * from app.config.js so the Maps key still resolves after config load.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  googleMapsApiKey?: string;
};

const metroEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env;

export const env = {
  appEnv: metroEnv?.EXPO_PUBLIC_APP_ENV ?? 'development',
  apiUrl: metroEnv?.EXPO_PUBLIC_API_URL ?? '',
  googleMapsApiKey: metroEnv?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || extra.googleMapsApiKey || '',
} as const;

export const hasGoogleMapsKey = env.googleMapsApiKey.length > 0;
