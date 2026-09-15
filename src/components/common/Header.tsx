'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store/useAppStore';
import { Lock, Sparkles, LogOut, ChevronDown, ArrowLeft, Sun, Zap, Moon, Compass, Download, Share2, Smartphone, X, Check } from 'lucide-react';
import { formatNgn } from '@/lib/utils';
import { InteractiveLogoCockpit } from './InteractiveLogoCockpit';
import { getAssetPath } from '@/lib/assets';
import { TripCategory } from '@/lib/types';
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
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
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
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult?.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const isInChatThread = activeTab === 'chats' && Boolean(activeThreadId);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/75 dark:bg-[#121110]/75 backdrop-blur-2xl border-b border-white/80 dark:border-white/10 px-3 py-1.5 space-y-1.5 transition-colors shadow-[0_4px_20px_0_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.4)] dark:shadow-[0_4px_20px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
      {/* Primary Row: Logo & Brand, Role Switcher, and User Profile */}
      <div className="flex items-center justify-between gap-2">
        {/* Brand or In-App Back Button */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {activeTab !== 'map' ? (
            <button
              onClick={() => {
                triggerHaptic('tap');
                if (isInChatThread) {
                  setActiveThreadId(null);
                } else {
                  setActiveTab('map');
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#1E1B18]/80 backdrop-blur-md hover:bg-white dark:hover:bg-stone-700 text-[#0D6E6E] dark:text-[#14B8A6] border border-[#0D6E6E]/30 dark:border-[#14B8A6]/40 font-bold text-xs shadow-2xs active:scale-95 transition-all"
              title={isInChatThread ? 'Return to Chat Inbox' : 'Return to Street Map'}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E] dark:text-amber-400" />
              <span>{isInChatThread ? 'Inbox' : 'Map'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setShowCockpit(true);
                }}
                className="p-1 rounded-xl bg-white/80 dark:bg-[#1E1B18]/80 backdrop-blur-md border border-[#C25E2E]/40 shadow-xs hover:border-[#0D6E6E] active:scale-95 transition-all flex-shrink-0"
                title="Tap to open Interactive Logo Cockpit"
              >
                <img
                  src={getAssetPath('/logo.png')}
                  alt="CAR PULL Logo"
                  className="w-7 h-7 object-contain"
                />
              </button>

              <div className="flex items-center gap-1">
                <span className="font-serif font-black text-sm text-[#141210] dark:text-[#EDE8E1] tracking-tight whitespace-nowrap">
                  CAR PULL
                </span>
                <span className="hidden sm:inline-block bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-[#121110] text-[8px] font-black px-1 py-0.2 rounded uppercase tracking-wider">
                  LAGOS
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dense Role Switcher (Rider / Driver) */}
        <div className="flex bg-white/70 dark:bg-stone-900/70 backdrop-blur-md p-0.5 rounded-xl border border-white/50 dark:border-stone-800 flex-shrink-0 shadow-2xs">
          <button
            onClick={() => {
              triggerHaptic('switch');
              setActiveRole('rider');
            }}
            className={`text-[11px] px-2 py-0.5 rounded-lg transition-all ${
              activeRole === 'rider'
                ? 'bg-white dark:bg-[#1E1B18] text-[#141210] dark:text-white shadow-2xs font-black'
                : 'text-[#70665A] dark:text-stone-400 hover:text-[#141210] font-bold'
            }`}
          >
            Rider
          </button>
          <button
            onClick={() => {
              triggerHaptic('switch');
              setActiveRole('driver');
            }}
            className={`text-[11px] px-2 py-0.5 rounded-lg transition-all ${
              activeRole === 'driver'
                ? 'bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-[#121110] shadow-2xs font-black'
                : 'text-[#70665A] dark:text-stone-400 hover:text-[#141210] font-bold'
            }`}
          >
            Driver
          </button>
        </div>

        {/* Profile Avatar, Wallet Chip, and Theme Switcher */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('wallet');
            }}
            className="flex items-center gap-1 bg-purple-50/80 dark:bg-purple-950/40 backdrop-blur-md hover:bg-purple-100/90 dark:hover:bg-purple-900/60 text-[#6D28D9] dark:text-purple-300 text-[10px] font-black px-1.5 py-1 rounded-xl border border-purple-200/60 dark:border-purple-700/50 transition-all active-press shadow-2xs"
            title="Open Escrow Wallet"
          >
            <Lock className="w-2.5 h-2.5 text-[#7C3AED] dark:text-purple-400" />
            <span>{formatNgn(escrowBalanceNgn)}</span>
          </button>

          {/* Download App Trigger */}
          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowDownloadModal(true);
            }}
            className="flex items-center gap-1 bg-[#0D6E6E]/10 dark:bg-[#14B8A6]/15 hover:bg-[#0D6E6E]/20 dark:hover:bg-[#14B8A6]/25 text-[#0D6E6E] dark:text-[#14B8A6] border border-[#0D6E6E]/30 dark:border-[#14B8A6]/30 px-2 py-1 rounded-xl text-xs font-bold transition-all active-press shadow-2xs backdrop-blur-md"
            title="Download / Install CAR PULL"
          >
            <Download className="w-3.5 h-3.5 text-[#0D6E6E] dark:text-[#14B8A6]" />
            <span className="hidden xs:inline text-[10px] font-black">Download</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('switch');
              toggleTheme();
            }}
            className="p-1 rounded-xl bg-white/80 dark:bg-[#1E1B18]/80 backdrop-blur-md hover:bg-white dark:hover:bg-stone-700 border border-white/50 dark:border-stone-800 transition-all active-press shadow-2xs text-[#141210] dark:text-stone-200"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowProfileMenu(!showProfileMenu);
              }}
              className="flex items-center gap-0.5 p-0.5 rounded-xl bg-white/80 dark:bg-[#1E1B18]/80 backdrop-blur-md hover:bg-white dark:hover:bg-stone-700 border border-white/50 dark:border-stone-800 transition-all active-press shadow-2xs"
              title="Account & Settings"
            >
              <div className="w-6 h-6 rounded-lg bg-[#0D6E6E]/10 dark:bg-[#14B8A6]/20 text-[#0D6E6E] dark:text-[#14B8A6] font-black text-xs flex items-center justify-center overflow-hidden border border-[#0D6E6E]/25 dark:border-[#14B8A6]/30">
                <span>{user.fullName ? user.fullName.charAt(0) : 'U'}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#70665A] dark:text-stone-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-10 w-52 bg-white/90 dark:bg-[#1E1B18]/90 backdrop-blur-2xl rounded-2xl p-2.5 shadow-2xl border border-white/60 dark:border-stone-700 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="border-b border-[#DDD4C5] dark:border-stone-800 pb-2 mb-2">
                  <span className="text-xs font-serif font-black text-[#141210] dark:text-[#EDE8E1] block truncate">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-[#70665A] dark:text-stone-400 block truncate">
                    {user.employer} (@{user.employerDomain})
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setActiveTab('wallet');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-[#141210] dark:text-stone-200 font-bold flex items-center justify-between"
                  >
                    <span>Escrow Balance</span>
                    <span className="text-[#0D6E6E] dark:text-[#14B8A6] font-black font-mono text-[11px]">
                      {formatNgn(escrowBalanceNgn)}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setActiveTab('pass');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-[#141210] dark:text-stone-200 font-bold flex items-center justify-between"
                  >
                    <span>Sec 44 Digital Pass</span>
                    <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">
                      VERIFIED
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setShowProfileMenu(false);
                      setShowDownloadModal(true);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-[#141210] dark:text-stone-200 font-bold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-[#0D6E6E] dark:text-[#14B8A6]" />
                      Download / Install App
                    </span>
                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                      PWA
                    </span>
                  </button>
                  <div className="border-t border-[#DDD4C5] dark:border-stone-800 pt-1 mt-1">
                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5"
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



      {/* Interactive 3D Logo Hardware Cockpit Console Modal */}
      <InteractiveLogoCockpit
        isOpen={showCockpit}
        onClose={() => setShowCockpit(false)}
      />

      {/* Apple VisionOS Liquid Glass Download & Installation Modal (Portaled to document.body) */}
      {showDownloadModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDownloadModal(false);
          }}
        >
          <div className="w-full max-w-[360px] bg-white/95 dark:bg-[#181614]/95 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_16px_48px_0_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.4)] dark:shadow-[0_16px_48px_0_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-white/80 dark:border-white/12 space-y-3.5 text-[#141210] dark:text-[#EDE8E1]">
            <div className="flex items-center justify-between border-b border-white/60 dark:border-stone-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <img
                  src={getAssetPath('/logo.png')}
                  alt="CAR PULL Logo"
                  className="w-9 h-9 object-contain rounded-xl p-1 bg-white dark:bg-stone-900 border border-white/80 dark:border-stone-800 shadow-xs"
                />
                <div>
                  <h3 className="text-sm font-serif font-black">Download CAR PULL</h3>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                    Fast • Offline-Ready PWA
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setShowDownloadModal(false);
                }}
                className="p-1.5 rounded-full text-[#70665A] dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#70665A] dark:text-stone-300 leading-relaxed">
              Install CAR PULL directly to your phone or desktop home screen. Launch instantly without opening the browser, with offline dispatch and verified Sec 44 commute certificates.
            </p>

            {/* Direct 1-Click Install Button if supported */}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 bg-gradient-to-r from-[#0D6E6E] to-[#094E4E] text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-md active-press transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install CAR PULL App (1-Click)</span>
              </button>
            )}

            {/* Step-by-step guides for iOS & Android */}
            <div className="space-y-2 text-xs">
              <div className="bg-white/60 dark:bg-white/[0.05] p-2.5 rounded-2xl border border-white/60 dark:border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-[#141210] dark:text-stone-100">
                  <Smartphone className="w-3.5 h-3.5 text-[#0D6E6E] dark:text-[#14B8A6]" />
                  <span>iPhone / iPad (Safari)</span>
                </div>
                <p className="text-[11px] text-[#70665A] dark:text-stone-400 leading-normal pl-5">
                  1. Tap the <strong>Share</strong> button <Share2 className="w-3 h-3 inline text-blue-500 mx-0.5" /> in Safari.<br />
                  2. Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                </p>
              </div>

              <div className="bg-white/60 dark:bg-white/[0.05] p-2.5 rounded-2xl border border-white/60 dark:border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-[#141210] dark:text-stone-100">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Android (Chrome)</span>
                </div>
                <p className="text-[11px] text-[#70665A] dark:text-stone-400 leading-normal pl-5">
                  1. Tap the three dots <strong>⋮</strong> at the top right.<br />
                  2. Tap <strong>&ldquo;Install app&rdquo;</strong> or &ldquo;Add to Home screen&rdquo;.
                </p>
              </div>
            </div>

            {/* Offline certificate download trigger */}
            <button
              onClick={() => {
                triggerHaptic('success');
                const manifestContent = `CAR PULL - LAGOS STATE NON-COMMERCIAL COMMUTER PASS
=====================================================
Status: Sec 44 Safe Harbor Certified
Rider: ${user.fullName} (@${user.employerDomain})
Corridor: Admiralty Way (Lekki Phase 1) ➔ Victoria Island
Escrow Security: Zero-Cash Peer Fuel Split
Government Exemption: Lagos State Transport Sector Reform Law Cap T1 Sec 44
Hotlines: LASTMA 0800-00-LASTMA | LASEMA 112 / 767
Timestamp: ${new Date().toISOString()}`;
                const blob = new Blob([manifestContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `CAR_PULL_PASS_${user.fullName.replace(/\\s+/g, '_')}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full py-2 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 text-[#141210] dark:text-stone-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-white/40 dark:border-stone-700 active-press transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#0D6E6E] dark:text-[#14B8A6]" />
              <span>Download Offline Commute Pass (.txt)</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
