'use client';

import React, { useState } from 'react';
import { CorridorDriver, SafeZone } from '@/lib/types';
import { ShieldCheck, Snowflake, Clock, Users, Car, MapPin, Star, Compass, Music, MessageCircle, Sparkles, Coffee, Headphones } from 'lucide-react';
import { DriverTrustModal } from './DriverTrustModal';
import { triggerHaptic } from '@/lib/haptics';

interface ProfileCardProps {
  driver: CorridorDriver;
  safeZone: SafeZone;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ driver, safeZone }) => {
  const [showTrustModal, setShowTrustModal] = useState(false);

  const categoryLabel =
    driver.trip_type === 'leaving_now'
      ? 'Leaving Soon'
      : driver.trip_type === 'morning'
      ? 'Morning Travel'
      : driver.trip_type === 'evening'
      ? 'Evening Return'
      : driver.trip_type === 'flexible'
      ? 'Anytime Ride'
      : 'Travel Corridor';

  const confirmedPassengers = driver.cabin_passengers || [];

  return (
    <div className="relative w-full h-full rounded-3xl bg-white dark:bg-[#151413] overflow-hidden shadow-[0_12px_36px_-6px_rgba(0,0,0,0.14)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7)] flex flex-col justify-between select-none border border-stone-200/80 dark:border-stone-800 transform-gpu">
      {/* 1. Full-Bleed Photo Section with Subtle Scrim */}
      <div className="relative w-full flex-1 min-h-0 overflow-hidden bg-stone-900">
        <img
          src={driver.avatar}
          alt={driver.name}
          loading="eager"
          className="w-full h-full object-cover object-top"
        />

        {/* Cinematic dark scrim at bottom of photo for razor-sharp typography */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

        {/* Floating Top Header Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowTrustModal(true);
            }}
            className="inline-flex items-center gap-1.5 bg-black/45 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm transition-all active:scale-95"
            title="Tap to view verified trust credentials"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified</span>
            {driver.vehicle.has_ac && (
              <>
                <span className="text-white/40">•</span>
                <span className="text-cyan-300 font-semibold flex items-center gap-0.5">
                  <Snowflake className="w-2.5 h-2.5" /> AC
                </span>
              </>
            )}
          </button>

          <div className="inline-flex items-center gap-1 bg-black/45 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>{driver.corridor.departure_time}</span>
          </div>
        </div>

        {/* Driver Name and Rating resting over the scrim */}
        <div className="absolute bottom-2.5 inset-x-3 text-white z-10">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-1.5 truncate">
              <h2 className="text-lg font-bold tracking-tight text-white truncate">
                {driver.name}
              </h2>
              {driver.social_handle && (
                <span className="text-[11px] font-mono text-teal-300 font-medium truncate">
                  {driver.social_handle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/15 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{driver.rating}</span>
              <span className="text-white/70 font-normal text-[10px]">({driver.trips_completed})</span>
            </div>
          </div>
          <p className="text-xs text-white/85 font-medium truncate mt-0.5">
            {driver.employer} • {driver.alumni}
          </p>
        </div>
      </div>

      {/* 2. Structured Ride Information Pane */}
      <div className="w-full bg-white dark:bg-[#151413] p-3 space-y-2 border-t border-stone-100 dark:border-stone-800 text-[#141210] dark:text-[#EDE8E1] flex-shrink-0">
        {/* Route & Corridor */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 truncate text-stone-900 dark:text-stone-100 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#0D6E6E] dark:text-[#14B8A6] flex-shrink-0" />
            <span className="truncate">{driver.corridor.origin.split('/')[0].trim()} ➔ {driver.corridor.destination.split('(')[0].trim()}</span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium flex-shrink-0">
            {driver.corridor.distance_km} km
          </span>
        </div>

        {/* Vehicle & Seats */}
        <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-1.5 truncate">
            <Car className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span className="font-medium text-stone-800 dark:text-stone-200">{driver.vehicle.make} {driver.vehicle.model}</span>
            <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">
              {driver.vehicle.plate_number}
            </span>
          </div>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
            <Users className="w-3 h-3" />
            {driver.corridor.available_seats} seats left
          </span>
        </div>

        {/* Trip Purpose / Vibe Note */}
        {driver.trip_purpose && (
          <p className="text-xs text-stone-500 dark:text-stone-400 italic line-clamp-1">
            &ldquo;{driver.trip_purpose}&rdquo;
          </p>
        )}

        {/* Subtle Topics / Mutual Vibe */}
        <div className="flex items-center gap-2 text-[10.5px] text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800/60">
          {driver.mutual_spark && (
            <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {driver.mutual_spark}
            </span>
          )}
          {driver.mutual_spark && driver.music_vibe && <span>•</span>}
          {driver.music_vibe && (
            <span className="truncate flex items-center gap-1">
              <Music className="w-3 h-3 text-[#0D6E6E] dark:text-[#14B8A6] flex-shrink-0" />
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
