import { createContext, useContext, useMemo } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';

import { colors } from '@/shared/theme/tokens';

/** Phone-frame width used for web desktop preview. */
export const MOBILE_MAX_WIDTH = 430;

const ShellWidthContext = createContext(MOBILE_MAX_WIDTH);

/** Prefer shell width on web so carousels/pagers match the phone frame. */
export function useShellWidth() {
  const window = useWindowDimensions();
  const shellWidth = useContext(ShellWidthContext);
  if (Platform.OS === 'web') {
    return Math.min(window.width, shellWidth);
  }
  return window.width;
}

/**
 * Keeps the whole UI at mobile size on desktop web.
 * Native apps pass children through unchanged.
 *
 * On web, height comes from the document chain (`100dvh` + resizes-content).
 * Do not pin or freeze shell height from visualViewport — that fights the soft
 * keyboard and steals focus from auth inputs on mobile browsers.
 */
export function MobileShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();

  const shellWidth = useMemo(
    () => Math.min(width, MOBILE_MAX_WIDTH),
    [width],
  );

  if (Platform.OS !== 'web') {
    return <View className="flex-1">{children}</View>;
  }

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        minHeight: 0,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: colors.canvas.sunken,
      }}>
      <ShellWidthContext.Provider value={shellWidth}>
        <View
          style={{
            flex: 1,
            width: shellWidth,
            maxWidth: MOBILE_MAX_WIDTH,
            minHeight: 0,
            backgroundColor: colors.canvas.DEFAULT,
            position: 'relative',
            borderLeftWidth: width > MOBILE_MAX_WIDTH ? 1 : 0,
            borderRightWidth: width > MOBILE_MAX_WIDTH ? 1 : 0,
            borderColor: colors.line.DEFAULT,
          }}>
          {children}
        </View>
      </ShellWidthContext.Provider>
    </View>
  );
}
