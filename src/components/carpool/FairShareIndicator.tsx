'use client';

import React from 'react';
import { calculateTripCost, formatNgn, MARKET_PMS_PRICE_PER_LITER } from '@/lib/utils';
import { Fuel, Lock, CheckCircle2 } from 'lucide-react';

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

  return (
    <div className="w-full bg-white dark:bg-[#141C24] rounded-xl px-3 py-2 shadow-floating-sm space-y-1.5 text-xs">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-[#1C1917] dark:text-slate-200">
          <Fuel className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Fair Split: <strong className="text-emerald-700 dark:text-emerald-400">{formatNgn(fairShareCostNgn)}</strong></span>
          <span className="text-[10px] text-[#78716C] dark:text-slate-400">(@₦{MARKET_PMS_PRICE_PER_LITER}/L)</span>
        </div>

        {isLegal ? (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shadow-floating-sm">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Zero-Profit
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full shadow-floating-sm">
            <Lock className="w-2.5 h-2.5" />
            Cap Exceeded
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#78716C] dark:text-slate-400 pt-1">
        <span>Fuel: <strong className="text-[#1C1917] dark:text-slate-200">{formatNgn(breakdown.fuelCostNgn)}</strong></span>
        <span className="text-[#D5CEC2] dark:text-slate-700">•</span>
        <span>Toll: <strong className="text-[#1C1917] dark:text-slate-200">{formatNgn(breakdown.tollFeeNgn)}</strong></span>
        <span className="text-[#D5CEC2] dark:text-slate-700">•</span>
        <span>AC: <strong className="text-cyan-700 dark:text-cyan-400">{formatNgn(breakdown.acSurchargeNgn)}</strong></span>
        <span className="text-[#D5CEC2] dark:text-slate-700">•</span>
        <span>Cap: <strong className="text-red-700 dark:text-red-400">{formatNgn(maxLegalCeilingNgn)}</strong></span>
      </div>
    </div>
  );
};
