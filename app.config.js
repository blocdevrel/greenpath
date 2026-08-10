const appJson = require('./app.json');

// Expo loads EXPO_PUBLIC_* from .env for the JS bundle; also mirror into
// expo.extra so native/config consumers (and env.ts fallback) see the key.
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra ?? {}),
      googleMapsApiKey,
    },
  },
};
