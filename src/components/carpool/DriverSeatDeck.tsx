'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
  Users,
  ArrowLeft,
  Car,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Plus,
  Trash2,
  Sparkles,
  DollarSign,
  Building2,
  Navigation,
  X,
  Star,
  MessageCircle,
  Compass,
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
  } = useAppStore();

  const [copiedManifest, setCopiedManifest] = useState(false);
  const [showCarModal, setShowCarModal] = useState(false);
  const [selectedChatRider, setSelectedChatRider] = useState<any | null>(null);
  const [carMake, setCarMake] = useState(driverVehicle.make);
  const [carModel, setCarModel] = useState(driverVehicle.model);
  const [carPlate, setCarPlate] = useState(driverVehicle.plate_number);
  const [carYear, setCarYear] = useState(driverVehicle.year.toString());
  const [carColor, setCarColor] = useState(driverVehicle.color);
  const [carSeats, setCarSeats] = useState(driverVehicle.total_seats);

  const moodLabels = {
    chat: { label: '💬 Chat & Network', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    easy: { label: '☕ Easy Flow', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    quiet: { label: '🎧 Quiet & Unwind', bg: 'bg-stone-100 text-stone-700 border-stone-200' },
  };

  const totalSeats = driverVehicle.total_seats;
  const filledSeats = acceptedRiders.length;
  const currentSeatPrice = filledSeats === 0 ? 2000 : filledSeats === 1 ? 2000 : filledSeats === 2 ? 1400 : 1000;
  const totalFuelOffset = filledSeats === 0 ? 0 : filledSeats * currentSeatPrice;

  const handleAccept = (riderId: string) => {
    triggerHaptic('match');
    acceptRiderIntoCarpool(riderId);
    confetti({
      particleCount: 35,
      spread: 45,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#10B981', '#F59E0B'],
    });
  };

  const shareToWhatsApp = () => {
    triggerHaptic('success');
    const text = `*CAR PULL - DRIVER COMMUTE MANIFEST*
Direction: ${commuteDirection === 'morning' ? 'Morning Outbound' : 'Evening Return'} Commute
Status: Lagos State Transport Law Sec 44 Compliant

• Driver: ${user.fullName} (${user.employer})
• Vehicle: ${driverVehicle.make} ${driverVehicle.model} (${driverVehicle.color})
• Plate Number: ${driverVehicle.plate_number}
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

  return (
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in">
      {/* Top Driver Controls & Live Map Switcher */}
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-emerald-800 text-[10px]">Driver Mode Active</span>
        </div>

        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('map');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0D6E6E] to-[#094E4E] text-white text-xs font-black shadow-xs hover:shadow-sm active-press transition-all"
          title="View route and pickups on live corridor map"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-300" />
          <span>Live Route Map</span>
        </button>
      </div>

      {/* Driver Vehicle & Dynamic Seat Card */}
      <div className="bg-gradient-to-b from-purple-50/70 to-white rounded-3xl p-4 border border-[#DDD4C5] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-[#0D6E6E]">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-zinc-900">
                  {driverVehicle.make} {driverVehicle.model}
                </h3>
                <span className="text-[10px] font-mono font-bold bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700">
                  {driverVehicle.plate_number}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-zinc-500 font-medium">
                  {driverVehicle.color} • AC Active
                </span>
                <span className="text-zinc-300">•</span>
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setShowCarModal(true);
                  }}
                  className="text-[10px] font-bold text-[#0D6E6E] hover:underline active-press"
                >
                  Edit Car
                </button>
              </div>
            </div>
          </div>

          {/* Seat Availability Badge */}
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
              Open Seats
            </span>
            <span
              className={`text-base font-black ${
                availableSeats > 0 ? 'text-emerald-700' : 'text-purple-700'
              }`}
            >
              {availableSeats} of {totalSeats}
            </span>
          </div>
        </div>

        {/* Visual Seat Indicators */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {Array.from({ length: totalSeats }).map((_, idx) => {
            const isFilled = idx < filledSeats;
            const rider = acceptedRiders[idx];

            return (
              <div
                key={idx}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isFilled
                    ? 'bg-purple-50/80 border-purple-200 text-[#0D6E6E]'
                    : 'bg-zinc-50/70 border-zinc-200/80 text-zinc-400 border-dashed'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-black">
                  <Users className="w-3 h-3" />
                  <span>Seat {idx + 1}</span>
                </div>
                <span className="text-[9px] block truncate font-medium mt-0.5">
                  {isFilled ? rider.name.split(' ')[0] : 'Available'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Proration Fuel Split Bar */}
        <div className="pt-2 border-t border-purple-100/60 flex items-center justify-between text-[11px]">
          <div>
            <span className="text-[10px] text-zinc-400 block font-medium">Statutory Fuel Offset</span>
            <span className="text-sm font-black text-emerald-700">{formatNgn(totalFuelOffset)}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block font-medium">Split Per Passenger</span>
            <span className="text-sm font-black text-zinc-900">
              {filledSeats > 0 ? `${formatNgn(currentSeatPrice)}/seat` : '₦2,000 max'}
            </span>
          </div>

          {filledSeats > 0 && (
            <button
              onClick={shareToWhatsApp}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-[10px] font-bold shadow-2xs active-press transition-all ml-2"
              title="Broadcast trip manifest to WhatsApp"
            >
              <Share2 className="w-3 h-3" />
              <span>{copiedManifest ? 'Copied!' : 'WhatsApp'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmed Passengers in Carpool */}
      {acceptedRiders.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider">
              Confirmed Passengers ({acceptedRiders.length})
            </h4>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              Escrow Held
            </span>
          </div>

          <div className="space-y-1.5">
            {acceptedRiders.map((rider) => (
              <div
                key={rider.id}
                className="bg-white rounded-2xl p-3 border border-purple-100 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-[#0D6E6E] font-black text-xs flex items-center justify-center flex-shrink-0">
                    {rider.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 flex items-center gap-1">
                      {rider.name}
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 rounded font-medium">
                        @{rider.employer_domain}
                      </span>
                    </h5>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-[#0D6E6E]" />
                      {rider.pickupSafeZone.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-zinc-900">
                    {formatNgn(currentSeatPrice)}
                  </span>
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setActiveThreadId('thread-tiwa');
                      setActiveTab('chats');
                    }}
                    className="p-1.5 text-[#0D6E6E] hover:text-[#094E4E] rounded-lg hover:bg-teal-50 transition-colors active-press"
                    title="Chat with passenger"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#C25E2E]" />
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      removeRiderFromCarpool(rider.id);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors active-press"
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

      {/* Waiting Lagos Riders Pool */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider">
            Waiting at Corridor Safe Zones
          </h4>
          <span className="text-[10px] text-zinc-400">
            {corridorRiders.filter((r) => r.status === 'waiting').length} Verified Commuters
          </span>
        </div>

        <div className="space-y-2">
          {corridorRiders
            .filter((r) => r.status === 'waiting')
            .map((rider) => (
              <div
                key={rider.id}
                className="bg-white rounded-2xl p-3.5 border border-zinc-100 shadow-2xs space-y-2 hover:border-purple-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {rider.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-zinc-900 flex items-center gap-1">
                        {rider.name}
                        {rider.isFemaleOnly && (
                          <span className="text-[9px] bg-pink-50 text-pink-700 px-1.5 py-0.2 rounded font-bold">
                            Women
                          </span>
                        )}
                      </h5>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                        <Building2 className="w-3 h-3 text-zinc-400" />
                        <span>{rider.employer}</span>
                        <span className="flex items-center gap-0.5">• <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" /> {rider.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-[#0D6E6E] block">
                      +{formatNgn(rider.bidNgn)}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-medium">Fair Split Offer</span>
                  </div>
                </div>

                {/* Mutual Spark & Mood Indicators */}
                {(rider.mutual_spark || rider.ride_mood) && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {rider.mutual_spark && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#C25E2E] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/70">
                        <Sparkles className="w-2.5 h-2.5 text-[#C25E2E]" />
                        {rider.mutual_spark}
                      </span>
                    )}
                    {rider.ride_mood && moodLabels[rider.ride_mood] && (
                      <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full border ${moodLabels[rider.ride_mood].bg}`}>
                        {moodLabels[rider.ride_mood].label}
                      </span>
                    )}
                  </div>
                )}

                {/* Trip Purpose / Social Reason */}
                {rider.trip_purpose && (
                  <div className="bg-[#FAF7F0] border border-[#DDD4C5] px-2 py-1 rounded-xl flex items-center gap-1.5 text-xs text-[#141210]">
                    <Compass className="w-3.5 h-3.5 text-[#C25E2E] flex-shrink-0" />
                    <span className="text-[10px] font-semibold truncate">
                      {rider.trip_purpose}
                    </span>
                  </div>
                )}

                {/* Pickup & Destination */}
                <div className="bg-zinc-50 p-2 rounded-xl text-[10px] space-y-1 text-zinc-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span className="font-bold text-zinc-800">Pickup:</span>
                    <span className="truncate">{rider.pickupSafeZone.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#0D6E6E] flex-shrink-0" />
                    <span className="font-bold text-zinc-800">Drop:</span>
                    <span className="truncate">{rider.destination} ({rider.departure_time})</span>
                  </div>
                </div>

                {/* Social Vibes and Talk About Chips */}
                <div className="flex items-center gap-1 flex-wrap">
                  {rider.talk_about?.map((topic, idx) => (
                    <span key={idx} className="text-[8px] font-bold text-[#0D6E6E] bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100">
                      {topic}
                    </span>
                  ))}
                  {rider.interests?.slice(0, 2).map((item, idx) => (
                    <span key={idx} className="text-[8px] font-medium text-[#70665A] bg-stone-100 px-1 rounded">
                      #{item}
                    </span>
                  ))}
                </div>

                {rider.notes && (
                  <p className="text-[10px] text-zinc-400 italic px-1">"{rider.notes}"</p>
                )}

                {/* Action Buttons: Say Hello & Accept Passenger */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      setSelectedChatRider(rider);
                    }}
                    className="py-2 bg-white hover:bg-amber-50 text-[#0D6E6E] border border-[#DDD4C5] text-xs font-bold rounded-xl shadow-2xs active-press transition-all flex items-center justify-center gap-1"
                    title="Say hello to rider"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#C25E2E]" />
                    <span>Chat</span>
                  </button>
                  <button
                    onClick={() => handleAccept(rider.id)}
                    disabled={availableSeats <= 0}
                    className="col-span-2 py-2 bg-[#0D6E6E] hover:bg-[#094E4E] disabled:bg-zinc-100 disabled:text-zinc-400 text-white text-xs font-bold rounded-xl shadow-2xs active-press transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {availableSeats > 0
                        ? `Accept (${availableSeats} Left)`
                        : 'Capacity Full'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Edit / Register Car Modal */}
      {showCarModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[360px] bg-white rounded-3xl p-5 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setShowCarModal(false);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#141210] font-bold text-xs shadow-2xs active-press transition-all"
                  title="Go back"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E]" />
                  <span>Back</span>
                </button>
                <h3 className="text-sm font-serif font-black text-zinc-900 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-[#0D6E6E]" />
                  Car Details
                </h3>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setShowCarModal(false);
                }}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center font-bold text-xs active-press"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerHaptic('success');
                updateDriverCar({
                  make: carMake.trim() || 'Toyota',
                  model: carModel.trim() || 'Corolla',
                  year: parseInt(carYear) || 2022,
                  color: carColor.trim() || 'Silver',
                  plate_number: carPlate.trim().toUpperCase() || 'APP-842-EY',
                  total_seats: Number(carSeats) || 3,
                });
                setShowCarModal(false);
                confetti({
                  particleCount: 30,
                  spread: 60,
                  origin: { y: 0.7 },
                  colors: ['#7C3AED', '#10B981', '#F59E0B'],
                });
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Car Brand / Make</label>
                  <input
                    type="text"
                    value={carMake}
                    onChange={(e) => setCarMake(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 font-bold text-zinc-900 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Model</label>
                  <input
                    type="text"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 font-bold text-zinc-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-purple-900 block mb-0.5">Plate Number *</label>
                <input
                  type="text"
                  value={carPlate}
                  onChange={(e) => setCarPlate(e.target.value)}
                  className="w-full bg-purple-50 border-2 border-[#7C3AED] rounded-xl px-2.5 py-1.5 font-mono font-black text-purple-900 uppercase focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Year</label>
                  <input
                    type="text"
                    value={carYear}
                    onChange={(e) => setCarYear(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 font-bold text-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block mb-0.5">Color</label>
                  <input
                    type="text"
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 font-bold text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 block mb-1">Available Passenger Seats</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        triggerHaptic('switch');
                        setCarSeats(num);
                      }}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all active-press ${
                        carSeats === num
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs rounded-xl shadow-md transition-all active-press mt-2"
              >
                Save & Update Vehicle
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
