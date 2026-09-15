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
        className="w-12 h-12 rounded-2xl bg-white dark:bg-[#12161A] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shadow-xs flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
        title="Pass ride"
        aria-label="Pass ride"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* 2. Fuel Split Stepper (Center frosted capsule) */}
      <div className="flex-1 h-12 rounded-2xl bg-white dark:bg-[#12161A] border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between px-2.5">
        <button
          onClick={() => adjustBid(-500)}
          disabled={customBidNgn <= 500}
          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all active:scale-90"
          title="Decrease fuel split by ₦500"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col items-center justify-center leading-none">
          <span className={`text-sm font-bold tracking-tight ${isLocked ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
            {formatNgn(customBidNgn)}
          </span>
          <span className="text-[9.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            fair fuel split
          </span>
        </div>

        <button
          onClick={() => adjustBid(500)}
          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-[#0F766E] dark:text-[#14B8A6] transition-all active:scale-90"
          title="Increase fuel split by ₦500"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Accept Seat Button */}
      <button
        onClick={onAccept}
        disabled={isLocked}
        className={`h-12 px-6 rounded-2xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 shadow-md flex-shrink-0 ${
          isLocked
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700'
            : 'bg-[#0F766E] hover:bg-[#0D655E] text-white shadow-teal-950/15'
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
            <Check className="w-4 h-4 stroke-[2.5] text-white" />
            <span>Accept</span>
          </>
        )}
      </button>
    </div>
  );
};
