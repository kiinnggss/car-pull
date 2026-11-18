'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, RotateCcw, Ticket, Sparkles, Bell } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  APP_THEMES,
  ThemeId,
  MatchFeedbackStyle,
  getThemeDefinition,
  getContrastForeground,
  applyThemeToDocument,
} from '@/lib/themes';
import { triggerHaptic } from '@/lib/haptics';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_ACCENTS = [
  '#0B0C0E',
  '#3B82F6',
  '#DF8E52',
  '#F5A623',
  '#9D7BFF',
  '#56CCF2',
  '#DE5D76',
];

const CONFIRMATION_OPTIONS: {
  id: MatchFeedbackStyle;
  label: string;
  sub: string;
  icon: React.ElementType;
}[] = [
  { id: 'ticket', label: 'Ticket', sub: 'Boarding pass', icon: Ticket },
  { id: 'ripple', label: 'Ripple', sub: 'Avatar ring', icon: Sparkles },
  { id: 'pill', label: 'Pill', sub: 'Top banner', icon: Bell },
];

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    colorTheme,
    customAccentHex,
    transparentDock,
    matchFeedbackStyle,
    setAppearancePreferences,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [draftTheme, setDraftTheme] = useState<ThemeId>(colorTheme);
  const [draftHex, setDraftHex] = useState<string>(
    customAccentHex || getThemeDefinition(colorTheme).accentPrimary
  );
  const [hasCustomHex, setHasCustomHex] = useState<boolean>(!!customAccentHex);
  const [draftTransparent, setDraftTransparent] = useState<boolean>(transparentDock);
  const [draftFeedback, setDraftFeedback] =
    useState<MatchFeedbackStyle>(matchFeedbackStyle);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDraftTheme(colorTheme);
      setDraftHex(customAccentHex || getThemeDefinition(colorTheme).accentPrimary);
      setHasCustomHex(!!customAccentHex);
      setDraftTransparent(transparentDock);
      setDraftFeedback(matchFeedbackStyle);
    }
  }, [isOpen, colorTheme, customAccentHex, transparentDock, matchFeedbackStyle]);

  if (!isOpen || !mounted) return null;

  const selectedDef = getThemeDefinition(draftTheme);
  const normalizedHex = /^#([0-9A-Fa-f]{6})$/.test(draftHex.trim())
    ? draftHex.trim().toUpperCase()
    : selectedDef.accentPrimary;
  const activeSaveBg = hasCustomHex ? normalizedHex : selectedDef.accentPrimary;
  const activeSaveFg = hasCustomHex
    ? getContrastForeground(activeSaveBg)
    : selectedDef.accentPrimaryFg;

  const handleSelectTheme = (id: ThemeId) => {
    triggerHaptic('tap');
    const def = getThemeDefinition(id);
    setDraftTheme(id);
    setDraftHex(def.accentPrimary);
    setHasCustomHex(false);
    applyThemeToDocument(id, null, draftTransparent);
  };

  const handleHexChange = (val: string) => {
    const clean = val.startsWith('#') ? val : `#${val}`;
    setDraftHex(clean.slice(0, 7));
    if (/^#([0-9A-Fa-f]{6})$/.test(clean)) {
      setHasCustomHex(true);
      applyThemeToDocument(draftTheme, clean, draftTransparent);
    }
  };

  const handlePickSwatch = (hex: string) => {
    triggerHaptic('tap');
    setDraftHex(hex);
    setHasCustomHex(true);
    applyThemeToDocument(draftTheme, hex, draftTransparent);
  };

  const handleToggleTransparent = () => {
    triggerHaptic('switch');
    const next = !draftTransparent;
    setDraftTransparent(next);
    applyThemeToDocument(draftTheme, hasCustomHex ? normalizedHex : null, next);
  };

  const handleCancel = () => {
    triggerHaptic('tap');
    applyThemeToDocument(colorTheme, customAccentHex, transparentDock);
    onClose();
  };

  const handleSave = () => {
    triggerHaptic('match');
    setAppearancePreferences({
      colorTheme: draftTheme,
      customAccentHex: hasCustomHex ? normalizedHex : null,
      transparentDock: draftTransparent,
      matchFeedbackStyle: draftFeedback,
    });
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[800] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150"
      onClick={handleCancel}
    >
      <div
        className="w-full max-w-[404px] rounded-[28px] overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 animate-in slide-in-from-bottom duration-200"
        style={{
          backgroundColor: 'var(--bg-sheet)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h3 className="text-base font-display font-black tracking-tight">
            Appearance
          </h3>
          <button
            type="button"
            onClick={handleCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center active-press transition-colors"
            style={{ backgroundColor: 'var(--bg-subtle)' }}
            aria-label="Close Appearance"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* Section 1: Interface theme */}
          <div className="space-y-2.5">
            <div>
              <h4 className="text-xs font-extrabold">Interface theme</h4>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Customize your ride deck palette
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {APP_THEMES.map((t) => {
                const isSelected = draftTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTheme(t.id)}
                    className="group rounded-2xl p-1.5 text-left transition-all active-press relative"
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      border: isSelected
                        ? `1.5px solid ${t.accentPrimary}`
                        : '1.5px solid transparent',
                    }}
                  >
                    {/* Miniature UI Preview */}
                    <div
                      className="w-full h-15 rounded-xl overflow-hidden flex border"
                      style={{
                        backgroundColor: t.bgCanvas,
                        borderColor: t.borderColor,
                      }}
                    >
                      <div
                        className="w-1/3 h-full p-1.5 flex flex-col justify-between"
                        style={{ backgroundColor: t.previewSidebar }}
                      >
                        <div className="flex items-center gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-red-400" />
                          <span className="w-1 h-1 rounded-full bg-amber-400" />
                          <span className="w-1 h-1 rounded-full bg-blue-400" />
                        </div>
                        <div className="space-y-1">
                          <div
                            className="h-1.5 w-full rounded-full"
                            style={{ backgroundColor: t.accentPrimary }}
                          />
                          <div
                            className="h-1 w-3/4 rounded-full opacity-40"
                            style={{ backgroundColor: t.textSecondary }}
                          />
                          <div
                            className="h-1 w-2/3 rounded-full opacity-30"
                            style={{ backgroundColor: t.textSecondary }}
                          />
                        </div>
                      </div>

                      <div className="flex-1 p-1.5 flex flex-col justify-center gap-1.5">
                        <div className="flex items-center gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: t.accentPrimary }}
                          />
                          <div
                            className="h-2.5 flex-1 rounded-md"
                            style={{ backgroundColor: t.accentPrimary }}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-40"
                            style={{ backgroundColor: t.textSecondary }}
                          />
                          <div
                            className="h-2 w-4/5 rounded-md opacity-25"
                            style={{ backgroundColor: t.textSecondary }}
                          />
                        </div>
                        <div
                          className="h-1.5 w-3/5 rounded-full opacity-35 ml-2.5"
                          style={{ backgroundColor: t.accentSecondary }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1.5 px-0.5">
                      <span className="text-[10px] font-bold truncate">
                        {t.name}
                      </span>
                      <span
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          border: isSelected
                            ? `1.5px solid ${t.accentPrimary}`
                            : '1.5px solid var(--text-secondary)',
                          backgroundColor: isSelected ? t.accentPrimary : 'transparent',
                          color: isSelected ? t.accentPrimaryFg : 'transparent',
                        }}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Ride Confirmation Style (Option 1, 2, 3) */}
          <div
            className="pt-3.5 border-t space-y-2"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <h4 className="text-xs font-extrabold">Ride confirmation</h4>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Choose what happens when you book a seat
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CONFIRMATION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = draftFeedback === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      setDraftFeedback(opt.id);
                    }}
                    className="p-2.5 rounded-2xl text-left transition-all active-press flex flex-col gap-1"
                    style={
                      active
                        ? {
                            backgroundColor: activeSaveBg,
                            color: activeSaveFg,
                          }
                        : {
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-primary)',
                          }
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-extrabold leading-tight">
                      {opt.label}
                    </span>
                    <span className="text-[9.5px] opacity-75 leading-tight">
                      {opt.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Customize primary color */}
          <div
            className="pt-3.5 border-t flex items-center justify-between gap-3"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="min-w-0">
              <h4 className="text-xs font-extrabold">Customize primary color</h4>
              <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                Pick a quick accent or enter hex
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                {QUICK_ACCENTS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => handlePickSwatch(hex)}
                    className="w-5 h-5 rounded-full border border-black/20 dark:border-white/20 active-press transition-transform"
                    style={{
                      backgroundColor: hex,
                      transform:
                        activeSaveBg.toUpperCase() === hex ? 'scale(1.18)' : 'scale(1)',
                      boxShadow:
                        activeSaveBg.toUpperCase() === hex
                          ? '0 0 0 2px var(--bg-sheet), 0 0 0 3.5px var(--text-primary)'
                          : 'none',
                    }}
                    title={`Use ${hex}`}
                  />
                ))}
                {hasCustomHex && (
                  <button
                    type="button"
                    onClick={() => {
                      setHasCustomHex(false);
                      setDraftHex(selectedDef.accentPrimary);
                      applyThemeToDocument(draftTheme, null, draftTransparent);
                    }}
                    className="w-5 h-5 rounded-full flex items-center justify-center opacity-70 hover:opacity-100"
                    title="Reset to theme default"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border flex-shrink-0"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/15"
                style={{ backgroundColor: activeSaveBg }}
              />
              <input
                type="text"
                value={draftHex}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-[62px] bg-transparent font-mono text-xs font-bold uppercase focus:outline-none"
                aria-label="Primary accent hex color"
              />
            </div>
          </div>

          {/* Section 4: Transparent Dock */}
          <div
            className="pt-3.5 border-t flex items-center justify-between gap-3"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <h4 className="text-xs font-extrabold">Transparent dock</h4>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Add frosted glass blur to navigation bars
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={draftTransparent}
              onClick={handleToggleTransparent}
              className="w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 relative"
              style={{
                backgroundColor: draftTransparent ? activeSaveBg : 'var(--bg-subtle)',
              }}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-150 ${
                  draftTransparent ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="px-5 py-3.5 border-t flex items-center justify-end gap-2.5"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-xs font-extrabold active-press transition-colors"
            style={{ backgroundColor: 'var(--bg-subtle)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-extrabold active-press transition-all shadow-sm"
            style={{
              backgroundColor: activeSaveBg,
              color: activeSaveFg,
            }}
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
