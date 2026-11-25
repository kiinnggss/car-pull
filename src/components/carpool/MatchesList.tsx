'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
  MapPin,
  CheckCircle2,
  Phone,
  Repeat,
  Share2,
  QrCode,
  MessageCircle,
  Car,
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
      <div className="w-full px-6 py-16 text-center space-y-4">
        <div className="space-y-1.5">
          <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
            No active rides yet
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
            Book a verified peer from Discover or pick a route on the Map to lock your seat.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab('deck')}
            className="h-10 px-5 btn-electric-mint text-xs active-press"
          >
            Discover rides
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className="text-xs font-semibold text-[var(--text-primary)] underline underline-offset-4 active-press"
          >
            Open map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 px-5 pt-4 space-y-4 animate-in fade-in">
      {/* Plain Section Heading */}
      <div className="flex items-baseline justify-between pb-2 border-b border-[var(--border-subtle)]">
        <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
          Your rides
        </h2>
        <span className="text-xs font-mono text-[var(--text-secondary)]">
          {activeMatches.length} active
        </span>
      </div>

      {/* Borderless Hairline-Separated Ride List */}
      <div className="divide-y divide-[var(--border-subtle)]">
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
            <div key={match.id} className="py-5 first:pt-2 space-y-4">
              {/* Driver Row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-11 h-11 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center font-mono font-bold text-xs overflow-hidden flex-shrink-0">
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
                    <div className="flex items-center gap-1.5">
                      {!isCompleted && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                      )}
                      <span className="text-[11px] font-mono font-semibold text-[var(--accent-signal)]">
                        {isCompleted ? 'Completed' : etaLabel}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {match.driverName}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {vehicleLabel} · <span className="font-mono">{plateLabel}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-mono tabular-nums font-bold text-[var(--text-primary)] block">
                    {formatNgn(match.fareNgn)}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {isCompleted ? 'Settled' : 'Held'}
                  </span>
                </div>
              </div>

              {/* Clean Live Progress Track */}
              <div className="space-y-2">
                <div className="relative h-1 w-full rounded-full bg-[var(--bg-subtle)] flex items-center">
                  <div
                    style={{ width: `${progressPct}%`, backgroundColor: 'var(--accent-signal)' }}
                    className="h-full rounded-full transition-all duration-1000 ease-linear"
                  />
                  <div
                    style={{
                      left: `${Math.min(94, Math.max(6, progressPct))}%`,
                      backgroundColor: 'var(--bg-sheet)',
                      borderColor: 'var(--accent-signal)',
                      color: 'var(--accent-signal)',
                    }}
                    className="absolute -translate-x-1/2 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-1000 ease-linear"
                  >
                    <Car className="w-3 h-3" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="truncate flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {safeZoneLabel}
                  </span>
                  <span className="font-mono text-[11px] flex-shrink-0">{match.scheduledFor}</span>
                </div>
              </div>

              {/* Plain Inline Action Row (No Boxes) */}
              <div className="flex items-center justify-between text-xs pt-0.5">
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
                  className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)] active-press"
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
                  className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 active-press"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share trip</span>
                </button>

                <a
                  href="tel:+2348030000000"
                  className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] active-press"
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
                  className={`flex items-center gap-1.5 font-medium active-press ${
                    isWeeklyLocked
                      ? 'text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{isWeeklyLocked ? 'Mon–Fri' : 'Repeat'}</span>
                </button>
              </div>

              {/* Boarding Row */}
              {!isCompleted ? (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() => setActiveTab('pass')}
                    className="flex items-center gap-2 text-left active-press"
                    title="Open Section 44 Pass"
                  >
                    <QrCode className="w-4 h-4 text-[var(--text-secondary)]" />
                    <span className="text-xs text-[var(--text-secondary)]">
                      PIN <strong className="font-mono text-[var(--text-primary)] tracking-wider">{offlinePin}</strong>
                    </span>
                  </button>

                  <button
                    onClick={() => handleConfirmBoarding(match.id)}
                    className="h-9 px-4 btn-electric-mint text-xs active-press"
                  >
                    Confirm boarding
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          );
        })}
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
