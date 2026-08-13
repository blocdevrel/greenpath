const appJson = require('./app.json');

// Expo loads EXPO_PUBLIC_* from .env for the JS bundle; also mirror into
// expo.extra so native/config consumers (and env.ts fallback) see the keys.
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
const webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://greenpath-delta.vercel.app';
const appEnv = process.env.EXPO_PUBLIC_APP_ENV || 'development';

const basePlugins = appJson.expo.plugins ?? [];
const plugins = [
  ...basePlugins,
  'expo-secure-store',
  'expo-web-browser',
  'expo-sharing',
  '@clerk/expo',
];

module.exports = {
  expo: {
    ...appJson.expo,
    plugins,
    extra: {
      ...(appJson.expo.extra ?? {}),
      googleMapsApiKey,
      clerkPublishableKey,
      apiUrl,
      webUrl,
      appEnv,
    },
  },
};
