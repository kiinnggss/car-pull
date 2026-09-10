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
    <div className="w-full bg-white border border-[#DDD4C5] rounded-2xl p-2.5 space-y-2 shadow-xs">
      {/* Row 1: Compact Bid Stepper with Logo Styling */}
      <div className="flex items-center justify-between bg-[#F8F5EE] border border-[#DDD4C5] rounded-xl px-3 py-1">
        <span className="text-[10px] font-extrabold text-[#70665A] uppercase tracking-wider pl-0.5">
          Your Split Offer
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustBid(-500)}
            disabled={customBidNgn <= 500}
            className="w-7 h-7 rounded-lg bg-white hover:bg-stone-100 disabled:opacity-30 border border-[#DDD4C5] flex items-center justify-center text-[#141210] active-press transition-all shadow-2xs"
            title="Decrease split by ₦500"
          >
            <Minus className="w-3.5 h-3.5 text-[#70665A]" />
          </button>

          <span className={`text-xs font-serif font-black min-w-[70px] text-center ${isLocked ? 'text-red-600' : 'text-[#141210]'}`}>
            {formatNgn(customBidNgn)}
          </span>

          <button
            onClick={() => adjustBid(500)}
            className="w-7 h-7 rounded-lg bg-white hover:bg-stone-100 border border-[#DDD4C5] flex items-center justify-center text-[#0D6E6E] active-press transition-all shadow-2xs"
            title="Increase split by ₦500"
          >
            <Plus className="w-3.5 h-3.5 text-[#0D6E6E]" />
          </button>
        </div>
      </div>

      {/* Row 2: Thumb-Friendly Primary Actions */}
      <div className="flex items-center gap-2">
        {/* Pass Button */}
        <button
          onClick={onPass}
          className="w-[30%] min-h-[44px] bg-[#F8F5EE] hover:bg-red-50 border border-[#DDD4C5] hover:border-red-200 text-[#70665A] hover:text-red-700 rounded-xl flex items-center justify-center gap-1 font-bold text-xs transition-all active-press shadow-2xs"
        >
          <X className="w-3.5 h-3.5 text-[#70665A]" />
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

      {/* Row 3: Flowing Statutory Cost Breakdown (Inside the same card) */}
      <div className="pt-1.5 border-t border-[#DDD4C5] flex items-center justify-between text-[10px] text-[#70665A] font-medium">
        <span>Fuel: <strong className="text-[#141210]">{formatNgn(breakdown.fuelCostNgn)}</strong></span>
        <span className="text-[#D5CAB8]">•</span>
        <span>Toll: <strong className="text-[#141210]">{formatNgn(breakdown.tollFeeNgn)}</strong></span>
        <span className="text-[#D5CAB8]">•</span>
        <span>AC: <strong className="text-[#0D6E6E]">{formatNgn(breakdown.acSurchargeNgn)}</strong></span>
        <span className="text-[#D5CAB8]">•</span>
        <span>Cap: <strong className="text-red-700">{formatNgn(breakdown.maxLegalCeilingNgn)}</strong></span>
      </div>
    </div>
  );
};
