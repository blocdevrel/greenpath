import { useRef } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

/**
 * Mobile web shrinks the layout viewport when the soft keyboard opens
 * (`interactive-widget=resizes-content`). Using live height for layout toggles
 * re-renders auth forms mid-focus and dismisses the keyboard.
 */
export function useStableWindowHeight() {
  const { height, width } = useWindowDimensions();
  const peakRef = useRef(height);

  if (Platform.OS === 'web') {
    if (height > peakRef.current) {
      peakRef.current = height;
    }
  } else {
    peakRef.current = height;
  }

  const layoutHeight = Platform.OS === 'web' ? peakRef.current : height;

  return {
    width,
    height: layoutHeight,
    compact: layoutHeight < 740,
  };
}
