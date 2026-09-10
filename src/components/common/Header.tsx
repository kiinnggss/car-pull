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
              onClick={() => {
                triggerHaptic('tap');
                setActiveTab('deck');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-stone-100 text-[#0D6E6E] border border-[#0D6E6E]/30 font-bold text-xs shadow-2xs active:scale-95 transition-all"
              title="Return to Corridor Deck"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E]" />
              <span>Deck</span>
            </button>
          ) : (
            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowCockpit(true);
              }}
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
            onClick={() => {
              triggerHaptic('switch');
              setActiveRole('rider');
            }}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
              activeRole === 'rider'
                ? 'bg-white text-[#141210] shadow-2xs font-black'
                : 'text-[#70665A] hover:text-[#141210] font-bold'
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
            onClick={() => {
              triggerHaptic('tap');
              setShowProfileMenu(!showProfileMenu);
            }}
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
                    triggerHaptic('tap');
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
                    triggerHaptic('tap');
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

      {/* Secondary Row: Adaptable Trip Vibe & Anytime Filter + Escrow Balance */}
      <div className="flex items-center justify-between gap-1.5 pt-0.5">
        {/* Horizontal Scrollable Vibe Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 shadow-2xs border ${
                  isActive
                    ? 'bg-[#0D6E6E] text-white border-[#0D6E6E]'
                    : 'bg-white text-[#70665A] border-[#DDD4C5] hover:text-[#141210] hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-amber-300' : 'text-[#C25E2E]'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Escrow Balance Chip */}
        <button
          onClick={() => {
            triggerHaptic('tap');
            setActiveTab('wallet');
          }}
          className="flex-shrink-0 flex items-center gap-1 bg-[#F5EEFB] hover:bg-purple-100 text-[#6D28D9] text-[11px] font-black px-2.5 py-1 rounded-xl border border-[#7C3AED]/30 transition-all active:scale-95 shadow-2xs"
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
