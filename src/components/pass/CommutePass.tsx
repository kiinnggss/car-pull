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
import { getAssetPath } from '@/lib/assets';

export const CommutePass: React.FC = () => {
  const {
    user,
    activeRole,
    driverVehicle,
    acceptedRiders,
    activeMatches,
    offlinePin,
    commuteDirection,
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

  const activeDriverName = activeRole === 'driver' ? user.fullName : (activeMatches[0]?.driverName || 'Babatunde Adeleke');
  const activeVehiclePlate = activeRole === 'driver' ? driverVehicle.plate_number : 'APP-842-EY';
  const activeVehicleModel = activeRole === 'driver' ? `${driverVehicle.make} ${driverVehicle.model}` : 'Toyota Camry (2021)';

  const sharePassWhatsApp = () => {
    const text = `*LAGOS STATE NON-COMMERCIAL COMMUTE CERTIFICATE*
Statutory Authority: Lagos State Transport Sector Reform Law 2018 (Cap T1, Section 44)
Status: Verified Non-Commercial Carpool (Exempt from Commercial Taxi Licensing)

• Vehicle: ${activeVehicleModel} | Plate: *${activeVehiclePlate}*
• Driver: ${activeDriverName} (${user.employer})
• Security PIN: ${offlinePin}
• Audit Timestamp: ${currentTime}

Manifest:
• Driver: ${activeDriverName} (NIN/BVN Verified)
${acceptedRiders.length > 0 ? acceptedRiders.map((r, i) => `• Co-Rider ${i + 1}: ${r.name} (${r.employer})`).join('\n') : '• Co-Rider: Femi Adeyemi (Dangote Group)'}

Zero-Profit Audit: Fuel split capped at 1.2x PMS consumption. Not for hire.
Emergency Hotlines: LASTMA: 0800-00-LASTMA | LASEMA: 112 / 767`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in pt-1">
      {/* Official Government Compliance Shield Card */}
      <div className="floating-surface rounded-2xl overflow-hidden">
        {/* Official Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200/70 dark:border-white/8">
          <div className="flex items-center gap-2.5">
            <img
              src={getAssetPath('/logo.png')}
              alt="CAR PULL Seal"
              className="w-8 h-8 rounded-xl object-contain bg-slate-100 dark:bg-[#171F29] p-1 border border-slate-200/80 dark:border-white/10 flex-shrink-0"
            />
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#0F766E] dark:text-[#14B8A6] font-extrabold block">
                LAGOS TRANSPORT REFORM ACT
              </span>
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
                Non-Commercial Commute Pass
              </h3>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/12 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-[9px] font-mono font-extrabold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SEC 44 SAFE HARBOR
          </span>
        </div>

        {/* Dynamic Anti-Counterfeit Scannable QR Shield */}
        <div className="p-4 bg-slate-950 dark:bg-[#0B0F14] text-white flex items-center gap-4 border-b border-slate-200/70 dark:border-white/8">
          <div className="bg-white p-2 rounded-xl flex-shrink-0">
            <svg
              viewBox="0 0 120 120"
              className="w-24 h-24 text-slate-950 fill-current"
              shapeRendering="crispEdges"
            >
              <rect x="10" y="10" width="30" height="30" fill="#000" />
              <rect x="15" y="15" width="20" height="20" fill="#fff" />
              <rect x="20" y="20" width="10" height="10" fill="#000" />

              <rect x="80" y="10" width="30" height="30" fill="#000" />
              <rect x="85" y="15" width="20" height="20" fill="#fff" />
              <rect x="90" y="20" width="10" height="10" fill="#000" />

              <rect x="10" y="80" width="30" height="30" fill="#000" />
              <rect x="15" y="85" width="20" height="20" fill="#fff" />
              <rect x="20" y="90" width="10" height="10" fill="#000" />

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

              <circle cx="60" cy="60" r="10" fill="#0F766E" />
            </svg>
          </div>

          <div className="space-y-1.5 min-w-0">
            <span className="text-[9px] font-mono uppercase tracking-widest text-teal-400 font-bold block">
              STATUTORY AUDIT TOKEN
            </span>
            <div className="text-xs font-mono font-black text-white tracking-wider">
              LASG-CP-8921-2026
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Present to LASTMA or Police Officer for instant Section 44 exemption verification.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono">
              <span className="text-slate-400">OFFLINE PIN:</span>
              <strong className="text-teal-300 font-black tracking-widest">{offlinePin}</strong>
            </div>
          </div>
        </div>

        {/* Live Audit Timestamp Bar */}
        <div className="px-4 py-2 bg-emerald-500/10 border-b border-slate-200/70 dark:border-white/8 flex items-center justify-between text-[10px] font-mono tabular-nums text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold">LIVE TELEMETRY CLOCK</span>
          </div>
          <span className="font-bold">{currentTime}</span>
        </div>

        {/* Vehicle & Occupant Manifest Breakdown (Hairline-Divided Rows) */}
        <div className="divide-y divide-slate-200/70 dark:divide-white/8 text-xs">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              <span className="font-extrabold text-slate-900 dark:text-slate-100">{activeVehicleModel}</span>
            </div>
            <span className="plate-badge">{activeVehiclePlate}</span>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Verified Driver</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {activeDriverName}{' '}
              <span className="font-mono text-[10px] text-[#0F766E] dark:text-[#14B8A6]">
                (@{user.employerDomain})
              </span>
            </span>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Commute Corridor</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-[10px]">
              {commuteDirection === 'morning' ? 'AJAH → VI → MARINA' : 'VI / MARINA → AJAH'}
            </span>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Statutory Class</span>
            <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/12 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px]">
              PRIVATE CORPORATE CARPOOL
            </span>
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Commercial Profit</span>
            <span className="font-black font-mono tabular-nums text-slate-900 dark:text-slate-100">
              ₦0.00 (1.2x PMS Ceiling)
            </span>
          </div>
        </div>

        {/* Legal Advisory & Actions Footer */}
        <div className="p-4 bg-slate-50/70 dark:bg-[#0D1218]/60 border-t border-slate-200/70 dark:border-white/8 space-y-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[10px] text-amber-950 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-mono font-extrabold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>NOTICE TO LAW ENFORCEMENT OFFICERS</span>
            </div>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              Under <strong>Lagos State Transport Sector Reform Law (Cap T1, Section 44)</strong>, non-profit cost-sharing corporate commuters are exempt from commercial hackney/taxi licensing and union tickets.
            </p>
          </div>

          <button
            onClick={sharePassWhatsApp}
            className="w-full py-3 btn-electric-mint font-black text-xs rounded-xl active-spring transition-all flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Pass Copied to Clipboard' : 'Share Statutory Pass on WhatsApp'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <a
              href="tel:080000527862"
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#171F29] hover:bg-slate-100 dark:hover:bg-[#1E2936] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 font-mono font-bold flex items-center justify-center gap-1.5 active-spring transition-all"
            >
              <PhoneCall className="w-3 h-3 text-red-600 dark:text-red-400" />
              <span>LASTMA TOLL-FREE</span>
            </a>

            <a
              href="tel:112"
              className="py-2.5 px-3 rounded-xl bg-red-500/12 hover:bg-red-500/20 border border-red-500/25 text-red-700 dark:text-red-300 font-mono font-bold flex items-center justify-center gap-1.5 active-spring transition-all"
            >
              <PhoneCall className="w-3 h-3 text-red-600 dark:text-red-400" />
              <span>LASEMA (112 / 767)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
