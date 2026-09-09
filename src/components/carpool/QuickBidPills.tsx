'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn, calculateTripCost } from '@/lib/utils';
import { Plus, Minus, Check, X, Lock } from 'lucide-react';

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
    <div className="w-full space-y-1.5">
      {/* Dense Stepper Row: Compact Fair-Split Bid Adjuster */}
      <div className="flex items-center justify-between bg-white border border-[#E7E2D8] rounded-xl px-2 py-1 shadow-2xs">
        <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider pl-1">
          Your Split
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustBid(-500)}
            disabled={customBidNgn <= 500}
            className="w-7 h-7 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F0E8] disabled:opacity-30 border border-[#E7E2D8] flex items-center justify-center text-[#1C1917] active:scale-95 transition-all"
            title="Decrease split by ₦500"
          >
            <Minus className="w-3 h-3 text-[#78716C]" />
          </button>

          <span className={`text-xs font-black min-w-[65px] text-center ${isLocked ? 'text-red-600' : 'text-[#1C1917]'}`}>
            {formatNgn(customBidNgn)}
          </span>

          <button
            onClick={() => adjustBid(500)}
            className="w-7 h-7 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F0E8] border border-[#E7E2D8] flex items-center justify-center text-[#7C3AED] active:scale-95 transition-all"
            title="Increase split by ₦500"
          >
            <Plus className="w-3 h-3 text-[#7C3AED]" />
          </button>
        </div>
      </div>

      {/* Streamlined Dual Action Buttons: Thumb-Friendly Ergonomics */}
      <div className="flex items-center gap-2">
        {/* Pass Corridor Button (Secondary) */}
        <button
          onClick={onPass}
          className="w-2/5 min-h-[44px] bg-white hover:bg-red-50/70 border border-[#E7E2D8] hover:border-red-200 text-[#78716C] hover:text-red-600 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 shadow-2xs"
        >
          <X className="w-3.5 h-3.5 text-[#A89F91] group-hover:text-red-500" />
          <span>Pass</span>
        </button>

        {/* Accept Seat Button (Primary Focus CTA) */}
        <button
          onClick={onAccept}
          disabled={isLocked}
          className={`flex-1 min-h-[44px] rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-[0.98] shadow-xs ${
            isLocked
              ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
              : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[#7C3AED]/20'
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
                <span className="text-[10px] text-purple-200 font-mono font-bold bg-white/15 px-1.5 py-0.2 rounded">
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
