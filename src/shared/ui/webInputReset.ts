import { Platform, type TextStyle } from 'react-native';

/** Strip browser inner border/outline on web TextInputs (border lives on the wrapper). */
export const webInputReset = (
  Platform.OS === 'web'
    ? {
        outlineWidth: 0,
        outlineStyle: 'none' as const,
        borderWidth: 0,
        boxShadow: 'none',
        cursor: 'text',
      }
    : {}
) as TextStyle;
