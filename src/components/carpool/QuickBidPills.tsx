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
    <div className="w-full space-y-2.5">
      {/* Quick Bid Counter Pill Actions */}
      <div className="flex items-center gap-2">
        {/* Decrease Pill (-₦500) */}
        <button
          onClick={() => adjustBid(-500)}
          disabled={customBidNgn <= 500}
          className="flex-1 min-h-[44px] bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-200 rounded-xl flex items-center justify-center gap-1 text-xs font-bold text-zinc-800 active:scale-95 transition-all shadow-2xs"
        >
          <Minus className="w-3.5 h-3.5 text-zinc-600" />
          <span>-₦500</span>
        </button>

        {/* Current Bid Display Chip */}
        <div className="px-3 min-h-[44px] bg-zinc-50 border border-[#7C3AED]/40 rounded-xl flex flex-col items-center justify-center shadow-2xs">
          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Your Bid</span>
          <span className={`text-sm font-black ${isLocked ? 'text-red-600' : 'text-zinc-900'}`}>
            {formatNgn(customBidNgn)}
          </span>
        </div>

        {/* Increase Pill (+₦500) */}
        <button
          onClick={() => adjustBid(500)}
          className="flex-1 min-h-[44px] bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl flex items-center justify-center gap-1 text-xs font-bold text-zinc-800 active:scale-95 transition-all shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>+₦500</span>
        </button>
      </div>

      {/* Main Dual Action Buttons: Pass vs Accept Seat */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Pass Button */}
        <button
          onClick={onPass}
          className="min-h-[48px] bg-zinc-100 hover:bg-red-50 border border-zinc-200 hover:border-red-300 text-zinc-700 hover:text-red-600 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 shadow-2xs"
        >
          <X className="w-4 h-4 text-red-500" />
          <span>Pass Corridor</span>
        </button>

        {/* Accept / Counter Button */}
        <button
          onClick={onAccept}
          disabled={isLocked}
          className={`min-h-[48px] rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 shadow-md ${
            isLocked
              ? 'bg-zinc-100 text-zinc-400 border border-zinc-300 cursor-not-allowed'
              : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[#7C3AED]/25 border border-[#A855F7]'
          }`}
        >
          {isLocked ? (
            <>
              <Lock className="w-4 h-4 text-red-500" />
              <span>Ceiling Locked</span>
            </>
          ) : (
            <div className="flex flex-col items-center leading-tight">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Accept ({formatNgn(customBidNgn)})</span>
              </span>
              {currentDriver && (
                <span className="text-[10px] text-purple-200 font-mono">
                  {currentDriver.vehicle.make} • {currentDriver.vehicle.plate_number}
                </span>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
