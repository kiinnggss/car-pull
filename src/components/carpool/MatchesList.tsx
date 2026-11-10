'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
  Clock,
  MapPin,
  Share2,
  AlertOctagon,
  QrCode,
  Car,
  CheckCircle2,
  MessageCircle,
  Compass,
  Sparkles,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IcebreakerChatModal } from './IcebreakerChatModal';
import { triggerHaptic } from '@/lib/haptics';

export const MatchesList: React.FC = () => {
  const {
    activeMatches,
    simulateFlakePenalty,
    offlinePin,
    setActiveTab,
    setActiveThreadId,
    chatThreads,
    getOrCreateThreadForDriver,
    completeCommuteTrip,
    setUserStreetByNameOrCoords,
  } = useAppStore();

  const [boardedMatchIds, setBoardedMatchIds] = useState<string[]>([]);
  const [selectedChatMatch, setSelectedChatMatch] = useState<any | null>(null);

  const toggleBoarded = (id: string) => {
    if (boardedMatchIds.includes(id)) {
      triggerHaptic('tap');
      setBoardedMatchIds(boardedMatchIds.filter((m) => m !== id));
    } else {
      triggerHaptic('match');
      setBoardedMatchIds([...boardedMatchIds, id]);
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#0F766E', '#D97706', '#10B981'],
      });
    }
  };

  const handleShareWhatsApp = (match: any) => {
    triggerHaptic('success');
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

  const moodLabels = {
    chat: { label: 'Chat & Network', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' },
    easy: { label: 'Easy Flow', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
    quiet: { label: 'Quiet & Unwind', bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20' },
  };

  return (
    <div className="w-full max-w-[400px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pt-0.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
            <span className="p-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6]">
              <Car className="w-4 h-4" />
            </span>
            Booked Rides
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Active street pickups and escrow manifests
          </p>
        </div>
        <span className="text-xs font-extrabold text-[#0F766E] dark:text-[#14B8A6] bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full flex-shrink-0 font-mono tabular-nums">
          {activeMatches.length} {activeMatches.length === 1 ? 'Ride' : 'Rides'}
        </span>
      </div>

      {/* Anti-Flake Escrow Simulator Strip */}
      <div className="floating-surface rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            Anti-Flake Escrow Protection
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[9.5px]">SEC 44 POLICY</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              triggerHaptic('error');
              simulateFlakePenalty('rider_flake');
            }}
            className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-[#090D11] hover:bg-rose-500/10 border border-slate-200/80 dark:border-white/8 text-[11px] font-bold text-slate-800 dark:text-slate-200 active-spring transition-all"
          >
            Simulate Rider Cancel (-₦1k)
          </button>
          <button
            onClick={() => {
              triggerHaptic('switch');
              simulateFlakePenalty('driver_flake');
            }}
            className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-[#090D11] hover:bg-teal-500/10 border border-slate-200/80 dark:border-white/8 text-[11px] font-bold text-[#0F766E] dark:text-[#14B8A6] active-spring transition-all"
          >
            Simulate Driver Flake (+₦2.5k)
          </button>
        </div>
      </div>

      {/* Booked Ride Manifest Cards (Hairline Structured, Zero Nested Boxes) */}
      <div className="space-y-3">
        {activeMatches.map((match) => {
          const isBoarded = boardedMatchIds.includes(match.id);
          const isCompleted = match.status === 'completed';
          const moodInfo = match.ride_mood ? moodLabels[match.ride_mood] : null;

          return (
            <div
              key={match.id}
              className="floating-surface rounded-2xl divide-y divide-slate-200/70 dark:divide-white/8 overflow-hidden"
            >
              {/* Section 1: Driver Identity & Escrow Fare */}
              <div className="p-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-mono font-bold text-xs border border-slate-200 dark:border-white/10 flex-shrink-0 overflow-hidden">
                    <span>{match.driverName.split(' ').map((n) => n[0]).join('')}</span>
                    <img
                      src={match.driverAvatar}
                      alt={match.driverName}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {match.driverName}
                    </h4>
                    <span className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {match.scheduledFor}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-extrabold font-mono tabular-nums text-slate-900 dark:text-white block">
                    {formatNgn(match.fareNgn)}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-teal-500/10 text-[#0F766E] dark:text-[#14B8A6]'
                    }`}
                  >
                    {isCompleted ? 'Released' : 'Escrow Held'}
                  </span>
                </div>
              </div>

              {/* Section 2: Telemetry Specs (Pickup, Vehicle, Co-Riders) */}
              <div className="px-3.5 py-2.5 bg-slate-50/50 dark:bg-[#0C1117]/50 space-y-2 text-xs">
                {/* Pickup & Vehicle Line */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
                    <span className="truncate font-semibold text-slate-900 dark:text-white">
                      {match.pickupSafeZone.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {match.vehicleMake || 'Toyota'} {match.vehicleModel || 'Camry'}
                    </span>
                    <span className="plate-badge text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {match.plateNumber || 'APP-842-EY'}
                    </span>
                  </div>
                </div>

                {/* Co-Riders & Purpose */}
                {(match.trip_purpose || (match.cabin_passengers && match.cabin_passengers.length > 0)) && (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50 dark:border-white/5 text-[11px]">
                    {match.trip_purpose ? (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 truncate">
                        <Compass className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{match.trip_purpose}</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    {match.cabin_passengers && match.cabin_passengers.length > 0 && (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 flex-shrink-0 font-medium">
                        <Users className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6]" />
                        <span>+{match.cabin_passengers.length} Co-Rider</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Spark & Mood Pills */}
                {(match.mutual_spark || moodInfo) && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {match.mutual_spark && (
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        {match.mutual_spark}
                      </span>
                    )}
                    {moodInfo && (
                      <span className={`inline-flex items-center text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${moodInfo.bg}`}>
                        {moodInfo.label}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Section 3: Communication & Boarding Controls */}
              <div className="p-3 space-y-2">
                {/* 4-Action Communication Strip */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      const thread = chatThreads.find(
                        (t) => t.partnerId === match.driverId || t.partnerName.toLowerCase() === match.driverName.toLowerCase()
                      );
                      const targetThreadId = thread
                        ? thread.id
                        : getOrCreateThreadForDriver({
                            id: match.driverId,
                            name: match.driverName,
                            avatar: match.driverAvatar,
                            plateNumber: match.plateNumber,
                            safeZoneName: match.pickupSafeZone.name,
                          });
                      setActiveThreadId(targetThreadId);
                      setActiveTab('chats');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-[#18222D] hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 active-spring"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setUserStreetByNameOrCoords(
                        match.pickupSafeZone.name,
                        match.pickupSafeZone.coordinates || { lat: 6.4480, lng: 3.4720 },
                        match.pickupSafeZone.address || 'Pickup Point'
                      );
                      setActiveTab('map');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-[#18222D] hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 active-spring"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>Map</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      const url = match.linkedin_handle
                        ? `https://linkedin.com/in/${match.linkedin_handle}`
                        : `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(match.driverName)}`;
                      window.open(url, '_blank');
                    }}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-[#18222D] hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-[#0A66C2] dark:text-blue-400 flex items-center justify-center gap-1 active-spring"
                    title="LinkedIn Profile"
                  >
                    <span className="w-3.5 h-3.5 bg-[#0A66C2] text-white rounded-xs flex items-center justify-center text-[9px] font-black leading-none">
                      in
                    </span>
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(match)}
                    className="py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-[#18222D] hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1 active-spring"
                    title="Share on WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Boarding Verification & Escrow Release */}
                {isCompleted ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Trip Completed • Escrow Released
                    </span>
                    <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">
                      {formatNgn(match.fareNgn)}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          triggerHaptic('tap');
                          setActiveTab('pass');
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-[#090D11] border border-slate-200/80 dark:border-white/8 rounded-xl text-[11px] font-mono active-spring flex-shrink-0"
                        title="Open Section 44 Commute Pass"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] font-sans font-semibold">PIN</span>
                        <strong className="text-slate-900 dark:text-white font-extrabold tracking-wider">{offlinePin}</strong>
                      </button>

                      <button
                        onClick={() => toggleBoarded(match.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active-spring ${
                          isBoarded
                            ? 'bg-teal-500/15 text-[#0F766E] dark:text-[#14B8A6] border border-teal-500/30'
                            : 'btn-electric-mint'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isBoarded ? 'Boarded in Vehicle' : 'Confirm Boarding'}</span>
                      </button>
                    </div>

                    {isBoarded && (
                      <button
                        onClick={() => {
                          triggerHaptic('match');
                          confetti({
                            particleCount: 45,
                            spread: 55,
                            origin: { y: 0.6 },
                            colors: ['#10B981', '#0F766E', '#D97706'],
                          });
                          completeCommuteTrip(match.id, 5);
                        }}
                        className="w-full py-2.5 btn-electric-mint text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 active-spring"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Arrived • Release Escrow ({formatNgn(match.fareNgn)})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Icebreaker Chat Modal */}
      {selectedChatMatch && (
        <IcebreakerChatModal
          isOpen={!!selectedChatMatch}
          onClose={() => setSelectedChatMatch(null)}
          personName={selectedChatMatch.driverName}
          personAvatar={selectedChatMatch.driverAvatar}
          tripPurpose={selectedChatMatch.trip_purpose}
          conversationVibe={selectedChatMatch.conversation_vibe}
          interests={selectedChatMatch.interests}
          vehiclePlate={selectedChatMatch.plateNumber}
          linkedinHandle={selectedChatMatch.linkedin_handle}
        />
      )}
    </div>
  );
};
