// src/theme/index.js
export const colors = {
  primary: '#006B3C',       // Deep Ethiopian green
  primaryLight: '#008F50',
  primaryDark: '#004D2B',
  secondary: '#FCDD09',     // Ethiopian gold/yellow
  secondaryDark: '#D4B800',
  accent: '#EF2118',        // Ethiopian red
  background: '#F5F7F5',
  surface: '#FFFFFF',
  surfaceAlt: '#EDF5EF',
  text: '#1A2E1A',
  textSecondary: '#4A6741',
  textMuted: '#8FAB8A',
  border: '#D0E4D3',
  borderLight: '#EAF3EC',
  error: '#C0392B',
  errorLight: '#FDEDEC',
  success: '#1E8449',
  successLight: '#EAFAF1',
  warning: '#D68910',
  warningLight: '#FEF9E7',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  cardShadow: 'rgba(0,107,60,0.12)',
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    '2xl': 26,
    '3xl': 32,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default { colors, typography, spacing, radius, shadows };
