'use client';

import React from 'react';
import { CorridorDriver, SafeZone } from '@/lib/types';
import { ShieldCheck, Snowflake, Clock, Users, Car, MapPin, Star } from 'lucide-react';

interface ProfileCardProps {
  driver: CorridorDriver;
  safeZone: SafeZone;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ driver, safeZone }) => {
  return (
    <div className="relative w-full h-[350px] rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col justify-between select-none border border-[#DDD4C5] transform-gpu">
      {/* Driver Visual with Smooth Seamless Fade into Card */}
      <div className="absolute inset-0 z-0">
        <img
          src={driver.avatar}
          alt={driver.name}
          loading="eager"
          className="w-full h-[52%] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent via-35% to-white to-52%" />
      </div>

      {/* Floating Header Badges - Deep Logo Colors */}
      <div className="relative z-10 p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 bg-[#0D6E6E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>

          {driver.vehicle.has_ac && (
            <span className="inline-flex items-center gap-1 bg-[#0F766E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
              <Snowflake className="w-3 h-3 animate-spin" style={{ animationDuration: '10s' }} />
              AC 20°C
            </span>
          )}
        </div>

        <span className="bg-white/95 text-[#141210] text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs border border-[#DDD4C5]">
          <Clock className="w-3 h-3 text-[#C25E2E]" />
          {driver.corridor.departure_time}
        </span>
      </div>

      {/* Flowing Content Section - Fancy Serif Name & High-Visibility Info */}
      <div className="relative z-10 p-3 pt-0 space-y-1.5 bg-white mt-auto rounded-b-2xl">
        {/* Driver Identity */}
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-serif font-black text-[#141210] tracking-tight">
              {driver.name}
            </h2>
            <div className="flex items-center gap-0.5 text-xs font-bold text-[#141210]">
              <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
              <span>{driver.rating}</span>
              <span className="text-[10px] text-[#70665A] font-normal">({driver.trips_completed} trips)</span>
            </div>
          </div>

          <p className="text-[11px] text-[#3D362F] flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#141210]">{driver.employer}</span>
            <span className="text-[#DDD4C5]">•</span>
            <span className="text-[#70665A]">{driver.alumni}</span>
          </p>
        </div>

        <div className="h-px w-full bg-[#EFE8DC]" />

        {/* Vehicle & Plate in Logo Colors */}
        <div className="flex items-center justify-between text-xs text-[#141210]">
          <div className="flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-[#0D6E6E]" />
            <span className="text-[11px]">
              <strong>{driver.vehicle.make} {driver.vehicle.model}</strong>{' '}
              <span className="text-[#C25E2E] font-mono font-black text-[10px] bg-[#FFF9EE] px-1.5 py-0.2 rounded border border-[#C25E2E]/30">
                {driver.vehicle.plate_number}
              </span>
            </span>
          </div>
          <span className="text-[#0D6E6E] font-black bg-teal-50 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 border border-teal-200">
            <Users className="w-3 h-3" /> {driver.corridor.available_seats} seats left
          </span>
        </div>

        {/* Pickup Hub - Flowing Strip */}
        <div className="bg-[#F8F5EE] border border-[#DDD4C5] px-2 py-1 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#141210]">
            <MapPin className="w-3 h-3 text-[#C25E2E] flex-shrink-0" />
            <span className="text-[10px] truncate">
              Pickup: <strong className="text-[#141210]">{safeZone.name}</strong>
            </span>
          </div>
          <span className="text-[8px] font-black text-[#0D6E6E] uppercase tracking-wider pl-1.5 flex-shrink-0">
            CCTV Monitored
          </span>
        </div>

        {/* Vibe Tags */}
        <div className="flex items-center gap-1 flex-wrap">
          {driver.vibe_tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[8px] font-bold text-[#70665A] bg-[#F2EDE2] px-2 py-0.2 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
