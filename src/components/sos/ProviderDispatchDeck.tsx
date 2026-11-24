'use client';

import React from 'react';
import { EmergencyProvider } from '@/lib/types';
import { ShieldCheck, Truck, Clock, AlertTriangle, Zap, Star } from 'lucide-react';
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
      {/* 1-Tap Instant Emergency Dispatch Hero (Uber Green Volt Card) */}
      {fastestCompatibleFlatbed && (
        <div className="volt-surface rounded-[28px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] font-mono font-black text-[10px] uppercase">
              <Zap className="w-3 h-3 fill-current" />
              <span>FASTEST UNIT</span>
            </div>
            <span className="text-xs font-mono tabular-nums font-black">
              ETA {fastestCompatibleFlatbed.traffic_eta_minutes} MINS
            </span>
          </div>

          <p className="text-xs font-semibold opacity-80 leading-snug">
            Stranded on the expressway? Dispatch {fastestCompatibleFlatbed.name} immediately with Zero-Cash Escrow protection.
          </p>

          <button
            onClick={() => onAcceptQuote(fastestCompatibleFlatbed)}
            className="w-full py-3 bg-[var(--bg-sheet)] text-[var(--text-primary)] font-extrabold text-xs rounded-full active-press flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>
              Dispatch Now • {formatNgn(fastestCompatibleFlatbed.flat_quote_ngn)}
            </span>
          </button>
        </div>
      )}

      <div className="space-y-2.5">
        {providers.map((prov, index) => {
          const isTopPriority = index === 0 && prov.compatible;

          return (
            <div
              key={prov.id}
              className={`floating-surface rounded-[28px] p-4 space-y-3 ${
                !prov.compatible ? 'opacity-65' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prov.operator_photo}
                    alt={prov.operator_name}
                    loading="lazy"
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-display font-black text-[var(--text-primary)] truncate">
                        {prov.name}
                      </h4>
                      {isTopPriority && (
                        <span className="text-[9px] font-mono font-black bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] px-2 py-0.5 rounded-full">
                          TOP
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                      <span className="truncate">{prov.operator_name}</span>
                      <span>•</span>
                      <span className="text-[#FF9F0A] font-mono font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        {prov.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="plate-badge flex-shrink-0">{prov.plate_number}</span>
              </div>

              {/* Equipment & ETA Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                <span className="px-2.5 py-1 rounded-full bg-[var(--bg-subtle)] font-bold text-[var(--text-primary)] flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  {prov.truck_type}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--bg-subtle)] font-mono font-bold text-[#FF9F0A] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {prov.traffic_eta_minutes}m ({prov.distance_km} km)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--bg-subtle)] font-mono font-bold text-[var(--text-secondary)] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {prov.lasdri_id}
                </span>
              </div>

              {!prov.compatible && (
                <div className="p-2.5 rounded-2xl bg-red-500/10 flex items-start gap-2 text-[10px] text-red-600 dark:text-red-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Drivetrain Block: {prov.incompatibilityReason}</span>
                </div>
              )}

              {/* Uber Green Bottom Price & Order Pill Bar */}
              <div className="bg-[var(--bg-subtle)] rounded-full p-1.5 pl-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-black font-mono tabular-nums text-[var(--text-primary)] block leading-none">
                    {formatNgn(prov.flat_quote_ngn)}
                  </span>
                  <span className="text-[8.5px] font-mono uppercase text-[var(--text-secondary)] font-bold">
                    FIXED ESCROW
                  </span>
                </div>

                <button
                  onClick={() => onAcceptQuote(prov)}
                  disabled={!prov.compatible}
                  className={`py-2.5 px-5 rounded-full font-extrabold text-xs transition-all active-press ${
                    !prov.compatible
                      ? 'bg-black/10 text-[#9BA1AE] cursor-not-allowed'
                      : 'btn-electric-mint'
                  }`}
                >
                  Dispatch Unit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
