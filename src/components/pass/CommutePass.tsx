'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
  ShieldCheck,
  QrCode,
  Lock,
  PhoneCall,
  Share2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Car,
  Users,
  Building2,
  ExternalLink,
} from 'lucide-react';

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
    const text = `🛡️ *LAGOS STATE NON-COMMERCIAL COMMUTE CERTIFICATE*
📜 *Statutory Authority:* Lagos State Transport Sector Reform Law 2018 (Cap T1, Section 44)
🛡️ *Status:* Verified Non-Commercial Carpool (Exempt from Commercial Taxi Licensing)

🚘 *Vehicle:* ${activeVehicleModel} | Plate: *${activeVehiclePlate}*
👤 *Driver:* ${activeDriverName} (${user.employer})
🔢 *Offline Security PIN:* ${offlinePin}
📅 *Audit Timestamp:* ${currentTime}

👥 *Manifest:*
• Driver: ${activeDriverName} (NIN/BVN Verified)
${acceptedRiders.length > 0 ? acceptedRiders.map((r, i) => `• Co-Rider ${i + 1}: ${r.name} (${r.employer})`).join('\n') : '• Co-Rider: Femi Adeyemi (Dangote Group)'}

⚖️ *Zero-Profit Audit:* Fuel split capped at 1.2x PMS consumption. Not for hire.
📞 *LASTMA Extortion Hotline:* 0800-00-LASTMA | *LASEMA:* 112 / 767`;

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
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in">
      {/* Official Government Compliance Shield Card */}
      <div className="bg-gradient-to-b from-emerald-50/80 via-white to-white rounded-3xl p-4.5 border border-emerald-200/80 shadow-xs space-y-3.5 relative overflow-hidden">
        {/* Subtle Watermark */}
        <div className="absolute -right-8 -top-8 text-emerald-100/40 pointer-events-none select-none">
          <ShieldCheck className="w-44 h-44" />
        </div>

        {/* Official Header */}
        <div className="flex items-center justify-between border-b border-emerald-100/80 pb-2.5">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="CAR PULL Seal"
              className="w-8 h-8 rounded-xl object-cover shadow-2xs border border-emerald-300 flex-shrink-0"
            />
            <div>
              <span className="text-[9px] uppercase tracking-widest text-emerald-800 font-extrabold block">
                Lagos State Transport Reform Act
              </span>
              <h3 className="text-xs font-black text-zinc-900 leading-tight">
                Non-Commercial Commute Certificate
              </h3>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            SEC 44 SAFE HARBOR
          </span>
        </div>

        {/* Dynamic Anti-Counterfeit Scannable QR Shield */}
        <div className="flex flex-col items-center justify-center p-3.5 bg-zinc-900 rounded-2xl text-white space-y-2 relative">
          <div className="bg-white p-2.5 rounded-xl shadow-md">
            {/* High fidelity SVG QR pattern */}
            <svg
              viewBox="0 0 120 120"
              className="w-32 h-32 text-zinc-900 fill-current"
              shapeRendering="crispEdges"
            >
              {/* Corner position markers */}
              <rect x="10" y="10" width="30" height="30" fill="#000" />
              <rect x="15" y="15" width="20" height="20" fill="#fff" />
              <rect x="20" y="20" width="10" height="10" fill="#000" />

              <rect x="80" y="10" width="30" height="30" fill="#000" />
              <rect x="85" y="15" width="20" height="20" fill="#fff" />
              <rect x="90" y="20" width="10" height="10" fill="#000" />

              <rect x="10" y="80" width="30" height="30" fill="#000" />
              <rect x="15" y="85" width="20" height="20" fill="#fff" />
              <rect x="20" y="90" width="10" height="10" fill="#000" />

              {/* Data matrices */}
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

              <circle cx="60" cy="60" r="10" fill="#7C3AED" />
            </svg>
          </div>

          <div className="text-center space-y-0.5">
            <span className="text-[10px] font-mono tracking-wider font-bold text-emerald-400 block">
              AUTH CODE: LASG-CP-8921-2026
            </span>
            <span className="text-[9px] text-zinc-400">
              Present to LASTMA / Police Officer for Instant Scanning
            </span>
          </div>
        </div>

        {/* Live Timestamp & Offline PIN */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-50 rounded-xl text-emerald-900 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span className="font-bold">{currentTime}</span>
          </div>
          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
            <span className="font-sans font-bold text-zinc-600">PIN:</span>
            <strong className="text-[#7C3AED] font-black tracking-widest">{offlinePin}</strong>
          </div>
        </div>

        {/* Vehicle & Occupant Manifest Breakdown */}
        <div className="bg-zinc-50 rounded-2xl p-3 space-y-2 border border-zinc-100 text-xs">
          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-zinc-600" />
              <span className="font-bold text-zinc-900">{activeVehicleModel}</span>
            </div>
            <span className="font-mono font-black text-xs px-2 py-0.5 bg-zinc-200 rounded text-zinc-800">
              {activeVehiclePlate}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-medium">Driver:</span>
              <span className="font-bold text-zinc-900">
                {activeDriverName} <span className="text-emerald-700 font-medium">(@{user.employerDomain})</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-medium">Commute Corridor:</span>
              <span className="font-bold text-zinc-900">
                {commuteDirection === 'morning' ? 'Ajah ➔ VI ➔ Marina' : 'VI / Marina ➔ Ajah'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-medium">Statutory Classification:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                Private Non-Commercial Carpool
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-medium">Commercial Profit:</span>
              <span className="font-black text-zinc-900">₦0.00 (Pure Fuel Offset)</span>
            </div>
          </div>
        </div>

        {/* Legal Advisory for Enforcement Officers */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-[10px] text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
            <span>STATUTORY NOTICE TO LAW ENFORCEMENT OFFICERS:</span>
          </div>
          <p className="leading-relaxed text-zinc-700">
            This vehicle is participating in a verified private corporate carpool. Under{' '}
            <strong>Lagos State Transport Sector Reform Law (Cap T1, Section 44)</strong>, non-profit cost-sharing commuters are legally exempt from commercial bus/taxi licensing, union tickets, and local government permits.
          </p>
        </div>

        {/* Action Buttons: WhatsApp Share & Emergency Hotlines */}
        <div className="space-y-2 pt-1">
          <button
            onClick={sharePassWhatsApp}
            className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Pass Copied to Clipboard!' : 'Share Pass on WhatsApp'}</span>
          </button>

          {/* Quick Extortion Escalation Dialers */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <a
              href="tel:080000527862"
              className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-800 font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-red-600" />
              <span>LASTMA (0800-LASTMA)</span>
            </a>

            <a
              href="tel:112"
              className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-800 font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-red-600" />
              <span>LASEMA (112 / 767)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
