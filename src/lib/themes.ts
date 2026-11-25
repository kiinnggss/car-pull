export type ThemeId =
  | 'clean-daylight'
  | 'midnight-cobalt'
  | 'paw-cream'
  | 'orange-mechanic'
  | 'purple-disco'
  | 'blue-powder';

export type MatchFeedbackStyle = 'ticket' | 'ripple' | 'pill';

export interface AppThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  isDark: boolean;
  bgCanvas: string;
  bgSheet: string;
  bgSubtle: string;
  textPrimary: string;
  textSecondary: string;
  accentPrimary: string;
  accentPrimaryFg: string;
  accentSecondary: string;
  borderColor: string;
  cardBorderWidth: string;
  previewSidebar: string;
}

export const APP_THEMES: AppThemeDefinition[] = [
  {
    id: 'clean-daylight',
    name: 'Loka Clay',
    subtitle: 'Warm stone, cast iron & terracotta',
    isDark: false,
    bgCanvas: '#ECECE8',
    bgSheet: '#F5F4F0',
    bgSubtle: '#E4E3DD',
    textPrimary: '#161616',
    textSecondary: '#5A5751',
    accentPrimary: '#161616',
    accentPrimaryFg: '#F5F4F0',
    accentSecondary: '#B86544',
    borderColor: 'rgba(22, 22, 22, 0.11)',
    cardBorderWidth: '1px',
    previewSidebar: '#B86544',
  },
  {
    id: 'midnight-cobalt',
    name: 'Cass Coal',
    subtitle: 'Coal Drops charcoal, umber & pigment red',
    isDark: true,
    bgCanvas: '#20150F',
    bgSheet: '#261B14',
    bgSubtle: '#33251D',
    textPrimary: '#F2EFEA',
    textSecondary: '#A29D98',
    accentPrimary: '#F2EFEA',
    accentPrimaryFg: '#20150F',
    accentSecondary: '#C84B31',
    borderColor: 'rgba(162, 157, 152, 0.18)',
    cardBorderWidth: '1px',
    previewSidebar: '#5F4C41',
  },
  {
    id: 'paw-cream',
    name: 'Paw Cream',
    subtitle: 'Warm cream, terracotta & rose',
    isDark: false,
    bgCanvas: '#FFF4D4',
    bgSheet: '#FFFDF5',
    bgSubtle: '#F6E6BE',
    textPrimary: '#1A1412',
    textSecondary: '#6B5648',
    accentPrimary: '#DF8E52',
    accentPrimaryFg: '#1A1412',
    accentSecondary: '#DE5D76',
    borderColor: '#1A1412',
    cardBorderWidth: '1.5px',
    previewSidebar: '#DF8E52',
  },
  {
    id: 'orange-mechanic',
    name: 'Orange Mechanic',
    subtitle: 'Warm charcoal & signal amber',
    isDark: true,
    bgCanvas: '#13120E',
    bgSheet: '#1D1B15',
    bgSubtle: '#28251D',
    textPrimary: '#FFF8EB',
    textSecondary: '#A89F8D',
    accentPrimary: '#F5A623',
    accentPrimaryFg: '#13120E',
    accentSecondary: '#FFB84D',
    borderColor: 'rgba(245, 166, 35, 0.16)',
    cardBorderWidth: '1px',
    previewSidebar: '#242119',
  },
  {
    id: 'purple-disco',
    name: 'Purple Disco',
    subtitle: 'Midnight plum & electric violet',
    isDark: true,
    bgCanvas: '#110E1A',
    bgSheet: '#191526',
    bgSubtle: '#241E36',
    textPrimary: '#F7F5FF',
    textSecondary: '#A398C2',
    accentPrimary: '#9D7BFF',
    accentPrimaryFg: '#0E0B16',
    accentSecondary: '#C084FC',
    borderColor: 'rgba(157, 123, 255, 0.18)',
    cardBorderWidth: '1px',
    previewSidebar: '#211B33',
  },
  {
    id: 'blue-powder',
    name: 'Blue Powder',
    subtitle: 'Deep slate & powder cyan',
    isDark: true,
    bgCanvas: '#0E1519',
    bgSheet: '#152026',
    bgSubtle: '#1E2D35',
    textPrimary: '#F0F8FC',
    textSecondary: '#8BA4B2',
    accentPrimary: '#56CCF2',
    accentPrimaryFg: '#0B1317',
    accentSecondary: '#38BDF8',
    borderColor: 'rgba(86, 204, 242, 0.18)',
    cardBorderWidth: '1px',
    previewSidebar: '#19262D',
  },
];

export function getThemeDefinition(id: ThemeId | string | undefined): AppThemeDefinition {
  return APP_THEMES.find((t) => t.id === id) || APP_THEMES[0];
}

function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{6})$/.test(hex.trim());
}

/**
 * Compute readable foreground (#0B0C0E or #FFFFFF) for a given hex background.
 */
export function getContrastForeground(hex: string): string {
  if (!isValidHex(hex)) return '#FFFFFF';
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? '#0B0C0E' : '#FFFFFF';
}

export function applyThemeToDocument(
  themeId: ThemeId,
  customAccentHex?: string | null,
  transparentDock: boolean = true
): void {
  if (typeof window === 'undefined') return;
  const def = getThemeDefinition(themeId);
  const root = document.documentElement;

  const activeAccent =
    customAccentHex && isValidHex(customAccentHex) ? customAccentHex.toUpperCase() : def.accentPrimary;
  const activeAccentFg =
    customAccentHex && isValidHex(customAccentHex)
      ? getContrastForeground(activeAccent)
      : def.accentPrimaryFg;

  root.classList.toggle('dark', def.isDark);
  root.setAttribute('data-theme', def.id);
  root.setAttribute('data-transparent-dock', transparentDock ? 'true' : 'false');

  root.style.setProperty('--bg-canvas', def.bgCanvas);
  root.style.setProperty('--bg-sheet', def.bgSheet);
  root.style.setProperty('--bg-subtle', def.bgSubtle);
  root.style.setProperty('--text-primary', def.textPrimary);
  root.style.setProperty('--text-secondary', def.textSecondary);
  root.style.setProperty('--accent-volt', activeAccent);
  root.style.setProperty('--accent-primary', activeAccent);
  root.style.setProperty('--accent-primary-fg', activeAccentFg);
  root.style.setProperty('--accent-signal', def.accentSecondary);
  root.style.setProperty('--border-subtle', def.borderColor);
  root.style.setProperty('--card-border-width', def.cardBorderWidth);
}
