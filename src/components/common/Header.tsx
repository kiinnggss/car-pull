'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  Car,
  ChevronDown,
  Smartphone,
  X,
  Share,
  PlusSquare,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { formatNgn } from '@/lib/utils';
import { InteractiveLogoCockpit } from './InteractiveLogoCockpit';
import { triggerHaptic } from '@/lib/haptics';

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

  const [isLogoCockpitOpen, setIsLogoCockpitOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic('tap');
    setShowUserMenu(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
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
      <header className="sticky top-0 z-30 w-full px-3.5 pt-2.5 pb-1.5 bg-[#F4F5F7]/90 dark:bg-[#0B0C0E]/90 backdrop-blur-xl">
        <div className="max-w-[430px] mx-auto flex items-center justify-between gap-2">
          {/* Left: Brand Pill Trigger */}
          <button
            onClick={() => {
              triggerHaptic('tap');
              setIsLogoCockpitOpen(true);
            }}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-white dark:bg-[#14161B] border border-black/6 dark:border-white/10 active-press transition-transform"
            title="Open Cockpit Shortcuts"
          >
            <span className="w-7 h-7 rounded-full bg-[#0B0C0E] dark:bg-[#C8FF00] text-[#C8FF00] dark:text-[#0B0C0E] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </span>
            <span className="font-display font-black text-xs tracking-tight text-[#0B0C0E] dark:text-white">
              CAR PULL
            </span>
          </button>

          {/* Center: Segmented Rider / Driver Pill */}
          <div className="flex items-center p-0.5 rounded-full bg-white dark:bg-[#14161B] border border-black/6 dark:border-white/10">
            <button
              onClick={() => {
                triggerHaptic('switch');
                setActiveRole('rider');
                setActiveTab('deck');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
                activeRole === 'rider'
                  ? 'bg-[#0B0C0E] dark:bg-[#C8FF00] text-white dark:text-[#0B0C0E]'
                  : 'text-[#525866] dark:text-[#9BA1AE]'
              }`}
            >
              Rider
            </button>
            <button
              onClick={() => {
                triggerHaptic('switch');
                setActiveRole('driver');
                setActiveTab('deck');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
                activeRole === 'driver'
                  ? 'bg-[#0B0C0E] dark:bg-[#C8FF00] text-white dark:text-[#0B0C0E]'
                  : 'text-[#525866] dark:text-[#9BA1AE]'
              }`}
            >
              Driver
            </button>
          </div>

          {/* Right: Volt Escrow Pill + Theme + Profile */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setActiveTab('wallet');
              }}
              className="px-2.5 py-1 rounded-full bg-[#C8FF00] text-[#0B0C0E] text-[11px] font-mono tabular-nums font-extrabold active-press transition-transform"
              title="Open Escrow Wallet"
            >
              {formatNgn(escrowBalanceNgn)}
            </button>

            <button
              onClick={() => {
                triggerHaptic('tap');
                toggleTheme();
              }}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#14161B] border border-black/6 dark:border-white/10 flex items-center justify-center text-[#0B0C0E] dark:text-white active-press"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[#C8FF00]" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>

            {/* User Avatar Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center gap-0.5 p-0.5 pr-1.5 rounded-full bg-white dark:bg-[#14161B] border border-black/6 dark:border-white/10 active-press"
                title="Account Menu"
              >
                <div className="w-7 h-7 rounded-full bg-[#0B0C0E] dark:bg-[#C8FF00] text-white dark:text-[#0B0C0E] font-extrabold text-[11px] flex items-center justify-center">
                  {user.fullName.charAt(0)}
                </div>
                <ChevronDown className="w-3 h-3 text-[#525866] dark:text-[#9BA1AE]" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 rounded-[24px] floating-surface p-3.5 z-50 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="pb-2.5 border-b border-black/6 dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#0B0C0E] dark:text-white truncate">
                          {user.fullName}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#C8FF00] text-[#0B0C0E]">
                          NIN VERIFIED
                        </span>
                      </div>
                      <span className="text-[10px] text-[#525866] dark:text-[#9BA1AE] block truncate mt-0.5">
                        {user.email}
                      </span>
                      <span className="text-[10px] font-bold text-[#0B0C0E] dark:text-[#C8FF00] block mt-0.5">
                        {user.employer}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveRole(activeRole === 'rider' ? 'driver' : 'rider');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-full text-xs font-bold text-[#0B0C0E] dark:text-white hover:bg-[#F4F5F7] dark:hover:bg-[#1E2028] flex items-center gap-2 transition-colors"
                      >
                        {activeRole === 'rider' ? (
                          <>
                            <Car className="w-3.5 h-3.5" />
                            <span>Switch to Driver Console</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Switch to Rider Swipe Deck</span>
                          </>
                        )}
                      </button>

                      {!isInstalled && (
                        <button
                          onClick={handleInstallClick}
                          className="w-full text-left px-3 py-2 rounded-full text-xs font-bold text-[#0B0C0E] dark:text-white hover:bg-[#F4F5F7] dark:hover:bg-[#1E2028] flex items-center gap-2 transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Install Mobile App (PWA)</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-full text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
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

      {showInstallModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[900] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
            <div className="w-full max-w-[380px] floating-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#C8FF00] text-[#0B0C0E] flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0B0C0E] dark:text-white">
                      Install CAR PULL
                    </h3>
                    <p className="text-[10px] font-mono text-[#525866] dark:text-[#9BA1AE]">
                      FULL-SCREEN MOBILE APP
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="p-1.5 rounded-full hover:bg-[#F4F5F7] dark:hover:bg-[#1E2028] text-[#525866]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F4F5F7] dark:bg-[#1E2028] space-y-1.5">
                  <div className="font-extrabold text-[#0B0C0E] dark:text-white flex items-center gap-1.5">
                    <Share className="w-3.5 h-3.5" />
                    <span>iPhone / iPad (Safari)</span>
                  </div>
                  <p className="text-[11px] text-[#525866] dark:text-[#9BA1AE] leading-relaxed">
                    Tap <strong>Share</strong> in Safari, then choose{' '}
                    <strong className="inline-flex items-center gap-1">
                      <PlusSquare className="w-3 h-3 inline" /> Add to Home Screen
                    </strong>
                    .
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F4F5F7] dark:bg-[#1E2028] space-y-1.5">
                  <div className="font-extrabold text-[#0B0C0E] dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Android (Chrome)</span>
                  </div>
                  <p className="text-[11px] text-[#525866] dark:text-[#9BA1AE] leading-relaxed">
                    Tap the browser menu (<strong>⋮</strong>) and select <strong>Install app</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full py-3 btn-electric-mint text-xs font-extrabold rounded-full active-press"
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
