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
  Sun,
  Moon,
} from 'lucide-react';
import { formatNgn } from '@/lib/utils';
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
    theme,
    toggleTheme,
  } = useAppStore();

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
        className="sticky top-0 z-30 w-full px-5 h-12 flex items-center justify-between border-b"
        style={{
          backgroundColor: 'var(--bg-sheet)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Left: Plain Wordmark */}
        <button
          onClick={() => {
            triggerHaptic('tap');
            setActiveTab('deck');
          }}
          className="font-display font-bold text-base tracking-tight text-[var(--text-primary)] active-press"
        >
          CarPull
        </button>

        {/* Center: Plain Text Role Switch */}
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => {
              triggerHaptic('switch');
              setActiveRole('rider');
              setActiveTab('deck');
            }}
            className="relative py-1 transition-colors"
            style={{
              color: activeRole === 'rider' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeRole === 'rider' ? 700 : 500,
            }}
          >
            Rider
            {activeRole === 'rider' && (
              <span
                className="absolute left-0 right-0 -bottom-[9px] h-[2px]"
                style={{ backgroundColor: 'var(--accent-signal)' }}
              />
            )}
          </button>
          <button
            onClick={() => {
              triggerHaptic('switch');
              setActiveRole('driver');
              setActiveTab('deck');
            }}
            className="relative py-1 transition-colors"
            style={{
              color: activeRole === 'driver' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeRole === 'driver' ? 700 : 500,
            }}
          >
            Driver
            {activeRole === 'driver' && (
              <span
                className="absolute left-0 right-0 -bottom-[9px] h-[2px]"
                style={{ backgroundColor: 'var(--accent-signal)' }}
              />
            )}
          </button>
        </div>

        {/* Right: Plain Balance Text + Theme Toggle + Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('wallet');
            }}
            className="text-xs font-mono tabular-nums font-semibold text-[var(--text-primary)] active-press"
            title="Open Wallet"
          >
            {formatNgn(escrowBalanceNgn)}
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              toggleTheme();
            }}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] active-press"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowUserMenu(!showUserMenu);
              }}
              className="w-7 h-7 rounded-full font-semibold text-xs flex items-center justify-center active-press"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-primary-fg)',
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
                <div className="absolute right-0 mt-2 w-56 floating-surface p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-2 border-b border-[var(--border-subtle)]">
                    <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                      {user.fullName}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] block truncate mt-0.5">
                      {user.employer}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setIsThemeModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] flex items-center gap-2 transition-colors"
                  >
                    <Palette className="w-3.5 h-3.5 opacity-70" />
                    <span>Appearance</span>
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
                        <Car className="w-3.5 h-3.5 opacity-70" />
                        <span>Switch to Driver</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5 opacity-70" />
                        <span>Switch to Rider</span>
                      </>
                    )}
                  </button>

                  {!isInstalled && (
                    <button
                      onClick={handleInstallClick}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] flex items-center gap-2 transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5 opacity-70" />
                      <span>Install app</span>
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
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <ThemeSwitcherModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {showInstallModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[900] bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-[360px] floating-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Install CarPull
                </h3>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="p-1 text-[var(--text-secondary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-[var(--border-subtle)] text-xs">
                <div className="pb-3 space-y-1">
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

                <div className="pt-3 space-y-1">
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
