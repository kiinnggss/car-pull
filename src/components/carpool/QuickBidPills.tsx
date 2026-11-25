'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn, calculateTripCost } from '@/lib/utils';
import { Minus, Plus, X } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface QuickBidPillsProps {
  onReject: () => void;
  onAccept: () => void;
}

export const QuickBidPills: React.FC<QuickBidPillsProps> = ({ onReject, onAccept }) => {
  const { currentDriver, customBidNgn, adjustBid, riderRoute } = useAppStore();

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
    <div className="w-full flex items-center justify-between gap-3 px-2 pt-3 pb-1 select-none">
      {/* Left: Pass */}
      <button
        onClick={onReject}
        className="p-2 text-[var(--text-secondary)] hover:text-red-600 active-press"
        title="Pass"
        aria-label="Pass"
      >
        <X className="w-5 h-5 stroke-[2]" />
      </button>

      {/* Center: Clean Fare Stepper */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleAdjust(-200)}
          disabled={customBidNgn <= 500}
          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-25 active-press"
          title="Decrease by ₦200"
        >
          <Minus className="w-4 h-4" />
        </button>

        <span className="text-base font-bold font-mono tabular-nums min-w-[66px] text-center text-[var(--text-primary)]">
          {formatNgn(customBidNgn)}
        </span>

        <button
          type="button"
          onClick={() => handleAdjust(200)}
          disabled={customBidNgn >= statutoryMaxSeatBidNgn}
          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-25 active-press"
          title="Increase by ₦200"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Book */}
      <button
        onClick={onAccept}
        className="h-10 px-6 btn-electric-mint text-xs active-press flex-shrink-0"
      >
        Book
      </button>
    </div>
  );
};
