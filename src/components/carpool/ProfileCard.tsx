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
    <div className="relative w-full h-[360px] rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col justify-between select-none border border-[#DDD4C5] transform-gpu">
      {/* Driver Visual with Smooth Seamless Fade into Card */}
      <div className="absolute inset-0 z-0">
        <img
          src={driver.avatar}
          alt={driver.name}
          loading="eager"
          className="w-full h-[46%] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent via-28% to-white to-46%" />
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

      {/* Flowing Content Section - Fancy Serif Name & High-Visibility Info */}
      <div className="relative z-10 p-3 pt-0 space-y-1 bg-white mt-auto rounded-b-2xl">
        {/* Driver Identity & Social Handle + Mutual Spark */}
        <div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5 truncate">
              <h2 className="text-lg font-serif font-black text-[#141210] tracking-tight truncate">
                {driver.name}
              </h2>
              {driver.social_handle && (
                <span className="text-[10px] font-mono font-bold text-[#0D6E6E]">
                  {driver.social_handle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 text-xs font-bold text-[#141210] flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
              <span>{driver.rating}</span>
              <span className="text-[10px] text-[#70665A] font-normal">({driver.trips_completed} trips)</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 flex-wrap">
            <p className="text-[11px] text-[#3D362F] flex items-center gap-1.5">
              <span className="font-bold text-[#141210]">{driver.employer}</span>
              <span className="text-[#DDD4C5]">•</span>
              <span className="text-[#70665A]">{driver.alumni}</span>
            </p>

            {/* Mutual Spark Indicator */}
            {driver.mutual_spark && (
              <span className="text-[9px] font-extrabold text-[#B45309] bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                <span>{driver.mutual_spark}</span>
              </span>
            )}
          </div>
        </div>

        {/* Trip Destination & Purpose */}
        {driver.trip_purpose && (
          <div className="bg-[#FAF7F0] border border-[#DDD4C5] px-2 py-0.5 rounded-lg flex items-center gap-1.5 text-xs text-[#141210]">
            <Compass className="w-3 h-3 text-[#C25E2E] flex-shrink-0" />
            <span className="text-[10px] font-semibold truncate leading-tight">
              {driver.trip_purpose}
            </span>
          </div>
        )}

        {/* Vehicle & Plate + Cabin Co-Riders Preview */}
        <div className="flex items-center justify-between text-xs text-[#141210] bg-[#F9F7F1] border border-[#DDD4C5] p-1.5 rounded-xl">
          <div className="flex items-center gap-1.5 truncate">
            <Car className="w-3.5 h-3.5 text-[#0D6E6E] flex-shrink-0" />
            <span className="text-[11px] truncate">
              <strong>{driver.vehicle.make} {driver.vehicle.model}</strong>{' '}
              <span className="text-[#C25E2E] font-mono font-black text-[9px] bg-white px-1 py-0.2 rounded border border-[#C25E2E]/30">
                {driver.vehicle.plate_number}
              </span>
            </span>
          </div>

          {/* Cabin Seat Indicators */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {confirmedPassengers.length > 0 ? (
              <div className="flex items-center gap-1 bg-white border border-[#DDD4C5] px-1.5 py-0.5 rounded-lg">
                <Users className="w-3 h-3 text-[#0D6E6E]" />
                <span className="text-[9px] font-bold text-[#141210]">
                  +{confirmedPassengers[0].name.split(' ')[0]} ({confirmedPassengers[0].role.split(' ')[0]})
                </span>
              </div>
            ) : (
              <span className="text-[#0D6E6E] font-black bg-teal-50 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 border border-teal-200">
                <Users className="w-3 h-3" /> {driver.corridor.available_seats} seats left
              </span>
            )}
          </div>
        </div>

        {/* Pickup Hub - Flowing Strip */}
        <div className="bg-[#F8F5EE] border border-[#DDD4C5] px-2 py-0.5 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#141210] truncate">
            <MapPin className="w-3 h-3 text-[#C25E2E] flex-shrink-0" />
            <span className="text-[10px] truncate">
              Pickup: <strong className="text-[#141210]">{safeZone.name}</strong>
            </span>
          </div>
          <span className="text-[8px] font-black text-[#0D6E6E] uppercase tracking-wider pl-1.5 flex-shrink-0">
            CCTV Monitored
          </span>
        </div>

        {/* Social Battery / Ride Mood & Talk Chips */}
        <div className="flex items-center gap-1 flex-wrap pt-0.5">
          {/* Ride Mood Badge */}
          {driver.ride_mood === 'chat' && (
            <span className="text-[8px] font-black text-[#0D6E6E] bg-teal-50 border border-teal-200 px-2 py-0.2 rounded-md flex items-center gap-0.5">
              <MessageCircle className="w-2.5 h-2.5" />
              Chat &amp; Network
            </span>
          )}
          {driver.ride_mood === 'easy' && (
            <span className="text-[8px] font-black text-[#B45309] bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-md flex items-center gap-0.5">
              <Coffee className="w-2.5 h-2.5" />
              Easy Flow
            </span>
          )}
          {driver.ride_mood === 'quiet' && (
            <span className="text-[8px] font-black text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.2 rounded-md flex items-center gap-0.5">
              <Headphones className="w-2.5 h-2.5" />
              Quiet &amp; Unwind
            </span>
          )}

          {/* Talk Topics / Hashtags */}
          {(driver.talk_about || driver.interests)?.slice(0, 2).map((topic, idx) => (
            <span
              key={idx}
              className="text-[8px] font-bold text-[#70665A] bg-[#F2EDE2] px-1.5 py-0.2 rounded-md"
            >
              {topic.startsWith('#') ? topic : `#${topic}`}
            </span>
          ))}

          {driver.music_vibe && (
            <span className="text-[8px] font-bold text-[#C25E2E] bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 truncate max-w-[130px]">
              <Music className="w-2.5 h-2.5" />
              {driver.music_vibe}
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
