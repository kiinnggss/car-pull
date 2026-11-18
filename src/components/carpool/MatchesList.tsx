'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
  MapPin,
  CheckCircle2,
  Phone,
  Lock,
  Repeat,
  AlertTriangle,
  Share2,
  QrCode,
  MessageCircle,
  Sparkles,
  Car,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IcebreakerChatModal } from './IcebreakerChatModal';
import { CommuteMatch } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';

export const MatchesList: React.FC = () => {
  const {
    activeMatches,
    completeCommuteTrip,
    weeklyLockedCommutes,
    lockWeeklyCommute,
    unlockWeeklyCommute,
    simulateFlakePenalty,
    setActiveTab,
    offlinePin,
    getOrCreateThreadForDriver,
    setActiveThreadId,
  } = useAppStore();

  const [activeChatMatch, setActiveChatMatch] = useState<CommuteMatch | null>(null);

  const handleConfirmBoarding = (matchId: string) => {
    triggerHaptic('success');
    completeCommuteTrip(matchId, 5);
    confetti({
      particleCount: 60,
      spread: 65,
      origin: { y: 0.7 },
      colors: ['#3B82F6', '#0B0C0E', '#DF8E52'],
    });
  };

  const shareRideViaWhatsApp = (
    driverName: string,
    plateNumber: string,
    safeZoneName: string,
    scheduledFor: string
  ) => {
    triggerHaptic('tap');
    const text = `*CAR PULL - LIVE RIDE MANIFEST*\n• Driver: ${driverName}\n• Plate: *${plateNumber}*\n• Pickup Hub: ${safeZoneName}\n• Departure: ${scheduledFor}\n• Boarding PIN: *${offlinePin}*\n• Protected under Lagos Sec 44 Non-Commercial Carpool`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  if (activeMatches.length === 0) {
    return (
      <div className="w-full max-w-[404px] mx-auto px-3 py-8">
        <div className="floating-surface rounded-[32px] p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] flex items-center justify-center mx-auto">
            <Car className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-display font-black text-[#0B0C0E] dark:text-white">
              No Active Rides Yet
            </h3>
            <p className="text-xs text-[#525866] dark:text-[#9BA1AE] max-w-xs mx-auto leading-relaxed">
              Swipe right on a verified peer in the Deck or book a street ride on the Map to lock in your seat.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setActiveTab('deck')}
              className="px-5 py-3 btn-electric-mint text-xs font-extrabold rounded-full active-press"
            >
              Open Swipe Deck
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className="px-5 py-3 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-xs font-extrabold text-[#0B0C0E] dark:text-white flex items-center gap-1.5 active-press"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Map</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[404px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in pt-1">
      {/* Header Row */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-display font-black text-[#0B0C0E] dark:text-white tracking-tight">
            Your Rides
          </h2>
          <p className="text-[11px] text-[#525866] dark:text-[#9BA1AE] font-medium">
            Live corridor telemetry &amp; zero-cash boarding
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] text-xs font-mono tabular-nums font-black">
          {activeMatches.length} ACTIVE
        </span>
      </div>

      {/* Rides Stack */}
      <div className="space-y-3.5">
        {activeMatches.map((match) => {
          const isWeeklyLocked = weeklyLockedCommutes.includes(match.driverId);
          const isCompleted = match.status === 'completed';
          const safeZoneLabel = match.pickupSafeZone?.name || 'TotalEnergies Safe Hub';
          const plateLabel = match.plateNumber || 'APP-842-EY';
          const vehicleLabel =
            match.vehicleMake && match.vehicleModel
              ? `${match.vehicleMake} ${match.vehicleModel}`
              : 'Verified Corridor Sedan';

          return (
            <div
              key={match.id}
              className="floating-surface rounded-[32px] p-3.5 space-y-3 overflow-hidden"
            >
              {/* 1. Charlie Waite "The re-designed Uber App" Frosted Dark Car Progress Widget */}
              <div className="bg-[#0B0C0E] dark:bg-[#1E2028] rounded-[24px] p-4 text-white space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-primary)] font-bold block">
                      {isCompleted ? 'TRIP COMPLETED' : 'EN ROUTE TO SAFE HUB'}
                    </span>
                    <h4 className="text-sm font-display font-black text-white mt-0.5">
                      {match.driverName} •{' '}
                      <span className="text-[#FF9F0A] font-mono text-xs">{plateLabel}</span>
                    </h4>
                    <span className="text-[11px] text-white/70 block">
                      {vehicleLabel} • {match.scheduledFor}
                    </span>
                  </div>

                  {/* Circular Driver Avatar with White Ring (Charlie Waite Uber Widget) */}
                  <div className="relative w-12 h-12 rounded-full ring-2 ring-white/90 bg-[#1E2028] flex items-center justify-center font-mono font-bold text-xs overflow-hidden flex-shrink-0 shadow-lg">
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
                </div>

                {/* Horizontal Route Progress Line with Top-Down Vehicle Silhouette */}
                <div className="pt-2 pb-1">
                  <div className="relative h-1.5 w-full rounded-full bg-white/20 flex items-center">
                    <div
                      className={`h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500 ${
                        isCompleted ? 'w-full' : 'w-[58%]'
                      }`}
                    />
                    <div
                      style={{ left: isCompleted ? '88%' : '54%' }}
                      className="absolute -translate-x-1/2 w-9 h-4.5 rounded-full bg-white text-[#0B0C0E] shadow-md flex items-center justify-center border border-[#0B0C0E]"
                    >
                      <Car className="w-3 h-3 fill-current" />
                    </div>
                    <span className="absolute right-0 w-2.5 h-2.5 rounded-full bg-[#FF9F0A] ring-2 ring-[#0B0C0E]" />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-white/75 mt-2">
                    <span className="truncate max-w-[180px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--accent-primary)] flex-shrink-0" />
                      {safeZoneLabel}
                    </span>
                    <span className="text-[var(--accent-primary)] font-bold">
                      {isCompleted ? 'ESCROW RELEASED' : `${formatNgn(match.fareNgn)} HELD`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Vibe & Purpose Tags */}
              {(match.trip_purpose || match.mutual_spark || match.conversation_vibe) && (
                <div className="flex items-center gap-1.5 flex-wrap px-1">
                  {match.mutual_spark && (
                    <span className="text-[10px] font-bold text-[#0B0C0E] bg-[var(--accent-primary)] px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {match.mutual_spark}
                    </span>
                  )}
                  {match.conversation_vibe && (
                    <span className="text-[10px] font-bold text-[#0B0C0E] dark:text-white bg-[#F4F5F7] dark:bg-[#1E2028] px-2.5 py-1 rounded-full">
                      {match.conversation_vibe}
                    </span>
                  )}
                  {match.cabin_passengers && match.cabin_passengers.length > 0 && (
                    <span className="text-[10px] font-mono font-bold text-[#525866] dark:text-[#9BA1AE] px-2 py-1">
                      +{match.cabin_passengers.length} Co-Rider
                    </span>
                  )}
                </div>
              )}

              {/* 3. 4-Button Circular / Pill Action Strip */}
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    const threadId = getOrCreateThreadForDriver({
                      id: match.driverId,
                      name: match.driverName,
                      avatar: match.driverAvatar,
                      plateNumber: plateLabel,
                      safeZoneName: safeZoneLabel,
                    });
                    setActiveThreadId(threadId);
                    setActiveTab('chats');
                  }}
                  className="py-2 px-2 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] text-[11px] font-extrabold flex items-center justify-center gap-1 active-press"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>

                <button
                  onClick={() =>
                    shareRideViaWhatsApp(
                      match.driverName,
                      plateLabel,
                      safeZoneLabel,
                      match.scheduledFor
                    )
                  }
                  className="py-2 px-2 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white text-[11px] font-bold flex items-center justify-center gap-1 active-press"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Share</span>
                </button>

                <a
                  href="tel:+2348030000000"
                  className="py-2 px-2 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white text-[11px] font-bold flex items-center justify-center gap-1 active-press"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>

                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    if (isWeeklyLocked) {
                      unlockWeeklyCommute(match.driverId);
                    } else {
                      lockWeeklyCommute(match.driverId);
                    }
                  }}
                  className={`py-2 px-2 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 active-press ${
                    isWeeklyLocked
                      ? 'bg-[#FF9F0A] text-[#0B0C0E] font-extrabold'
                      : 'bg-[#F4F5F7] dark:bg-[#1E2028] text-[#525866] dark:text-[#9BA1AE]'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{isWeeklyLocked ? 'M-F' : 'Lock'}</span>
                </button>
              </div>

              {/* 4. Uber Green Bottom Pill Bar: Boarding PIN + Confirm Boarding CTA */}
              {!isCompleted ? (
                <div className="bg-[#F4F5F7] dark:bg-[#1E2028] rounded-full p-1.5 pl-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveTab('pass')}
                    className="flex items-center gap-2 text-left active-press"
                    title="Open Section 44 Pass"
                  >
                    <QrCode className="w-4 h-4 text-[var(--text-primary)] dark:text-[var(--accent-primary)]" />
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#525866] dark:text-[#9BA1AE] font-bold block leading-none">
                        BOARDING PIN
                      </span>
                      <strong className="text-xs font-mono tabular-nums font-black text-[#0B0C0E] dark:text-white tracking-widest">
                        {offlinePin}
                      </strong>
                    </div>
                  </button>

                  <button
                    onClick={() => handleConfirmBoarding(match.id)}
                    className="py-2.5 px-5 btn-electric-mint text-xs font-extrabold rounded-full flex items-center gap-1.5 active-press"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confirm Boarding</span>
                  </button>
                </div>
              ) : (
                <div className="py-2.5 px-4 rounded-full bg-[var(--accent-primary)]/15 text-[var(--text-primary)] text-xs font-extrabold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Trip Verified &amp; Fuel Split Released</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Anti-Flake Escrow Sandbox Strip */}
      <div className="floating-surface rounded-[28px] p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#FF9F0A] font-extrabold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Anti-Flake Escrow Sandbox</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-[#525866] dark:text-[#9BA1AE]">
            SEC 44 POLICY
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => simulateFlakePenalty('rider_flake')}
            className="py-2.5 px-3 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white font-bold text-[11px] active-press"
          >
            Rider Cancel (-₦1k)
          </button>
          <button
            onClick={() => simulateFlakePenalty('driver_flake')}
            className="py-2.5 px-3 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] font-extrabold text-[11px] active-press"
          >
            Driver Flake (+₦2.5k)
          </button>
        </div>
      </div>

      {activeChatMatch && (
        <IcebreakerChatModal
          isOpen={!!activeChatMatch}
          onClose={() => setActiveChatMatch(null)}
          personName={activeChatMatch.driverName}
          personAvatar={activeChatMatch.driverAvatar}
          tripPurpose={activeChatMatch.trip_purpose}
          conversationVibe={activeChatMatch.conversation_vibe}
          vehiclePlate={activeChatMatch.plateNumber}
        />
      )}
    </div>
  );
};
