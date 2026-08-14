/**
 * GreenPath Ghana design tokens.
 * Mirrored in tailwind.config.js — change both together.
 */

export const colors = {
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#2E7D32',
    800: '#1B5E20',
    900: '#0D3B12',
    DEFAULT: '#2E7D32',
  },
  secondary: {
    DEFAULT: '#4CAF50',
    soft: '#E8F5E9',
  },
  lime: {
    DEFAULT: '#8BC34A',
    soft: '#F1F8E9',
  },
  accent: {
    DEFAULT: '#3B82F6',
    soft: '#EFF6FF',
  },
  gold: {
    DEFAULT: '#FBBF24',
    soft: '#FFFBEB',
  },
  ink: {
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    DEFAULT: '#1F2937',
  },
  // Screens are white; panels are the tinted green surface.
  canvas: {
    sunken: '#E8F0EB',
    DEFAULT: '#FFFFFF',
  },
  card: {
    raised: '#FFFFFF',
    DEFAULT: '#F0F5F1',
  },
  line: {
    subtle: '#EEF5F0',
    strong: '#C5D9CB',
    DEFAULT: '#DCE8DF',
  },
  bubble: '#E8F5E9',
  subtle: '#4B5563',
  muted: '#9CA3AF',

  danger: { soft: '#FEE2E2', DEFAULT: '#EF4444' },
  success: { soft: '#DCFCE7', DEFAULT: '#22C55E' },
} as const;

/** Weight is chosen by family name — React Native cannot synthesise weights. */
export const fontFamily = {
  light: 'PlusJakartaSans_300Light',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const fontSize = {
  'display-xl': [40, { lineHeight: 44, letterSpacing: -1.2 }],
  display: [34, { lineHeight: 38, letterSpacing: -0.9 }],
  title: [26, { lineHeight: 30, letterSpacing: -0.5 }],
  heading: [20, { lineHeight: 26, letterSpacing: -0.3 }],
  subheading: [17, { lineHeight: 24, letterSpacing: -0.2 }],
  'body-lg': [16, { lineHeight: 24, letterSpacing: 0 }],
  body: [15, { lineHeight: 22, letterSpacing: 0 }],
  label: [13, { lineHeight: 18, letterSpacing: 0 }],
  caption: [12, { lineHeight: 16, letterSpacing: 0 }],
  overline: [11, { lineHeight: 14, letterSpacing: 0.8 }],
  stat: [30, { lineHeight: 34, letterSpacing: -0.8 }],
} as const;

export const borderRadius = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '28px',
  '3xl': '34px',
} as const;

/**
 * Surfaces stay flat. Separation comes from the tinted card fill against the
 * white canvas — do not add drop shadows.
 */

/** Minimum comfortable touch target for accessibility, in dp. */
export const MIN_TOUCH_TARGET = 48;
