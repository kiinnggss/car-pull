'use client';

import React, { useState } from 'react';
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
  Car,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

  const [boardedMatchIds, setBoardedMatchIds] = useState<string[]>([]);

  const toggleBoarded = (id: string) => {
    if (boardedMatchIds.includes(id)) {
      setBoardedMatchIds(boardedMatchIds.filter((m) => m !== id));
    } else {
      setBoardedMatchIds([...boardedMatchIds, id]);
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#0D6E6E', '#C25E2E', '#10B981'],
      });
    }
  };

  const handleShareWhatsApp = (match: any) => {
    const text = `*CAR PULL COMMUTE CONFIRMATION*
Scheduled: ${match.scheduledFor}
Status: Verified Non-Commercial (Lagos Law Sec 44)

• Driver: ${match.driverName} (NIN/BVN Checked)
• Pickup Safe Zone: ${match.pickupSafeZone.name}
• Offline Pickup PIN: ${offlinePin}
• Fair Share Fuel Split: ${formatNgn(match.fareNgn)} (Escrow Held)

Zero Cash • Monitored Corridor • CCTV Safe Zone`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in">
      {/* Back to Deck Quick Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('deck')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECE5D8] hover:bg-[#E3DCCE] text-[#0D6E6E] border border-[#DDD4C5] font-bold text-xs shadow-2xs active:scale-95 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E]" />
          <span>Back to Corridor Deck</span>
        </button>
        <span className="text-xs font-bold text-[#0D6E6E] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
          {activeMatches.length} Active {activeMatches.length === 1 ? 'Ride' : 'Rides'}
        </span>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-base font-serif font-black text-[#141210] flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#0D6E6E]" />
          Your Commute Matches
        </h2>
        <p className="text-[11px] text-[#70665A] font-medium">
          Double opt-in verified rides with locked escrow &amp; CCTV safe hubs
        </p>
      </div>

      {/* Flake Penalty Test Action Bar - Minimal & Clean */}
      <div className="bg-[#FAF6EE] border border-[#DDD4C5] rounded-2xl p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold text-[#C25E2E] flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-[#C25E2E]" />
            Lagos Anti-Flake Penalty Engine
          </span>
          <span className="text-[#70665A] font-mono text-[9px]">Sec 44 Policy</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => simulateFlakePenalty('rider_flake')}
            className="py-1.5 px-2 bg-white hover:bg-amber-50 rounded-xl text-[10px] font-bold text-[#141210] border border-[#DDD4C5] text-center active:scale-95 transition-colors shadow-2xs"
          >
            Rider Late Cancel (-₦1k)
          </button>
          <button
            onClick={() => simulateFlakePenalty('driver_flake')}
            className="py-1.5 px-2 bg-white hover:bg-teal-50 rounded-xl text-[10px] font-bold text-[#0D6E6E] border border-[#DDD4C5] text-center active:scale-95 transition-colors shadow-2xs"
          >
            Driver Flake (+₦2.5k Voucher)
          </button>
        </div>
      </div>

      {/* List of active matches */}
      <div className="space-y-2.5">
        {activeMatches.map((match) => {
          const isWeeklyLocked = weeklyLockedCommutes.includes(match.driverId);
          const isBoarded = boardedMatchIds.includes(match.id);

          return (
            <div
              key={match.id}
              className="bg-white rounded-3xl p-3.5 space-y-2.5 shadow-xs border border-[#DDD4C5]"
            >
              {/* Top info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={match.driverAvatar}
                    alt={match.driverName}
                    className="w-10 h-10 rounded-xl object-cover border border-[#DDD4C5]"
                  />
                  <div>
                    <h4 className="text-xs font-serif font-black text-[#141210]">{match.driverName}</h4>
                    <span className="text-[10px] text-[#70665A] font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#0D6E6E]" />
                      {match.scheduledFor}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-[#0D6E6E] block">
                    {formatNgn(match.fareNgn)}
                  </span>
                  <span className="text-[9px] text-[#70665A] uppercase font-mono">Escrow Held</span>
                </div>
              </div>

              {/* Vehicle Brand and Plate Number */}
              <div className="flex items-center justify-between bg-[#F8F5EE] border border-[#DDD4C5] rounded-xl px-2.5 py-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#0D6E6E]" />
                  <span className="font-bold text-[#141210] text-[11px]">
                    {match.vehicleMake || 'Toyota'} {match.vehicleModel || 'Camry'}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-black text-[#C25E2E] bg-[#FFF9EE] px-2 py-0.2 rounded border border-[#C25E2E]/30">
                  {match.plateNumber || 'APP-842-EY'}
                </span>
              </div>

              {/* Pickup Safe Zone */}
              <div className="flex items-center justify-between text-xs py-0.5 px-1 text-[#70665A]">
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#C25E2E] flex-shrink-0" />
                  <span className="text-[11px]">Pickup: <strong className="text-[#141210]">{match.pickupSafeZone.name}</strong></span>
                </span>
                <span className="text-[9px] font-black text-[#0D6E6E] bg-teal-50 px-2 py-0.2 rounded-full border border-teal-200 flex-shrink-0 ml-1">
                  CCTV Guarded
                </span>
              </div>

              {/* Weekly Commute Lock Action Strip */}
              <div className="bg-[#FAF6EE] border border-[#DDD4C5] rounded-xl p-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0D6E6E]" />
                  <span className="font-bold text-[#141210] text-[11px]">
                    Mon–Fri Routine
                  </span>
                </div>
                <button
                  onClick={() =>
                    isWeeklyLocked
                      ? unlockWeeklyCommute(match.driverId)
                      : lockWeeklyCommute(match.driverId)
                  }
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-2xs ${
                    isWeeklyLocked
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-[#141210] border border-[#DDD4C5] hover:bg-stone-100'
                  }`}
                >
                  {isWeeklyLocked ? (
                    <>
                      <Lock className="w-3 h-3" /> Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-[#70665A]" /> Lock Routine
                    </>
                  )}
                </button>
              </div>

              {/* In-Transit Status & Boarding Check-In */}
              <div>
                <button
                  onClick={() => toggleBoarded(match.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] shadow-2xs ${
                    isBoarded
                      ? 'bg-[#EEF7F7] text-[#0D6E6E] border border-[#0D6E6E]/40 font-black'
                      : 'bg-[#0D6E6E] hover:bg-[#094E4E] text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isBoarded
                      ? 'Boarded • Commute in Progress'
                      : 'Confirm Boarding at Safe Hub'}
                  </span>
                </button>
              </div>

              {/* Offline PIN & Pass Links */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#F8F5EE] border border-[#DDD4C5] rounded-xl text-[10px]">
                <div className="flex items-center gap-1.5 text-[#70665A] font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-[#C25E2E]" />
                  <span>Offline PIN:</span>
                  <strong className="text-[#141210] font-mono tracking-widest">{offlinePin}</strong>
                </div>
                <button
                  onClick={() => setActiveTab('pass')}
                  className="text-[#0D6E6E] font-bold flex items-center gap-1 hover:underline"
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
