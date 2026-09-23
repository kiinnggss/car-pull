'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn, calculateTripCost } from '@/lib/utils';
import { Plus, Minus, Check, X, Lock } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface QuickBidPillsProps {
  onAccept: () => void;
  onPass: () => void;
}

export const QuickBidPills: React.FC<QuickBidPillsProps> = ({ onAccept, onPass }) => {
  const { customBidNgn, adjustBid, currentDriver } = useAppStore();

  const distance = currentDriver?.corridor.distance_km || 26.5;
  const breakdown = calculateTripCost(distance, 3, true, customBidNgn);
  const isLocked = !breakdown.isLegal;

  return (
    /* Unified Ergonomic Cockpit Pill: Connected Unibody Floating Control */
    <div className="w-full flex items-center justify-between gap-2 px-1 py-1">
      {/* 1. Pass Button: Tactile circular dismissal */}
      <button
        onClick={() => {
          triggerHaptic('tap');
          onPass();
        }}
        className="w-12 h-12 rounded-2xl floating-pill bg-white/95 dark:bg-[#12161A]/95 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 shadow-specular flex items-center justify-center transition-all active-spring flex-shrink-0"
        title="Pass ride"
        aria-label="Pass ride"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* 2. Fuel Split Stepper: Center frosted capsule with tabular mono fare */}
      <div className="flex-1 h-12 rounded-2xl floating-surface bg-white/95 dark:bg-[#12161A]/95 shadow-specular flex items-center justify-between px-2.5">
        <button
          onClick={() => {
            triggerHaptic('tap');
            adjustBid(-500);
          }}
          disabled={customBidNgn <= 500}
          className="w-8 h-8 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-25 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all active-spring shadow-xs"
          title="Decrease fuel split by ₦500"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col items-center justify-center leading-none">
          <span className={`text-sm font-black font-mono tabular-nums tracking-tight ${isLocked ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'}`}>
            {formatNgn(customBidNgn)}
          </span>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            Fair fuel split
          </span>
        </div>

        <button
          onClick={() => {
            triggerHaptic('tap');
            adjustBid(500);
          }}
          className="w-8 h-8 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 transition-all active-spring shadow-xs"
          title="Increase fuel split by ₦500"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Accept Seat Button: Electric Mint with top specular highlight */}
      <button
        onClick={() => {
          triggerHaptic('match');
          onAccept();
        }}
        disabled={isLocked}
        className={`h-12 px-5 rounded-2xl flex items-center justify-center gap-1.5 font-black text-xs transition-all active-spring shadow-specular flex-shrink-0 ${
          isLocked
            ? 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-400 cursor-not-allowed shadow-xs'
            : 'btn-electric-mint'
        }`}
        title={isLocked ? 'Legal fare ceiling exceeded' : 'Accept ride and reserve seat'}
      >
        {isLocked ? (
          <>
            <Lock className="w-3.5 h-3.5 text-rose-500" />
            <span>Exceeded</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Reserve Seat</span>
          </>
        )}
      </button>
    </div>
  );
};
