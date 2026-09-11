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
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Compass,
  Sparkles,
  Users,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IcebreakerChatModal } from './IcebreakerChatModal';
import { triggerHaptic } from '@/lib/haptics';

export const MatchesList: React.FC = () => {
  const {
    activeMatches,
    weeklyLockedCommutes,
    lockWeeklyCommute,
    unlockWeeklyCommute,
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
        colors: ['#0D6E6E', '#C25E2E', '#10B981'],
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
    chat: { label: '💬 Chat & Network', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    easy: { label: '☕ Easy Flow', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    quiet: { label: '🎧 Quiet & Unwind', bg: 'bg-stone-100 text-stone-700 border-stone-200' },
  };

  return (
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-base font-serif font-black text-[#141210] dark:text-[#EDE8E1] flex items-center gap-1.5">
            <Car className="w-4 h-4 text-[#0D6E6E] dark:text-[#14B8A6]" />
            Your Booked Rides
          </h2>
          <p className="text-[11px] text-[#70665A] dark:text-stone-400 font-medium">
            Live street pickups &amp; escrow secured
          </p>
        </div>
        <span className="text-xs font-bold text-[#0D6E6E] dark:text-[#14B8A6] bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800 shadow-2xs flex-shrink-0">
          {activeMatches.length} Active {activeMatches.length === 1 ? 'Ride' : 'Rides'}
        </span>
      </div>

      {/* Flake Penalty Test Action Bar - Minimal & Clean */}
      <div className="bg-[#FAF6EE] dark:bg-[#1E1B18] border border-[#DDD4C5] dark:border-stone-800 rounded-2xl p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold text-[#C25E2E] dark:text-amber-400 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-[#C25E2E] dark:text-amber-400" />
            Lagos Anti-Flake Penalty Engine
          </span>
          <span className="text-[#70665A] dark:text-stone-400 font-mono text-[9px]">Sec 44 Policy</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              triggerHaptic('error');
              simulateFlakePenalty('rider_flake');
            }}
            className="py-1.5 px-2 bg-white dark:bg-[#141210] hover:bg-amber-50 dark:hover:bg-stone-800 rounded-xl text-[10px] font-bold text-[#141210] dark:text-stone-200 border border-[#DDD4C5] dark:border-stone-700 text-center active-press transition-colors shadow-2xs"
          >
            Rider Late Cancel (-₦1k)
          </button>
          <button
            onClick={() => {
              triggerHaptic('switch');
              simulateFlakePenalty('driver_flake');
            }}
            className="py-1.5 px-2 bg-white dark:bg-[#141210] hover:bg-teal-50 dark:hover:bg-stone-800 rounded-xl text-[10px] font-bold text-[#0D6E6E] dark:text-[#14B8A6] border border-[#DDD4C5] dark:border-stone-700 text-center active-press transition-colors shadow-2xs"
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
          const isCompleted = match.status === 'completed';
          const moodInfo = match.ride_mood ? moodLabels[match.ride_mood] : null;

          return (
            <div
              key={match.id}
              className="bg-white dark:bg-[#1A1816] rounded-3xl p-3.5 space-y-2.5 shadow-xs border border-[#DDD4C5] dark:border-stone-800"
            >
              {/* Top info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={match.driverAvatar}
                    alt={match.driverName}
                    className="w-10 h-10 rounded-xl object-cover border border-[#DDD4C5] dark:border-stone-700"
                  />
                  <div>
                    <h4 className="text-xs font-serif font-black text-[#141210] dark:text-[#EDE8E1]">{match.driverName}</h4>
                    <span className="text-[10px] text-[#70665A] dark:text-stone-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#0D6E6E] dark:text-[#14B8A6]" />
                      {match.scheduledFor}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-[#0D6E6E] dark:text-[#14B8A6] block">
                    {formatNgn(match.fareNgn)}
                  </span>
                  <span className={`text-[9px] uppercase font-mono ${isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[#70665A] dark:text-stone-400'}`}>
                    {isCompleted ? 'Escrow Released' : 'Escrow Held'}
                  </span>
                </div>
              </div>

              {/* Mutual Spark & Mood Indicators */}
              {(match.mutual_spark || moodInfo) && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {match.mutual_spark && (
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-[#C25E2E] dark:text-amber-400 bg-orange-50/90 dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-200/70 dark:border-orange-800/50">
                      <Sparkles className="w-2.5 h-2.5 text-[#C25E2E] dark:text-amber-400" />
                      {match.mutual_spark}
                    </span>
                  )}
                  {moodInfo && (
                    <span className={`inline-flex items-center text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${moodInfo.bg}`}>
                      {moodInfo.label}
                    </span>
                  )}
                </div>
              )}

              {/* Trip Purpose / Human Context */}
              {match.trip_purpose && (
                <div className="bg-[#FAF7F0] dark:bg-[#1E1B18] border border-[#DDD4C5] dark:border-stone-800 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-xs text-[#141210] dark:text-stone-200">
                  <Compass className="w-3.5 h-3.5 text-[#C25E2E] dark:text-amber-400 flex-shrink-0" />
                  <span className="text-[10.5px] font-semibold truncate leading-tight">
                    {match.trip_purpose}
                  </span>
                </div>
              )}

              {/* Cabin Co-Riders Preview */}
              {match.cabin_passengers && match.cabin_passengers.length > 0 && (
                <div className="bg-[#F8F5EE] dark:bg-[#1E1B18] border border-[#DDD4C5]/80 dark:border-stone-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-[#0D6E6E] dark:text-[#14B8A6]" />
                    <span className="font-bold text-[#70665A] dark:text-stone-400">Cabin Co-Rider:</span>
                    <span className="text-[#141210] dark:text-stone-200 font-semibold">
                      {match.cabin_passengers.map((p) => `${p.name} (${p.role})`).join(', ')}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                    Seat Filled
                  </span>
                </div>
              )}

              {/* Vehicle Brand and Plate Number */}
              <div className="flex items-center justify-between bg-[#F8F5EE] dark:bg-[#1E1B18] border border-[#DDD4C5] dark:border-stone-800 rounded-xl px-2.5 py-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#0D6E6E] dark:text-[#14B8A6]" />
                  <span className="font-bold text-[#141210] dark:text-stone-200 text-[11px]">
                    {match.vehicleMake || 'Toyota'} {match.vehicleModel || 'Camry'}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-black text-[#C25E2E] dark:text-amber-400 bg-[#FFF9EE] dark:bg-amber-950/40 px-2 py-0.2 rounded border border-[#C25E2E]/30 dark:border-amber-700/50">
                  {match.plateNumber || 'APP-842-EY'}
                </span>
              </div>

              {/* Pickup Safe Zone with 1-Tap Map Navigation */}
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
                className="w-full flex items-center justify-between text-xs py-1.5 px-2 bg-[#F8F5EE] dark:bg-[#1E1B18] hover:bg-stone-100 dark:hover:bg-stone-800 border border-[#DDD4C5] dark:border-stone-800 rounded-xl text-left transition-colors active-press group"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-[11px] truncate">
                    Pickup: <strong className="text-[#141210] dark:text-[#EDE8E1]">{match.pickupSafeZone.name}</strong>
                  </span>
                </span>
                <span className="text-[9px] font-bold text-[#0D6E6E] dark:text-[#14B8A6] flex items-center gap-0.5 group-hover:underline flex-shrink-0 ml-1">
                  View on Map &rarr;
                </span>
              </button>

              {/* Dynamic Chat & LinkedIn Actions */}
              <div className="grid grid-cols-3 gap-1.5">
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
                  className="col-span-2 py-2 bg-[#EEF7F7] dark:bg-teal-950/50 hover:bg-teal-100/70 dark:hover:bg-teal-900/60 text-[#0D6E6E] dark:text-[#14B8A6] border border-[#0D6E6E]/30 dark:border-teal-700/50 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active-press transition-all shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#C25E2E] dark:text-amber-400" />
                  <span>Chat &amp; Pings</span>
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
                  className="py-2 bg-[#0A66C2]/10 dark:bg-sky-950/40 hover:bg-[#0A66C2]/20 dark:hover:bg-sky-900/50 text-[#0A66C2] dark:text-sky-300 border border-[#0A66C2]/30 dark:border-sky-800/50 text-xs font-bold rounded-xl flex items-center justify-center gap-1 active-press transition-all shadow-2xs"
                  title="Connect on LinkedIn"
                >
                  <span className="w-3.5 h-3.5 bg-[#0A66C2] text-white rounded-xs flex items-center justify-center text-[9px] font-black leading-none">
                    in
                  </span>
                  <span>Connect</span>
                </button>
              </div>

              {/* Everyday Carpool Schedule Info */}
              <div className="bg-[#FAF6EE] dark:bg-[#1E1B18] border border-[#DDD4C5] dark:border-stone-800 rounded-xl p-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0D6E6E] dark:text-[#14B8A6]" />
                  <span className="font-bold text-[#141210] dark:text-stone-200 text-[11px]">
                    Ride Schedule
                  </span>
                </div>
                <span className="text-[10px] font-bold font-mono text-[#0D6E6E] dark:text-[#14B8A6] bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                  {match.scheduledFor}
                </span>
              </div>

              {/* In-Transit Status & Trip Completion with Escrow Release */}
              {isCompleted ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Trip Completed • Escrow Released
                  </span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                    {formatNgn(match.fareNgn)} Paid
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <button
                    onClick={() => toggleBoarded(match.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active-press shadow-2xs ${
                      isBoarded
                        ? 'bg-[#EEF7F7] dark:bg-teal-950/60 text-[#0D6E6E] dark:text-[#14B8A6] border border-[#0D6E6E]/40 dark:border-teal-700/60 font-black'
                        : 'bg-[#0D6E6E] dark:bg-[#14B8A6] hover:bg-[#094E4E] text-white dark:text-[#121110]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {isBoarded
                        ? 'Boarded • Commute in Progress'
                        : 'Confirm Boarding at Safe Hub'}
                    </span>
                  </button>

                  {isBoarded && (
                    <button
                      onClick={() => {
                        triggerHaptic('match');
                        confetti({
                          particleCount: 45,
                          spread: 55,
                          origin: { y: 0.6 },
                          colors: ['#10B981', '#0D6E6E', '#F59E0B'],
                        });
                        completeCommuteTrip(match.id, 5);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all active-press shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Arrived at Destination • Release Escrow ({formatNgn(match.fareNgn)})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Offline PIN & Pass Links */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#F8F5EE] dark:bg-[#1E1B18] border border-[#DDD4C5] dark:border-stone-800 rounded-xl text-[10px]">
                <div className="flex items-center gap-1.5 text-[#70665A] dark:text-stone-400 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-[#C25E2E] dark:text-amber-400" />
                  <span>Offline PIN:</span>
                  <strong className="text-[#141210] dark:text-[#EDE8E1] font-mono tracking-widest">{offlinePin}</strong>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setActiveTab('pass');
                  }}
                  className="text-[#0D6E6E] dark:text-[#14B8A6] font-bold flex items-center gap-1 hover:underline"
                >
                  <QrCode className="w-3 h-3" />
                  <span>Sec 44 Pass</span>
                </button>
              </div>

              {/* Share ride details via WhatsApp */}
              <button
                onClick={() => handleShareWhatsApp(match)}
                className="w-full py-2 bg-[#25D366]/10 dark:bg-emerald-950/40 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors active-press"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Manifest on WhatsApp</span>
              </button>
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
