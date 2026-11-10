'use client';

import React, { useState } from 'react';
import { CorridorDriver, SafeZone } from '@/lib/types';
import { ShieldCheck, Snowflake, Clock, Users, Car, MapPin, Star, Music, Sparkles, ArrowRight } from 'lucide-react';
import { DriverTrustModal } from './DriverTrustModal';
import { triggerHaptic } from '@/lib/haptics';

interface ProfileCardProps {
  driver: CorridorDriver;
  safeZone: SafeZone;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ driver }) => {
  const [showTrustModal, setShowTrustModal] = useState(false);

  return (
    <div className="relative w-full h-full rounded-2xl floating-surface overflow-hidden flex flex-col justify-between select-none transform-gpu">
      {/* 1. Full-Bleed Portrait Section with Editorial Scrim */}
      <div className="relative w-full flex-1 min-h-0 overflow-hidden bg-slate-900">
        <img
          src={driver.avatar}
          alt={driver.name}
          loading="eager"
          className="w-full h-full object-cover object-top"
        />

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent pointer-events-none" />

        {/* Top Instrumentation Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowTrustModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-slate-950/75 hover:bg-slate-950/90 backdrop-blur-md border border-white/15 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all active-spring"
            title="Inspect NIN, BVN, and corporate verification"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Verified</span>
            {driver.vehicle.has_ac && (
              <>
                <span className="text-white/30">•</span>
                <span className="text-teal-200 font-semibold flex items-center gap-0.5">
                  <Snowflake className="w-2.5 h-2.5" /> AC
                </span>
              </>
            )}
          </button>

          <div className="inline-flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-md border border-white/15 text-white text-[11px] font-mono font-bold tabular-nums px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{driver.corridor.departure_time}</span>
          </div>
        </div>

        {/* Driver Identity & Rating Overlay */}
        <div className="absolute bottom-3 inset-x-3.5 text-white z-10">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5 truncate">
              <h2 className="text-lg font-extrabold tracking-tight text-white truncate">
                {driver.name}
              </h2>
              {driver.social_handle && (
                <span className="text-[11px] font-mono text-teal-300 font-medium truncate">
                  {driver.social_handle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-slate-950/75 border border-white/15 px-2.5 py-0.5 rounded-full flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-mono tabular-nums">{driver.rating}</span>
              <span className="text-white/70 font-normal font-mono tabular-nums text-[10px]">
                ({driver.trips_completed})
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-200 font-medium truncate mt-0.5">
            {driver.employer} • {driver.alumni}
          </p>
        </div>
      </div>

      {/* 2. Structured Ride Telemetry Deck */}
      <div className="w-full bg-white dark:bg-[#11171E] divide-y divide-slate-200/70 dark:divide-white/8 text-slate-900 dark:text-slate-100 flex-shrink-0">
        {/* Row 1: Route Corridor & Distance */}
        <div className="px-3.5 py-2.5 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 truncate font-bold text-slate-900 dark:text-white">
            <MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
            <span className="truncate">{driver.corridor.origin.split('/')[0].trim()}</span>
            <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{driver.corridor.destination.split('(')[0].trim()}</span>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 font-semibold flex-shrink-0">
            {driver.corridor.distance_km} km
          </span>
        </div>

        {/* Row 2: Vehicle Spec, Plate Badge, & Seats */}
        <div className="px-3.5 py-2.5 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 truncate">
            <Car className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
              {driver.vehicle.make} {driver.vehicle.model}
            </span>
            <span className="plate-badge text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0">
              {driver.vehicle.plate_number}
            </span>
          </div>
          <span className="text-[#0F766E] dark:text-[#14B8A6] font-bold text-[11px] font-mono tabular-nums flex items-center gap-1 flex-shrink-0">
            <Users className="w-3 h-3" />
            {driver.corridor.available_seats} left
          </span>
        </div>

        {/* Row 3: Commuter Context & Cabin Vibe */}
        <div className="px-3.5 py-2 space-y-1">
          {driver.trip_purpose && (
            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 font-medium">
              &ldquo;{driver.trip_purpose}&rdquo;
            </p>
          )}
          <div className="flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400">
            {driver.mutual_spark && (
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {driver.mutual_spark}
              </span>
            )}
            {driver.mutual_spark && driver.music_vibe && <span>•</span>}
            {driver.music_vibe && (
              <span className="truncate flex items-center gap-1">
                <Music className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
                <span className="truncate">{driver.music_vibe}</span>
              </span>
            )}
          </div>
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
