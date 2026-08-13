const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** Standard Expo + NativeWind Metro config (no OneDrive workarounds). */
const config = getDefaultConfig(__dirname);

const mediapipeShim = path.resolve(__dirname, 'src/shims/mediapipe-tasks-vision.js');
const defaultResolve = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === '@mediapipe/tasks-vision') {
    return { filePath: mediapipeShim, type: 'sourceFile' };
  }
  if (defaultResolve) {
    return defaultResolve(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
