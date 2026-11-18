'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn, calculateTripCost, MARKET_PMS_PRICE_PER_LITER } from '@/lib/utils';
import { Minus, Plus, X, RotateCcw, Zap, Handshake } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface QuickBidPillsProps {
  onReject: () => void;
  onAccept: () => void;
}

export const QuickBidPills: React.FC<QuickBidPillsProps> = ({ onReject, onAccept }) => {
  const { currentDriver, customBidNgn, adjustBid, resetDeck, riderRoute } = useAppStore();

  if (!currentDriver) return null;

  const { maxLegalCeilingNgn: statutoryMaxSeatBidNgn } = calculateTripCost(
    riderRoute.distanceKm,
    4,
    true,
    customBidNgn
  );

  const handleAdjust = (delta: number) => {
    triggerHaptic('tap');
    adjustBid(delta);
  };

  return (
    <div className="w-full flex items-center justify-between gap-2 pt-1.5 select-none">
      {/* 1. Tinder BLK Circular Undo Button */}
      <button
        onClick={() => {
          triggerHaptic('tap');
          resetDeck();
        }}
        className="w-10 h-10 rounded-full bg-white dark:bg-[#14161B] border border-black/8 dark:border-white/10 text-[#0B0C0E] dark:text-white flex items-center justify-center active-press flex-shrink-0 shadow-sm"
        title="Rewind Deck"
        aria-label="Rewind Deck"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* 2. Tinder BLK Circular Pass (X) Button */}
      <button
        onClick={onReject}
        className="w-10 h-10 rounded-full bg-[#1E2028] text-white flex items-center justify-center active-press flex-shrink-0 shadow-md hover:bg-red-600 transition-colors"
        title="Pass on Ride"
        aria-label="Pass on Ride"
      >
        <X className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* 3. Uber Green Unified Price Stepper + Primary Pill CTA (`[ $21.75 | Order Now ]`) */}
      <div className="flex-1 bg-white dark:bg-[#14161B] border border-black/8 dark:border-white/10 rounded-full p-1 pl-2.5 flex items-center justify-between gap-2 shadow-sm">
        {/* Fuel Split Stepper */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleAdjust(-200)}
            disabled={customBidNgn <= 500}
            className="w-7 h-7 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white flex items-center justify-center disabled:opacity-30 active-press"
            title="Decrease split by ₦200"
          >
            <Minus className="w-3 h-3" />
          </button>

          <div className="text-center min-w-[64px]">
            <span className="text-sm font-black font-mono tabular-nums text-[#0B0C0E] dark:text-white block leading-none">
              {formatNgn(customBidNgn)}
            </span>
            <span className="text-[8px] font-mono uppercase tracking-wider text-[#525866] dark:text-[#9BA1AE] font-bold block mt-0.5">
              {customBidNgn >= statutoryMaxSeatBidNgn ? 'MAX CAP' : 'FUEL SPLIT'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleAdjust(200)}
            disabled={customBidNgn >= statutoryMaxSeatBidNgn}
            className="w-7 h-7 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white flex items-center justify-center disabled:opacity-30 active-press"
            title="Increase split by ₦200"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Professional Network Tinder / Uber Green Pill CTA */}
        <button
          onClick={onAccept}
          className="h-10 px-4 rounded-full btn-electric-mint flex items-center justify-center gap-1.5 text-xs font-extrabold active-press flex-shrink-0"
          title="Reserve Seat & Hold Escrow"
        >
          <Handshake className="w-3.5 h-3.5" />
          <span>Connect</span>
        </button>
      </div>
    </div>
  );
};
