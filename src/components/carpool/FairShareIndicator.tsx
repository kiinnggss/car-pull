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
    <div className="w-full bg-white rounded-xl px-3 py-1.5 border border-[#E7E2D8] shadow-2xs space-y-1 text-xs">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-[#1C1917]">
          <Fuel className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Fair Split: <strong className="text-emerald-700">{formatNgn(fairShareCostNgn)}</strong></span>
          <span className="text-[10px] text-[#78716C]">(@₦{MARKET_PMS_PRICE_PER_LITER}/L)</span>
        </div>

        {isLegal ? (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Zero-Profit
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.2 rounded-full">
            <Lock className="w-2.5 h-2.5" />
            Cap Exceeded
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#78716C] pt-1 border-t border-[#E7E2D8]">
        <span>Fuel: <strong className="text-[#1C1917]">{formatNgn(breakdown.fuelCostNgn)}</strong></span>
        <span className="text-[#D5CEC2]">•</span>
        <span>Toll: <strong className="text-[#1C1917]">{formatNgn(breakdown.tollFeeNgn)}</strong></span>
        <span className="text-[#D5CEC2]">•</span>
        <span>AC: <strong className="text-cyan-700">{formatNgn(breakdown.acSurchargeNgn)}</strong></span>
        <span className="text-[#D5CEC2]">•</span>
        <span>Cap: <strong className="text-red-700">{formatNgn(maxLegalCeilingNgn)}</strong></span>
      </div>
    </div>
  );
};
