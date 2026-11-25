'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Palette,
  LogOut,
  UserCheck,
  Car,
  Smartphone,
  X,
  Share,
  PlusSquare,
  CheckCircle2,
  Wallet,
  Zap,
} from 'lucide-react';
import { formatNgn } from '@/lib/utils';
import { InteractiveLogoCockpit } from './InteractiveLogoCockpit';
import { ThemeSwitcherModal } from './ThemeSwitcherModal';
import { triggerHaptic } from '@/lib/haptics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const Header: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    escrowBalanceNgn,
    setActiveTab,
    user,
    logout,
  } = useAppStore();

  const [isLogoCockpitOpen, setIsLogoCockpitOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        requestAnimationFrame(() => setIsInstalled(true));
      }
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => {
        cancelAnimationFrame(id);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }
    return () => cancelAnimationFrame(id);
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic('tap');
    setShowUserMenu(false);
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-30 w-full px-4 py-2.5 border-b backdrop-blur-md"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-sheet) 92%, transparent)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Left: Clean Brand + Role Segmented Toggle */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setIsLogoCockpitOpen(true);
              }}
              className="flex items-center gap-1.5 active-press flex-shrink-0"
              title="Open Cockpit Shortcuts"
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary-fg)',
                }}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
              </span>
              <span className="font-display font-bold text-sm tracking-tight text-[var(--text-primary)]">
                CarPull
              </span>
            </button>

            <div
              className="flex items-center p-0.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <button
                onClick={() => {
                  triggerHaptic('switch');
                  setActiveRole('rider');
                  setActiveTab('deck');
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
                style={
                  activeRole === 'rider'
                    ? {
                        backgroundColor: 'var(--bg-sheet)',
                        color: 'var(--text-primary)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                      }
                    : { color: 'var(--text-secondary)' }
                }
              >
                Rider
              </button>
              <button
                onClick={() => {
                  triggerHaptic('switch');
                  setActiveRole('driver');
                  setActiveTab('deck');
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
                style={
                  activeRole === 'driver'
                    ? {
                        backgroundColor: 'var(--bg-sheet)',
                        color: 'var(--text-primary)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                      }
                    : { color: 'var(--text-secondary)' }
                }
              >
                Driver
              </button>
            </div>
          </div>

          {/* Right: Wallet Chip + Avatar Menu */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setActiveTab('wallet');
              }}
              className="h-8 px-2.5 rounded-lg border text-xs font-mono tabular-nums font-bold flex items-center gap-1.5 active-press"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              title="Open Escrow Wallet"
            >
              <Wallet className="w-3.5 h-3.5 opacity-70" />
              <span>{formatNgn(escrowBalanceNgn)}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setShowUserMenu(!showUserMenu);
                }}
                className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center active-press border"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary-fg)',
                  borderColor: 'var(--border-subtle)',
                }}
                title="Account & Appearance"
                aria-label="Account Menu"
              >
                {user.fullName.charAt(0)}
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 floating-surface p-3 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="pb-2.5 border-b border-[var(--border-subtle)] px-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {user.fullName}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-primary)]">
                          Verified
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-secondary)] block truncate mt-0.5">
                        {user.email}
                      </span>
                      <span className="text-[11px] font-medium text-[var(--text-secondary)] block mt-0.5">
                        {user.employer}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setIsThemeModalOpen(true);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] flex items-center gap-2 transition-colors"
                      >
                        <Palette className="w-3.5 h-3.5 opacity-75" />
                        <span>Appearance &amp; Themes</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveRole(activeRole === 'rider' ? 'driver' : 'rider');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] flex items-center gap-2 transition-colors"
                      >
                        {activeRole === 'rider' ? (
                          <>
                            <Car className="w-3.5 h-3.5 opacity-75" />
                            <span>Switch to Driver Console</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 opacity-75" />
                            <span>Switch to Rider Deck</span>
                          </>
                        )}
                      </button>

                      {!isInstalled && (
                        <button
                          onClick={handleInstallClick}
                          className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] flex items-center gap-2 transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5 opacity-75" />
                          <span>Install Mobile App</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <InteractiveLogoCockpit
        isOpen={isLogoCockpitOpen}
        onClose={() => setIsLogoCockpitOpen(false)}
      />

      <ThemeSwitcherModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {showInstallModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[900] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-[380px] floating-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Install CarPull
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Add to your home screen
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] space-y-1">
                  <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Share className="w-3.5 h-3.5" />
                    <span>iPhone &amp; iPad</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Tap <strong>Share</strong> in Safari, then choose{' '}
                    <strong className="inline-flex items-center gap-1">
                      <PlusSquare className="w-3 h-3 inline" /> Add to Home Screen
                    </strong>
                    .
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] space-y-1">
                  <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Android</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Open the Chrome menu and select <strong>Install app</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full py-2.5 btn-electric-mint text-xs active-press"
              >
                Done
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
