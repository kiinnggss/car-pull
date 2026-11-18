'use client';

import React, { useState } from 'react';
import { CorridorDriver } from '@/lib/types';
import { Clock, Info, MapPin, Star } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { DriverTrustModal } from './DriverTrustModal';
import { triggerHaptic } from '@/lib/haptics';

interface ProfileCardProps {
  driver: CorridorDriver;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ driver }) => {
  const { selectedSafeZone } = useAppStore();
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const portraitTags = [
    `${driver.vehicle.make} ${driver.vehicle.model}`,
    driver.vehicle.plate_number,
    `${driver.corridor.ac_included ? 'AC' : 'Air'} · ${driver.corridor.available_seats} Seats`,
  ];

  return (
    <>
      <div
        onClick={() => {
          triggerHaptic('tap');
          setActiveSlide((prev) => (prev + 1) % 3);
        }}
        className="relative w-full h-full min-h-[380px] sm:min-h-[450px] rounded-[30px] overflow-hidden select-none cursor-pointer bg-[#14161B]"
        style={{
          border: 'var(--card-border-width, 1px) solid var(--border-subtle)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Monogram Fallback behind Portrait */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E2028] to-[#0B0C0E]">
          <span className="text-6xl font-display font-black text-white/12 tracking-tighter">
            {driver.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </span>
        </div>

        {/* Full-Bleed Portrait (Top 60% unobstructed) */}
        <img
          src={driver.avatar}
          alt={driver.name}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Editorial Scrim: Clear at top, deep gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/25 pointer-events-none" />

        {/* Top Story Bars + Metadata Pill + Info Button */}
        <div className="absolute top-3.5 left-4 right-4 z-20 space-y-2.5">
          <div className="flex items-center gap-1.5">
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

          <div className="flex items-center justify-between gap-2">
            <div className="glass-pill-tag px-2.5 py-1 flex items-center gap-2 text-[10.5px] font-mono font-bold">
              <span className="inline-flex items-center gap-1">
                <Star
                  className="w-3 h-3 fill-current"
                  style={{ color: 'var(--accent-primary)' }}
                />
                {driver.rating}
              </span>
              <span className="opacity-40">|</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 opacity-80" />
                {driver.corridor.departure_time}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('tap');
                setShowTrustModal(true);
              }}
              className="w-8 h-8 rounded-full bg-white/95 text-[#0B0C0E] flex items-center justify-center shadow-md active-press"
              title="Open Verification Dossier"
              aria-label="Open Verification Dossier"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Editorial Stack (Tinder BLK + Professional Network Tinder) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 space-y-2.5">
          {/* Name + Employer */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-xs font-extrabold text-white/95 block truncate">
                {driver.name}
                <span className="text-white/60 font-semibold">
                  {' '}
                  · {driver.employer}
                </span>
              </span>
            </div>
            <div className="flex items-center -space-x-1.5 flex-shrink-0">
              <span
                className="w-5 h-5 rounded-full text-[8px] font-black flex items-center justify-center ring-1 ring-black/40"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary-fg)',
                }}
                title={driver.employer}
              >
                {driver.employer.slice(0, 2).toUpperCase()}
              </span>
              <span
                className="w-5 h-5 rounded-full bg-white text-[#0B0C0E] text-[8px] font-mono font-black flex items-center justify-center ring-1 ring-black/40"
                title="Section 44 Verified"
              >
                S44
              </span>
            </div>
          </div>

          {/* Bold 2-line Editorial Headline */}
          <h2 className="font-display text-[19px] font-black text-white leading-[1.15] tracking-tight line-clamp-2">
            {driver.trip_purpose ||
              `Daily ${driver.corridor.origin.split('/')[0].trim()} to ${driver.corridor.destination.split('(')[0].trim()} carpool`}
          </h2>

          {/* Single Clean Smoked-Glass Pill Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {portraitTags.map((tag, idx) => (
              <span
                key={idx}
                className="glass-pill-tag px-2.5 py-1 text-[10px] font-bold whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Subtle Safe Pickup Line */}
          <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-white/75 truncate">
            <MapPin
              className="w-3 h-3 flex-shrink-0"
              style={{ color: 'var(--accent-primary)' }}
            />
            <span className="truncate">
              {selectedSafeZone.name} → {driver.corridor.destination.split('(')[0].trim()}
            </span>
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
