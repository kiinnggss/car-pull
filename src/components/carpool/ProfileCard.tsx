'use client';

import React from 'react';
import { CorridorDriver, SafeZone } from '@/lib/types';
import { ShieldCheck, Snowflake, Clock, Users, Building2, Car, Sparkles, MapPin, Star } from 'lucide-react';

interface ProfileCardProps {
  driver: CorridorDriver;
  safeZone: SafeZone;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ driver, safeZone }) => {
  return (
    <div className="relative w-full h-[495px] rounded-3xl bg-white overflow-hidden shadow-lg flex flex-col justify-between select-none border border-zinc-100 transform-gpu">
      {/* Driver Visual with Smooth Seamless Fade into White Card Body */}
      <div className="absolute inset-0 z-0">
        <img
          src={driver.avatar}
          alt={driver.name}
          loading="eager"
          className="w-full h-[58%] object-cover object-center"
        />
        {/* Soft Multi-Stop Gradient Fading Image into Content */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent via-45% to-white to-60%" />
      </div>

      {/* Floating Header Badges - Clean and Minimal */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified
          </span>

          {driver.vehicle.has_ac && (
            <span className="inline-flex items-center gap-1 bg-cyan-600 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow-xs">
              <Snowflake className="w-3 h-3 animate-spin" style={{ animationDuration: '10s' }} />
              AC 20°C
            </span>
          )}
        </div>

        <span className="bg-white/95 text-zinc-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs border border-zinc-100">
          <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
          {driver.corridor.departure_time}
        </span>
      </div>

      {/* Unified Content Section - Seamless Flow without Box-in-a-Box Clutter */}
      <div className="relative z-10 p-5 pt-0 space-y-3 bg-white mt-auto rounded-b-3xl">
        {/* Driver Identity & Verification Info */}
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">
              {driver.name}
            </h2>
            <div className="flex items-center gap-1 text-xs font-bold text-zinc-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{driver.rating}</span>
              <span className="text-[10px] text-zinc-400 font-normal">({driver.trips_completed} trips)</span>
            </div>
          </div>

          {/* Seamless Metadata Row */}
          <p className="text-xs text-zinc-600 mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-zinc-800">{driver.employer}</span>
            <span className="text-zinc-300">•</span>
            <span>{driver.alumni}</span>
          </p>
        </div>

        {/* Soft Divider */}
        <div className="h-px w-full bg-gradient-to-r from-zinc-200 via-zinc-100 to-transparent" />

        {/* Car & Seat Capacity - Clean inline presentation */}
        <div className="flex items-center justify-between text-xs text-zinc-700">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-[#7C3AED]" />
            <span>
              <strong>{driver.vehicle.make} {driver.vehicle.model}</strong>{' '}
              <span className="text-zinc-400 font-mono text-[11px]">({driver.vehicle.plate_number})</span>
            </span>
          </div>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
            <Users className="w-3 h-3" /> {driver.corridor.available_seats} seats left
          </span>
        </div>

        {/* Pickup Hub - Soft Gradient Banner Fading into Background */}
        <div className="bg-gradient-to-r from-purple-50/90 via-purple-50/40 to-transparent px-3 py-2 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-800">
            <MapPin className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
            <span className="text-[11px] truncate">
              Pickup: <strong className="text-zinc-900">{safeZone.name}</strong>
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-[#7C3AED] uppercase tracking-wider pl-2 flex-shrink-0">
            Off-Street
          </span>
        </div>

        {/* Vibe Tags - Minimal pills */}
        <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
          {driver.vibe_tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
