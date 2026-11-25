'use client';

import React, { useEffect, useState } from 'react';
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
import { IcebreakerChatModal } from './IcebreakerChatModal';
import { CommuteMatch } from '@/lib/types';
import { triggerHaptic } from '@/lib/haptics';
import {
  estimateEtaMinutes,
  formatEtaLabel,
  openWhatsAppTripShare,
} from '@/lib/liveTracking';

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
    showFeedbackBanner,
  } = useAppStore();

  const [activeChatMatch, setActiveChatMatch] = useState<CommuteMatch | null>(null);
  const [liveProgressByMatch, setLiveProgressByMatch] = useState<Record<string, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveProgressByMatch((prev) => {
        const next = { ...prev };
        let changed = false;
        activeMatches.forEach((m, idx) => {
          if (m.status === 'completed') {
            if (next[m.id] !== 1) {
              next[m.id] = 1;
              changed = true;
            }
            return;
          }
          const fallback = 0.36 + ((idx * 0.14) % 0.32);
          const current = typeof next[m.id] === 'number' ? next[m.id] : fallback;
          const stepped = current >= 0.96 ? 0.36 : Math.min(0.96, current + 0.03);
          next[m.id] = stepped;
          changed = true;
        });
        return changed ? next : prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeMatches]);

  const handleConfirmBoarding = (matchId: string) => {
    triggerHaptic('success');
    completeCommuteTrip(matchId, 5);
    showFeedbackBanner(
      'Boarding Verified',
      'Escrow released to driver · 5★ rating logged',
      'SETTLED'
    );
  };

  const shareRideViaWhatsApp = (
    driverName: string,
    plateNumber: string,
    safeZoneName: string,
    scheduledFor: string,
    vehicleModel: string,
    etaLabel?: string
  ) => {
    triggerHaptic('tap');
    const result = openWhatsAppTripShare({
      driverName,
      plateNumber,
      vehicleModel,
      pickupHub: safeZoneName,
      scheduledFor,
      etaLabel,
      boardingPin: offlinePin,
    });
    showFeedbackBanner(
      'Live Trip Shared',
      result.copied
        ? `Manifest copied & opened in WhatsApp · ${plateNumber}`
        : `Opened live manifest in WhatsApp · ${plateNumber}`,
      'WHATSAPP'
    );
  };

  if (activeMatches.length === 0) {
    return (
      <div className="w-full max-w-[404px] mx-auto px-3 py-8">
        <div className="floating-surface rounded-[32px] p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] flex items-center justify-center mx-auto">
            <Car className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-display font-black text-[var(--text-primary)]">
              No Active Rides Yet
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
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
              className="px-5 py-3 rounded-full bg-[var(--bg-subtle)] text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 active-press"
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
    <div className="w-full max-w-[404px] mx-auto pb-20 px-3.5 space-y-3.5 animate-in fade-in pt-2">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold text-[var(--text-primary)] tracking-tight">
            Your rides
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Live corridor telemetry &amp; zero-cash boarding
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-mono tabular-nums font-semibold">
          {activeMatches.length} active
        </span>
      </div>

      {/* Rides Stack */}
      <div className="space-y-3">
        {activeMatches.map((match) => {
          const isWeeklyLocked = weeklyLockedCommutes.includes(match.driverId);
          const isCompleted = match.status === 'completed';
          const safeZoneLabel = match.pickupSafeZone?.name || 'TotalEnergies Safe Hub';
          const plateLabel = match.plateNumber || 'APP-842-EY';
          const vehicleLabel =
            match.vehicleMake && match.vehicleModel
              ? `${match.vehicleMake} ${match.vehicleModel}`
              : 'Verified Corridor Sedan';
          const progress = isCompleted ? 1 : liveProgressByMatch[match.id] ?? 0.48;
          const progressPct = Math.round(progress * 100);
          const etaMinutes = isCompleted ? 0 : estimateEtaMinutes(11, progress);
          const etaLabel = isCompleted ? 'Completed' : formatEtaLabel(etaMinutes);

          return (
            <div
              key={match.id}
              className="floating-surface p-3.5 space-y-3 overflow-hidden"
            >
              {/* Live Car Progress Panel */}
              <div className="bg-[#0F172A] dark:bg-[#1E2433] rounded-xl p-3.5 text-white space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {!isCompleted && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-signal)] font-bold">
                        {isCompleted ? 'TRIP COMPLETED' : `LIVE · ${etaLabel.toUpperCase()}`}
                      </span>
                    </div>
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
                      style={{ width: `${progressPct}%` }}
                      className="h-full rounded-full bg-[var(--accent-signal)] transition-all duration-1000 ease-linear"
                    />
                    <div
                      style={{ left: `${Math.min(92, Math.max(8, progressPct))}%` }}
                      className="absolute -translate-x-1/2 w-9 h-4.5 rounded-full bg-white text-[#0B0C0E] shadow-md flex items-center justify-center border border-[#0B0C0E] transition-all duration-1000 ease-linear"
                    >
                      <Car className="w-3 h-3 fill-current" />
                    </div>
                    <span className="absolute right-0 w-2.5 h-2.5 rounded-full bg-[#FF9F0A] ring-2 ring-[#0B0C0E]" />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-white/75 mt-2">
                    <span className="truncate max-w-[180px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--accent-signal)] flex-shrink-0" />
                      {safeZoneLabel}
                    </span>
                    <span className="text-[var(--accent-signal)] font-bold">
                      {isCompleted ? 'ESCROW RELEASED' : `${formatNgn(match.fareNgn)} HELD`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Vibe & Purpose Tags */}
              {(match.trip_purpose || match.mutual_spark || match.conversation_vibe) && (
                <div className="flex items-center gap-1.5 flex-wrap px-1">
                  {match.mutual_spark && (
                    <span className="text-[10px] font-bold bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {match.mutual_spark}
                    </span>
                  )}
                  {match.conversation_vibe && (
                    <span className="text-[10px] font-bold text-[var(--text-primary)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-full">
                      {match.conversation_vibe}
                    </span>
                  )}
                  {match.cabin_passengers && match.cabin_passengers.length > 0 && (
                    <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] px-2 py-1">
                      +{match.cabin_passengers.length} Co-Rider
                    </span>
                  )}
                </div>
              )}

              {/* 3. 4-Button Action Strip */}
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
                  className="h-9 px-2 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] text-xs font-semibold flex items-center justify-center gap-1 active-press"
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
                      match.scheduledFor,
                      vehicleLabel,
                      etaLabel
                    )
                  }
                  aria-label="Share live trip on WhatsApp"
                  title="Share live trip on WhatsApp"
                  className="h-9 px-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-medium flex items-center justify-center gap-1 active-press"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Share</span>
                </button>

                <a
                  href="tel:+2348030000000"
                  className="h-9 px-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-medium flex items-center justify-center gap-1 active-press"
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
                  className={`h-9 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 active-press ${
                    isWeeklyLocked
                      ? 'bg-[#F59E0B] text-[#0F172A]'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{isWeeklyLocked ? 'M-F' : 'Lock'}</span>
                </button>
              </div>

              {/* 4. Boarding PIN + Confirm Boarding Bar */}
              {!isCompleted ? (
                <div className="bg-[var(--bg-subtle)] rounded-xl p-1.5 pl-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveTab('pass')}
                    className="flex items-center gap-2 text-left active-press"
                    title="Open Section 44 Pass"
                  >
                    <QrCode className="w-4 h-4 text-[var(--text-primary)]" />
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-secondary)] font-semibold block leading-none">
                        Boarding PIN
                      </span>
                      <strong className="text-xs font-mono tabular-nums font-bold text-[var(--text-primary)] tracking-widest">
                        {offlinePin}
                      </strong>
                    </div>
                  </button>

                  <button
                    onClick={() => handleConfirmBoarding(match.id)}
                    className="h-9 px-4 btn-electric-mint text-xs flex items-center gap-1.5 active-press"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confirm Boarding</span>
                  </button>
                </div>
              ) : (
                <div className="py-2.5 px-3 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Trip verified &amp; fuel split released</span>
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
          <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)]">
            SEC 44 POLICY
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => simulateFlakePenalty('rider_flake')}
            className="py-2.5 px-3 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] font-bold text-[11px] active-press"
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
