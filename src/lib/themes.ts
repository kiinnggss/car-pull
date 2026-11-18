export type ThemeId =
  | 'obsidian-volt'
  | 'clean-daylight'
  | 'paw-cream'
  | 'orange-mechanic'
  | 'purple-disco'
  | 'blue-powder';

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
    id: 'obsidian-volt',
    name: 'Obsidian Volt',
    subtitle: 'Pitch dark with electric lime',
    isDark: true,
    bgCanvas: '#0B0C0E',
    bgSheet: '#14161B',
    bgSubtle: '#1E2028',
    textPrimary: '#FFFFFF',
    textSecondary: '#9BA1AE',
    accentPrimary: '#C8FF00',
    accentPrimaryFg: '#0B0C0E',
    accentSecondary: '#A3E635',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    cardBorderWidth: '1px',
    previewSidebar: '#1B1E24',
  },
  {
    id: 'clean-daylight',
    name: 'Clean Daylight',
    subtitle: 'Crisp white & obsidian ink',
    isDark: false,
    bgCanvas: '#F4F5F7',
    bgSheet: '#FFFFFF',
    bgSubtle: '#E9ECF1',
    textPrimary: '#0B0C0E',
    textSecondary: '#525866',
    accentPrimary: '#0B0C0E',
    accentPrimaryFg: '#FFFFFF',
    accentSecondary: '#10B981',
    borderColor: 'rgba(11, 12, 14, 0.08)',
    cardBorderWidth: '1px',
    previewSidebar: '#E5E7EB',
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
  if (!isValidHex(hex)) return '#0B0C0E';
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
