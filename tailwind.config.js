/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
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
      },

      fontFamily: {
        sans: ['PlusJakartaSans_400Regular'],
        'sans-light': ['PlusJakartaSans_300Light'],
        'sans-medium': ['PlusJakartaSans_500Medium'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold'],
        'sans-bold': ['PlusJakartaSans_700Bold'],
        'sans-extrabold': ['PlusJakartaSans_800ExtraBold'],
      },

      fontSize: {
        'display-xl': ['40px', { lineHeight: '44px', letterSpacing: '-1.2px' }],
        display: ['34px', { lineHeight: '38px', letterSpacing: '-0.9px' }],
        title: ['26px', { lineHeight: '30px', letterSpacing: '-0.5px' }],
        heading: ['20px', { lineHeight: '26px', letterSpacing: '-0.3px' }],
        subheading: ['17px', { lineHeight: '24px', letterSpacing: '-0.2px' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        body: ['15px', { lineHeight: '22px' }],
        label: ['13px', { lineHeight: '18px' }],
        caption: ['12px', { lineHeight: '16px' }],
        overline: ['11px', { lineHeight: '14px', letterSpacing: '0.8px' }],
        stat: ['30px', { lineHeight: '34px', letterSpacing: '-0.8px' }],
      },

      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '28px',
        '3xl': '34px',
      },
    },
  },
  plugins: [],
};
