'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn, calculateTripCost } from '@/lib/utils';
import { Minus, Plus, X, RotateCcw, Handshake } from 'lucide-react';
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
    <div className="w-full flex items-center justify-between gap-2 pt-2 select-none">
      {/* Rewind Deck */}
      <button
        onClick={() => {
          triggerHaptic('tap');
          resetDeck();
        }}
        className="w-10 h-10 rounded-full border flex items-center justify-center active-press flex-shrink-0 shadow-sm"
        style={{
          backgroundColor: 'var(--bg-sheet)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
        title="Rewind Deck"
        aria-label="Rewind Deck"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Pass */}
      <button
        onClick={onReject}
        className="w-10 h-10 rounded-full border flex items-center justify-center active-press flex-shrink-0 shadow-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
        style={{
          backgroundColor: 'var(--bg-sheet)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
        }}
        title="Pass on Ride"
        aria-label="Pass on Ride"
      >
        <X className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Unified Price Stepper + Connect Pill */}
      <div
        className="flex-1 rounded-full p-1 pl-2.5 flex items-center justify-between gap-2 border shadow-sm"
        style={{
          backgroundColor: 'var(--bg-sheet)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleAdjust(-200)}
            disabled={customBidNgn <= 500}
            className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30 active-press"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
            }}
            title="Decrease split by ₦200"
          >
            <Minus className="w-3 h-3" />
          </button>

          <div className="text-center min-w-[60px]">
            <span className="text-sm font-black font-mono tabular-nums block leading-none">
              {formatNgn(customBidNgn)}
            </span>
            <span
              className="text-[8px] font-mono uppercase tracking-wider font-bold block mt-0.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              {customBidNgn >= statutoryMaxSeatBidNgn ? 'MAX CAP' : 'FUEL SPLIT'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleAdjust(200)}
            disabled={customBidNgn >= statutoryMaxSeatBidNgn}
            className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30 active-press"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
            }}
            title="Increase split by ₦200"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={onAccept}
          className="h-9 px-4 rounded-full btn-electric-mint flex items-center justify-center gap-1.5 text-xs font-extrabold active-press flex-shrink-0"
          title="Reserve Seat & Hold Escrow"
        >
          <Handshake className="w-3.5 h-3.5" />
          <span>Connect</span>
        </button>
      </div>
    </div>
  );
};
