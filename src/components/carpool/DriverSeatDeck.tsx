'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
  Users,
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DriverSeatDeck: React.FC = () => {
  const {
    user,
    driverVehicle,
    availableSeats,
    corridorRiders,
    acceptedRiders,
    acceptRiderIntoCarpool,
    removeRiderFromCarpool,
    commuteDirection,
    offlinePin,
    setActiveTab,
  } = useAppStore();

  const [copiedManifest, setCopiedManifest] = useState(false);

  const totalSeats = driverVehicle.total_seats;
  const filledSeats = acceptedRiders.length;
  const currentSeatPrice = filledSeats === 0 ? 2000 : filledSeats === 1 ? 2000 : filledSeats === 2 ? 1400 : 1000;
  const totalFuelOffset = filledSeats === 0 ? 0 : filledSeats * currentSeatPrice;

  const handleAccept = (riderId: string) => {
    acceptRiderIntoCarpool(riderId);
    confetti({
      particleCount: 35,
      spread: 45,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#10B981', '#F59E0B'],
    });
  };

  const shareToWhatsApp = () => {
    const text = `🚗 *CAR PULL - DRIVER COMMUTE MANIFEST*
📅 ${commuteDirection === 'morning' ? 'Morning Outbound' : 'Evening Return'} Commute
🛡️ *Status:* Lagos State Transport Law Sec 44 Compliant

👤 *Driver:* ${user.fullName} (${user.employer})
🚘 *Vehicle:* ${driverVehicle.make} ${driverVehicle.model} (${driverVehicle.color})
🔢 *Plate Number:* ${driverVehicle.plate_number}
🔑 *Offline Pickup PIN:* ${offlinePin}
💺 *Capacity:* ${filledSeats}/${totalSeats} Seats Filled (Offset: ${formatNgn(totalFuelOffset)})

👥 *Confirmed Passengers:*
${acceptedRiders.map((r, i) => `${i + 1}. ${r.name} (${r.employer}) - ${r.pickupSafeZone.name}`).join('\n')}

*CAR PULL Zero-Cash Escrow Active*`;

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
          onClick={() => setActiveTab('map')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-xs font-black shadow-xs hover:shadow-sm active:scale-95 transition-all"
          title="View route and pickups on live corridor map"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-300" />
          <span>Live Route Map</span>
        </button>
      </div>

      {/* Driver Vehicle & Dynamic Seat Card */}
      <div className="bg-gradient-to-b from-purple-50/70 to-white rounded-3xl p-4 border border-purple-100/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-[#7C3AED]">
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
              <span className="text-[10px] text-zinc-500 font-medium">
                {driverVehicle.color} • AC Active • {commuteDirection === 'morning' ? 'Ajah ➔ VI' : 'VI ➔ Ajah'}
              </span>
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
                    ? 'bg-purple-50/80 border-purple-200 text-[#7C3AED]'
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
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-[10px] font-bold shadow-2xs active:scale-95 transition-all ml-2"
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
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-[#7C3AED] font-black text-xs flex items-center justify-center flex-shrink-0">
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
                      <MapPin className="w-2.5 h-2.5 text-[#7C3AED]" />
                      {rider.pickupSafeZone.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-zinc-900">
                    {formatNgn(currentSeatPrice)}
                  </span>
                  <button
                    onClick={() => removeRiderFromCarpool(rider.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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

      {/* Waiting Corporate Riders Pool */}
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
                        <span>• ★ {rider.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-[#7C3AED] block">
                      +{formatNgn(rider.bidNgn)}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-medium">Fair Split Offer</span>
                  </div>
                </div>

                {/* Pickup & Destination */}
                <div className="bg-zinc-50 p-2 rounded-xl text-[10px] space-y-1 text-zinc-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span className="font-bold text-zinc-800">Pickup:</span>
                    <span className="truncate">{rider.pickupSafeZone.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#7C3AED] flex-shrink-0" />
                    <span className="font-bold text-zinc-800">Drop:</span>
                    <span className="truncate">{rider.destination} ({rider.departure_time})</span>
                  </div>
                </div>

                {rider.notes && (
                  <p className="text-[10px] text-zinc-400 italic px-1">"{rider.notes}"</p>
                )}

                {/* Accept Passenger CTA */}
                <button
                  onClick={() => handleAccept(rider.id)}
                  disabled={availableSeats <= 0}
                  className="w-full py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-zinc-100 disabled:text-zinc-400 text-white text-xs font-bold rounded-xl shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {availableSeats > 0
                      ? `Accept Passenger (${availableSeats} Seat${availableSeats > 1 ? 's' : ''} Left)`
                      : 'Car Capacity Full'}
                  </span>
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
