'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { PhoneCall, Share2 } from 'lucide-react';
import { openWhatsAppTripShare } from '@/lib/liveTracking';
import { triggerHaptic } from '@/lib/haptics';

export const CommutePass: React.FC = () => {
  const {
    user,
    activeRole,
    driverVehicle,
    activeMatches,
    offlinePin,
    selectedSafeZone,
    showFeedbackBanner,
  } = useAppStore();

  const [currentTime, setCurrentTime] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-NG', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) +
          ' · ' +
          now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeMatch = activeMatches[0];
  const activeDriverName = activeRole === 'driver' ? user.fullName : (activeMatch?.driverName || 'Babatunde Adeleke');
  const activeVehiclePlate = activeRole === 'driver'
    ? driverVehicle.plate_number
    : (activeMatch?.plateNumber || 'APP-842-EY');
  const activeVehicleModel = activeRole === 'driver'
    ? `${driverVehicle.make} ${driverVehicle.model}`
    : (activeMatch?.vehicleMake && activeMatch?.vehicleModel
        ? `${activeMatch.vehicleMake} ${activeMatch.vehicleModel}`
        : 'Toyota Camry (2021)');
  const activePickupHub = activeMatch?.pickupSafeZone?.name || selectedSafeZone?.name || 'TotalEnergies Safe Hub, Ajah';

  const sharePassWhatsApp = () => {
    triggerHaptic('tap');
    const result = openWhatsAppTripShare({
      driverName: activeDriverName,
      plateNumber: activeVehiclePlate,
      vehicleModel: activeVehicleModel,
      pickupHub: activePickupHub,
      boardingPin: offlinePin,
      scheduledFor: activeMatch?.scheduledFor || currentTime,
      corridorLabel: 'Lagos Sec 44 Verified Carpool',
    });

    if (result.copied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }

    showFeedbackBanner(
      'Live Trip Shared',
      result.copied
        ? `Copied & opened in WhatsApp · ${activeVehiclePlate}`
        : `Opened live pass in WhatsApp · ${activeVehiclePlate}`,
      'WHATSAPP'
    );
  };

  return (
    <div className="w-full pb-20 px-5 pt-4 space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-baseline justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
            Commute Pass
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Verified non-commercial carpool
          </p>
        </div>
        <span className="text-xs font-mono font-semibold" style={{ color: 'var(--accent-signal)' }}>
          Active
        </span>
      </div>

      {/* Centered Clean QR Code */}
      <div className="flex flex-col items-center text-center py-2 space-y-3">
        <div className="bg-white p-3 rounded-xl border border-[var(--border-subtle)]">
          <svg
            viewBox="0 0 120 120"
            className="w-36 h-36 text-[#0F172A] fill-current"
            shapeRendering="crispEdges"
          >
            <rect x="10" y="10" width="30" height="30" fill="#0F172A" />
            <rect x="15" y="15" width="20" height="20" fill="#FFFFFF" />
            <rect x="20" y="20" width="10" height="10" fill="#0F172A" />

            <rect x="80" y="10" width="30" height="30" fill="#0F172A" />
            <rect x="85" y="15" width="20" height="20" fill="#FFFFFF" />
            <rect x="90" y="20" width="10" height="10" fill="#0F172A" />

            <rect x="10" y="80" width="30" height="30" fill="#0F172A" />
            <rect x="15" y="85" width="20" height="20" fill="#FFFFFF" />
            <rect x="20" y="90" width="10" height="10" fill="#0F172A" />

            <rect x="45" y="15" width="5" height="5" />
            <rect x="55" y="15" width="15" height="5" />
            <rect x="45" y="25" width="10" height="5" />
            <rect x="65" y="25" width="5" height="5" />
            <rect x="45" y="35" width="25" height="5" />

            <rect x="15" y="45" width="15" height="5" />
            <rect x="35" y="45" width="10" height="5" />
            <rect x="55" y="45" width="5" height="5" />
            <rect x="70" y="45" width="15" height="5" />
            <rect x="95" y="45" width="15" height="5" />

            <rect x="15" y="55" width="5" height="5" />
            <rect x="25" y="55" width="20" height="5" />
            <rect x="55" y="55" width="15" height="5" />
            <rect x="80" y="55" width="10" height="5" />
            <rect x="100" y="55" width="10" height="5" />

            <rect x="15" y="65" width="20" height="5" />
            <rect x="45" y="65" width="10" height="5" />
            <rect x="65" y="65" width="20" height="5" />
            <rect x="95" y="65" width="15" height="5" />

            <rect x="45" y="85" width="15" height="5" />
            <rect x="70" y="85" width="5" height="5" />
            <rect x="85" y="85" width="20" height="5" />
            <rect x="45" y="95" width="5" height="5" />
            <rect x="60" y="95" width="25" height="5" />
            <rect x="95" y="95" width="10" height="5" />
          </svg>
        </div>

        <div className="space-y-0.5">
          <div className="text-sm font-mono font-bold tracking-wider text-[var(--text-primary)]">
            LASG-CP-8921-2026
          </div>
          <div className="text-xs font-mono text-[var(--text-secondary)]">
            Boarding PIN <strong className="text-[var(--text-primary)]">{offlinePin}</strong>
          </div>
        </div>
      </div>

      {/* Hairline Key-Value Manifest */}
      <dl className="divide-y divide-[var(--border-subtle)] border-t border-b border-[var(--border-subtle)] text-xs">
        <div className="py-2.5 flex items-center justify-between gap-4">
          <dt className="text-[var(--text-secondary)]">Driver</dt>
          <dd className="font-semibold text-[var(--text-primary)] truncate">{activeDriverName}</dd>
        </div>
        <div className="py-2.5 flex items-center justify-between gap-4">
          <dt className="text-[var(--text-secondary)]">Vehicle</dt>
          <dd className="font-semibold text-[var(--text-primary)] truncate">
            {activeVehicleModel} · <span className="font-mono">{activeVehiclePlate}</span>
          </dd>
        </div>
        <div className="py-2.5 flex items-center justify-between gap-4">
          <dt className="text-[var(--text-secondary)]">Pickup hub</dt>
          <dd className="font-semibold text-[var(--text-primary)] truncate">{activePickupHub}</dd>
        </div>
        <div className="py-2.5 flex items-center justify-between gap-4">
          <dt className="text-[var(--text-secondary)]">Fare type</dt>
          <dd className="font-semibold text-[var(--text-primary)]">Shared fuel cost</dd>
        </div>
        <div className="py-2.5 flex items-center justify-between gap-4">
          <dt className="text-[var(--text-secondary)]">Time</dt>
          <dd className="font-mono tabular-nums text-[var(--text-primary)]">{currentTime}</dd>
        </div>
      </dl>

      {/* Primary Action + Plain Emergency Links */}
      <div className="space-y-4">
        <button
          onClick={sharePassWhatsApp}
          className="w-full h-11 btn-electric-mint text-xs active-press flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>{copied ? 'Live trip copied & shared' : 'Share live trip on WhatsApp'}</span>
        </button>

        <div className="flex items-center justify-center gap-6 text-xs">
          <a
            href="tel:080000527862"
            className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] active-press"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-500" />
            <span>LASTMA</span>
          </a>

          <a
            href="tel:112"
            className="flex items-center gap-1.5 font-medium text-red-600 dark:text-red-400 active-press"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>LASEMA 112</span>
          </a>
        </div>
      </div>
    </div>
  );
};
