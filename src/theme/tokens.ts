/**
 * Clast.io 2026 design tokens — see /ui.md
 * Used by landing, auth, and all portal surfaces (Phase 1+).
 */
export const colors = {
  bgCanvas: '#F8FAFC',
  bgSurface: '#FFFFFF',
  bgDarkCanvas: '#090D16',
  bgDarkSurface: '#111827',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnDark: '#E2E8F0',
  textOnDarkMuted: '#94A3B8',

  brandPrimary: '#4F46E5',
  brandPrimaryHover: '#4338CA',
  brandAccent: '#7C3AED',
  brandSoft: '#EEF2FF',
  brandAccentSoft: '#F5F3FF',

  statusSuccess: '#10B981',
  statusSuccessSoft: 'rgba(16, 185, 129, 0.10)',
  statusWarning: '#F59E0B',
  statusWarningSoft: 'rgba(245, 158, 11, 0.10)',
  statusDanger: '#EF4444',
  statusDangerSoft: 'rgba(239, 68, 68, 0.10)',

  borderSubtle: '#E2E8F0',
  borderDark: '#1E293B',

  /** @deprecated aliases — keep portal components compiling during migration */
  primary: '#4F46E5',
  primarySoft: '#EEF2FF',
  primaryDark: '#4338CA',
  secondary: '#7C3AED',
  secondarySoft: '#F5F3FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondaryLegacy: '#475569',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  success: '#10B981',
  successSoft: '#ECFDF5',
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',
  info: '#4F46E5',
  infoSoft: '#EEF2FF',
  sidebar: '#090D16',
  sidebarMuted: '#111827',
  sidebarHover: '#1E293B',
  sidebarActive: 'rgba(79, 70, 229, 0.22)',
  sidebarBorder: '#1E293B',
  sidebarText: '#E2E8F0',
  sidebarTextMuted: '#94A3B8',
  overlay: 'rgba(15, 23, 42, 0.58)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const radii = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 16,
  full: 999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  brand: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  /** Arabic UI fallback for portal RTL screens */
  arabicRegular: 'Cairo_400Regular',
  arabicMedium: 'Cairo_500Medium',
  arabicSemiBold: 'Cairo_600SemiBold',
  arabicBold: 'Cairo_700Bold',
} as const;

export const brand = {
  name: 'Clast',
  wordmark: 'Clast',
  badge: 'مدارس K-12',
  tagline: 'منصة مدارس متعددة المستأجرين للمدارس في مصر',
} as const;

/** Prefer Cairo on Arabic marketing / RTL surfaces */
export const arFonts = {
  regular: fonts.arabicRegular,
  medium: fonts.arabicMedium,
  semiBold: fonts.arabicSemiBold,
  bold: fonts.arabicBold,
  extraBold: fonts.arabicBold,
  mono: fonts.mono,
  monoMedium: fonts.monoMedium,
} as const;

/** Reanimated spring presets — clast_io_ui_design_system.md §5.1 */
export const SPRING_SNAPPY = {
  damping: 18,
  stiffness: 180,
  mass: 0.8,
} as const;

export const SPRING_GENTLE = {
  damping: 22,
  stiffness: 120,
  mass: 1,
} as const;

export const MOTION = {
  pressScale: 0.97,
  progressMs: 750,
  staggerMs: 70,
  tabEnterMs: 280,
  heroStaggerMs: [0, 80, 160, 240, 320] as const,
  levitateMs: 4000,
  levitateOffsetY: -8,
  levitatePhaseMs: 1500,
} as const;
