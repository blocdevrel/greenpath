import Constants from 'expo-constants';
import { type ComponentType } from 'react';
import { Platform, StatusBar, TurboModuleRegistry, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/theme/tokens';

type BarStyle = 'auto' | 'inverted' | 'light' | 'dark';

type NativeSystemBarsProps = {
  style?: BarStyle | { statusBar?: BarStyle; navigationBar?: BarStyle };
};

type SystemBarsProps = NativeSystemBarsProps & {
  /** Solid fill behind the status bar icons. Defaults to canvas white. */
  backgroundColor?: string;
};

/**
 * SystemBars from react-native-edge-to-edge calls TurboModuleRegistry.getEnforcing
 * at import time on Android. Expo Go can crash hard if that native module is missing
 * or mismatched with the SDK — use RN StatusBar instead.
 */
function FallbackSystemBars({ style }: NativeSystemBarsProps) {
  const resolved = typeof style === 'string' ? style : (style?.statusBar ?? 'dark');
  const barStyle =
    resolved === 'light' ? 'light-content' : resolved === 'dark' ? 'dark-content' : 'default';

  return <StatusBar barStyle={barStyle} translucent backgroundColor="transparent" />;
}

function loadNativeSystemBars(): ComponentType<NativeSystemBarsProps> {
  // Expo Go: never load edge-to-edge native module (process-level crash on many devices).
  if (Constants.appOwnership === 'expo') {
    return FallbackSystemBars;
  }

  if (Platform.OS === 'android' && TurboModuleRegistry.get('RNEdgeToEdge') == null) {
    return FallbackSystemBars;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-edge-to-edge').SystemBars as ComponentType<NativeSystemBarsProps>;
  } catch {
    return FallbackSystemBars;
  }
}

const NativeSystemBars = loadNativeSystemBars();

/**
 * Icon style + a non-scrolling solid band for the status-bar safe area.
 */
export function SystemBars({ style, backgroundColor = colors.canvas.DEFAULT }: SystemBarsProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <NativeSystemBars style={style} />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor,
          zIndex: 50,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
