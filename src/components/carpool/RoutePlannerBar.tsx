'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { LagosLocation } from '@/lib/types';
import {
  MapPin,
  ArrowRightLeft,
  Search,
  ChevronDown,
  Clock,
  Car,
  ShieldCheck,
  ArrowLeft,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SafeZoneSelector } from './SafeZoneSelector';
import { DeparturesSheet } from './DeparturesSheet';
import { triggerHaptic } from '@/lib/haptics';

export const RoutePlannerBar: React.FC = () => {
  const {
    riderRoute,
    setRiderOrigin,
    setRiderDestination,
    swapRiderRoute,
    lagosLocations,
    selectedSafeZone,
    drivers,
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSafeZoneModal, setShowSafeZoneModal] = useState(false);
  const [showDeparturesSheet, setShowDeparturesSheet] = useState(false);
  const [originQuery, setOriginQuery] = useState(riderRoute.origin);
  const [destQuery, setDestQuery] = useState(riderRoute.destination);
  const [activeInput, setActiveInput] = useState<'origin' | 'dest'>('origin');

  // Back button support for Route Planner modal
  useEffect(() => {
    if (!isModalOpen && !showSafeZoneModal) return;

    window.history.pushState({ modal: isModalOpen ? 'route' : 'safezone' }, '');

    const handlePopState = () => {
      setIsModalOpen(false);
      setShowSafeZoneModal(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isModalOpen, showSafeZoneModal]);

  const filteredOrigins = lagosLocations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(originQuery.toLowerCase()) ||
      loc.area.toLowerCase().includes(originQuery.toLowerCase())
  );

  const filteredDestinations = lagosLocations.filter(
    (loc) =>
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

  const handleApplyRoute = () => {
    if (originQuery.trim()) setRiderOrigin(originQuery);
    if (destQuery.trim()) setRiderDestination(destQuery);
    setIsModalOpen(false);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#0D6E6E', '#D97706', '#7C3AED'],
    });
  };

  return (
    <>
      {/* Sleek Native Executive Transit Capsule (44px) */}
      <div className="w-full bg-white rounded-2xl shadow-2xs border border-[#DDD4C5] p-2 flex items-center justify-between gap-1.5 text-xs transition-all">
        {/* Left: Route Summary & Hub (Tap to edit route) */}
        <button
          onClick={() => {
            triggerHaptic('tap');
            setOriginQuery(riderRoute.origin);
            setDestQuery(riderRoute.destination);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 text-left hover:bg-[#F8F5EE] p-1.5 rounded-xl min-w-0 flex-1 transition-colors active-press"
          title="Tap to change commute route"
        >
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#0D6E6E] ring-2 ring-teal-100" />
            <span className="text-[#DDD4C5] text-[10px] font-bold">➔</span>
            <span className="w-2 h-2 rounded-full bg-[#C25E2E] ring-2 ring-amber-100" />
          </div>

          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1">
              <span className="font-serif font-black text-xs text-[#141210] truncate">
                {riderRoute.origin.split('/')[0].trim()} ➔ {riderRoute.destination.split('(')[0].trim()}
              </span>
              <ChevronDown className="w-3 h-3 text-[#70665A] flex-shrink-0" />
            </div>
            <span className="text-[10px] text-[#70665A] font-semibold truncate block">
              Hub: <strong className="text-[#0D6E6E]">{selectedSafeZone.name}</strong> • {riderRoute.distanceKm}km
            </span>
          </div>
        </button>

        {/* Right: Departures & Hub Switch Shortcuts */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowDeparturesSheet(true);
            }}
            className="flex items-center gap-1 text-[#0D6E6E] hover:text-[#094E4E] bg-teal-50 hover:bg-teal-100/70 px-2.5 py-1.5 rounded-xl border border-teal-200/80 font-bold text-[10.5px] active-press shadow-2xs"
            title="Browse corridor departures schedule"
          >
            <Clock className="w-3.5 h-3.5 text-[#C25E2E]" />
            <span>{drivers.length} Dep</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowSafeZoneModal(true);
            }}
            className="p-1.5 rounded-xl bg-[#F8F5EE] hover:bg-teal-50 text-[#0D6E6E] border border-[#DDD4C5] active-press shadow-2xs"
            title="Change CCTV Safe Hub"
          >
            <ShieldCheck className="w-4 h-4 text-[#0D6E6E]" />
          </button>
        </div>
      </div>

      {/* Location Modal with Back Button */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] bg-[#FAF8F3] rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-[#DDD5C7] max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between border-b border-[#DDD5C7] pb-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#141210] shadow-2xs active:scale-95 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E]" />
                <span>Back</span>
              </button>
              <div className="text-center">
                <h3 className="text-sm font-serif font-black text-[#141210]">Set Route</h3>
                <p className="text-[10px] text-[#70665A]">Ajah → Victoria Island Expressway</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white border border-[#DDD5C7] text-stone-700 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inputs & Quick Selection */}
            <div className="space-y-2 py-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#70665A] uppercase tracking-wider block">
                  Pickup Origin
                </label>
                <div className="flex items-center gap-2 bg-white border border-[#DDD5C7] rounded-xl px-2.5 py-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0D6E6E]" />
                  <input
                    type="text"
                    value={originQuery}
                    onChange={(e) => {
                      setOriginQuery(e.target.value);
                      setActiveInput('origin');
                    }}
                    placeholder="Enter pickup point..."
                    className="w-full bg-transparent text-xs font-bold text-[#141210] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#70665A] uppercase tracking-wider block">
                  Destination
                </label>
                <div className="flex items-center gap-2 bg-white border border-[#DDD5C7] rounded-xl px-2.5 py-1.5">
                  <Car className="w-3.5 h-3.5 text-[#C25E2E]" />
                  <input
                    type="text"
                    value={destQuery}
                    onChange={(e) => {
                      setDestQuery(e.target.value);
                      setActiveInput('dest');
                    }}
                    placeholder="Enter destination..."
                    className="w-full bg-transparent text-xs font-bold text-[#141210] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Suggested Lagos Locations */}
            <div className="flex-1 overflow-y-auto space-y-1 py-1 max-h-[220px]">
              <span className="text-[9px] font-bold text-[#70665A] uppercase tracking-wider block px-1">
                Verified Corridor Landmarks:
              </span>
              {(activeInput === 'origin' ? filteredOrigins : filteredDestinations).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc, activeInput)}
                  className="w-full p-2 rounded-xl bg-white hover:bg-teal-50 border border-[#DDD5C7] text-left flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-[#141210] block">{loc.name}</span>
                    <span className="text-[10px] text-[#70665A]">{loc.area}</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#0D6E6E] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Select
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleApplyRoute}
              className="w-full mt-3 py-2.5 bg-[#0D6E6E] hover:bg-[#094E4E] text-white font-bold text-xs rounded-xl shadow-xs active:scale-[0.99] transition-all"
            >
              Update Commute Route
            </button>
          </div>
        </div>
      )}

      {/* Safe Zone Picker Modal with Back Button */}
      {showSafeZoneModal && (
        <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] bg-[#FAF8F3] rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-[#DDD5C7] max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-[#DDD5C7] pb-2.5">
              <button
                onClick={() => setShowSafeZoneModal(false)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#141210] shadow-2xs active:scale-95 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E]" />
                <span>Back</span>
              </button>
              <h3 className="text-xs font-serif font-black text-[#141210] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D6E6E]" />
                CCTV Safe Pickup Hubs
              </h3>
              <button
                onClick={() => setShowSafeZoneModal(false)}
                className="w-7 h-7 rounded-full bg-white border border-[#DDD5C7] text-stone-700 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <SafeZoneSelector />
            </div>
            <button
              onClick={() => setShowSafeZoneModal(false)}
              className="w-full mt-2 py-2.5 bg-[#0D6E6E] text-white font-bold text-xs rounded-xl shadow-xs active:scale-[0.99] transition-all"
            >
              Confirm Safe Zone Hub
            </button>
          </div>
        </div>
      )}

      {/* Calm Drawer: Corridor Departures Sheet */}
      <DeparturesSheet
        isOpen={showDeparturesSheet}
        onClose={() => setShowDeparturesSheet(false)}
      />
    </>
  );
};
