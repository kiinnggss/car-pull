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
  const fastestCompatibleFlatbed = providers.find((p) => p.compatible && p.category === 'flatbed_tow') || providers.find((p) => p.compatible);

  return (
    <div className="space-y-2.5">
      {/* 1-Tap Instant Emergency Dispatch Hero */}
      {fastestCompatibleFlatbed && (
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-3.5 text-white shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4 fill-current text-yellow-300" />
              <span>Instant Emergency Dispatch</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              {fastestCompatibleFlatbed.traffic_eta_minutes} mins away
            </span>
          </div>

          <p className="text-[11px] text-white/90 leading-tight">
            Urgent choke point on Lekki-Epe expressway? Dispatch the closest verified flatbed without comparing quotes.
          </p>

          <button
            onClick={() => onAcceptQuote(fastestCompatibleFlatbed)}
            className="w-full py-2 bg-white text-red-700 hover:bg-zinc-100 font-black text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>
              Dispatch {fastestCompatibleFlatbed.name.split(' ')[0]} Now ({formatNgn(fastestCompatibleFlatbed.flat_quote_ngn)})
            </span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">
            All Responding Providers
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono">
          {providers.length} responding
        </span>
      </div>

      <div className="space-y-2">
        {providers.map((prov, index) => {
          const isTopPriority = index === 0 && prov.compatible;

          return (
            <div
              key={prov.id}
              className={`p-3.5 rounded-2xl transition-all ${
                !prov.compatible
                  ? 'bg-zinc-50/60 opacity-75'
                  : isTopPriority
                  ? 'bg-white ring-1.5 ring-[#7C3AED] shadow-sm'
                  : 'bg-white border border-zinc-100 shadow-2xs'
              }`}
            >
              {/* Header: Operator Photo, Name, Rating, and Priority Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={prov.operator_photo}
                    alt={prov.operator_name}
                    loading="lazy"
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 leading-tight">
                      {prov.name}
                    </h4>
                    <span className="text-[11px] text-zinc-400 block">
                      Lead: {prov.operator_name}
                    </span>
                  </div>
                </div>

                {isTopPriority && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-[#7C3AED] text-white px-2 py-0.5 rounded-md">
                    Top Match
                  </span>
                )}
              </div>

              {/* Equipment Spec & LASDRI Certification */}
              <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px]">
                <span className="text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#7C3AED]" />
                  {prov.truck_type}
                </span>

                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  LASDRI Certified
                </span>

                <span className="text-amber-600 font-bold flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{prov.rating}</span>
                </span>
              </div>

              {/* Flowing Metrics Line - No Clunky Box Grid */}
              <div className="mt-2 py-1.5 px-2.5 bg-zinc-50 rounded-xl flex items-center justify-between text-xs text-zinc-600">
                <span>Dist: <strong className="text-zinc-900">{prov.distance_km} km</strong></span>
                <span className="text-zinc-300">•</span>
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {prov.traffic_eta_minutes} mins ETA
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-400 font-mono text-[10px]">Score: {prov.score}</span>
              </div>

              {/* Incompatibility Warning (Phase 1 Filter) */}
              {!prov.compatible && (
                <div className="mt-2 bg-red-50 rounded-xl p-2 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-800 leading-tight">
                    <strong>Phase 1 Rejected:</strong> {prov.incompatibilityReason}
                  </p>
                </div>
              )}

              {/* Quote Amount & Acceptance CTA */}
              <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-medium">
                    Fixed Escrow Quote
                  </span>
                  <span className="text-base font-black text-zinc-900">
                    {formatNgn(prov.flat_quote_ngn)}
                  </span>
                </div>

                <button
                  onClick={() => onAcceptQuote(prov)}
                  disabled={!prov.compatible}
                  className={`min-h-[38px] px-3.5 rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all active:scale-95 shadow-xs ${
                    !prov.compatible
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Accept & Escrow</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
