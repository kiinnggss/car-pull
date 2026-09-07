'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ShieldCheck, Lock, Compass, Sun, Moon, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
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
    trafficAlerts,
  } = useAppStore();

  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [showCockpit, setShowCockpit] = useState(false);

  const cycleAlert = () => {
    setActiveAlertIndex((prev) => (prev + 1) % trafficAlerts.length);
  };

  const currentAlert = trafficAlerts[activeAlertIndex] || trafficAlerts[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-zinc-100 px-3.5 py-2.5 space-y-2">
      <div className="flex items-center justify-between">
        {/* Brand Logo & Interactive Cockpit Launcher */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCockpit(true)}
            className="relative group p-0.5 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-amber-400 to-[#6D28D9] shadow-xs hover:scale-105 active:scale-95 transition-all flex-shrink-0"
            title="Tap to open Interactive Logo Cockpit"
          >
            <img
              src={getAssetPath('/logo.png')}
              alt="CAR PULL Logo"
              className="w-9 h-9 rounded-[14px] object-cover"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-zinc-950 text-[8px] font-black px-1 rounded-full shadow-xs border border-white flex items-center">
              ⚡
            </span>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="bg-[#7C3AED] text-white text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                CAR PULL
              </span>
              <button
                onClick={() => setShowCockpit(true)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7C3AED] bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full transition-colors active:scale-95"
                title="Open Interactive Hardware Console"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                Cockpit
              </button>
            </div>

          {/* Commute Direction Switcher */}
          <button
            onClick={toggleCommuteDirection}
            className="text-[11px] text-zinc-700 font-bold mt-1 flex items-center gap-1 hover:text-[#7C3AED] transition-colors group"
            title="Tap to switch between Morning and Evening commute corridor"
          >
            {commuteDirection === 'morning' ? (
              <span className="flex items-center gap-1 text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded-md text-[10px]">
                <Sun className="w-3 h-3 text-amber-500" /> AM Outbound: Ajah ➔ VI / Marina
              </span>
            ) : (
              <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50/80 px-1.5 py-0.5 rounded-md text-[10px]">
                <Moon className="w-3 h-3 text-indigo-500" /> PM Return: VI / Marina ➔ Ajah
              </span>
            )}
          </button>
        </div>
      </div>

        {/* Top Right: Direction Toggle Pill & Escrow */}
        <div className="flex items-center gap-1.5">
          {/* Quick AM/PM Pill */}
          <button
            onClick={toggleCommuteDirection}
            className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold rounded-lg transition-all active:scale-95"
          >
            {commuteDirection === 'morning' ? '🌅 AM' : '🌆 PM'}
          </button>

          {/* Minimal Escrow Pill */}
          <button
            onClick={() => setActiveTab('wallet')}
            className="flex flex-col items-end px-2.5 py-1 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 transition-colors text-right active:scale-95 border border-purple-100/60"
            title="View In-App Escrow Balance"
          >
            <span className="text-[9px] text-[#7C3AED] uppercase tracking-wider font-bold flex items-center gap-0.5">
              <Lock className="w-2.5 h-2.5" /> Escrow
            </span>
            <span className="text-xs font-black text-zinc-900 tracking-tight">
              {formatNgn(escrowBalanceNgn)}
            </span>
          </button>
        </div>
      </div>

      {/* Live Corridor Traffic & Flooding Marquee */}
      {currentAlert && (
        <div
          onClick={cycleAlert}
          className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-zinc-50 border border-zinc-100 text-[10px] text-zinc-600 cursor-pointer hover:bg-zinc-100/70 transition-colors"
          title="Tap to cycle corridor traffic updates"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="font-bold text-zinc-800 flex-shrink-0">{currentAlert.location}:</span>
            <span className="truncate">{currentAlert.message}</span>
          </div>
          <ChevronRight className="w-3 h-3 text-zinc-400 flex-shrink-0 ml-1" />
        </div>
      )}

      {/* Corridor Affiliation & Role Switch */}
      <div className="pt-1 border-t border-zinc-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-zinc-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium truncate max-w-[190px]">
            {user.employer} <span className="text-zinc-400">(@{user.employerDomain})</span>
          </span>
        </div>

        {/* Lightweight Role Toggle: Rider / Driver */}
        <div className="flex bg-zinc-100 p-0.5 rounded-lg">
          <button
            onClick={() => setActiveRole('rider')}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
              activeRole === 'rider'
                ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Rider
          </button>
          <button
            onClick={() => setActiveRole('driver')}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
              activeRole === 'driver'
                ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Driver
          </button>
        </div>
      </div>

      {/* Interactive 3D Logo Hardware Cockpit Console Modal */}
      <InteractiveLogoCockpit
        isOpen={showCockpit}
        onClose={() => setShowCockpit(false)}
      />
    </header>
  );
};
