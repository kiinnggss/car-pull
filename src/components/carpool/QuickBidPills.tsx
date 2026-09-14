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
    /* FLOWING UNIFIED ACTION & COST AUDIT CONSOLE (No separate disjointed boxes!) */
    <div className="w-full bg-white/85 dark:bg-[#181614]/85 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-2.5 space-y-2 shadow-xl">
      {/* Row 1: Compact Bid Stepper with Logo Styling */}
      <div className="flex items-center justify-between bg-[#F8F5EE]/75 dark:bg-stone-900/70 backdrop-blur-md border border-white/40 dark:border-stone-800 rounded-xl px-3 py-1">
        <span className="text-[10px] font-extrabold text-[#70665A] dark:text-stone-400 uppercase tracking-wider pl-0.5">
          Your Split Offer
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustBid(-500)}
            disabled={customBidNgn <= 500}
            className="w-7 h-7 rounded-lg bg-white/90 dark:bg-stone-800/90 hover:bg-white disabled:opacity-30 border border-white/60 dark:border-stone-700 flex items-center justify-center text-[#141210] dark:text-stone-100 active-press transition-all shadow-2xs"
            title="Decrease split by ₦500"
          >
            <Minus className="w-3.5 h-3.5 text-[#70665A] dark:text-stone-400" />
          </button>

          <span className={`text-xs font-serif font-black min-w-[70px] text-center ${isLocked ? 'text-red-600' : 'text-[#141210] dark:text-stone-100'}`}>
            {formatNgn(customBidNgn)}
          </span>

          <button
            onClick={() => adjustBid(500)}
            className="w-7 h-7 rounded-lg bg-white/90 dark:bg-stone-800/90 hover:bg-white border border-white/60 dark:border-stone-700 flex items-center justify-center text-[#0D6E6E] dark:text-[#14B8A6] active-press transition-all shadow-2xs"
            title="Increase split by ₦500"
          >
            <Plus className="w-3.5 h-3.5 text-[#0D6E6E] dark:text-[#14B8A6]" />
          </button>
        </div>
      </div>

      {/* Row 2: Thumb-Friendly Primary Actions */}
      <div className="flex items-center gap-2">
        {/* Pass Button */}
        <button
          onClick={onPass}
          className="w-[30%] min-h-[44px] bg-white/80 dark:bg-stone-800/80 hover:bg-red-50/80 border border-white/50 dark:border-stone-700 hover:border-red-200 text-[#70665A] dark:text-stone-300 hover:text-red-700 rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition-all active-press shadow-2xs backdrop-blur-md"
        >
          <X className="w-3.5 h-3.5 text-[#70665A] dark:text-stone-400" />
          <span>Pass</span>
        </button>

        {/* Accept Seat Button (Logo Colors: Teal gradient with vehicle plate) */}
        <button
          onClick={onAccept}
          disabled={isLocked}
          className={`flex-1 min-h-[44px] rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all active-press shadow-xs ${
            isLocked
              ? 'bg-stone-100 text-stone-400 border border-stone-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#0D6E6E] via-[#0F766E] to-[#6D28D9] hover:opacity-95 text-white'
          }`}
        >
          {isLocked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-red-500" />
              <span>Ceiling Exceeded</span>
            </>
          ) : (
            <div className="flex items-center gap-1.5 leading-tight">
              <Check className="w-3.5 h-3.5 text-emerald-200" />
              <span>Accept Ride</span>
              {currentDriver && (
                <span className="text-[9.5px] text-[#FEF3C7] font-mono font-black bg-black/25 px-1.5 py-0.2 rounded border border-white/20">
                  {currentDriver.vehicle.plate_number}
                </span>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
