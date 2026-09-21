'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { SafeZoneType } from '@/lib/types';
import { ShieldCheck, MapPin, Fuel, ShoppingBag, Landmark, Building2, AlertTriangle, Check } from 'lucide-react';

export const SafeZoneSelector: React.FC = () => {
  const { safeZones, selectedSafeZone, setSelectedSafeZone } = useAppStore();

  const getZoneIcon = (type: SafeZoneType) => {
    switch (type) {
      case 'fuel_station':
        return <Fuel className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'shopping_mall':
        return <ShoppingBag className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />;
      case 'gated_estate_gate':
        return <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'bank_premises':
        return <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getZoneTag = (type: SafeZoneType) => {
    switch (type) {
      case 'fuel_station':
        return 'Fuel Station Forecourt';
      case 'shopping_mall':
        return 'Mall Security Staging';
      case 'gated_estate_gate':
        return 'Estate Visitor Bay';
      case 'bank_premises':
        return 'Bank Secure Forecourt';
      default:
        return 'Safe Zone';
    }
  };

  return (
    <div className="space-y-3">
      {/* Geofencing Anti-Agbero Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-3 flex items-start gap-2.5 shadow-2xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-950 dark:text-amber-200 leading-snug">
          <span className="font-bold text-amber-900 dark:text-amber-300">Anti-Agbero Geofenced Snapping:</span> Expressways, bus stops, and roundabouts are blocked. Pickups are strictly restricted to CCTV-monitored off-street safe hubs with max 45s dwell time.
        </div>
      </div>

      {/* List of Verified Safe Zones */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block px-1">
          Select Off-Street Pickup Hub (Ajah ➔ VI)
        </label>
        {safeZones.map((zone) => {
          const isSelected = selectedSafeZone.id === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => setSelectedSafeZone(zone)}
              className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between shadow-xs ${
                isSelected
                  ? 'bg-teal-50/80 dark:bg-teal-950/40 border-[#0F766E] ring-1 ring-[#0F766E]'
                  : 'bg-white dark:bg-[#12161A] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    isSelected ? 'bg-[#0F766E] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {getZoneIcon(zone.zone_type)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{zone.name}</span>
                    <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {getZoneTag(zone.zone_type)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">{zone.address}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Armed Security Guarded
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">• 45s Max Dwell</span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-[#0F766E] flex items-center justify-center text-white flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
