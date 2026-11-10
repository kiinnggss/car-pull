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
    <div className="w-full flex items-center justify-between gap-2 py-0.5">
      {/* 1. Pass Button */}
      <button
        onClick={() => {
          triggerHaptic('tap');
          onPass();
        }}
        className="w-12 h-12 rounded-2xl floating-surface hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all active-spring flex-shrink-0"
        title="Pass driver"
        aria-label="Pass driver"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* 2. Fuel Split Stepper */}
      <div className="flex-1 h-12 rounded-2xl floating-surface flex items-center justify-between px-2">
        <button
          onClick={() => {
            triggerHaptic('tap');
            adjustBid(-500);
          }}
          disabled={customBidNgn <= 500}
          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#18222D] hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all active-spring"
          title="Decrease fuel split by ₦500"
          aria-label="Decrease fuel split by 500 Naira"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col items-center justify-center leading-none">
          <span
            className={`text-sm font-extrabold font-mono tabular-nums tracking-tight ${
              isLocked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatNgn(customBidNgn)}
          </span>
          <span
            className={`text-[9px] font-mono font-bold mt-0.5 ${
              isLocked
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {isLocked ? 'SEC 44 CEILING' : 'FAIR FUEL SPLIT'}
          </span>
        </div>

        <button
          onClick={() => {
            triggerHaptic('tap');
            adjustBid(500);
          }}
          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#18222D] hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-[#0F766E] dark:text-[#14B8A6] transition-all active-spring"
          title="Increase fuel split by ₦500"
          aria-label="Increase fuel split by 500 Naira"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Reserve Seat CTA */}
      <button
        onClick={() => {
          triggerHaptic('match');
          onAccept();
        }}
        disabled={isLocked}
        className={`h-12 px-4 rounded-2xl flex items-center justify-center gap-1.5 font-extrabold text-xs transition-all active-spring flex-shrink-0 ${
          isLocked
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-white/5 cursor-not-allowed'
            : 'btn-electric-mint'
        }`}
        title={isLocked ? 'Statutory non-commercial fare ceiling exceeded' : 'Accept ride and hold escrow'}
      >
        {isLocked ? (
          <>
            <Lock className="w-3.5 h-3.5 text-rose-500" />
            <span>Ceiling</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Reserve</span>
          </>
        )}
      </button>
    </div>
  );
};
