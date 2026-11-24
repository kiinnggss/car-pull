'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, ArrowLeft, X } from 'lucide-react';
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
    <div
      className="fixed inset-0 z-[700] bg-black/75 backdrop-blur-xs overflow-y-auto p-3 overscroll-contain flex items-center justify-center animate-in fade-in duration-150"
      onClick={handleBack}
    >
      <div
        className="w-full max-w-[390px] bg-[var(--bg-sheet)] text-[var(--text-primary)] rounded-[32px] p-5 space-y-3.5 my-auto border border-[var(--border-subtle)] shadow-2xl animate-in zoom-in-95 duration-150"
        style={{ borderWidth: 'var(--card-border-width, 1px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center active-press"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 rounded-full bg-[var(--bg-subtle)] text-xs font-bold text-[var(--text-primary)] truncate max-w-[200px]">
            {driver.employer}
          </span>

          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center active-press"
            aria-label="Close Verification Dossier"
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
              className="w-14 h-14 rounded-2xl object-cover object-top flex-shrink-0 border border-[var(--border-subtle)]"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-display font-black truncate">
                  {driver.name}
                </h3>
                <ShieldCheck
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: 'var(--accent-signal)' }}
                />
              </div>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {driver.employer} · {driver.trips_completed} verified trips
              </p>
            </div>
          </div>

          <div className="flex items-center -space-x-2 flex-shrink-0">
            <span className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] ring-2 ring-[var(--bg-sheet)] text-[10px] font-black flex items-center justify-center">
              {driver.employer.slice(0, 2).toUpperCase()}
            </span>
            <span className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] ring-2 ring-[var(--bg-sheet)] text-[10px] font-mono font-black flex items-center justify-center">
              ★{driver.rating}
            </span>
          </div>
        </div>

        {/* Theme-Adaptive Commute Goal Block */}
        <div className="volt-surface p-4 relative overflow-hidden">
          <span className="absolute right-3 -top-2 font-display text-6xl font-black opacity-20 select-none pointer-events-none">
            &ldquo;
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider font-black opacity-80 block">
            Commute Goal
          </span>
          <p className="text-sm font-extrabold leading-snug mt-1 relative z-10">
            {driver.trip_purpose ||
              `Sharing daily ${driver.corridor.origin} to ${driver.corridor.destination} expressway rides with verified peers.`}
          </p>
        </div>

        {/* Corporate & Identity Verification */}
        <div className="p-4 rounded-[24px] bg-[var(--bg-subtle)] space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block">
            Corporate &amp; Identity Verification
          </span>
          <p className="text-xs font-semibold leading-relaxed">
            Work email authenticated under{' '}
            <strong className="font-mono">@{driver.employer_domain}</strong>. Government NIN and BVN matched via Dojah.
          </p>
        </div>

        {/* Vehicle & Sec 44 Exemption */}
        <div className="p-4 rounded-[24px] bg-[var(--bg-subtle)] space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block">
            Vehicle &amp; Sec 44 Exemption
          </span>
          <p className="text-xs font-semibold leading-relaxed">
            {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.color}) · Plate{' '}
            <strong className="font-mono">{driver.vehicle.plate_number}</strong>. Non-commercial fuel split under Lagos Transport Reform Act Sec 44.
          </p>
        </div>

        {/* Pill Tags Grid */}
        <div className="flex flex-wrap gap-1.5">
          {(driver.interests || ['Tech & Design', 'FinTech', 'Startups', 'Afrobeats']).map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] text-[11px] font-bold"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={handleBack}
          className="w-full py-3.5 btn-electric-mint font-extrabold text-xs rounded-full active-press"
        >
          Back to Swipe Deck
        </button>
      </div>
    </div>,
    document.body
  );
};
