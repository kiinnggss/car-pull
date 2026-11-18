'use client';

import React, { useState } from 'react';
import { CorridorDriver } from '@/lib/types';
import {
  ShieldCheck,
  Snowflake,
  Star,
  Clock,
  Car,
  MapPin,
  Info,
  Sparkles,
  Users,
  Music,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { DriverTrustModal } from './DriverTrustModal';
import { triggerHaptic } from '@/lib/haptics';

interface ProfileCardProps {
  driver: CorridorDriver;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ driver }) => {
  const { user, riderRoute, selectedSafeZone } = useAppStore();
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const sharedInterests = (driver.interests || []).filter((item) =>
    ['Tech & Design', 'FinTech', 'Startups', 'Afrobeats'].includes(item)
  );

  // Build Tinder BLK style single-row pill tags overlaid on the portrait
  const portraitTags = [
    `${driver.vehicle.make} ${driver.vehicle.model}`,
    driver.vehicle.plate_number,
    `${driver.corridor.ac_included ? 'AC' : 'Air'} • ${driver.corridor.available_seats} Seats`,
  ];

  return (
    <>
      <div className="w-full bg-[#0B0C0E] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.75)] select-none border border-black/10 dark:border-white/10">
        {/* 1. Full-Bleed Portrait Section (Tinder BLK + Professional Network Tinder) */}
        <div
          onClick={() => {
            triggerHaptic('tap');
            setActiveSlide((prev) => (prev + 1) % 3);
          }}
          className="relative h-[168px] w-full bg-[#14161B] overflow-hidden cursor-pointer"
        >
          {/* Fallback Monogram behind Portrait */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E2028] to-[#0B0C0E]">
            <span className="text-5xl font-display font-black text-white/15 tracking-tighter">
              {driver.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </span>
          </div>

          <img
            src={driver.avatar}
            alt={driver.name}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* Deep Editorial Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C0E] via-[#0B0C0E]/45 to-black/25" />

          {/* Top Story Progress Bars (Tinder BLK signature) */}
          <div className="absolute top-3 left-4 right-4 flex items-center gap-1.5 z-20">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden"
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    idx <= activeSlide ? 'w-full bg-white' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Bottom-of-Portrait Overlay: Name, Bold 2-Line Headline, and Glass Pill Tags */}
          <div className="absolute bottom-3 left-4 right-4 z-20 space-y-1.5">
            {/* Name, Rating & Departure Time Line */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-extrabold text-white truncate">
                  {driver.name}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#C8FF00] text-[#0B0C0E] text-[9.5px] font-mono font-black flex-shrink-0">
                  ★ {driver.rating}
                </span>
                <span className="glass-pill-tag px-2 py-0.5 text-[9.5px] font-mono font-bold flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-2.5 h-2.5 text-[#C8FF00]" />
                  {driver.corridor.departure_time}
                </span>
              </div>

              {/* Tinder BLK White 'i' Info Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('tap');
                  setShowTrustModal(true);
                }}
                className="w-7 h-7 rounded-full bg-white text-[#0B0C0E] flex items-center justify-center font-black text-xs shadow-md active-press flex-shrink-0"
                title="Open Sec 44 Verification Dossier"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Professional Network Tinder Bold Editorial Headline */}
            <h2 className="font-display text-base font-black text-white leading-[1.15] tracking-tight line-clamp-2">
              {driver.trip_purpose ||
                `Daily ${driver.corridor.origin.split('/')[0].trim()} to ${driver.corridor.destination.split('(')[0].trim()} executive carpool`}
            </h2>

            {/* Tinder BLK Translucent Pill Row Overlaid on Portrait */}
            <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
              {portraitTags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                    idx === 1
                      ? 'bg-[#FF9F0A] text-[#0B0C0E] font-mono font-black'
                      : 'glass-pill-tag'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Professional Network Tinder Warm Amber Route & Network Strip */}
        <div className="p-2 bg-[#14161B]">
          <div className="amber-quote-surface px-3 py-2 relative overflow-hidden">
            {/* Oversized decorative quote mark */}
            <span className="absolute right-3 -top-2 font-display text-4xl font-black text-white/25 select-none pointer-events-none">
              &ldquo;
            </span>

            <div className="flex items-center justify-between gap-2 relative z-10">
              <div className="min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-wider font-black text-white/85 block">
                  Pickup Hub • {driver.employer}
                </span>
                <div className="text-[11px] font-extrabold text-white truncate">
                  {selectedSafeZone.name} → {driver.corridor.destination.split('(')[0].trim()}
                </div>
              </div>

              {/* Overlapping Circular Network Badges (from Professional Network Tinder) */}
              <div className="flex items-center -space-x-2 flex-shrink-0">
                <span
                  className="w-6 h-6 rounded-full bg-[#0B0C0E] text-[#C8FF00] ring-2 ring-[#FF9F0A] text-[8.5px] font-black flex items-center justify-center"
                  title={driver.employer}
                >
                  {driver.employer.slice(0, 2).toUpperCase()}
                </span>
                <span
                  className="w-6 h-6 rounded-full bg-white text-[#0B0C0E] ring-2 ring-[#FF9F0A] text-[8.5px] font-black flex items-center justify-center"
                  title={driver.alumni}
                >
                  {driver.alumni.slice(0, 2).toUpperCase()}
                </span>
                <span
                  className="w-6 h-6 rounded-full bg-[#C8FF00] text-[#0B0C0E] ring-2 ring-[#FF9F0A] text-[8.5px] font-mono font-black flex items-center justify-center"
                  title="Section 44 Compliant"
                >
                  S44
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DriverTrustModal
        driver={driver}
        isOpen={showTrustModal}
        onClose={() => setShowTrustModal(false)}
      />
    </>
  );
};
