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
  // Loaded via useFonts() in App.tsx before anything renders, so the family
  // name is registered on every platform by the time these are referenced.
  // pixelDisplay is ~2x wider per character than a normal typeface — use it
  // only for short headers/labels/buttons, never for paragraph-length text.
  pixelDisplay: 'PressStart2P_400Regular',
  pixelBody: 'VT323_400Regular',
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
  none: 0, // square pixel-art corners
} as const;

// Chunky hairline width used by the retro/pixel-art border treatment.
export const PIXEL_BORDER = 3;

// RN's shadow* props are silent no-ops on Android without `elevation`;
// web renders a real boxShadow instead since RN shadow props don't work there.
export const glow = (color: string) =>
  Platform.select({
    web: { boxShadow: `0 0 8px ${color}` },
    default: {
      shadowColor: color,
      shadowOpacity: 0.9,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 0 },
      elevation: 6,
    },
  });

export const THEME = { COLORS, FONTS, SPACING, RADII, PIXEL_BORDER };
