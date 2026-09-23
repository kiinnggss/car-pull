'use client';

import React, { useState } from 'react';
import { CorridorDriver, SafeZone } from '@/lib/types';
import { ShieldCheck, Snowflake, Clock, Users, Car, MapPin, Star, Music, Sparkles } from 'lucide-react';
import { DriverTrustModal } from './DriverTrustModal';
import { triggerHaptic } from '@/lib/haptics';

interface ProfileCardProps {
  driver: CorridorDriver;
  safeZone: SafeZone;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ driver, safeZone }) => {
  const [showTrustModal, setShowTrustModal] = useState(false);

  return (
    <div className="relative w-full h-full rounded-3xl floating-surface overflow-hidden shadow-specular flex flex-col justify-between select-none transform-gpu">
      {/* 1. Full-Bleed Photo Section with Subtle Scrim */}
      <div className="relative w-full flex-1 min-h-0 overflow-hidden bg-slate-900">
        <img
          src={driver.avatar}
          alt={driver.name}
          loading="eager"
          className="w-full h-full object-cover object-top"
        />

        {/* Scrim at bottom of photo for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

        {/* Floating Top Header Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowTrustModal(true);
            }}
            className="inline-flex items-center gap-1.5 floating-pill bg-slate-950/60 hover:bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-specular-light transition-all active-spring"
            title="Tap to view verified trust credentials"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Verified</span>
            {driver.vehicle.has_ac && (
              <>
                <span className="text-white/40">•</span>
                <span className="text-slate-300 font-semibold flex items-center gap-0.5">
                  <Snowflake className="w-2.5 h-2.5" /> AC
                </span>
              </>
            )}
          </button>

          <div className="inline-flex items-center gap-1.5 floating-pill bg-slate-950/60 backdrop-blur-md text-white text-[11px] font-mono tabular-nums px-3 py-1 rounded-full shadow-specular-light">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{driver.corridor.departure_time}</span>
          </div>
        </div>

        {/* Driver Name and Rating resting over the scrim */}
        <div className="absolute bottom-2.5 inset-x-3 text-white z-10">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5 truncate">
              <h2 className="text-lg font-black tracking-tight text-white truncate">
                {driver.name}
              </h2>
              {driver.social_handle && (
                <span className="text-[11px] font-mono text-teal-300 font-medium truncate">
                  {driver.social_handle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 floating-pill bg-slate-950/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-mono tabular-nums">{driver.rating}</span>
              <span className="text-white/70 font-normal font-mono tabular-nums text-[10px]">({driver.trips_completed})</span>
            </div>
          </div>
          <p className="text-xs text-white/85 font-medium truncate mt-0.5">
            {driver.employer} • {driver.alumni}
          </p>
        </div>
      </div>

      {/* 2. Structured Ride Information Pane */}
      <div className="w-full bg-white/95 dark:bg-[#12161A]/95 backdrop-blur-xl p-3 space-y-2 text-slate-900 dark:text-slate-100 flex-shrink-0">
        {/* Route & Corridor */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 truncate text-slate-900 dark:text-slate-100 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
            <span className="truncate">{driver.corridor.origin.split('/')[0].trim()} ➔ {driver.corridor.destination.split('(')[0].trim()}</span>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 font-medium flex-shrink-0">
            {driver.corridor.distance_km} km
          </span>
        </div>

        {/* Vehicle & Seats */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 truncate">
            <Car className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-medium text-slate-800 dark:text-slate-200">{driver.vehicle.make} {driver.vehicle.model}</span>
            <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-xs">
              {driver.vehicle.plate_number}
            </span>
          </div>
          <span className="text-teal-600 dark:text-teal-400 font-semibold text-[11px] font-mono tabular-nums flex items-center gap-1">
            <Users className="w-3 h-3" />
            {driver.corridor.available_seats} seats left
          </span>
        </div>

        {/* Trip Purpose / Vibe Note */}
        {driver.trip_purpose && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1">
            &ldquo;{driver.trip_purpose}&rdquo;
          </p>
        )}

        {/* Topics / Mutual Vibe */}
        <div className="flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400 pt-0.5">
          {driver.mutual_spark && (
            <span className="font-semibold text-amber-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {driver.mutual_spark}
            </span>
          )}
          {driver.mutual_spark && driver.music_vibe && <span>•</span>}
          {driver.music_vibe && (
            <span className="truncate flex items-center gap-1">
              <Music className="w-3 h-3 text-teal-500 flex-shrink-0" />
              <span className="truncate">{driver.music_vibe}</span>
            </span>
          )}
        </div>
      </div>

      {/* Verified Corporate Commuter Trust Sheet */}
      <DriverTrustModal
        driver={driver}
        isOpen={showTrustModal}
        onClose={() => setShowTrustModal(false)}
      />
    </div>
  );
};
