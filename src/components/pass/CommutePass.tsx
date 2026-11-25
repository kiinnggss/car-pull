'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  ShieldCheck,
  PhoneCall,
  Share2,
  AlertTriangle,
  Car,
} from 'lucide-react';
import { openWhatsAppTripShare } from '@/lib/liveTracking';
import { triggerHaptic } from '@/lib/haptics';

export const CommutePass: React.FC = () => {
  const {
    user,
    activeRole,
    driverVehicle,
    acceptedRiders,
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
          ' ' +
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
    <div className="w-full max-w-[404px] mx-auto pb-24 px-3 space-y-3.5 animate-in fade-in pt-1">
      {/* 1. Pitch Obsidian + Volt Lime Scannable QR Certificate Card */}
      <div className="bg-[#0B0C0E] dark:bg-[#14161B] rounded-[32px] p-5 text-white space-y-4 border border-[var(--border-subtle)] shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-signal)] font-bold block">
              LAGOS TRANSPORT REFORM ACT
            </span>
            <h2 className="text-base font-display font-black text-white mt-0.5">
              Sec 44 Commute Pass
            </h2>
          </div>

          <span className="px-3 py-1 rounded-full bg-white text-[#0B0C0E] text-[10px] font-mono font-black flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-ping" />
            EXEMPT
          </span>
        </div>

        {/* Scannable QR & Token Row */}
        <div className="p-4 rounded-[24px] bg-[#1E2028] flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-2xl flex-shrink-0">
            <svg
              viewBox="0 0 120 120"
              className="w-22 h-22 text-[#0B0C0E] fill-current"
              shapeRendering="crispEdges"
            >
              <rect x="10" y="10" width="30" height="30" fill="#0B0C0E" />
              <rect x="15" y="15" width="20" height="20" fill="#FFFFFF" />
              <rect x="20" y="20" width="10" height="10" fill="#0B0C0E" />

              <rect x="80" y="10" width="30" height="30" fill="#0B0C0E" />
              <rect x="85" y="15" width="20" height="20" fill="#FFFFFF" />
              <rect x="90" y="20" width="10" height="10" fill="#0B0C0E" />

              <rect x="10" y="80" width="30" height="30" fill="#0B0C0E" />
              <rect x="15" y="85" width="20" height="20" fill="#FFFFFF" />
              <rect x="20" y="90" width="10" height="10" fill="#0B0C0E" />

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

          <div className="space-y-1.5 min-w-0">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--accent-signal)] font-bold block">
              STATUTORY AUDIT TOKEN
            </span>
            <div className="text-xs font-mono font-black text-white tracking-wider">
              LASG-CP-8921-2026
            </div>
            <p className="text-[10.5px] text-white/70 leading-snug">
              Present to LASTMA or Police Officer for instant Section 44 exemption verification.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 text-[10px] font-mono">
              <span className="text-white/60">PIN:</span>
              <strong className="text-white font-black tracking-widest">{offlinePin}</strong>
            </div>
          </div>
        </div>

        {/* Live Telemetry Clock Pill */}
        <div className="px-4 py-2.5 rounded-full bg-white/8 flex items-center justify-between text-[10px] font-mono tabular-nums">
          <span className="text-[var(--accent-signal)] font-bold">LIVE AUDIT CLOCK</span>
          <span className="text-white font-bold">{currentTime}</span>
        </div>
      </div>

      {/* 2. Uber Green 2-Column Bento Manifest Tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="volt-surface rounded-[26px] p-4 flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-black opacity-75">
              VEHICLE
            </span>
            <Car className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold block truncate">
              {activeVehicleModel}
            </span>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] font-mono text-[10px] font-black">
              {activeVehiclePlate}
            </span>
          </div>
        </div>

        <div className="floating-surface rounded-[26px] p-4 flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-secondary)]">
              COMMERCIAL PROFIT
            </span>
            <ShieldCheck className="w-4 h-4 text-[var(--text-primary)] dark:text-[var(--accent-primary)]" />
          </div>
          <div>
            <span className="text-base font-black font-mono tabular-nums text-[var(--text-primary)] block">
              ₦0.00
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-semibold block mt-0.5">
              1.2x PMS Fuel Cap Only
            </span>
          </div>
        </div>
      </div>

      {/* 3. Statutory Notice & Actions Sheet */}
      <div className="floating-surface rounded-[28px] p-4 space-y-3">
        <div className="p-3.5 rounded-2xl bg-[#FF9F0A]/15 text-[11px] text-[var(--text-primary)] space-y-1">
          <div className="flex items-center gap-1.5 font-mono font-black text-xs text-[#FF9F0A]">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>STATUTORY NOTICE TO OFFICERS</span>
          </div>
          <p className="leading-relaxed text-[var(--text-secondary)]">
            Under <strong>Lagos State Transport Sector Reform Law (Cap T1, Section 44)</strong>, corporate cost-sharing commuters are exempt from hackney permits and union tickets.
          </p>
        </div>

        <button
          onClick={sharePassWhatsApp}
          className="w-full py-3.5 btn-electric-mint font-extrabold text-xs rounded-full active-press flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>{copied ? 'Live Trip Copied & Shared' : 'Share Live Trip on WhatsApp'}</span>
        </button>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <a
            href="tel:080000527862"
            className="py-2.5 px-3 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] font-mono font-bold flex items-center justify-center gap-1.5 active-press"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-500" />
            <span>LASTMA</span>
          </a>

          <a
            href="tel:112"
            className="py-2.5 px-3 rounded-full bg-red-500/12 text-red-600 dark:text-red-400 font-mono font-bold flex items-center justify-center gap-1.5 active-press"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>LASEMA (112)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
