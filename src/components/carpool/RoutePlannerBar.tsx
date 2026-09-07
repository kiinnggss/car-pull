'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { LagosLocation } from '@/lib/types';
import {
  MapPin,
  Navigation,
  ArrowRightLeft,
  Search,
  Crosshair,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  X,
  Clock,
  Sparkles,
  Car,
} from 'lucide-react';
import { formatNgn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export const RoutePlannerBar: React.FC = () => {
  const {
    riderRoute,
    setRiderOrigin,
    setRiderDestination,
    swapRiderRoute,
    lagosLocations,
    selectedSafeZone,
    setActiveTab,
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originQuery, setOriginQuery] = useState(riderRoute.origin);
  const [destQuery, setDestQuery] = useState(riderRoute.destination);
  const [activeInput, setActiveInput] = useState<'origin' | 'dest'>('origin');
  const [gpsLoading, setGpsLoading] = useState(false);

  // Filter locations based on active input query
  const filteredOrigins = lagosLocations.filter((loc) =>
    loc.name.toLowerCase().includes(originQuery.toLowerCase()) ||
    loc.area.toLowerCase().includes(originQuery.toLowerCase())
  );

  const filteredDestinations = lagosLocations.filter((loc) =>
    loc.name.toLowerCase().includes(destQuery.toLowerCase()) ||
    loc.area.toLowerCase().includes(destQuery.toLowerCase())
  );

  const handleSelectLocation = (loc: LagosLocation, type: 'origin' | 'dest') => {
    if (type === 'origin') {
      setOriginQuery(loc.name);
      setRiderOrigin(loc.name, loc.coordinates);
      setActiveInput('dest');
    } else {
      setDestQuery(loc.name);
      setRiderDestination(loc.name, loc.coordinates);
    }
  };

  const handleCurrentLocationGps = () => {
    setGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLoading(false);
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const label = 'Current Location (GPS)';
          setOriginQuery(label);
          setRiderOrigin(label, coords);
        },
        () => {
          // Fallback to closest high-fidelity Lekki corridor coordinates
          setGpsLoading(false);
          const fallback = lagosLocations[0];
          setOriginQuery(fallback.name);
          setRiderOrigin(fallback.name, fallback.coordinates);
        },
        { timeout: 5000 }
      );
    } else {
      setGpsLoading(false);
      const fallback = lagosLocations[0];
      setOriginQuery(fallback.name);
      setRiderOrigin(fallback.name, fallback.coordinates);
    }
  };

  const handleApplyRoute = () => {
    if (originQuery.trim()) {
      setRiderOrigin(originQuery);
    }
    if (destQuery.trim()) {
      setRiderDestination(destQuery);
    }
    setIsModalOpen(false);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#7C3AED', '#F59E0B', '#10B981'],
    });
  };

  return (
    <>
      {/* Sleek Floating Route Header Bar (Pill) */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-xs border border-zinc-200/90 text-xs">
        <div className="flex items-center justify-between gap-1.5">
          {/* Origin & Destination Display */}
          <button
            onClick={() => {
              setOriginQuery(riderRoute.origin);
              setDestQuery(riderRoute.destination);
              setIsModalOpen(true);
            }}
            className="flex-1 flex items-center gap-2 overflow-hidden text-left hover:bg-zinc-50 p-1.5 rounded-xl transition-colors"
          >
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></span>
              <span className="w-0.5 h-2.5 bg-zinc-300"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] ring-2 ring-purple-100"></span>
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-900 truncate">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">FROM:</span>
                <span className="truncate">{riderRoute.origin}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-black text-purple-900 truncate">
                <span className="text-[9px] text-purple-400 font-extrabold uppercase tracking-wider">TO:</span>
                <span className="truncate">{riderRoute.destination}</span>
              </div>
            </div>

            <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          </button>

          {/* Quick Swap Direction Button */}
          <button
            onClick={swapRiderRoute}
            className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-purple-50 hover:text-[#7C3AED] text-zinc-600 flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
            title="Swap Origin and Destination"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Route Meta & Distance Summary */}
        <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-zinc-100 text-[10px]">
          <span className="text-zinc-500 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            {riderRoute.distanceKm} km • ~{riderRoute.estimatedMinutes} mins
          </span>
          <span className="text-[#7C3AED] font-extrabold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            Fair Split: ₦{riderRoute.recommendedFuelSplitNgn.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Interactive Location & Destination Modal / Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-zinc-200 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-zinc-900">Set Your Route</h3>
                <p className="text-[10px] text-zinc-500">
                  Choose where you are leaving from and where you want to go
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Fields */}
            <div className="my-3 space-y-2.5">
              {/* Pickup Origin Input */}
              <div
                className={`p-2.5 rounded-2xl border transition-all ${
                  activeInput === 'origin'
                    ? 'border-[#7C3AED] bg-purple-50/40 ring-2 ring-[#7C3AED]/20'
                    : 'border-zinc-200 bg-zinc-50'
                }`}
                onClick={() => setActiveInput('origin')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Pickup Location (Where from?)
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCurrentLocationGps();
                    }}
                    disabled={gpsLoading}
                    className="text-[10px] font-bold text-[#7C3AED] hover:underline flex items-center gap-1"
                  >
                    <Crosshair className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                    <span>{gpsLoading ? 'Locating...' : 'Use Current GPS'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <input
                    type="text"
                    value={originQuery}
                    onChange={(e) => setOriginQuery(e.target.value)}
                    onFocus={() => setActiveInput('origin')}
                    placeholder="e.g. Ajah, VGC, Jakande, Sangotedo..."
                    className="w-full bg-transparent text-xs font-bold text-zinc-900 focus:outline-none"
                  />
                  {originQuery && (
                    <button
                      onClick={() => setOriginQuery('')}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Destination Dropoff Input */}
              <div
                className={`p-2.5 rounded-2xl border transition-all ${
                  activeInput === 'dest'
                    ? 'border-[#7C3AED] bg-purple-50/40 ring-2 ring-[#7C3AED]/20'
                    : 'border-zinc-200 bg-zinc-50'
                }`}
                onClick={() => setActiveInput('dest')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7C3AED] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
                    Destination (Where to?)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                  <input
                    type="text"
                    value={destQuery}
                    onChange={(e) => setDestQuery(e.target.value)}
                    onFocus={() => setActiveInput('dest')}
                    placeholder="e.g. Victoria Island, Marina CMS, Ikoyi Falomo..."
                    className="w-full bg-transparent text-xs font-bold text-zinc-900 focus:outline-none"
                  />
                  {destQuery && (
                    <button
                      onClick={() => setDestQuery('')}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Popular Quick Suggestions Chips */}
            <div className="mb-2">
              <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-1.5 px-0.5">
                Popular {activeInput === 'origin' ? 'Pickup Points' : 'Destinations'}:
              </span>
              <div className="flex flex-wrap gap-1">
                {lagosLocations
                  .filter((loc) =>
                    activeInput === 'origin' ? loc.isPopularPickup : loc.isPopularDropoff
                  )
                  .slice(0, 8)
                  .map((loc) => {
                    let label = loc.name.split('/')[0].split('(')[0].trim();
                    if (loc.name.includes('Falomo')) label = 'Ikoyi / Falomo';
                    else if (loc.name.includes('Marina')) label = 'Marina CMS';
                    else if (loc.name.includes('Civic')) label = 'VI / Civic Center';
                    else if (loc.name.includes('Eko Hotel')) label = 'VI / Eko Hotel';
                    else if (loc.name.includes('Jakande')) label = 'Jakande Roundabout';
                    else if (loc.name.includes('VGC')) label = 'VGC Security Bay';
                    return (
                      <button
                        key={loc.id}
                        onClick={() => handleSelectLocation(loc, activeInput)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-purple-100 hover:text-[#7C3AED] text-zinc-700 border border-zinc-200/80 transition-colors"
                      >
                        {label}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Location Autocomplete List */}
            <div className="flex-1 overflow-y-auto max-h-[160px] divide-y divide-zinc-100 pr-1">
              {(activeInput === 'origin' ? filteredOrigins : filteredDestinations).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc, activeInput)}
                  className="w-full py-2 px-1 flex items-center justify-between text-left hover:bg-zinc-50 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#7C3AED]" />
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block leading-tight">
                        {loc.name}
                      </span>
                      <span className="text-[9px] text-zinc-500 block">{loc.area}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#7C3AED] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Select
                  </span>
                </button>
              ))}
            </div>

            {/* Nearest Safe Zone Banner */}
            <div className="my-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-2.5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="text-[10px] leading-tight">
                <span className="font-extrabold text-emerald-900 block">
                  CCTV Safe Zone Pickups Active
                </span>
                <span className="text-emerald-700">
                  Off-street boarding at verified stations with 24/7 security.
                </span>
              </div>
            </div>

            {/* Confirm & Find Matches CTA Button */}
            <button
              onClick={handleApplyRoute}
              className="w-full py-3 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] active:scale-98 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#7C3AED]/25 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Confirm Route & Match Drivers</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
