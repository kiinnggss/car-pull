'use client';

import React from 'react';
import { calculateTripCost, formatNgn, MARKET_PMS_PRICE_PER_LITER } from '@/lib/utils';
import { Fuel, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface FairShareIndicatorProps {
  distanceKm: number;
  currentBidNgn: number;
  seats?: number;
  hasAc?: boolean;
}

export const FairShareIndicator: React.FC<FairShareIndicatorProps> = ({
  distanceKm,
  currentBidNgn,
  seats = 3,
  hasAc = true,
}) => {
  const breakdown = calculateTripCost(distanceKm, seats, hasAc, currentBidNgn);
  const { fairShareCostNgn, maxLegalCeilingNgn, isLegal } = breakdown;

  const percentage = Math.min(100, Math.round((currentBidNgn / maxLegalCeilingNgn) * 100));

  return (
    <div className="w-full bg-white rounded-2xl p-3.5 space-y-2 border border-zinc-100 shadow-2xs">
      {/* Title & Status */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-800">
          <Fuel className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fair Share Fuel Formula</span>
          <span className="text-[10px] text-zinc-400 font-mono">(@₦{MARKET_PMS_PRICE_PER_LITER}/L)</span>
        </div>

        {isLegal ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Legal Zero-Profit
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
            <Lock className="w-3 h-3" />
            Ceiling Exceeded
          </span>
        )}
      </div>

      {/* Sleek Progress Bar with Zero Layout Jitter */}
      <div className="space-y-1">
        <div className="relative h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
          {/* Target Fair Split Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-emerald-600 z-10"
            style={{ left: `${Math.min(100, (fairShareCostNgn / maxLegalCeilingNgn) * 100)}%` }}
            title={`Statutory Fair Split: ${formatNgn(fairShareCostNgn)}`}
          />

          {/* Current Bid Fill Bar */}
          <div
            className={`h-full transition-all duration-200 rounded-full ${
              !isLegal ? 'bg-red-500' : currentBidNgn < fairShareCostNgn ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-zinc-500 font-medium font-mono">
          <span>Min: ₦500</span>
          <span className="text-emerald-700 font-bold">Fair Split: {formatNgn(fairShareCostNgn)}</span>
          <span className="text-red-600 font-bold flex items-center gap-0.5">
            <Lock className="w-2.5 h-2.5" /> Cap: {formatNgn(maxLegalCeilingNgn)}
          </span>
        </div>
      </div>

      {/* Seamless Inline Cost Breakdown - No Clunky Box Grid */}
      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-600">
        <div>
          <span className="text-zinc-400">Fuel: </span>
          <strong className="text-zinc-800">{formatNgn(breakdown.fuelCostNgn)}</strong>
        </div>
        <span className="text-zinc-300">•</span>
        <div>
          <span className="text-zinc-400">Toll: </span>
          <strong className="text-zinc-800">{formatNgn(breakdown.tollFeeNgn)}</strong>
        </div>
        <span className="text-zinc-300">•</span>
        <div>
          <span className="text-zinc-400">AC Chill: </span>
          <strong className="text-cyan-700">{formatNgn(breakdown.acSurchargeNgn)}</strong>
        </div>
      </div>

      {!isLegal && (
        <div className="bg-red-50 rounded-xl p-2 flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-800 leading-tight">
            <strong>LEGAL_CEILING_LOCK:</strong> Capped at 1.2x operating costs to preserve private carpool status under Lagos State Transport regulations.
          </p>
        </div>
      )}
    </div>
  );
};
