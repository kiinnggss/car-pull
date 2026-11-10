'use client';

import React from 'react';
import { EmergencyProvider } from '@/lib/types';
import { ShieldCheck, Truck, Clock, AlertTriangle, Lock, Zap, Star } from 'lucide-react';
import { formatNgn } from '@/lib/utils';

interface ProviderDispatchDeckProps {
  providers: (EmergencyProvider & {
    score: number;
    compatible: boolean;
    incompatibilityReason?: string;
  })[];
  onAcceptQuote: (provider: EmergencyProvider) => void;
}

export const ProviderDispatchDeck: React.FC<ProviderDispatchDeckProps> = ({
  providers,
  onAcceptQuote,
}) => {
  const fastestCompatibleFlatbed =
    providers.find((p) => p.compatible && p.category === 'flatbed_tow') ||
    providers.find((p) => p.compatible);

  return (
    <div className="space-y-3">
      {/* 1-Tap Instant Emergency Dispatch Hero */}
      {fastestCompatibleFlatbed && (
        <div className="bg-red-600 dark:bg-red-700 border border-red-500 rounded-2xl p-3.5 text-white space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono font-black text-[11px] uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>INSTANT EXPRESSWAY DISPATCH</span>
            </div>
            <span className="text-[10px] font-mono tabular-nums bg-black/25 px-2 py-0.5 rounded-md font-bold">
              ETA {fastestCompatibleFlatbed.traffic_eta_minutes}M
            </span>
          </div>

          <p className="text-[11px] text-red-50 leading-snug">
            Stranded at a choke point on Lekki-Epe Expressway? Dispatch the closest compatible unit immediately.
          </p>

          <button
            onClick={() => onAcceptQuote(fastestCompatibleFlatbed)}
            className="w-full py-2.5 bg-white text-red-700 hover:bg-red-50 font-black text-xs rounded-xl active-press transition-all flex items-center justify-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>
              Dispatch {fastestCompatibleFlatbed.name.split(' ')[0]} Now (
              {formatNgn(fastestCompatibleFlatbed.flat_quote_ngn)})
            </span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            RESPONDING DISPATCH UNITS
          </span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          {providers.length} UNITS
        </span>
      </div>

      <div className="space-y-2.5">
        {providers.map((prov, index) => {
          const isTopPriority = index === 0 && prov.compatible;

          return (
            <div
              key={prov.id}
              className={`floating-surface rounded-2xl overflow-hidden transition-all ${
                !prov.compatible
                  ? 'opacity-70'
                  : isTopPriority
                  ? 'ring-1 ring-[#0F766E] dark:ring-[#14B8A6]'
                  : ''
              }`}
            >
              {/* Header: Operator Photo, Name, Rating, and Priority Badge */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-200/70 dark:border-white/8">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={prov.operator_photo}
                    alt={prov.operator_name}
                    loading="lazy"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 dark:border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                      {prov.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400">
                      <span className="truncate">Lead: {prov.operator_name}</span>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-mono font-bold flex items-center gap-0.5 flex-shrink-0">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        {prov.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {isTopPriority && (
                    <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider bg-teal-500/12 border border-teal-500/25 text-[#0F766E] dark:text-[#14B8A6] px-2 py-0.5 rounded-md">
                      TOP MATCH
                    </span>
                  )}
                  <span className="plate-badge">{prov.plate_number}</span>
                </div>
              </div>

              {/* Equipment Spec & Telemetry Strip */}
              <div className="px-3.5 py-2.5 bg-slate-50/70 dark:bg-[#0D1218]/60 border-b border-slate-200/70 dark:border-white/8 space-y-2">
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 truncate">
                    <Truck className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
                    <span className="truncate">{prov.truck_type}</span>
                  </span>

                  <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-mono font-bold flex items-center gap-1 flex-shrink-0 text-[9px]">
                    <ShieldCheck className="w-3 h-3" />
                    {prov.lasdri_id}
                  </span>
                </div>

                <div className="grid grid-cols-3 divide-x divide-slate-200/70 dark:divide-white/8 pt-1 text-[10px] font-mono tabular-nums">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[8.5px]">DIST</span>
                    <strong className="text-slate-900 dark:text-slate-100">{prov.distance_km} km</strong>
                  </div>
                  <div className="px-2">
                    <span className="text-slate-400 dark:text-slate-500 block text-[8.5px]">TRAFFIC ETA</span>
                    <strong className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {prov.traffic_eta_minutes}m
                    </strong>
                  </div>
                  <div className="pl-2 text-right">
                    <span className="text-slate-400 dark:text-slate-500 block text-[8.5px]">FIT SCORE</span>
                    <strong className="text-[#0F766E] dark:text-[#14B8A6]">{prov.score}/100</strong>
                  </div>
                </div>
              </div>

              {/* Incompatibility Warning */}
              {!prov.compatible && (
                <div className="px-3.5 py-2 bg-red-500/10 border-b border-red-500/20 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-800 dark:text-red-300 leading-tight">
                    <strong>Drivetrain Safety Block:</strong> {prov.incompatibilityReason}
                  </p>
                </div>
              )}

              {/* Quote Amount & Acceptance CTA */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-bold">
                    FIXED ESCROW QUOTE
                  </span>
                  <span className="text-base font-black font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {formatNgn(prov.flat_quote_ngn)}
                  </span>
                </div>

                <button
                  onClick={() => onAcceptQuote(prov)}
                  disabled={!prov.compatible}
                  className={`min-h-[38px] px-3.5 rounded-xl flex items-center gap-1.5 font-extrabold text-xs transition-all active-press ${
                    !prov.compatible
                      ? 'bg-slate-100 dark:bg-[#171F29] text-slate-400 dark:text-slate-600 border border-slate-200/80 dark:border-white/5 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Accept & Lock Escrow</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
