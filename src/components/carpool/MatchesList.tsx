'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  AlertOctagon,
  Lock,
  Unlock,
  KeyRound,
  QrCode,
} from 'lucide-react';

export const MatchesList: React.FC = () => {
  const {
    activeMatches,
    weeklyLockedCommutes,
    lockWeeklyCommute,
    unlockWeeklyCommute,
    simulateFlakePenalty,
    offlinePin,
    setActiveTab,
  } = useAppStore();

  const handleShareWhatsApp = (match: any) => {
    const text = `🚗 *CAR PULL COMMUTE CONFIRMATION*
📅 Scheduled: ${match.scheduledFor}
🛡️ *Status:* Verified Non-Commercial (Lagos Law Sec 44)

👤 *Driver:* ${match.driverName} (NIN/BVN Checked)
📍 *Pickup Safe Zone:* ${match.pickupSafeZone.name}
🔑 *Offline Pickup PIN:* ${offlinePin}
💰 *Fair Share Fuel Split:* ${formatNgn(match.fareNgn)} (Escrow Held)

*Zero Cash • Monitored Corridor • CCTV Safe Zone*`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-zinc-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#7C3AED]" />
            Your Commute Matches
          </h2>
          <p className="text-[11px] text-zinc-400">
            Double opt-in verified rides with locked escrow
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
          {activeMatches.length} Active
        </span>
      </div>

      {/* Flake Penalty Test Action Bar - Minimal */}
      <div className="bg-amber-50/80 rounded-2xl p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold text-amber-900 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-amber-600" />
            Lagos Anti-Flake Penalty Engine
          </span>
          <span className="text-zinc-400 font-mono">Test Rules</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => simulateFlakePenalty('rider_flake')}
            className="py-1 px-2 bg-white hover:bg-amber-100/60 rounded-xl text-[10px] font-bold text-amber-900 text-center active:scale-95 transition-colors shadow-2xs"
          >
            Rider Late Cancel (-₦1k)
          </button>
          <button
            onClick={() => simulateFlakePenalty('driver_flake')}
            className="py-1 px-2 bg-white hover:bg-emerald-100/60 rounded-xl text-[10px] font-bold text-emerald-900 text-center active:scale-95 transition-colors shadow-2xs"
          >
            Driver Flake (+₦2.5k Voucher)
          </button>
        </div>
      </div>

      {/* List of active matches */}
      <div className="space-y-2.5">
        {activeMatches.map((match) => {
          const isWeeklyLocked = weeklyLockedCommutes.includes(match.driverId);

          return (
            <div
              key={match.id}
              className="bg-white rounded-3xl p-4 space-y-2.5 shadow-xs border border-zinc-100"
            >
              {/* Top info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={match.driverAvatar}
                    alt={match.driverName}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-black text-zinc-900">{match.driverName}</h4>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#7C3AED]" />
                      {match.scheduledFor}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 block">
                    {formatNgn(match.fareNgn)}
                  </span>
                  <span className="text-[9px] text-zinc-400 uppercase font-mono">Escrow Held</span>
                </div>
              </div>

              {/* Pickup Safe Zone - Inline Flow */}
              <div className="flex items-center justify-between text-xs py-1 px-1 text-zinc-600">
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
                  <span>Pickup: <strong className="text-zinc-900">{match.pickupSafeZone.name}</strong></span>
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0 ml-1">
                  Guarded
                </span>
              </div>

              {/* Weekly Commute Lock Action Strip */}
              <div className="bg-purple-50/70 rounded-xl p-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span className="font-semibold text-zinc-800 text-[11px]">
                    Mon–Fri Routine
                  </span>
                </div>
                <button
                  onClick={() =>
                    isWeeklyLocked
                      ? unlockWeeklyCommute(match.driverId)
                      : lockWeeklyCommute(match.driverId)
                  }
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    isWeeklyLocked
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-zinc-700 hover:bg-[#7C3AED] hover:text-white shadow-2xs'
                  }`}
                >
                  {isWeeklyLocked ? (
                    <>
                      <Lock className="w-3 h-3" /> Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" /> Lock Routine
                    </>
                  )}
                </button>
              </div>

              {/* Offline PIN & Security Badges */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-50 rounded-xl text-[10px]">
                <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Offline Pickup PIN:</span>
                  <strong className="text-zinc-900 font-mono tracking-widest">{offlinePin}</strong>
                </div>
                <button
                  onClick={() => setActiveTab('pass')}
                  className="text-[#7C3AED] font-bold flex items-center gap-1 hover:underline"
                >
                  <QrCode className="w-3 h-3" />
                  <span>Sec 44 Pass</span>
                </button>
              </div>

              {/* Share ride details via WhatsApp */}
              <button
                onClick={() => handleShareWhatsApp(match)}
                className="w-full py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Manifest on WhatsApp</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
