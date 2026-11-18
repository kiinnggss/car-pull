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
        return <Fuel className="w-4 h-4" />;
      case 'shopping_mall':
        return <ShoppingBag className="w-4 h-4" />;
      case 'gated_estate_gate':
        return <Landmark className="w-4 h-4" />;
      case 'bank_premises':
        return <Building2 className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-[28px] bg-[#FF9F0A]/15 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-[#FF9F0A] flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-[#0B0C0E] dark:text-white leading-snug">
          <strong className="font-mono uppercase">ANTI-AGBERO GEOFENCE:</strong> Pickups are restricted to CCTV-monitored off-street hubs with max 45s dwell time.
        </div>
      </div>

      <div className="space-y-2">
        {safeZones.map((zone) => {
          const isSelected = selectedSafeZone.id === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => setSelectedSafeZone(zone)}
              className={`w-full text-left p-4 rounded-[28px] transition-all flex items-center justify-between gap-2 active-press ${
                isSelected ? 'volt-surface' : 'floating-surface'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'bg-[var(--bg-sheet)] text-[var(--text-primary)]'
                      : 'bg-[#F4F5F7] dark:bg-[#1E2028] text-[var(--text-primary)] dark:text-[var(--accent-primary)]'
                  }`}
                >
                  {getZoneIcon(zone.zone_type)}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-extrabold block truncate">{zone.name}</span>
                  <p className="text-[11px] opacity-75 line-clamp-1 mt-0.5">{zone.address}</p>
                  <span className="text-[10px] font-mono font-bold flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3 h-3" /> Armed Security • 45s Dwell
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="w-7 h-7 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
