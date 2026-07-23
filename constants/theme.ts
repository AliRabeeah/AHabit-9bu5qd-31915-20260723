// AHabit Design System

export const Colors = {
  // AMOLED Black base
  background: '#000000',
  surface: '#0D0D0D',
  surfaceElevated: '#1A1A1A',
  surfaceHighlight: '#222222',
  border: '#2A2A2A',
  borderSubtle: '#1A1A1A',

  // Accent (default purple-violet, user-configurable)
  primary: '#7C5CFC',
  primaryLight: '#9B7FFD',
  primaryDim: 'rgba(124,92,252,0.15)',
  primaryGlow: 'rgba(124,92,252,0.3)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textTertiary: '#666666',
  textInverse: '#000000',

  // Semantic
  success: '#4CAF50',
  successDim: 'rgba(76,175,80,0.15)',
  warning: '#FF9800',
  warningDim: 'rgba(255,152,0,0.15)',
  error: '#F44336',
  errorDim: 'rgba(244,67,54,0.15)',
  skipped: '#555555',
  skippedDim: 'rgba(85,85,85,0.3)',

  // Calendar
  calendarDone: '#4CAF50',
  calendarSkipped: '#444444',
  calendarMissed: '#5C2020',
  calendarEmpty: '#1A1A1A',

  // Accent palette
  accents: [
    '#7C5CFC', // Purple
    '#FC5C7D', // Pink
    '#43E97B', // Green
    '#38F9D7', // Teal
    '#FA8231', // Orange
    '#F7B731', // Yellow
    '#4FC3F7', // Blue
    '#CE93D8', // Lavender
  ],

  // Gradients (as arrays)
  gradientPrimary: ['#7C5CFC', '#5C3BCC'] as const,
  gradientSuccess: ['#43E97B', '#38F9D7'] as const,
  gradientWarm: ['#FC5C7D', '#FA8231'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 34,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadows = {
  sm: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};
