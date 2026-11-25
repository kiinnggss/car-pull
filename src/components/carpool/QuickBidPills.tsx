'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn, calculateTripCost } from '@/lib/utils';
import { Minus, Plus, X, RotateCcw, Check } from 'lucide-react';
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
    <div className="w-full flex items-center gap-2 pt-2.5 select-none">
      {/* Rewind Deck */}
      <button
        onClick={() => {
          triggerHaptic('tap');
          resetDeck();
        }}
        className="w-11 h-11 rounded-xl border flex items-center justify-center active-press flex-shrink-0"
        style={{
          backgroundColor: 'var(--bg-sheet)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-secondary)',
        }}
        title="Rewind Deck"
        aria-label="Rewind Deck"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Pass */}
      <button
        onClick={onReject}
        className="w-11 h-11 rounded-xl border flex items-center justify-center active-press flex-shrink-0 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
        style={{
          backgroundColor: 'var(--bg-sheet)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
        title="Pass on Ride"
        aria-label="Pass on Ride"
      >
        <X className="w-4 h-4 stroke-[2.2]" />
      </button>

      {/* Clean Fare Stepper */}
      <div
        className="flex-1 h-11 rounded-xl px-1.5 flex items-center justify-between border"
        style={{
          backgroundColor: 'var(--bg-sheet)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={() => handleAdjust(-200)}
          disabled={customBidNgn <= 500}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 active-press"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-primary)',
          }}
          title="Decrease split by ₦200"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="text-center px-1">
          <span className="text-sm font-bold font-mono tabular-nums block leading-none">
            {formatNgn(customBidNgn)}
          </span>
          <span
            className="text-[9px] font-medium block mt-0.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {customBidNgn >= statutoryMaxSeatBidNgn ? 'Max cap' : 'Fuel split'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleAdjust(200)}
          disabled={customBidNgn >= statutoryMaxSeatBidNgn}
          className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 active-press"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-primary)',
          }}
          title="Increase split by ₦200"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Book CTA */}
      <button
        onClick={onAccept}
        className="h-11 px-4 btn-electric-mint flex items-center justify-center gap-1.5 text-xs active-press flex-shrink-0"
        title="Reserve Seat & Hold Escrow"
      >
        <Check className="w-4 h-4 stroke-[2.5]" />
        <span>Book</span>
      </button>
    </div>
  );
};
