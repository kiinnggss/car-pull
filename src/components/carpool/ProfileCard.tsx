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
    <div className="relative w-full h-[360px] rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col justify-between select-none border border-[#E7E2D8] transform-gpu">
      {/* Driver Visual */}
      <div className="absolute inset-0 z-0">
        <img
          src={driver.avatar}
          alt={driver.name}
          loading="eager"
          className="w-full h-[52%] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent via-35% to-white to-52%" />
      </div>

      {/* Floating Header Badges */}
      <div className="relative z-10 p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>

          {driver.vehicle.has_ac && (
            <span className="inline-flex items-center gap-1 bg-cyan-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
              <Snowflake className="w-3 h-3 animate-spin" style={{ animationDuration: '10s' }} />
              AC 20°C
            </span>
          )}
        </div>

        <span className="bg-white/95 text-[#1C1917] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs border border-[#E7E2D8]">
          <Clock className="w-3 h-3 text-[#7C3AED]" />
          {driver.corridor.departure_time}
        </span>
      </div>

      {/* Unified Content Section */}
      <div className="relative z-10 p-3 pt-0 space-y-1.5 bg-white mt-auto rounded-b-2xl">
        {/* Driver Identity */}
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-black text-[#1C1917] tracking-tight">
              {driver.name}
            </h2>
            <div className="flex items-center gap-0.5 text-xs font-bold text-[#1C1917]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{driver.rating}</span>
              <span className="text-[10px] text-[#78716C] font-normal">({driver.trips_completed} trips)</span>
            </div>
          </div>

          <p className="text-[11px] text-[#78716C] flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#1C1917]">{driver.employer}</span>
            <span className="text-[#D5CEC2]">•</span>
            <span>{driver.alumni}</span>
          </p>
        </div>

        <div className="h-px w-full bg-[#E7E2D8]" />

        {/* Vehicle & Plate */}
        <div className="flex items-center justify-between text-xs text-[#1C1917]">
          <div className="flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="text-[11px]">
              <strong>{driver.vehicle.make} {driver.vehicle.model}</strong>{' '}
              <span className="text-[#7C3AED] font-mono font-black text-[10px] bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                {driver.vehicle.plate_number}
              </span>
            </span>
          </div>
          <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 border border-emerald-200">
            <Users className="w-3 h-3" /> {driver.corridor.available_seats} seats left
          </span>
        </div>

        {/* Pickup Hub */}
        <div className="bg-[#FAF8F5] border border-[#E7E2D8] px-2 py-1 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#1C1917]">
            <MapPin className="w-3 h-3 text-[#7C3AED] flex-shrink-0" />
            <span className="text-[10px] truncate">
              Pickup: <strong className="text-[#1C1917]">{safeZone.name}</strong>
            </span>
          </div>
          <span className="text-[8px] font-extrabold text-[#7C3AED] uppercase tracking-wider pl-1.5 flex-shrink-0">
            CCTV Hub
          </span>
        </div>

        {/* Vibe Tags */}
        <div className="flex items-center gap-1 flex-wrap">
          {driver.vibe_tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[8px] font-semibold text-[#78716C] bg-[#F4F0E8] px-2 py-0.2 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
