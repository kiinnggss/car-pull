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
    chat: { label: '💬 Chat & Network', bg: 'bg-emerald-50 text-emerald-800 shadow-2xs' },
    easy: { label: '☕ Easy Flow', bg: 'bg-amber-50 text-amber-800 shadow-2xs' },
    quiet: { label: '🎧 Quiet & Unwind', bg: 'bg-stone-100 text-stone-700 shadow-2xs' },
  };

  return (
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Car className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Your Booked Rides
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Live street pickups &amp; escrow secured
          </p>
        </div>
        <span className="text-xs font-bold text-teal-950 dark:text-teal-300 bg-teal-100/90 dark:bg-teal-500/15 px-3 py-1 rounded-full shadow-2xs flex-shrink-0 font-mono tabular-nums">
          {activeMatches.length} Active {activeMatches.length === 1 ? 'Ride' : 'Rides'}
        </span>
      </div>

      {/* Flake Penalty Test Action Bar - Frosted Glass Surface */}
      <div className="bg-white/80 dark:bg-[#121820]/80 backdrop-blur-2xl rounded-2xl p-3 space-y-2 shadow-md border border-white/80 dark:border-white/10">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            Lagos Anti-Flake Penalty Engine
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[9px]">Sec 44 Policy</span>
        </div>
        <div className="flex items-center p-1 bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-xl gap-1 border border-white/50 dark:border-white/10 shadow-inner">
          <button
            onClick={() => {
              triggerHaptic('error');
              simulateFlakePenalty('rider_flake');
            }}
            className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-slate-900 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 text-center active-spring transition-all"
          >
            Rider Late Cancel (-₦1k)
          </button>
          <div className="w-px h-4 bg-slate-300/60 dark:bg-white/10" />
          <button
            onClick={() => {
              triggerHaptic('switch');
              simulateFlakePenalty('driver_flake');
            }}
            className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-teal-950 dark:text-teal-300 hover:bg-white/80 dark:hover:bg-white/10 text-center active-spring transition-all"
          >
            Driver Flake (+₦2.5k)
          </button>
        </div>
      </div>

      {/* List of active matches */}
      <div className="space-y-3">
        {activeMatches.map((match) => {
          const isBoarded = boardedMatchIds.includes(match.id);
          const isCompleted = match.status === 'completed';
          const moodInfo = match.ride_mood ? moodLabels[match.ride_mood] : null;

          return (
            <div
              key={match.id}
              className="bg-white/80 dark:bg-[#121820]/80 backdrop-blur-2xl rounded-3xl p-4 space-y-3 shadow-xl border border-white/80 dark:border-white/10"
            >
              {/* Top info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={match.driverAvatar}
                    alt={match.driverName}
                    className="w-10 h-10 rounded-xl object-cover shadow-xs"
                  />
                  <div>
                    <h4 className="text-xs font-black text-slate-950 dark:text-slate-50">{match.driverName}</h4>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      {match.scheduledFor}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black font-mono tabular-nums text-teal-950 dark:text-teal-300 block">
                    {formatNgn(match.fareNgn)}
                  </span>
                  <span className={`text-[9px] uppercase font-mono font-bold ${isCompleted ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {isCompleted ? 'Escrow Released' : 'Escrow Held'}
                  </span>
                </div>
              </div>

              {/* Mutual Spark & Mood Indicators */}
              {(match.mutual_spark || moodInfo) && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {match.mutual_spark && (
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-900 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/40 px-2 py-0.5 rounded-full shadow-2xs">
                      <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                      {match.mutual_spark}
                    </span>
                  )}
                  {moodInfo && (
                    <span className={`inline-flex items-center text-[9.5px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs ${moodInfo.bg}`}>
                      {moodInfo.label}
                    </span>
                  )}
                </div>
              )}

              {/* Trip Purpose */}
              {match.trip_purpose && (
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-slate-900 dark:text-slate-200 border border-white/50 dark:border-white/5 shadow-2xs">
                  <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-[11px] font-semibold truncate leading-tight">
                    {match.trip_purpose}
                  </span>
                </div>
              )}

              {/* Cabin Co-Riders Preview */}
              {match.cabin_passengers && match.cabin_passengers.length > 0 && (
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center justify-between text-[10px] border border-white/50 dark:border-white/5 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                    <span className="font-bold text-slate-600 dark:text-slate-400">Co-Rider:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">
                      {match.cabin_passengers.map((p) => `${p.name} (${p.role})`).join(', ')}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                    Seat Filled
                  </span>
                </div>
              )}

              {/* Vehicle & Plate */}
              <div className="flex items-center justify-between bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-xl px-3 py-1.5 text-xs border border-white/50 dark:border-white/5 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                    {match.vehicleMake || 'Toyota'} {match.vehicleModel || 'Camry'}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-black text-amber-900 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {match.plateNumber || 'APP-842-EY'}
                </span>
              </div>

              {/* Pickup Safe Zone */}
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-xl px-3 py-2 text-xs flex items-center justify-between border border-white/50 dark:border-white/5 shadow-2xs">
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-teal-800 dark:text-teal-400 flex-shrink-0" />
                  <span className="text-[11px] truncate text-slate-700 dark:text-slate-300">
                    Pickup: <strong className="text-slate-950 dark:text-white font-bold">{match.pickupSafeZone.name}</strong>
                  </span>
                </span>
              </div>

              {/* Grouped Action Rail 1: Chat, Map, LinkedIn, WhatsApp */}
              <div className="flex items-center p-1 bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-2xl gap-1 border border-white/60 dark:border-white/10 shadow-inner">
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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 hover:bg-white/80 dark:hover:bg-white/10 active-spring transition-all"
                  title="Chat with driver"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />
                  <span>Chat</span>
                </button>

                <div className="w-px h-5 bg-slate-300/60 dark:bg-white/10" />

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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 hover:bg-white/80 dark:hover:bg-white/10 active-spring transition-all"
                  title="View pickup location on map"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-800 dark:text-teal-400" />
                  <span>Map</span>
                </button>

                <div className="w-px h-5 bg-slate-300/60 dark:bg-white/10" />

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    const url = match.linkedin_handle
                      ? `https://linkedin.com/in/${match.linkedin_handle}`
                      : `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(match.driverName)}`;
                    window.open(url, '_blank');
                  }}
                  className="w-10 h-8 rounded-xl flex items-center justify-center hover:bg-white/80 dark:hover:bg-white/10 text-[#0A66C2] active-spring transition-all flex-shrink-0"
                  title="LinkedIn Profile"
                >
                  <span className="w-4 h-4 bg-[#0A66C2] text-white rounded-xs flex items-center justify-center text-[10px] font-black leading-none">
                    in
                  </span>
                </button>

                <div className="w-px h-5 bg-slate-300/60 dark:bg-white/10" />

                <button
                  onClick={() => handleShareWhatsApp(match)}
                  className="w-10 h-8 rounded-xl flex items-center justify-center hover:bg-white/80 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-400 active-spring transition-all flex-shrink-0"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grouped Action Rail 2: Boarding & Verification Cockpit */}
              {isCompleted ? (
                <div className="bg-emerald-50/90 dark:bg-emerald-950/40 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between text-xs border border-emerald-200/50 dark:border-emerald-900/40 shadow-2xs">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    Trip Completed • Escrow Released
                  </span>
                  <span className="font-mono font-bold text-emerald-950 dark:text-emerald-200 text-xs">
                    {formatNgn(match.fareNgn)} Paid
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        setActiveTab('pass');
                      }}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-white/70 dark:bg-white/10 backdrop-blur-md hover:bg-white/90 dark:hover:bg-white/15 rounded-2xl text-[11px] font-mono border border-white/60 dark:border-white/10 shadow-xs active-spring transition-all flex-shrink-0"
                      title="Open Sec 44 Commute Pass"
                    >
                      <QrCode className="w-3.5 h-3.5 text-teal-800 dark:text-teal-400" />
                      <span className="text-slate-600 dark:text-slate-400 text-[10px] font-sans font-medium">PIN:</span>
                      <strong className="text-slate-950 dark:text-white font-bold tracking-wider">{offlinePin}</strong>
                    </button>

                    <button
                      onClick={() => toggleBoarded(match.id)}
                      className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active-spring shadow-specular ${
                        isBoarded
                          ? 'bg-teal-100 dark:bg-teal-950/70 text-teal-950 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/40'
                          : 'btn-electric-mint'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isBoarded ? 'Boarded' : 'Confirm Boarding'}</span>
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
                          colors: ['#10B981', '#0F766E', '#F59E0B'],
                        });
                        completeCommuteTrip(match.id, 5);
                      }}
                      className="w-full py-2.5 btn-electric-mint text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 transition-all active-spring shadow-specular"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Arrived • Release Escrow ({formatNgn(match.fareNgn)})</span>
                    </button>
                  )}
                </div>
              )}
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
