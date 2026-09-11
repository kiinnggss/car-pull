'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Lock, Sparkles, LogOut, ChevronDown, ArrowLeft, Sun, Zap, Moon, Compass } from 'lucide-react';
import { formatNgn } from '@/lib/utils';
import { InteractiveLogoCockpit } from './InteractiveLogoCockpit';
import { getAssetPath } from '@/lib/assets';
import { TripCategory } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';

const TRIP_MODES: { id: TripCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All Rides', icon: Sparkles },
  { id: 'leaving_now', label: 'Leaving Soon', icon: Zap },
  { id: 'morning', label: 'Morning Travel', icon: Sun },
  { id: 'evening', label: 'Evening Return', icon: Moon },
  { id: 'flexible', label: 'Anytime / Day', icon: Compass },
];

export const Header: React.FC = () => {
  const {
    user,
    activeRole,
    setActiveRole,
    escrowBalanceNgn,
    activeTab,
    setActiveTab,
    activeTripMode,
    setActiveTripMode,
    logout,
    theme,
    toggleTheme,
  } = useAppStore();

  const [showCockpit, setShowCockpit] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F6F2EA]/95 dark:bg-[#121110]/95 backdrop-blur-md border-b border-[#DDD4C5] dark:border-stone-800 px-3 py-2 space-y-1.5 transition-colors">
      {/* Primary Row: Logo & Brand, Role Switcher, and User Profile */}
      <div className="flex items-center justify-between gap-2">
        {/* Brand & Optional In-App Back Button */}
        <div className="flex items-center gap-1.5">
          {activeTab !== 'deck' ? (
            <button
              onClick={() => {
                triggerHaptic('tap');
                setActiveTab('deck');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-[#1E1B18] hover:bg-stone-100 dark:hover:bg-stone-700 text-[#0D6E6E] dark:text-[#14B8A6] border border-[#0D6E6E]/30 dark:border-[#14B8A6]/40 font-bold text-xs shadow-2xs active:scale-95 transition-all"
              title="Return to Corridor Deck"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E] dark:text-amber-400" />
              <span>Deck</span>
            </button>
          ) : (
            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowCockpit(true);
              }}
              className="p-1 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#C25E2E]/40 shadow-xs hover:border-[#0D6E6E] active:scale-95 transition-all flex-shrink-0"
              title="Tap to open Interactive Logo Cockpit"
            >
              <img
                src={getAssetPath('/logo.png')}
                alt="CAR PULL Logo"
                className="w-7 h-7 object-contain"
              />
            </button>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-sm text-[#141210] dark:text-[#EDE8E1] tracking-tight">
                CAR PULL
              </span>
              <span className="bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-[#121110] text-[8px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                LAGOS
              </span>
            </div>
          </div>
        </div>

        {/* Dense Role Switcher (Rider / Driver) */}
        <div className="flex bg-[#ECE5D8] dark:bg-stone-900 p-0.5 rounded-xl border border-[#DDD4C5] dark:border-stone-800">
          <button
            onClick={() => {
              triggerHaptic('switch');
              setActiveRole('rider');
            }}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
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
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
              activeRole === 'driver'
                ? 'bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-[#121110] shadow-2xs font-black'
                : 'text-[#70665A] dark:text-stone-400 hover:text-[#141210] font-bold'
            }`}
          >
            Driver
          </button>
        </div>

        {/* Profile Avatar, Wallet Chip, and Theme Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('wallet');
            }}
            className="flex items-center gap-1 bg-[#F5EEFB] dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-[#6D28D9] dark:text-purple-300 text-[10.5px] font-black px-2 py-1 rounded-xl border border-[#7C3AED]/30 dark:border-purple-700/50 transition-all active-press shadow-2xs"
            title="Open Escrow Wallet"
          >
            <Lock className="w-2.5 h-2.5 text-[#7C3AED] dark:text-purple-400" />
            <span>{formatNgn(escrowBalanceNgn)}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('switch');
              toggleTheme();
            }}
            className="p-1.5 rounded-xl bg-white dark:bg-[#1E1B18] hover:bg-stone-100 dark:hover:bg-stone-700 border border-[#DDD4C5] dark:border-stone-800 transition-all active-press shadow-2xs text-[#141210] dark:text-stone-200"
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
              className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#1E1B18] hover:bg-stone-100 dark:hover:bg-stone-700 border border-[#DDD4C5] dark:border-stone-800 transition-all active-press shadow-2xs"
              title="Account & Settings"
            >
              <div className="w-7 h-7 rounded-lg bg-[#0D6E6E]/10 dark:bg-[#14B8A6]/20 text-[#0D6E6E] dark:text-[#14B8A6] font-black text-xs flex items-center justify-center overflow-hidden border border-[#0D6E6E]/25 dark:border-[#14B8A6]/30">
                <span>{user.fullName ? user.fullName.charAt(0) : 'U'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#70665A] dark:text-stone-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-10 w-52 bg-white dark:bg-[#1E1B18] rounded-2xl p-2.5 shadow-2xl border border-[#DDD4C5] dark:border-stone-700 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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

      {/* Secondary Row: Trip Mode Filters with Full Horizontal Scroll (Corridor Deck Only) */}
      {activeTab === 'deck' && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 pt-1 w-full">
          {TRIP_MODES.map((mode) => {
            const isActive = activeTripMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  triggerHaptic('switch');
                  setActiveTripMode(mode.id);
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all active-press shadow-2xs border ${
                  isActive
                    ? 'bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-[#121110] border-[#0D6E6E] dark:border-[#14B8A6]'
                    : 'bg-white dark:bg-[#1E1B18] text-[#70665A] dark:text-stone-400 border-[#DDD4C5] dark:border-stone-800 hover:text-[#141210] dark:hover:text-stone-200'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-amber-300' : 'text-[#C25E2E] dark:text-amber-400'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Interactive 3D Logo Hardware Cockpit Console Modal */}
      <InteractiveLogoCockpit
        isOpen={showCockpit}
        onClose={() => setShowCockpit(false)}
      />
    </header>
  );
};
