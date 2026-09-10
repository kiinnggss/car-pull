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
    <div className="relative w-full h-[325px] rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col justify-between select-none border border-[#DDD4C5] transform-gpu">
      {/* Driver Visual with Smooth Seamless Fade into Card */}
      <div className="absolute inset-0 z-0">
        <img
          src={driver.avatar}
          alt={driver.name}
          loading="eager"
          className="w-full h-[45%] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent via-28% to-white to-45%" />
      </div>

      {/* Floating Header Badges - Deep Logo Colors */}
      <div className="relative z-10 p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowTrustModal(true);
            }}
            className="inline-flex items-center gap-1 bg-[#0D6E6E] hover:bg-[#094E4E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs transition-all active:scale-95"
            title="Tap to view verified trust credentials"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Verified</span>
          </button>

          {driver.vehicle.has_ac && (
            <span className="inline-flex items-center gap-1 bg-[#0F766E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
              <Snowflake className="w-3 h-3 animate-spin" style={{ animationDuration: '10s' }} />
              AC
            </span>
          )}

          <span className="inline-flex items-center gap-1 bg-[#FFF9EE] text-[#C25E2E] border border-[#C25E2E]/30 text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
            {categoryLabel}
          </span>
        </div>

        <span className="bg-white/95 text-[#141210] text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs border border-[#DDD4C5]">
          <Clock className="w-3 h-3 text-[#C25E2E]" />
          {driver.corridor.departure_time}
        </span>
      </div>

      {/* Flowing Content Section - Airy, Prestigious & Breathable */}
      <div className="relative z-10 p-2.5 pt-1 space-y-1 bg-white mt-auto rounded-b-2xl">
        {/* Row 1: Name, Role, Rating */}
        <div>
          <div className="flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1.5 truncate">
              <h2 className="text-base font-serif font-black text-[#141210] tracking-tight truncate">
                {driver.name}
              </h2>
              {driver.social_handle && (
                <span className="text-[10px] font-mono font-bold text-[#0D6E6E]">
                  {driver.social_handle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#141210] flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
              <span>{driver.rating}</span>
              <span className="text-[10px] text-[#70665A] font-normal">({driver.trips_completed})</span>
            </div>
          </div>

          <p className="text-[11px] text-[#70665A] truncate">
            <strong className="text-[#141210] font-bold">{driver.employer}</strong> • {driver.alumni}
          </p>
        </div>

        {/* Row 2: Human Quote / Trip Purpose (Subtitle without bulky box) */}
        {driver.trip_purpose && (
          <p className="text-[11px] text-[#554D42] italic flex items-center gap-1 truncate leading-tight">
            <Compass className="w-3 h-3 text-[#C25E2E] flex-shrink-0" />
            <span className="truncate">&ldquo;{driver.trip_purpose}&rdquo;</span>
          </p>
        )}

        {/* Row 3: Unified Social Connection Signals (Spark + Mood) */}
        {(driver.mutual_spark || driver.ride_mood) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {driver.mutual_spark && (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-[#B45309] bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                <span>{driver.mutual_spark}</span>
              </span>
            )}

            {driver.ride_mood === 'chat' && (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-[#0D6E6E] bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-full">
                <MessageCircle className="w-2.5 h-2.5" />
                <span>Chat &amp; Network</span>
              </span>
            )}
            {driver.ride_mood === 'easy' && (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-[#B45309] bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                <Coffee className="w-2.5 h-2.5" />
                <span>Easy Flow</span>
              </span>
            )}
            {driver.ride_mood === 'quiet' && (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
                <Headphones className="w-2.5 h-2.5" />
                <span>Quiet &amp; Unwind</span>
              </span>
            )}
          </div>
        )}

        {/* Row 4: Vehicle & Cabin Co-Riders (Sleek Single Strip) */}
        <div className="flex items-center justify-between text-xs text-[#141210] bg-[#F9F7F1] border border-[#DDD4C5] px-2 py-1 rounded-xl">
          <div className="flex items-center gap-1.5 truncate">
            <Car className="w-3.5 h-3.5 text-[#0D6E6E] flex-shrink-0" />
            <span className="text-[11px] truncate">
              <strong>{driver.vehicle.make} {driver.vehicle.model}</strong>{' '}
              <span className="text-[#C25E2E] font-mono font-black text-[9px] bg-white px-1 py-0.2 rounded border border-[#C25E2E]/30">
                {driver.vehicle.plate_number}
              </span>
            </span>
          </div>

          {/* Cabin Mates / Seats Left */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {confirmedPassengers.length > 0 ? (
              <div className="flex items-center gap-1 bg-white border border-[#DDD4C5] px-1.5 py-0.5 rounded-lg">
                <Users className="w-3 h-3 text-[#0D6E6E]" />
                <span className="text-[9.5px] font-bold text-[#141210]">
                  +{confirmedPassengers[0].name.split(' ')[0]} ({confirmedPassengers[0].role.split(' ')[0]})
                </span>
              </div>
            ) : (
              <span className="text-[#0D6E6E] font-bold bg-teal-50 px-2 py-0.5 rounded-full text-[9.5px] flex items-center gap-1 border border-teal-200">
                <Users className="w-3 h-3" /> {driver.corridor.available_seats} seats left
              </span>
            )}
          </div>
        </div>

        {/* Row 5: Subtle Horizontal Topics / Music Footnote */}
        <div className="flex items-center gap-1.5 text-[9.5px] text-[#70665A] truncate pt-0.5">
          {(driver.talk_about || driver.interests)?.slice(0, 2).map((topic, idx) => (
            <span key={idx} className="font-bold text-[#0D6E6E]">
              {topic.startsWith('#') ? topic : `#${topic}`}
            </span>
          ))}

          {driver.music_vibe && (
            <>
              <span className="text-[#DDD4C5]">•</span>
              <span className="truncate flex items-center gap-1 text-[#70665A]">
                <Music className="w-2.5 h-2.5 text-[#C25E2E] flex-shrink-0" />
                <span className="truncate">{driver.music_vibe}</span>
              </span>
            </>
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
