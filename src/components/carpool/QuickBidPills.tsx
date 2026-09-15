'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn, calculateTripCost } from '@/lib/utils';
import { Plus, Minus, Check, X, Lock, Fuel, CheckCircle2 } from 'lucide-react';

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
    /* Unified Ergonomic Single-Row Action Bar */
    <div className="w-full flex items-center justify-between gap-2 px-1 py-1">
      {/* 1. Pass Button (Tactile dismissal) */}
      <button
        onClick={onPass}
        className="w-12 h-12 rounded-2xl bg-white dark:bg-[#181615] hover:bg-red-50 dark:hover:bg-red-950/40 border border-stone-200/90 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 shadow-sm flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
        title="Pass ride"
        aria-label="Pass ride"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* 2. Fuel Split Stepper (Center frosted capsule) */}
      <div className="flex-1 h-12 rounded-2xl bg-white/90 dark:bg-[#181615]/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-sm flex items-center justify-between px-2.5">
        <button
          onClick={() => adjustBid(-500)}
          disabled={customBidNgn <= 500}
          className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-30 flex items-center justify-center text-stone-700 dark:text-stone-300 transition-all active:scale-90"
          title="Decrease fuel split by ₦500"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col items-center justify-center leading-none">
          <span className={`text-sm font-bold tracking-tight ${isLocked ? 'text-red-600' : 'text-[#141210] dark:text-stone-100'}`}>
            {formatNgn(customBidNgn)}
          </span>
          <span className="text-[9px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
            fair fuel split
          </span>
        </div>

        <button
          onClick={() => adjustBid(500)}
          className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-[#0D6E6E] dark:text-[#14B8A6] transition-all active:scale-90"
          title="Increase fuel split by ₦500"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Accept Seat Button */}
      <button
        onClick={onAccept}
        disabled={isLocked}
        className={`h-12 px-5 rounded-2xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 shadow-md flex-shrink-0 ${
          isLocked
            ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed border border-stone-300 dark:border-stone-700'
            : 'bg-[#0D6E6E] hover:bg-[#0A5656] text-white shadow-teal-950/10'
        }`}
        title={isLocked ? 'Legal fare ceiling exceeded' : 'Accept ride and reserve seat'}
      >
        {isLocked ? (
          <>
            <Lock className="w-3.5 h-3.5 text-red-500" />
            <span>Exceeded</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4 stroke-[2.5] text-emerald-300" />
            <span>Accept</span>
          </>
        )}
      </button>
    </div>
  );
};
