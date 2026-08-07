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
 * at import time on Android. Expo Go builds that omit RNEdgeToEdge (e.g. store
 * builds lagging an SDK release) then crash before the tree mounts.
 *
 * Prefer the real SystemBars when the native module is present; otherwise fall
 * back to RN StatusBar so development can continue.
 */
function FallbackSystemBars({ style }: NativeSystemBarsProps) {
  const resolved = typeof style === 'string' ? style : (style?.statusBar ?? 'dark');
  const barStyle =
    resolved === 'light' ? 'light-content' : resolved === 'dark' ? 'dark-content' : 'default';

  return <StatusBar barStyle={barStyle} translucent backgroundColor="transparent" />;
}

function loadNativeSystemBars(): ComponentType<NativeSystemBarsProps> {
  if (Platform.OS === 'android' && TurboModuleRegistry.get('RNEdgeToEdge') == null) {
    return FallbackSystemBars;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports -- gated require avoids Android getEnforcing crash
  return require('react-native-edge-to-edge').SystemBars as ComponentType<NativeSystemBarsProps>;
}

const NativeSystemBars = loadNativeSystemBars();

/**
 * Icon style + a non-scrolling solid band for the status-bar safe area.
 * Edge-to-edge makes the native bar translucent; without this band, scrolling
 * content shows through behind the clock and battery.
 */
export function SystemBars({ style, backgroundColor = colors.canvas.DEFAULT }: SystemBarsProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <NativeSystemBars style={style} />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor,
          zIndex: 50,
        }}
      />
    </>
  );
}
