'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  Car,
  ArrowLeft,
  X,
} from 'lucide-react';
import { CorridorDriver } from '@/lib/types';

interface DriverTrustModalProps {
  driver: CorridorDriver;
  isOpen: boolean;
  onClose: () => void;
}

export const DriverTrustModal: React.FC<DriverTrustModalProps> = ({
  driver,
  isOpen,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: 'driver-trust' }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleBack = () => {
    if (window.history.state?.modal === 'driver-trust') {
      window.history.back();
    } else {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[700] bg-black/75 backdrop-blur-xs overflow-y-auto p-3 overscroll-contain flex items-center justify-center animate-in fade-in duration-150">
      {/* Professional Network Tinder Style Dark Editorial Sheet */}
      <div className="w-full max-w-[390px] bg-[#0B0C0E] text-white rounded-[32px] p-5 space-y-3.5 my-auto border border-white/10 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active-press"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white/90">
            {driver.employer}
          </span>

          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active-press"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Driver Header & Overlapping Network Badges */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-display font-black text-white truncate">
                  {driver.name}
                </h3>
                <ShieldCheck className="w-4 h-4 text-[#C8FF00] flex-shrink-0" />
              </div>
              <p className="text-xs text-white/70 truncate">
                {driver.employer} • {driver.trips_completed} verified trips
              </p>
            </div>
          </div>

          <div className="flex items-center -space-x-2 flex-shrink-0">
            <span className="w-8 h-8 rounded-full bg-[#FF9F0A] text-[#0B0C0E] ring-2 ring-[#0B0C0E] text-[10px] font-black flex items-center justify-center">
              {driver.employer.slice(0, 2).toUpperCase()}
            </span>
            <span className="w-8 h-8 rounded-full bg-[#C8FF00] text-[#0B0C0E] ring-2 ring-[#0B0C0E] text-[10px] font-mono font-black flex items-center justify-center">
              ★{driver.rating}
            </span>
          </div>
        </div>

        {/* 1. Professional Network Tinder Warm Amber "Goals" Block */}
        <div className="amber-quote-surface p-4 relative overflow-hidden">
          <span className="absolute right-3 -top-2 font-display text-6xl font-black text-white/25 select-none pointer-events-none">
            &ldquo;
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider font-black text-white/85 block">
            Commute Goal
          </span>
          <p className="text-sm font-extrabold text-white leading-snug mt-1 relative z-10">
            {driver.trip_purpose ||
              `Sharing daily ${driver.corridor.origin} to ${driver.corridor.destination} expressway rides with verified peers.`}
          </p>
        </div>

        {/* 2. Dark Charcoal Bento Blocks (`Available for` & `Verification`) */}
        <div className="p-4 rounded-[24px] bg-[#1E2028] space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold block">
            Corporate &amp; Identity Verification
          </span>
          <p className="text-xs font-semibold text-white/90 leading-relaxed">
            Work email authenticated under <strong className="text-[#C8FF00]">@{driver.employer_domain}</strong>. Government NIN and BVN matched via Dojah.
          </p>
        </div>

        <div className="p-4 rounded-[24px] bg-[#1E2028] space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold block">
            Vehicle &amp; Sec 44 Exemption
          </span>
          <p className="text-xs font-semibold text-white/90 leading-relaxed">
            {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.color}) • Plate{' '}
            <strong className="text-[#FF9F0A] font-mono">{driver.vehicle.plate_number}</strong>. Non-commercial fuel split under Lagos Transport Reform Act Sec 44.
          </p>
        </div>

        {/* 3. Pill Tags Grid */}
        <div className="flex flex-wrap gap-1.5">
          {(driver.interests || ['Tech & Design', 'FinTech', 'Startups', 'Afrobeats']).map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-[#1E2028] text-white/85 text-[11px] font-bold"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={handleBack}
          className="w-full py-3.5 btn-volt font-extrabold text-xs rounded-full active-press"
        >
          Back to Swipe Deck
        </button>
      </div>
    </div>,
    document.body
  );
};
