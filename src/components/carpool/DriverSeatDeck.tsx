'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import { StreetCarpoolRide } from '@/lib/types';
import {
  Users,
  Car,
  MapPin,
  Clock,
  ShieldCheck,
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
  Check,
  ArrowRight,
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
    commuteDirection,
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
      colors: ['#0F766E', '#10B981', '#F58A25'],
    });
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
      make: carMake.trim() || 'Mercedes-Benz',
      model: carModel.trim() || 'GLA 250',
      year: driverVehicle.year,
      color: carColor.trim() || 'Mountain Grey',
      plate_number: carPlate.trim().toUpperCase() || 'LSR-210-DK',
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
${acceptedRiders.map((r, i) => `${i + 1}. ${r.name} (${r.employer}) - ${r.pickupSafeZone.name}`).join('\n')}

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

  const waitingRiders = corridorRiders.filter((r) => r.status === 'waiting');

  return (
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in">
      {/* 1. Header Toolbar: Status, Route Capsule, and Trip Settings */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-emerald-500/15 dark:bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[10px]">
            Driver Active
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowSettingsModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs active:scale-95 transition-all"
            title="Edit route, schedule, and car details"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Trip Settings</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('switch');
              setActiveTab('map');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            title="View corridor pickup map"
          >
            <Navigation className="w-3.5 h-3.5 text-[#F58A25]" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* 2. Route & Capacity Capsule */}
      <div className="bg-white dark:bg-[#12161A] rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        {/* Active Route & Schedule Line */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
              {userStreet.name} ➔ {driverSchedule?.destination || 'Victoria Island'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex-shrink-0">
            <Clock className="w-3 h-3 text-[#F58A25]" />
            <span>{driverSchedule?.departureTime || '07:30 AM'}</span>
          </div>
        </div>

        {/* Vehicle Details & Seat Badges */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0F766E] dark:text-[#14B8A6]">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  {driverVehicle.make} {driverVehicle.model}
                </span>
                <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                  {driverVehicle.plate_number}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {driverVehicle.color} • AC On • {formatNgn(currentSeatPrice)}/seat
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
              Available
            </span>
            <span className="text-sm font-bold text-[#0F766E] dark:text-[#14B8A6]">
              {availableSeats} of {totalSeats} seats
            </span>
          </div>
        </div>

        {/* Visual Seat Indicators */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {Array.from({ length: totalSeats }).map((_, idx) => {
            const isFilled = idx < filledSeats;
            const rider = acceptedRiders[idx];

            return (
              <div
                key={idx}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isFilled
                    ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60 text-[#0F766E] dark:text-teal-300'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 border-dashed'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold">
                  <Users className="w-3 h-3" />
                  <span>Seat {idx + 1}</span>
                </div>
                <span className="text-[9.5px] block truncate font-medium mt-0.5">
                  {isFilled ? rider.name.split(' ')[0] : 'Open'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Offset & WhatsApp Action Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              Statutory Fuel Contribution
            </span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {formatNgn(totalFuelOffset)} earned
            </span>
          </div>

          {filledSeats > 0 && (
            <button
              onClick={shareToWhatsApp}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition-all"
              title="Share manifest on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedManifest ? 'Copied' : 'Share Manifest'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Confirmed Passengers (Only displayed when riders exist) */}
      {acceptedRiders.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Confirmed Passengers ({acceptedRiders.length})
            </h4>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full font-bold">
              Escrow Held
            </span>
          </div>

          <div className="space-y-1.5">
            {acceptedRiders.map((rider) => (
              <div
                key={rider.id}
                className="bg-white dark:bg-[#12161A] rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#0F766E] dark:text-teal-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {rider.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      {rider.name}
                      <span className="text-[9px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded font-medium">
                        @{rider.employer_domain}
                      </span>
                    </h5>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-[#0F766E] dark:text-[#14B8A6]" />
                      {rider.pickupSafeZone.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {formatNgn(currentSeatPrice)}
                  </span>
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      const threadId = getOrCreateThreadForRider(rider);
                      setActiveThreadId(threadId);
                      setActiveTab('chats');
                    }}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-[#0F766E] dark:hover:text-[#14B8A6] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Chat with passenger"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#F58A25]" />
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      removeRiderFromCarpool(rider.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Remove rider"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Commuters Waiting on Your Corridor (Clean, Actionable List) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Passengers on Your Route
          </h4>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {waitingRiders.length} Verified Commuters
          </span>
        </div>

        <div className="space-y-2">
          {waitingRiders.map((rider) => (
            <div
              key={rider.id}
              className="bg-white dark:bg-[#12161A] rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5 hover:border-teal-500/50 transition-all"
            >
              {/* Header: Commuter Avatar, Name, Company, Rating, Offer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {rider.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      {rider.name}
                      {rider.isFemaleOnly && (
                        <span className="text-[9px] bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 px-1.5 py-0.2 rounded font-bold">
                          Women
                        </span>
                      )}
                    </h5>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{rider.employer}</span>
                      <span className="flex items-center gap-0.5">
                        • <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" /> {rider.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#0F766E] dark:text-[#14B8A6] block">
                    +{formatNgn(rider.bidNgn)}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                    Fair Split
                  </span>
                </div>
              </div>

              {/* Route: Pickup Safe Zone to Drop Destination */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl text-[10.5px] space-y-1 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Pickup:</span>
                  <span className="truncate">{rider.pickupSafeZone.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#F58A25] flex-shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Drop:</span>
                  <span className="truncate">{rider.destination} ({rider.departure_time})</span>
                </div>
              </div>

              {/* Mutual Spark Pill if present */}
              {rider.mutual_spark && (
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-[#F58A25] bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/40">
                    <Sparkles className="w-2.5 h-2.5 text-[#F58A25]" />
                    {rider.mutual_spark}
                  </span>
                </div>
              )}

              {/* Action Buttons: Chat & Accept */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setSelectedChatRider(rider);
                  }}
                  className="py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1"
                  title="Say hello to commuter"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#F58A25]" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => handleAccept(rider.id)}
                  disabled={availableSeats <= 0}
                  className="col-span-2 py-2 bg-[#0F766E] hover:bg-[#0D655E] disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {availableSeats > 0 ? `Accept Commuter (${availableSeats} Left)` : 'Car Full'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Trip & Vehicle Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] bg-white dark:bg-[#12161A] backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                Trip &amp; Vehicle Settings
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3.5 overflow-y-auto py-3 text-xs pr-0.5">
              {/* Trip Day */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Trip Day
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Today', 'Tomorrow', 'Saturday', 'Sunday'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setTempDepartureDay(day)}
                      className={`py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        tempDepartureDay === day
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time and Destination */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Departure Time
                  </label>
                  <input
                    type="text"
                    value={tempDepartureTime}
                    onChange={(e) => setTempDepartureTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Destination
                  </label>
                  <select
                    value={tempDestination}
                    onChange={(e) => setTempDestination(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
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

              {/* Fuel Split per Seat */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Fair Fuel Contribution Per Seat
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1000, 1500, 2000, 2500].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setTempFuelSplit(amount)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                        tempFuelSplit === amount
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {formatNgn(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Vehicle Specifications
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">
                      Make
                    </label>
                    <input
                      type="text"
                      value={carMake}
                      onChange={(e) => setCarMake(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">
                      Model
                    </label>
                    <input
                      type="text"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">
                      Plate Number
                    </label>
                    <input
                      type="text"
                      value={carPlate}
                      onChange={(e) => setCarPlate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 font-mono font-bold text-slate-900 dark:text-slate-100 uppercase text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">
                      Color
                    </label>
                    <input
                      type="text"
                      value={carColor}
                      onChange={(e) => setCarColor(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Available Passenger Capacity
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCarSeats(num)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          carSeats === num
                            ? 'bg-[#0F766E] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl shadow-xs active:scale-[0.99] transition-all"
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
