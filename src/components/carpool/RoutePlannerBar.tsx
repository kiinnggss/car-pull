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
      colors: ['#0F766E', '#F58A25', '#14B8A6'],
    });
  };

  return (
    <>
      {/* Sleek Native Executive Transit Capsule (VisionOS Liquid Glass) */}
      {/* Sleek Corridor Transit Capsule */}
      <div className="w-full bg-white dark:bg-[#12161A] rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-1.5 flex items-center justify-between gap-1.5 text-xs transition-all">
        {/* Left: Route Summary & Hub (Tap to edit route) */}
        <button
          onClick={() => {
            triggerHaptic('tap');
            setOriginQuery(riderRoute.origin);
            setDestQuery(riderRoute.destination);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 p-1 rounded-xl min-w-0 flex-1 transition-colors active:scale-98"
          title="Tap to change commute route"
        >
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <span className="text-slate-300 dark:text-slate-600 text-[10px] font-bold">➔</span>
            <span className="w-2 h-2 rounded-full bg-[#F58A25]" />
          </div>

          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {riderRoute.origin.split('/')[0].trim()} ➔ {riderRoute.destination.split('(')[0].trim()}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate block">
              Via <strong className="text-slate-700 dark:text-slate-300 font-semibold">{selectedSafeZone.name}</strong> • {riderRoute.distanceKm}km
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
            className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 px-2.5 py-1 rounded-xl font-medium text-[11px] active:scale-95 transition-all shadow-xs"
            title="Browse corridor departures schedule"
          >
            <Clock className="w-3 h-3 text-[#F58A25]" />
            <span className="font-bold text-[#0F766E] dark:text-[#14B8A6]">{drivers.length} rides</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowSafeZoneModal(true);
            }}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 active:scale-95 transition-all shadow-xs"
            title="CCTV Safe Hub Security"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
          </button>
        </div>
      </div>

      {/* Location Modal with Back Button */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] bg-white dark:bg-[#12161A] backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs active:scale-95 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#F58A25]" />
                <span>Back</span>
              </button>
              <div className="text-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Set Route</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Ajah ➔ Victoria Island Corridor</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inputs & Quick Selection */}
            <div className="space-y-2 py-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Pickup Origin
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <input
                    type="text"
                    value={originQuery}
                    onChange={(e) => {
                      setOriginQuery(e.target.value);
                      setActiveInput('origin');
                    }}
                    placeholder="Enter pickup point..."
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Destination
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
                  <Car className="w-3.5 h-3.5 text-[#F58A25]" />
                  <input
                    type="text"
                    value={destQuery}
                    onChange={(e) => {
                      setDestQuery(e.target.value);
                      setActiveInput('dest');
                    }}
                    placeholder="Enter destination..."
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Suggested Lagos Locations */}
            <div className="flex-1 overflow-y-auto space-y-1 py-1 max-h-[220px]">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block px-1">
                Verified Corridor Landmarks:
              </span>
              {(activeInput === 'origin' ? filteredOrigins : filteredDestinations).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc, activeInput)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-teal-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{loc.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{loc.area}</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#0F766E] dark:text-[#14B8A6] bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    Select
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleApplyRoute}
              className="w-full mt-3 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl shadow-xs active:scale-[0.99] transition-all"
            >
              Update Commute Route
            </button>
          </div>
        </div>
      )}

      {/* Safe Zone Picker Modal with Back Button */}
      {showSafeZoneModal && (
        <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] bg-white dark:bg-[#12161A] backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <button
                onClick={() => setShowSafeZoneModal(false)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs active:scale-95 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#F58A25]" />
                <span>Back</span>
              </button>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                CCTV Safe Pickup Hubs
              </h3>
              <button
                onClick={() => setShowSafeZoneModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <SafeZoneSelector />
            </div>
            <button
              onClick={() => setShowSafeZoneModal(false)}
              className="w-full mt-2 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl shadow-xs active:scale-[0.99] transition-all"
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
