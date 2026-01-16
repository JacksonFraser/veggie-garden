/**
 * Design Tokens
 * Centralized design system constants for consistent styling across the application
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  garden: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  earth: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  soil: {
    50: '#f7f3f0',
    100: '#ede4d3',
    200: '#dbc5a4',
    300: '#c4a26f',
    400: '#b08647',
    500: '#9c7339',
    600: '#855d30',
    700: '#6f4a2a',
    800: '#5d3e27',
    900: '#513525',
    950: '#2d1c12',
  },
} as const;

// ============================================================================
// SEMANTIC COLORS
// ============================================================================

export const semanticColors = {
  primary: colors.garden[600],
  primaryHover: colors.garden[700],
  secondary: colors.earth[500],
  secondaryHover: colors.earth[600],
  accent: colors.soil[500],
  success: colors.garden[500],
  warning: colors.earth[500],
  error: '#ef4444',
  info: '#3b82f6',
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  '2xl': '2rem', // 32px
  '3xl': '3rem', // 48px
  '4xl': '4rem', // 64px
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  garden: '0 10px 25px -5px rgba(132, 204, 22, 0.1), 0 4px 6px -2px rgba(132, 204, 22, 0.05)',
  gardenHover:
    '0 20px 40px -10px rgba(132, 204, 22, 0.15), 0 8px 16px -4px rgba(132, 204, 22, 0.1)',
  canvas:
    '0 10px 25px -5px rgba(132, 204, 22, 0.1), 0 4px 6px -2px rgba(132, 204, 22, 0.05), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  canvasHover:
    '0 20px 40px -10px rgba(132, 204, 22, 0.15), 0 8px 16px -4px rgba(132, 204, 22, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
  lift: '0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  notification: 70,
  max: 9999,
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// MATERIAL COLORS (for raised beds)
// Note: Keep in sync with convex/raisedBeds.ts getMaterialDefaults if changed
// ============================================================================

export const materialColors = {
  wood: '#8B4513',
  stone: '#696969',
  metal: '#708090',
  composite: '#654321',
} as const;

export type MaterialType = keyof typeof materialColors;

// ============================================================================
// PLANT COLORS (for Garden3D component)
// ============================================================================

export const plantColors = {
  default: colors.garden[500],
  tomato: '#ef4444',
  lettuce: '#86efac',
  carrot: '#f97316',
  pepper: '#eab308',
  cucumber: '#22c55e',
  broccoli: '#059669',
  spinach: '#047857',
  radish: '#ec4899',
  onion: '#f3e8ff',
  bean: '#4ade80',
} as const;

// ============================================================================
// TYPE HELPERS
// ============================================================================

export type ColorShade = keyof typeof colors.garden;
export type SemanticColor = keyof typeof semanticColors;
export type SpacingSize = keyof typeof spacing;
export type ShadowType = keyof typeof shadows;
export type ZIndexLevel = keyof typeof zIndex;
