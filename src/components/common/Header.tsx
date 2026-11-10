'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Lock,
  LogOut,
  ChevronDown,
  ArrowLeft,
  Sun,
  Moon,
  Download,
  Share2,
  Smartphone,
  X,
} from 'lucide-react';
import { formatNgn } from '@/lib/utils';
import { InteractiveLogoCockpit } from './InteractiveLogoCockpit';
import { getAssetPath } from '@/lib/assets';
import { triggerHaptic } from '@/lib/haptics';

export const Header: React.FC = () => {
  const {
    user,
    activeRole,
    setActiveRole,
    escrowBalanceNgn,
    activeTab,
    setActiveTab,
    logout,
    theme,
    toggleTheme,
    activeThreadId,
    setActiveThreadId,
  } = useAppStore();

  const [showCockpit, setShowCockpit] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic('match');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  const isInChatThread = activeTab === 'chats' && Boolean(activeThreadId);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0D131A]/95 backdrop-blur-xl px-3 py-2.5 border-b border-slate-200/80 dark:border-white/8 transition-colors">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Brand Identity & Hardware Cockpit Trigger */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isInChatThread && (
            <button
              onClick={() => {
                triggerHaptic('tap');
                setActiveThreadId(null);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all active-spring"
              title="Return to Chat Inbox"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Inbox</span>
            </button>
          )}

          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowCockpit(true);
            }}
            className="flex items-center gap-2 group active-spring text-left"
            title="Open Interactive Logo Telemetry Console"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#161F29] border border-slate-200/80 dark:border-white/10 p-1 flex items-center justify-center group-hover:border-teal-500/40 transition-colors">
              <img
                src={getAssetPath('/logo.png')}
                alt="CAR PULL Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-[13px] leading-none text-slate-900 dark:text-white tracking-tight">
                  CAR PULL
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Sec 44 Active" />
              </div>
              <span className="font-mono text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide mt-0.5">
                LAGOS SEC 44
              </span>
            </div>
          </button>
        </div>

        {/* Center: Precision Segmented Role Switcher (Rider / Driver) */}
        <div className="flex bg-slate-100 dark:bg-[#090D11] p-0.5 rounded-xl border border-slate-200/80 dark:border-white/8 flex-shrink-0">
          <button
            onClick={() => {
              triggerHaptic('switch');
              setActiveRole('rider');
            }}
            className={`text-[11px] px-3 py-1 rounded-lg transition-all active-spring ${
              activeRole === 'rider'
                ? 'bg-white dark:bg-[#18222D] text-slate-900 dark:text-white shadow-2xs font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
            }`}
          >
            Rider
          </button>
          <button
            onClick={() => {
              triggerHaptic('switch');
              setActiveRole('driver');
            }}
            className={`text-[11px] px-3 py-1 rounded-lg transition-all active-spring ${
              activeRole === 'driver'
                ? 'btn-electric-mint font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
            }`}
          >
            Driver
          </button>
        </div>

        {/* Right: Escrow Balance Pill, Theme Switcher, and Account Menu */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('wallet');
            }}
            className="flex items-center gap-1 bg-slate-100 dark:bg-[#161F29] hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/8 text-slate-900 dark:text-slate-100 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all active-spring"
            title="Open Escrow Wallet"
          >
            <Lock className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6]" />
            <span className="font-mono tabular-nums">{formatNgn(escrowBalanceNgn)}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('switch');
              toggleTheme();
            }}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#161F29] hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/8 flex items-center justify-center transition-all active-spring text-slate-600 dark:text-slate-300"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowProfileMenu(!showProfileMenu);
              }}
              className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#161F29] hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/8 transition-all active-spring"
              title="Account & Settings"
              aria-label="Open account menu"
            >
              <div className="w-6 h-6 rounded-lg bg-[#0F766E] dark:bg-[#14B8A6] text-white dark:text-[#041E1B] font-extrabold text-xs flex items-center justify-center">
                <span>{user.fullName ? user.fullName.charAt(0) : 'U'}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400 mr-0.5" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-10 w-56 floating-surface rounded-2xl p-2 shadow-floating-lg dark:shadow-floating-dark-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="bg-slate-50 dark:bg-[#090D11] border border-slate-200/60 dark:border-white/5 p-2.5 rounded-xl mb-1.5">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                    {user.employer} (@{user.employerDomain})
                  </span>
                </div>

                <div className="space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setActiveTab('wallet');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-between transition-colors"
                  >
                    <span>Escrow Vault</span>
                    <span className="text-[#0F766E] dark:text-[#14B8A6] font-bold font-mono text-[11px]">
                      {formatNgn(escrowBalanceNgn)}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setActiveTab('pass');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-between transition-colors"
                  >
                    <span>Sec 44 Digital Pass</span>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                      VERIFIED
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setShowProfileMenu(false);
                      setShowDownloadModal(true);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                      Install Offline PWA
                    </span>
                    <span className="text-[9px] font-mono bg-teal-500/15 text-[#0F766E] dark:text-[#14B8A6] font-bold px-1.5 py-0.5 rounded">
                      APP
                    </span>
                  </button>
                  <div className="pt-1 mt-1 border-t border-slate-200/70 dark:border-white/8">
                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Logo Hardware Cockpit Console Modal */}
      <InteractiveLogoCockpit
        isOpen={showCockpit}
        onClose={() => setShowCockpit(false)}
      />

      {/* PWA Installation & Offline Pass Modal */}
      {showDownloadModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDownloadModal(false);
          }}
        >
          <div className="w-full max-w-[360px] floating-surface rounded-2xl p-5 shadow-floating-lg dark:shadow-floating-dark-lg space-y-3.5 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/8">
              <div className="flex items-center gap-2.5">
                <img
                  src={getAssetPath('/logo.png')}
                  alt="CAR PULL Logo"
                  className="w-9 h-9 object-contain rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Install CAR PULL</h3>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold block">
                    Offline-Ready Commuter PWA
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setShowDownloadModal(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Add CAR PULL to your home screen for instant corridor access, offline pickup PINs, and Section 44 commute certificates.
            </p>

            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 btn-electric-mint text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 active-spring"
              >
                <Download className="w-4 h-4" />
                <span>Install CAR PULL App</span>
              </button>
            )}

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 dark:bg-[#090D11] border border-slate-200/70 dark:border-white/8 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <Smartphone className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>iOS (Safari)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal pl-5">
                  1. Tap <strong>Share</strong> <Share2 className="w-3 h-3 inline text-blue-500 mx-0.5" /> in the Safari toolbar.<br />
                  2. Select <strong>Add to Home Screen</strong>.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#090D11] border border-slate-200/70 dark:border-white/8 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Android (Chrome)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal pl-5">
                  1. Open the browser menu at top right.<br />
                  2. Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('success');
                const manifestContent = `CAR PULL - LAGOS STATE NON-COMMERCIAL COMMUTER PASS
=====================================================
Status: Sec 44 Safe Harbor Certified
Rider: ${user.fullName} (@${user.employerDomain})
Corridor: Admiralty Way (Lekki Phase 1) to Victoria Island
Escrow Security: Zero-Cash Peer Fuel Split
Government Exemption: Lagos State Transport Sector Reform Law Cap T1 Sec 44
Hotlines: LASTMA 0800-00-LASTMA | LASEMA 112 / 767
Timestamp: ${new Date().toISOString()}`;
                const blob = new Blob([manifestContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `CAR_PULL_PASS_${user.fullName.replace(/\s+/g, '_')}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active-press transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
              <span>Download Offline Pass (.txt)</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
