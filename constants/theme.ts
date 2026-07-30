import { Platform } from 'react-native';

// Central palette and typography tokens for the app.
// Import from here rather than hardcoding hex values in components.

export const COLORS = {
  background: '#12151A',
  surface: '#1C2129',
  border: '#2A3038',

  accent: '#00D9E8', // primary: progress, active states, correct answers, mastered
  warning: '#FF9F1C', // Leitner box-1 / due-for-review states only — never decorative

  success: '#00D9E8', // alias of accent for "correct" states, kept distinct for readability at call sites
  danger: '#FF5C5C',

  textPrimary: '#E8EAED',
  textSecondary: '#8B93A1',
  textOnAccent: '#0A0C0F',
} as const;

// react-native-web resolves these font-family stacks via CSS; native platforms
// fall back to their default system faces since no custom fonts are bundled.
export const FONTS = {
  mono: Platform.select({
    web: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
  sans: Platform.select({
    web: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: undefined, // system default
  }),
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const RADII = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const THEME = { COLORS, FONTS, SPACING, RADII };
