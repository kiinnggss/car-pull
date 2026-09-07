'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ShieldCheck, Lock, Sun, Moon, Sparkles, LogOut, ChevronDown } from 'lucide-react';
import { formatNgn } from '@/lib/utils';
import { InteractiveLogoCockpit } from './InteractiveLogoCockpit';
import { getAssetPath } from '@/lib/assets';

export const Header: React.FC = () => {
  const {
    user,
    activeRole,
    setActiveRole,
    escrowBalanceNgn,
    setActiveTab,
    commuteDirection,
    toggleCommuteDirection,
    logout,
  } = useAppStore();

  const [showCockpit, setShowCockpit] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-3.5 py-2.5 space-y-2">
      {/* Primary Row: Logo & Brand, Role Switcher, and User Profile with Sign Out */}
      <div className="flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCockpit(true)}
            className="relative group p-0.5 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-amber-400 shadow-xs hover:scale-105 active:scale-95 transition-all flex-shrink-0"
            title="Tap to open 3D Interactive Cockpit"
          >
            <img
              src={getAssetPath('/logo.png')}
              alt="CAR PULL Logo"
              className="w-8 h-8 rounded-[12px] object-cover"
            />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-zinc-900 tracking-tight">
                CAR PULL
              </span>
              <span className="bg-[#7C3AED] text-white text-[9px] font-black px-1.5 py-0.2 rounded-md">
                LAGOS
              </span>
            </div>
          </div>
        </div>

        {/* Clean Role Toggle (Rider / Driver) */}
        <div className="flex bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/60">
          <button
            onClick={() => setActiveRole('rider')}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
              activeRole === 'rider'
                ? 'bg-white text-zinc-900 shadow-xs font-black'
                : 'text-zinc-500 hover:text-zinc-800 font-bold'
            }`}
          >
            Rider
          </button>
          <button
            onClick={() => setActiveRole('driver')}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
              activeRole === 'driver'
                ? 'bg-[#7C3AED] text-white shadow-xs font-black'
                : 'text-zinc-500 hover:text-zinc-800 font-bold'
            }`}
          >
            Driver
          </button>
        </div>

        {/* Profile & Sign Out Button */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 transition-all active:scale-95"
            title="Account & Sign Out"
          >
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-7 h-7 rounded-xl object-cover ring-1 ring-[#7C3AED]/30"
            />
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl p-2.5 shadow-xl border border-zinc-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="border-b border-zinc-100 pb-2 mb-2">
                <span className="text-xs font-black text-zinc-900 block truncate">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">
                  {user.employer} (@{user.employerDomain})
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setShowCockpit(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-2 py-1.5 rounded-xl hover:bg-purple-50 text-left text-xs font-bold text-zinc-700 flex items-center gap-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>3D Cockpit Console</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full px-2 py-1.5 rounded-xl hover:bg-red-50 text-left text-xs font-bold text-red-600 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Row: Corridor Direction & Escrow Chip */}
      <div className="flex items-center justify-between pt-0.5 text-xs">
        {/* Direction Toggle Chip */}
        <button
          onClick={toggleCommuteDirection}
          className="flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-zinc-200/80 transition-all active:scale-95"
          title="Tap to toggle Morning / Evening commute corridor"
        >
          {commuteDirection === 'morning' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>AM Outbound (Ajah ➔ VI)</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>PM Return (VI ➔ Ajah)</span>
            </>
          )}
          <span className="text-[9px] text-zinc-400 font-black">⇌</span>
        </button>

        {/* Escrow Balance Chip */}
        <button
          onClick={() => setActiveTab('wallet')}
          className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-900 text-[11px] font-black px-2.5 py-1 rounded-xl border border-purple-200 transition-all active:scale-95"
          title="Open Escrow Wallet"
        >
          <Lock className="w-3 h-3 text-[#7C3AED]" />
          <span>{formatNgn(escrowBalanceNgn)}</span>
        </button>
      </div>

      {/* Interactive 3D Logo Hardware Cockpit Console Modal */}
      <InteractiveLogoCockpit
        isOpen={showCockpit}
        onClose={() => setShowCockpit(false)}
      />
    </header>
  );
};
