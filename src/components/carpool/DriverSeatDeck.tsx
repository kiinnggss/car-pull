'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import { StreetCarpoolRide } from '@/lib/types';
import {
  Users,
  MapPin,
  Clock,
  Share2,
  Plus,
  Trash2,
  Sparkles,
  Building2,
  Navigation,
  X,
  Star,
  MessageCircle,
  SlidersHorizontal,
  ArrowRight,
  Radio,
  Compass,
  Snowflake,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IcebreakerChatModal } from './IcebreakerChatModal';
import { triggerHaptic } from '@/lib/haptics';

export const DriverSeatDeck: React.FC = () => {
  const {
    user,
    driverVehicle,
    updateDriverCar,
    availableSeats,
    corridorRiders,
    acceptedRiders,
    acceptRiderIntoCarpool,
    removeRiderFromCarpool,
    boardedRiderIds,
    markRiderBoarded,
    sendBroadcastPing,
    commuteDirection,
    setCommuteDirection,
    offlinePin,
    setActiveTab,
    setActiveThreadId,
    driverSchedule,
    updateDriverSchedule,
    getOrCreateThreadForRider,
    userStreet,
    postDriverStreetRide,
  } = useAppStore();

  const [copiedManifest, setCopiedManifest] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedChatRider, setSelectedChatRider] = useState<any | null>(null);
  const [filterPill, setFilterPill] = useState<'all' | 'expressway' | 'corporate' | 'high_match'>('all');
  const [pingSentToast, setPingSentToast] = useState(false);

  // Modal form states
  const [tempDepartureDay, setTempDepartureDay] = useState(driverSchedule?.departureDay || 'Today');
  const [tempDepartureTime, setTempDepartureTime] = useState(driverSchedule?.departureTime || '07:30 AM');
  const [tempDestination, setTempDestination] = useState(driverSchedule?.destination || 'Victoria Island');
  const [tempFuelSplit, setTempFuelSplit] = useState(driverSchedule?.fuelSplitNgn || 1500);

  const [carMake, setCarMake] = useState(driverVehicle.make);
  const [carModel, setCarModel] = useState(driverVehicle.model);
  const [carPlate, setCarPlate] = useState(driverVehicle.plate_number);
  const [carColor, setCarColor] = useState(driverVehicle.color);
  const [carSeats, setCarSeats] = useState(driverVehicle.total_seats);

  const totalSeats = driverVehicle.total_seats;
  const filledSeats = acceptedRiders.length;
  const currentSeatPrice = driverSchedule?.fuelSplitNgn || 1500;
  const totalFuelOffset = filledSeats * currentSeatPrice;

  const handleAccept = (riderId: string) => {
    triggerHaptic('match');
    acceptRiderIntoCarpool(riderId);
    confetti({
      particleCount: 35,
      spread: 45,
      origin: { y: 0.6 },
      colors: ['#0F766E', '#10B981', '#D97706'],
    });
  };

  const handleConfirmBoarded = (riderId: string) => {
    triggerHaptic('match');
    markRiderBoarded(riderId);
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.5 },
      colors: ['#0F766E', '#10B981', '#D97706'],
    });
  };

  const handleBroadcastPing = () => {
    triggerHaptic('success');
    sendBroadcastPing();
    setPingSentToast(true);
    setTimeout(() => setPingSentToast(false), 3000);
  };

  const handleStartDrive = () => {
    triggerHaptic('tap');
    const destination = driverSchedule?.destination || 'Victoria Island, Lagos';
    const waypoints = acceptedRiders.map((r) => r.pickupSafeZone.name).join('|');
    const mapsUrl = waypoints
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    if (typeof window !== 'undefined') {
      window.open(mapsUrl, '_blank');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    updateDriverSchedule({
      departureDay: tempDepartureDay,
      departureTime: tempDepartureTime,
      destination: tempDestination,
      fuelSplitNgn: tempFuelSplit,
    });
    updateDriverCar({
      make: carMake.trim() || 'Toyota',
      model: carModel.trim() || 'Camry',
      year: driverVehicle.year,
      color: carColor.trim() || 'Midnight Black',
      plate_number: carPlate.trim().toUpperCase() || 'APP-842-EY',
      total_seats: Number(carSeats) || 3,
    });
    postDriverStreetRide({
      originStreet: userStreet.name,
      originCoords: userStreet.coordinates,
      destination: tempDestination,
      departureDay: tempDepartureDay as StreetCarpoolRide['departureDay'],
      departureTime: tempDepartureTime,
      fuelSplitNgn: tempFuelSplit,
      availableSeats: Math.max(1, Number(carSeats) - filledSeats),
      totalSeats: Number(carSeats),
    });
    setShowSettingsModal(false);
  };

  const shareToWhatsApp = () => {
    triggerHaptic('success');
    const text = `*CAR PULL - DRIVER COMMUTE MANIFEST*
Direction: ${commuteDirection === 'morning' ? 'Morning Outbound' : 'Evening Return'} Commute
Status: Lagos State Transport Law Sec 44 Compliant

• Driver: ${user.fullName} (${user.employer})
• Vehicle: ${driverVehicle.make} ${driverVehicle.model} (${driverVehicle.color})
• Plate: ${driverVehicle.plate_number}
• Pickup PIN: ${offlinePin}
• Capacity: ${filledSeats}/${totalSeats} Seats Filled (Offset: ${formatNgn(totalFuelOffset)})

Confirmed Passengers:
${acceptedRiders.map((r, i) => `${i + 1}. ${r.name} (${r.employer}) - ${r.pickupSafeZone.name} [${boardedRiderIds?.includes(r.id) ? 'BOARDED' : 'AWAITING'}]`).join('\n')}

CAR PULL Zero-Cash Escrow Active`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2500);
    }
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const waitingRiders = corridorRiders.filter((r) => {
    if (r.status !== 'waiting') return false;
    if (filterPill === 'expressway') {
      const expresswayKeywords = ['mall', 'circle', 'total', 'jubilee', 'bridge', 'ikota', 'chicken', 'expressway', 'chisco', 'vgc', 'agungi'];
      return expresswayKeywords.some((kw) => r.pickupSafeZone.name.toLowerCase().includes(kw));
    }
    if (filterPill === 'corporate') {
      return r.employer_domain || r.employer.toLowerCase().includes('dangote') || r.employer.toLowerCase().includes('flutterwave') || r.employer.toLowerCase().includes('paystack') || r.employer.toLowerCase().includes('access');
    }
    if (filterPill === 'high_match') {
      return Boolean(r.mutual_spark) || r.rating >= 4.9;
    }
    return true;
  });

  return (
    <div className="w-full max-w-[400px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in">
      {/* 1. Driver Cockpit Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[10px]">
            DRIVER COCKPIT ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowSettingsModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl floating-surface text-slate-800 dark:text-slate-200 text-xs font-bold active-spring"
            title="Edit route, schedule, and vehicle specs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Trip Setup</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('switch');
              setActiveTab('map');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl btn-electric-mint text-xs font-extrabold active-spring"
            title="Open corridor pickup map"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Driver Telemetry & Seat Console (Hairline Divided) */}
      <div className="floating-surface rounded-2xl divide-y divide-slate-200/70 dark:divide-white/8 overflow-hidden">
        {/* Direction Switcher Row */}
        <div className="p-2 bg-slate-50/70 dark:bg-[#0C1117]/70">
          <div className="grid grid-cols-2 gap-1 bg-slate-200/70 dark:bg-[#090D11] p-1 rounded-xl border border-slate-200/80 dark:border-white/5 text-xs">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('switch');
                setCommuteDirection('morning');
              }}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all text-left active-spring ${
                commuteDirection === 'morning'
                  ? 'bg-white dark:bg-[#18222D] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold truncate">Morning Outbound</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] dark:bg-[#14B8A6]" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                {userStreet.name.split(',')[0]} to VI
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('switch');
                setCommuteDirection('evening');
              }}
              className={`py-1.5 px-2 rounded-lg font-bold transition-all text-left active-spring ${
                commuteDirection === 'evening'
                  ? 'bg-white dark:bg-[#18222D] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold truncate">Evening Return</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                VI to {userStreet.name.split(',')[0]}
              </span>
            </button>
          </div>
        </div>

        {/* 3-Column Tabular Telemetry Strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-200/70 dark:divide-white/8 text-center py-2.5">
          <div className="px-2">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
              Open Seats
            </span>
            <span className="text-sm font-extrabold font-mono tabular-nums text-[#0F766E] dark:text-[#14B8A6]">
              {availableSeats} / {totalSeats}
            </span>
          </div>

          <div className="px-2">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
              Fuel Offset
            </span>
            <span className="text-sm font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatNgn(totalFuelOffset)}
            </span>
          </div>

          <div className="px-2">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
              Departure
            </span>
            <span className="text-sm font-extrabold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {driverSchedule?.departureTime || '07:30 AM'}
            </span>
          </div>
        </div>

        {/* Interactive Seat Bay Visualizer */}
        <div className="p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {driverVehicle.make} {driverVehicle.model}
              </span>
              <span className="plate-badge text-[10px] font-bold px-2 py-0.5 rounded">
                {driverVehicle.plate_number}
              </span>
            </div>

            {/* Seat Stepper */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#090D11] border border-slate-200/80 dark:border-white/8 px-2 py-0.5 rounded-lg">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mr-0.5">
                Capacity
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  const newSeats = Math.max(1, Number(carSeats) - 1);
                  setCarSeats(newSeats);
                  updateDriverCar({ ...driverVehicle, total_seats: newSeats });
                }}
                className="w-5 h-5 rounded bg-white dark:bg-[#18222D] text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center active-spring"
                title="Decrease seats"
              >
                -
              </button>
              <span className="font-mono tabular-nums font-extrabold text-xs text-slate-900 dark:text-white min-w-[14px] text-center">
                {carSeats}
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  const newSeats = Math.min(6, Number(carSeats) + 1);
                  setCarSeats(newSeats);
                  updateDriverCar({ ...driverVehicle, total_seats: newSeats });
                }}
                className="w-5 h-5 rounded bg-white dark:bg-[#18222D] text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center active-spring"
                title="Increase seats"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: totalSeats }).map((_, idx) => {
              const isFilled = idx < filledSeats;
              const rider = acceptedRiders[idx];
              const isBoarded = rider && boardedRiderIds?.includes(rider.id);

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    isBoarded
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : isFilled
                      ? 'bg-teal-500/10 border-teal-500/30 text-[#0F766E] dark:text-[#14B8A6]'
                      : 'bg-slate-50 dark:bg-[#090D11] border-slate-200/80 dark:border-white/8 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold">
                    <Users className="w-3 h-3" />
                    <span>Seat {idx + 1}</span>
                  </div>
                  <span className="text-[10px] block truncate font-semibold mt-0.5">
                    {isBoarded
                      ? `${rider.name.split(' ')[0]} • Onboard`
                      : isFilled
                      ? rider.name.split(' ')[0]
                      : 'Available'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Live Pickup Itinerary & Confirmed Passengers */}
      {acceptedRiders.length > 0 && (
        <div className="floating-surface rounded-2xl divide-y divide-slate-200/70 dark:divide-white/8 overflow-hidden">
          <div className="px-3.5 py-2.5 flex items-center justify-between bg-slate-50/70 dark:bg-[#0C1117]/70">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                Active Pickup Manifest
              </h4>
            </div>
            <span className="text-[10px] font-mono tabular-nums text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              {boardedRiderIds?.length || 0}/{acceptedRiders.length} Boarded
            </span>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-white/5">
            {acceptedRiders.map((rider, idx) => {
              const isBoarded = boardedRiderIds?.includes(rider.id);
              return (
                <div key={rider.id} className="p-3 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6] font-extrabold text-xs flex items-center justify-center flex-shrink-0 font-mono">
                      S{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {rider.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
                          @{rider.employer_domain}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate mt-0.5">
                        <MapPin className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
                        <span className="truncate">{rider.pickupSafeZone.name}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isBoarded ? (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                        Onboard
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirmBoarded(rider.id)}
                        className="px-2.5 py-1.5 btn-electric-mint text-[10.5px] font-extrabold rounded-lg active-spring"
                      >
                        Board
                      </button>
                    )}

                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        const threadId = getOrCreateThreadForRider(rider);
                        setActiveThreadId(threadId);
                        setActiveTab('chats');
                      }}
                      className="p-1.5 text-slate-500 hover:text-[#0F766E] dark:text-slate-400 dark:hover:text-[#14B8A6] rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      title="Message passenger"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        removeRiderFromCarpool(rider.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Remove passenger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dispatch Controls Footer */}
          <div className="p-3 bg-slate-50/50 dark:bg-[#0C1117]/50 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleStartDrive}
                className="py-2 px-3 btn-electric-mint rounded-xl text-xs font-extrabold active-spring flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Launch Maps</span>
              </button>

              <button
                onClick={handleBroadcastPing}
                className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-bold active-spring flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5 text-amber-500" />
                <span>{pingSentToast ? 'Ping Sent!' : '5-Min Alert'}</span>
              </button>
            </div>

            <button
              onClick={shareToWhatsApp}
              className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold active-spring flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedManifest ? 'Manifest Copied' : 'Share WhatsApp Manifest'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Commuters Waiting on Your Route */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
            Passengers Along Your Corridor
          </h4>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
            {waitingRiders.length} waiting
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(
            [
              { id: 'all', label: 'All Commuters' },
              { id: 'expressway', label: 'Direct Expressway' },
              { id: 'corporate', label: 'Corporate Verified' },
              { id: 'high_match', label: 'Top Rated' },
            ] as const
          ).map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setFilterPill(pill.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active-spring ${
                filterPill === pill.id
                  ? 'btn-electric-mint'
                  : 'floating-surface text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Commuters List */}
        <div className="space-y-2.5">
          {waitingRiders.map((rider) => (
            <div
              key={rider.id}
              className="floating-surface rounded-2xl divide-y divide-slate-200/70 dark:divide-white/8 overflow-hidden transition-all"
            >
              {/* Header: Commuter Identity & Fuel Split Offer */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#18222D] border border-slate-200/80 dark:border-white/8 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                    {rider.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                      <span className="truncate">{rider.name}</span>
                      {rider.isFemaleOnly && (
                        <span className="text-[9px] bg-pink-500/10 border border-pink-500/20 text-pink-700 dark:text-pink-300 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                          Women
                        </span>
                      )}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{rider.employer}</span>
                      <span className="flex items-center gap-0.5 font-mono text-amber-600 dark:text-amber-400 font-bold flex-shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" /> {rider.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-extrabold font-mono tabular-nums text-[#0F766E] dark:text-[#14B8A6] block">
                    +{formatNgn(rider.bidNgn)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-semibold">
                    FUEL SPLIT
                  </span>
                </div>
              </div>

              {/* Route & Spark Info */}
              <div className="px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0C1117]/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
                    <MapPin className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
                    <strong className="font-semibold text-slate-900 dark:text-white">Hub:</strong>
                    <span className="truncate">{rider.pickupSafeZone.name}</span>
                  </span>
                  <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold flex-shrink-0">
                    {rider.departure_time}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
                    <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span>To {rider.destination}</span>
                  </span>
                  {rider.mutual_spark && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {rider.mutual_spark}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Row */}
              <div className="p-2.5 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setSelectedChatRider(rider);
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#18222D] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold active-spring flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => handleAccept(rider.id)}
                  disabled={availableSeats <= 0}
                  className="col-span-2 py-2 px-3 btn-electric-mint disabled:opacity-40 text-xs font-extrabold rounded-xl active-spring flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {availableSeats > 0 ? `Accept Rider (${availableSeats} Open)` : 'Seats Full'}
                  </span>
                </button>
              </div>
            </div>
          ))}

          {waitingRiders.length === 0 && (
            <div className="p-8 text-center floating-surface rounded-2xl space-y-1.5">
              <Users className="w-7 h-7 text-slate-400 mx-auto" />
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                No matching commuters for this filter
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Switch filter pills above or toggle your commute direction.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trip & Vehicle Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
          <div className="floating-surface rounded-2xl max-w-[380px] w-full p-5 shadow-floating-lg dark:shadow-floating-dark-lg space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-white/8">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Trip &amp; Vehicle Configuration
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Departure Day
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Today', 'Tomorrow', 'Saturday', 'Sunday'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setTempDepartureDay(day)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                        tempDepartureDay === day
                          ? 'btn-electric-mint'
                          : 'bg-slate-100 dark:bg-[#090D11] border border-slate-200/80 dark:border-white/8 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Departure Time
                  </label>
                  <input
                    type="text"
                    value={tempDepartureTime}
                    onChange={(e) => setTempDepartureTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#090D11] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-2 font-mono font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Destination
                  </label>
                  <select
                    value={tempDestination}
                    onChange={(e) => setTempDestination(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#090D11] border border-slate-200 dark:border-white/10 rounded-xl px-2 py-2 font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="Victoria Island">Victoria Island</option>
                    <option value="Marina / CMS">Marina / CMS</option>
                    <option value="Ikoyi (Kingsway)">Ikoyi (Kingsway)</option>
                    <option value="Lekki Phase 1">Lekki Phase 1</option>
                    <option value="Ikeja City Mall">Ikeja City Mall</option>
                    <option value="Landmark Beach">Landmark Beach</option>
                    <option value="Yaba Tech Hubs">Yaba Tech Hubs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Fair Fuel Split Per Seat
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1000, 1500, 2000, 2500].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setTempFuelSplit(amount)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        tempFuelSplit === amount
                          ? 'btn-electric-mint'
                          : 'bg-slate-100 dark:bg-[#090D11] border border-slate-200/80 dark:border-white/8 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {formatNgn(amount)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 dark:border-white/8 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Vehicle Details
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                      Make
                    </label>
                    <input
                      type="text"
                      value={carMake}
                      onChange={(e) => setCarMake(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#090D11] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                      Model
                    </label>
                    <input
                      type="text"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#090D11] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                      Plate Number
                    </label>
                    <input
                      type="text"
                      value={carPlate}
                      onChange={(e) => setCarPlate(e.target.value)}
                      className="w-full plate-badge rounded-xl px-2.5 py-1.5 font-mono font-bold uppercase text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                      Color
                    </label>
                    <input
                      type="text"
                      value={carColor}
                      onChange={(e) => setCarColor(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#090D11] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 btn-electric-mint text-xs font-extrabold rounded-xl active-spring"
              >
                Save Trip &amp; Vehicle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Driver-to-Passenger Icebreaker Chat Modal */}
      {selectedChatRider && (
        <IcebreakerChatModal
          isOpen={!!selectedChatRider}
          onClose={() => setSelectedChatRider(null)}
          personName={selectedChatRider.name}
          personAvatar={selectedChatRider.avatar}
          tripPurpose={selectedChatRider.trip_purpose}
          conversationVibe={selectedChatRider.conversation_vibe}
          interests={selectedChatRider.interests}
          phone={selectedChatRider.phone}
          linkedinHandle={selectedChatRider.linkedin_handle}
        />
      )}
    </div>
  );
};
