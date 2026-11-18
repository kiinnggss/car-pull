'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
  CheckCircle2,
  X,
  MapPin,
  ShieldCheck,
  Car,
  Plus,
  Minus,
  Briefcase,
  Sliders,
  Compass,
  Zap,
  Handshake,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WaitingRider } from '@/lib/types';
import { IcebreakerChatModal } from './IcebreakerChatModal';
import { triggerHaptic } from '@/lib/haptics';

export const DriverSeatDeck: React.FC = () => {
  const {
    driverVehicle,
    updateDriverCar,
    availableSeats,
    corridorRiders,
    acceptedRiders,
    acceptRiderIntoCarpool,
    removeRiderFromCarpool,
    markRiderBoarded,
    commuteDirection,
    toggleCommuteDirection,
    driverSchedule,
    updateDriverSchedule,
    postDriverStreetRide,
    setActiveTab,
    getOrCreateThreadForRider,
    setActiveThreadId,
  } = useAppStore();

  const [selectedChatRider, setSelectedChatRider] = useState<WaitingRider | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [rideFilter, setRideFilter] = useState<'all' | 'express' | 'verified'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [originDraft, setOriginDraft] = useState(driverSchedule.origin);
  const [destDraft, setDestDraft] = useState(driverSchedule.destination);
  const [timeDraft, setTimeDraft] = useState(driverSchedule.departureTime);
  const [dateDraft, setDateDraft] = useState(driverSchedule.departureDay || 'Today');
  const [fareDraft, setFareDraft] = useState(driverSchedule.fuelSplitNgn.toString());

  const totalEscrowEarned = acceptedRiders.reduce((sum, r) => sum + r.bidNgn, 0);

  const filteredRiders = corridorRiders.filter((rider: WaitingRider) => {
    if (rideFilter === 'express') return rider.bidNgn >= 1500;
    if (rideFilter === 'verified') return rider.rating >= 4.9;
    return true;
  });

  const handleAdjustSeats = (delta: number) => {
    const nextTotal = Math.max(1, Math.min(4, driverVehicle.total_seats + delta));
    updateDriverCar({
      ...driverVehicle,
      total_seats: nextTotal,
    });
  };

  const handleAcceptRider = (riderId: string) => {
    triggerHaptic('match');
    acceptRiderIntoCarpool(riderId);
    confetti({
      particleCount: 40,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#C8FF00', '#0B0C0E', '#FF9F0A'],
    });
  };

  const handleCompleteDropoff = (riderId: string) => {
    triggerHaptic('success');
    markRiderBoarded(riderId);
    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#C8FF00', '#0B0C0E', '#FFFFFF'],
    });
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    const numericFare = Math.max(500, Math.min(5000, parseInt(fareDraft, 10) || 1500));

    updateDriverSchedule({
      origin: originDraft,
      destination: destDraft,
      departureDay: dateDraft,
      departureTime: timeDraft,
      fuelSplitNgn: numericFare,
    });

    postDriverStreetRide({
      originStreet: originDraft,
      destination: destDraft,
      departureDay: dateDraft as any,
      departureTime: `${dateDraft}, ${timeDraft}`,
      fuelSplitNgn: numericFare,
      availableSeats: availableSeats,
    });

    setShowScheduleModal(false);
  };

  return (
    <div className="w-full max-w-[404px] mx-auto pb-24 px-3 space-y-3.5 animate-in fade-in pt-1">
      {/* 1. Uber Green Inspired Volt Driver Telemetry Card */}
      <div className="volt-surface rounded-[32px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B0C0E] text-[#C8FF00] text-[10px] font-mono font-bold uppercase">
            <Zap className="w-3 h-3 fill-current" />
            DRIVER HOST MODE
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowScheduleModal(true);
              }}
              className="px-3 py-1.5 rounded-full bg-white/85 hover:bg-white text-[#0B0C0E] text-[11px] font-extrabold flex items-center gap-1 active-press"
            >
              <Sliders className="w-3 h-3" />
              <span>Trip Setup</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('tap');
                setActiveTab('map');
              }}
              className="px-3 py-1.5 rounded-full bg-[#0B0C0E] text-white text-[11px] font-extrabold flex items-center gap-1 active-press"
            >
              <Compass className="w-3 h-3 text-[#C8FF00]" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Route & Earnings Headline */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B0C0E]/70 block">
              {driverSchedule.departureDay || 'Today'} • {driverSchedule.departureTime}
            </span>
            <h2 className="text-xl font-display font-black text-[#0B0C0E] leading-tight mt-0.5">
              {commuteDirection === 'morning'
                ? 'Admiralty Way → Victoria Island'
                : 'Victoria Island → Admiralty Way'}
            </h2>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[9px] font-mono uppercase font-bold text-[#0B0C0E]/70 block">
              ESCROW OFFSET
            </span>
            <span className="text-xl font-black font-mono tabular-nums text-[#0B0C0E]">
              +{formatNgn(totalEscrowEarned)}
            </span>
          </div>
        </div>

        {/* Segmented AM/PM + Seat Stepper Bar */}
        <div className="bg-[#0B0C0E] text-white rounded-full p-1.5 pl-3.5 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              triggerHaptic('switch');
              toggleCommuteDirection();
            }}
            className="text-left flex items-center gap-2 active-press"
          >
            <Car className="w-4 h-4 text-[#C8FF00]" />
            <div>
              <span className="text-[11px] font-extrabold block leading-none">
                {driverVehicle.make} {driverVehicle.model}
              </span>
              <span className="text-[9px] font-mono text-[#C8FF00] block mt-0.5">
                {driverVehicle.plate_number} • Tap to flip AM/PM
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1.5 bg-white/10 rounded-full p-1">
            <button
              onClick={() => handleAdjustSeats(-1)}
              disabled={driverVehicle.total_seats <= 1}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center disabled:opacity-30 active-press"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-mono tabular-nums font-black px-1.5 text-[#C8FF00]">
              {availableSeats}/{driverVehicle.total_seats} Seats
            </span>
            <button
              onClick={() => handleAdjustSeats(1)}
              disabled={driverVehicle.total_seats >= 4}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center disabled:opacity-30 active-press"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Accepted Co-Riders Manifest */}
      {acceptedRiders.length > 0 && (
        <div className="floating-surface rounded-[28px] p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#0B0C0E] dark:text-white">
              Confirmed Cabin Manifest ({acceptedRiders.length})
            </span>
            <span className="text-[10px] font-mono font-bold text-[#0B0C0E] bg-[#C8FF00] px-2.5 py-0.5 rounded-full">
              ESCROW LOCKED
            </span>
          </div>

          <div className="space-y-2">
            {acceptedRiders.map((rider) => (
              <div
                key={rider.id}
                className="p-3 rounded-[22px] bg-[#F4F5F7] dark:bg-[#1E2028] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={rider.avatar}
                    alt={rider.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-[#0B0C0E] dark:text-white truncate">
                      {rider.name}
                    </h4>
                    <p className="text-[10px] text-[#525866] dark:text-[#9BA1AE] truncate">
                      {rider.pickupSafeZone.name} •{' '}
                      <strong className="font-mono text-[#0B0C0E] dark:text-[#C8FF00]">
                        {formatNgn(rider.bidNgn)}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      const threadId = getOrCreateThreadForRider(rider);
                      setActiveThreadId(threadId);
                      setActiveTab('chats');
                    }}
                    className="px-3 py-2 rounded-full bg-white dark:bg-[#14161B] text-[#0B0C0E] dark:text-white text-[11px] font-bold active-press"
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => handleCompleteDropoff(rider.id)}
                    className="px-3.5 py-2 rounded-full btn-electric-mint text-[11px] font-extrabold flex items-center gap-1 active-press"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Boarded</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Waiting Corridor Peers (Professional Network Tinder Style Cards) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-display font-black text-[#0B0C0E] dark:text-white">
            Peers Along Your Corridor
          </h3>
          <span className="text-[11px] font-mono font-bold text-[#525866] dark:text-[#9BA1AE]">
            {filteredRiders.length} waiting
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'all', label: 'All Peers' },
              { id: 'express', label: 'Top Fuel Split' },
              { id: 'verified', label: '4.9★+ Rated' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRideFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all active-press ${
                rideFilter === tab.id
                  ? 'bg-[#0B0C0E] dark:bg-[#C8FF00] text-white dark:text-[#0B0C0E]'
                  : 'bg-white dark:bg-[#14161B] text-[#525866] dark:text-[#9BA1AE]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredRiders.map((rider: WaitingRider) => {
          const noSeatsLeft = availableSeats <= 0;

          return (
            <div
              key={rider.id}
              className="floating-surface rounded-[28px] p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={rider.avatar}
                      alt={rider.name}
                      className="w-13 h-13 rounded-2xl object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#C8FF00] text-[#0B0C0E] text-[9px] font-mono font-black">
                      ★ {rider.rating}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-display font-black text-[#0B0C0E] dark:text-white truncate">
                        {rider.name}
                      </h4>
                      <ShieldCheck className="w-4 h-4 text-[#0B0C0E] dark:text-[#C8FF00] flex-shrink-0" />
                    </div>
                    <p className="text-[11px] text-[#525866] dark:text-[#9BA1AE] font-semibold flex items-center gap-1 truncate">
                      <Briefcase className="w-3 h-3 flex-shrink-0" />
                      <span>{rider.employer}</span>
                    </p>
                    <p className="text-[11px] font-bold text-[#0B0C0E] dark:text-white flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-[#FF9F0A] flex-shrink-0" />
                      <span className="truncate">{rider.pickupSafeZone.name}</span>
                      <span className="text-[#525866] dark:text-[#9BA1AE] font-mono text-[10px]">
                        ({rider.departure_time})
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Editorial Trip Quote Pill */}
              {rider.trip_purpose && (
                <div className="px-3.5 py-2 rounded-2xl bg-[#F4F5F7] dark:bg-[#1E2028] text-xs font-semibold text-[#0B0C0E] dark:text-white">
                  &ldquo;{rider.trip_purpose}&rdquo;
                </div>
              )}

              {/* Professional Network Tinder Floating `[ X | 🤝 Connect ₦1,500 ]` Bar */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A] text-[10px] font-mono font-extrabold">
                    To {rider.destination.split('(')[0].trim()}
                  </span>
                  {rider.conversation_vibe && (
                    <span className="px-2.5 py-1 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[10px] font-bold text-[#525866] dark:text-[#9BA1AE]">
                      {rider.conversation_vibe}
                    </span>
                  )}
                </div>

                <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028]">
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      removeRiderFromCarpool(rider.id);
                    }}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#14161B] text-[#0B0C0E] dark:text-white flex items-center justify-center active-press"
                    title="Pass"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleAcceptRider(rider.id)}
                    disabled={noSeatsLeft}
                    className="h-8 px-3.5 rounded-full btn-electric-mint text-[11px] font-extrabold flex items-center gap-1.5 disabled:opacity-40 active-press"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span>Accept • {formatNgn(rider.bidNgn)}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trip Setup Modal */}
      {showScheduleModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[700] bg-black/70 backdrop-blur-xs overflow-y-auto p-3 flex items-end sm:items-center justify-center animate-in fade-in duration-150">
            <div className="w-full max-w-[390px] floating-surface rounded-[32px] p-5 space-y-4 my-auto animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-display font-black text-[#0B0C0E] dark:text-white">
                  Configure Driver Trip
                </h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="w-8 h-8 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSchedule} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[#525866] dark:text-[#9BA1AE] mb-1">
                    Origin Street / Gate
                  </label>
                  <input
                    type="text"
                    value={originDraft}
                    onChange={(e) => setOriginDraft(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] font-bold text-[#0B0C0E] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[#525866] dark:text-[#9BA1AE] mb-1">
                    Destination Hub
                  </label>
                  <input
                    type="text"
                    value={destDraft}
                    onChange={(e) => setDestDraft(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] font-bold text-[#0B0C0E] dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-[#525866] dark:text-[#9BA1AE] mb-1">
                      Departure Time
                    </label>
                    <input
                      type="text"
                      value={timeDraft}
                      onChange={(e) => setTimeDraft(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] font-mono font-bold text-[#0B0C0E] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-[#525866] dark:text-[#9BA1AE] mb-1">
                      Seat Fuel Split (₦)
                    </label>
                    <input
                      type="number"
                      value={fareDraft}
                      onChange={(e) => setFareDraft(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] font-mono font-bold text-[#0B0C0E] dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 btn-electric-mint text-xs font-extrabold rounded-full active-press"
                >
                  Publish Street Carpool
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

      {selectedChatRider && (
        <IcebreakerChatModal
          isOpen={!!selectedChatRider}
          onClose={() => setSelectedChatRider(null)}
          personName={selectedChatRider.name}
          personAvatar={selectedChatRider.avatar}
          tripPurpose={selectedChatRider.trip_purpose}
          conversationVibe={selectedChatRider.conversation_vibe}
          interests={selectedChatRider.interests}
        />
      )}
    </div>
  );
};
