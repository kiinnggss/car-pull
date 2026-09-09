'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Lock, Sun, Moon, Sparkles, LogOut, ChevronDown, ArrowRightLeft, ArrowLeft } from 'lucide-react';
import { formatNgn } from '@/lib/utils';
import { InteractiveLogoCockpit } from './InteractiveLogoCockpit';
import { getAssetPath } from '@/lib/assets';

export const Header: React.FC = () => {
  const {
    user,
    activeRole,
    setActiveRole,
    escrowBalanceNgn,
    activeTab,
    setActiveTab,
    commuteDirection,
    toggleCommuteDirection,
    logout,
  } = useAppStore();

  const [showCockpit, setShowCockpit] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F6F2EA]/95 backdrop-blur-md border-b border-[#DDD4C5] px-3 py-2 space-y-1.5">
      {/* Primary Row: Logo & Brand, Role Switcher, and User Profile */}
      <div className="flex items-center justify-between gap-2">
        {/* Brand & Optional In-App Back Button */}
        <div className="flex items-center gap-1.5">
          {activeTab !== 'deck' ? (
            <button
              onClick={() => setActiveTab('deck')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-stone-100 text-[#0D6E6E] border border-[#0D6E6E]/30 font-bold text-xs shadow-2xs active:scale-95 transition-all"
              title="Return to Corridor Deck"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E]" />
              <span>Deck</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCockpit(true)}
              className="p-1 rounded-xl bg-white border border-[#C25E2E]/40 shadow-xs hover:border-[#0D6E6E] active:scale-95 transition-all flex-shrink-0"
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
              <span className="font-serif font-black text-sm text-[#141210] tracking-tight">
                CAR PULL
              </span>
              <span className="bg-[#0D6E6E] text-white text-[8px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                LAGOS
              </span>
            </div>
          </div>
        </div>

        {/* Dense Role Switcher (Rider / Driver) */}
        <div className="flex bg-[#ECE5D8] p-0.5 rounded-xl border border-[#DDD4C5]">
          <button
            onClick={() => setActiveRole('rider')}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
              activeRole === 'rider'
                ? 'bg-white text-[#141210] shadow-2xs font-black'
                : 'text-[#70665A] hover:text-[#141210] font-bold'
            }`}
          >
            Rider
          </button>
          <button
            onClick={() => setActiveRole('driver')}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
              activeRole === 'driver'
                ? 'bg-[#0D6E6E] text-white shadow-2xs font-black'
                : 'text-[#70665A] hover:text-[#141210] font-bold'
            }`}
          >
            Driver
          </button>
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1 p-1 rounded-xl bg-white hover:bg-stone-100 border border-[#DDD4C5] transition-all active:scale-95 shadow-2xs"
            title="Account & Sign Out"
          >
            <div className="w-7 h-7 rounded-lg bg-[#0D6E6E]/10 text-[#0D6E6E] font-black text-xs flex items-center justify-center overflow-hidden border border-[#0D6E6E]/25">
              <span>{user.fullName ? user.fullName.charAt(0) : 'U'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#70665A]" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl p-2.5 shadow-2xl border border-[#DDD4C5] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="border-b border-[#DDD4C5] pb-2 mb-2">
                <span className="text-xs font-serif font-black text-[#141210] block truncate">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-[#70665A] block truncate">
                  {user.employer} (@{user.employerDomain})
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setShowCockpit(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-2 py-1.5 rounded-xl hover:bg-amber-50 text-left text-xs font-bold text-[#141210] flex items-center gap-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
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

      {/* Secondary Row: Direction Toggle & Escrow Chip */}
      <div className="flex items-center justify-between pt-0.5 text-xs">
        {/* Direction Toggle Chip */}
        <button
          onClick={toggleCommuteDirection}
          className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all active:scale-95 shadow-2xs ${
            commuteDirection === 'morning'
              ? 'bg-[#FFF9EE] border-[#C25E2E]/30 text-[#C25E2E] hover:bg-[#FFF3DC]'
              : 'bg-[#EEF7F7] border-[#0D6E6E]/30 text-[#0D6E6E] hover:bg-[#E0F2F1]'
          }`}
          title="Toggle Morning / Evening commute corridor"
        >
          {commuteDirection === 'morning' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#D97706]" />
              <span>AM Outbound (Ajah → VI)</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#0D6E6E]" />
              <span>PM Return (VI → Ajah)</span>
            </>
          )}
          <ArrowRightLeft className="w-3 h-3 text-[#70665A] ml-0.5" />
        </button>

        {/* Escrow Balance Chip */}
        <button
          onClick={() => setActiveTab('wallet')}
          className="flex items-center gap-1 bg-[#F5EEFB] hover:bg-purple-100 text-[#6D28D9] text-[11px] font-black px-2.5 py-1 rounded-xl border border-[#7C3AED]/30 transition-all active:scale-95 shadow-2xs"
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
