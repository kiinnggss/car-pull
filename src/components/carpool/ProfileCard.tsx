'use client';

import React, { useState, useEffect } from 'react';
import { CorridorDriver } from '@/lib/types';
import {
  Clock,
  Info,
  MapPin,
  Star,
  Car,
  Music,
  ShieldCheck,
  Users,
  Sparkles,
  CheckCircle2,
  Snowflake,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { DriverTrustModal } from './DriverTrustModal';
import { triggerHaptic } from '@/lib/haptics';

interface ProfileCardProps {
  driver: CorridorDriver;
  matchPercent?: number;
  matchReason?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  driver,
  matchPercent,
  matchReason,
}) => {
  const { selectedSafeZone } = useAppStore();
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setActiveSlide(0);
  }, [driver.id]);

  const portraitTags = [
    `${driver.vehicle.make} ${driver.vehicle.model}`,
    driver.vehicle.plate_number,
    `${driver.corridor.ac_included ? 'AC' : 'Air'} · ${driver.corridor.available_seats} Seats`,
  ];

  const handleCardTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftTap = clickX < rect.width * 0.35;

    triggerHaptic('tap');
    setActiveSlide((prev) => {
      if (isLeftTap) {
        return Math.max(0, prev - 1);
      }
      return (prev + 1) % 3;
    });
  };

  return (
    <>
      <div
        onClick={handleCardTap}
        className="relative w-full h-full min-h-[360px] sm:min-h-[420px] rounded-2xl overflow-hidden select-none cursor-pointer bg-[#14161B]"
        style={{
          border: 'var(--card-border-width, 1px) solid var(--border-subtle)',
          boxShadow: '0 10px 28px -12px rgba(15, 23, 42, 0.28)',
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

        {/* Full-Bleed Portrait (Top 60% unobstructed on Slide 0) */}
        <img
          src={driver.avatar}
          alt={driver.name}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Editorial Scrim */}
        {activeSlide === 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/25 pointer-events-none" />
        )}
        {activeSlide === 1 && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px] pointer-events-none transition-opacity duration-200" />
        )}
        {activeSlide === 2 && (
          <div className="absolute inset-0 bg-black/78 backdrop-blur-[4px] pointer-events-none transition-opacity duration-200" />
        )}

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

          <div className="flex items-center justify-between gap-2 text-white">
            <div className="flex items-center gap-2 text-xs font-mono font-medium drop-shadow-xs min-w-0 truncate">
              <span className="inline-flex items-center gap-1">
                <Star className="w-3 h-3 fill-current text-[#D1835E]" />
                {driver.rating}
              </span>
              <span className="opacity-50">·</span>
              <span>{driver.corridor.departure_time}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('tap');
                setShowTrustModal(true);
              }}
              className="p-1.5 text-white/90 hover:text-white active-press flex-shrink-0"
              title="Driver details"
              aria-label="Driver details"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SLIDE 0: Clean Editorial Portrait Overview */}
        {activeSlide === 0 && (
          <div className="absolute bottom-5 left-5 right-5 z-20 space-y-1 text-white">
            <h2 className="font-display text-2xl font-bold text-white leading-tight tracking-tight truncate">
              {driver.name}
            </h2>

            <p className="text-xs text-white/85 truncate">
              {driver.employer} · {driver.vehicle.make} {driver.vehicle.model}
            </p>

            <p className="text-xs text-white/70 truncate pt-0.5">
              {selectedSafeZone.name} → {driver.corridor.destination.split('(')[0].trim()} · {driver.corridor.available_seats} seats
            </p>
          </div>
        )}

        {/* SLIDE 1: Vehicle, Cabin Vibe & Co-Riders */}
        {activeSlide === 1 && (
          <div className="absolute inset-x-4 top-20 bottom-4 z-20 flex flex-col justify-between text-white">
            <div className="space-y-3 overflow-y-auto no-scrollbar pr-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/65 font-bold">
                  02 · Vehicle &amp; Cabin
                </span>
                {driver.mutual_spark && (
                  <span className="glass-pill-tag px-2.5 py-0.5 text-[9.5px] font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#FF9F0A]" />
                    {driver.mutual_spark}
                  </span>
                )}
              </div>

              {/* Vehicle Spec Block */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Car className="w-4 h-4 text-white/85 flex-shrink-0" />
                    <span className="text-xs font-extrabold truncate">
                      {driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/15 font-mono text-[10px] font-black flex-shrink-0">
                    {driver.vehicle.plate_number}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/75">
                  <span>{driver.vehicle.color}</span>
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Snowflake className="w-3 h-3" />
                    {driver.corridor.ac_included ? 'Cold AC' : 'Ventilated'} ·{' '}
                    {driver.corridor.available_seats} seats open
                  </span>
                </div>
              </div>

              {/* Cabin Vibe & Playlist */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white/90">
                    {driver.conversation_vibe || 'Friendly Commute'}
                  </span>
                </div>
                {driver.music_vibe && (
                  <div className="flex items-center gap-1.5 text-[11px] text-white/75">
                    <Music className="w-3.5 h-3.5 flex-shrink-0 text-white/85" />
                    <span className="truncate">{driver.music_vibe}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {(driver.talk_about || driver.vibe_tags).slice(0, 4).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-white/12 text-[10px] font-bold text-white/90"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Co-Riders */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/65 font-bold flex items-center gap-1">
                    <Users className="w-3 h-3" /> Co-Riders in Cabin
                  </span>
                  <span className="text-[10px] font-mono font-bold text-white/70">
                    {driver.cabin_passengers?.length || 0} booked
                  </span>
                </div>

                {driver.cabin_passengers && driver.cabin_passengers.length > 0 ? (
                  <div className="space-y-1.5">
                    {driver.cabin_passengers.map((p) => (
                      <div key={p.id} className="flex items-center gap-2.5">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-7 h-7 rounded-full object-cover object-top"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-extrabold block truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-white/70 block truncate">
                            {p.role} · Seat {p.seatNumber}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-white/75 font-medium">
                    Open cabin · First seat available
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[9.5px] font-mono uppercase tracking-wider text-white/55 pt-2">
              <span>← Photo</span>
              <span>Route &amp; Trust →</span>
            </div>
          </div>
        )}

        {/* SLIDE 2: Corridor Timeline & Section 44 Trust */}
        {activeSlide === 2 && (
          <div className="absolute inset-x-4 top-20 bottom-4 z-20 flex flex-col justify-between text-white">
            <div className="space-y-3 overflow-y-auto no-scrollbar pr-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/65 font-bold">
                  03 · Corridor &amp; Verification
                </span>
                <span className="glass-pill-tag px-2.5 py-0.5 text-[10px] font-mono font-bold">
                  {driver.corridor.distance_km ?? 22} km
                </span>
              </div>

              {/* Corridor Timeline */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center pt-1">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span className="w-0.5 h-5 border-l border-dotted border-white/40 my-0.5" />
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: 'var(--accent-signal)' }}
                    />
                    <span className="w-0.5 h-5 border-l border-dotted border-white/40 my-0.5" />
                    <span className="w-2 h-2 rounded-full bg-white/80" />
                  </div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <div>
                      <span className="text-[9.5px] font-mono uppercase text-white/55 block">
                        Origin
                      </span>
                      <span className="text-xs font-extrabold block truncate">
                        {driver.corridor.origin}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-mono uppercase text-white/55 block">
                        Safe Pickup Hub · CCTV Guarded
                      </span>
                      <span className="text-xs font-extrabold block truncate">
                        {selectedSafeZone.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-mono uppercase text-white/55 block">
                        Destination
                      </span>
                      <span className="text-xs font-extrabold block truncate">
                        {driver.corridor.destination}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sec 44 Trust Summary */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  <ShieldCheck className="w-4 h-4 text-[#FF9F0A]" />
                  <span>Section 44 Verified Commuter</span>
                </div>
                <div className="space-y-1 text-[11px] text-white/85">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
                    <span className="truncate">
                      Work email: <strong>@{driver.employer_domain}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
                    <span className="truncate">
                      {driver.alumni} · {driver.trips_completed} trips completed
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('tap');
                    setShowTrustModal(true);
                  }}
                  className="w-full mt-1 py-2 rounded-full bg-white text-[#0B0C0E] text-[11px] font-extrabold active-press"
                >
                  View full Sec 44 dossier
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9.5px] font-mono uppercase tracking-wider text-white/55 pt-2">
              <span>← Cabin</span>
              <span>Restart →</span>
            </div>
          </div>
        )}
      </div>

      <DriverTrustModal
        driver={driver}
        isOpen={showTrustModal}
        onClose={() => setShowTrustModal(false)}
      />
    </>
  );
};
