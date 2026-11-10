'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { LagosLocation } from '@/lib/types';
import {
  MapPin,
  ChevronDown,
  Clock,
  Car,
  ShieldCheck,
  ArrowLeft,
  X,
  ArrowRight,
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
      colors: ['#0F766E', '#D97706', '#14B8A6'],
    });
  };

  return (
    <>
      {/* Corridor Transit Console Bar */}
      <div className="w-full floating-surface rounded-2xl p-2 flex items-center justify-between gap-2 text-xs">
        {/* Left: Route Summary & Safe Hub */}
        <button
          onClick={() => {
            triggerHaptic('tap');
            setOriginQuery(riderRoute.origin);
            setDestQuery(riderRoute.destination);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/5 px-2 py-1 rounded-xl min-w-0 flex-1 transition-colors active-spring"
          title="Change commute corridor"
        >
          {/* Connected Transit Nodes */}
          <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#14B8A6]" />
            <span className="w-px h-2.5 bg-slate-300 dark:bg-slate-700" />
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight truncate">
                {riderRoute.origin.split('/')[0].trim()}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight truncate">
                {riderRoute.destination.split('(')[0].trim()}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              <span className="truncate">
                Hub: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{selectedSafeZone.name}</strong>
              </span>
              <span className="font-mono tabular-nums text-slate-400 dark:text-slate-500 flex-shrink-0">
                ({riderRoute.distanceKm} km)
              </span>
            </div>
          </div>
        </button>

        {/* Right: Timetable & Safe Hub Selector */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowDeparturesSheet(true);
            }}
            className="flex items-center gap-1 bg-slate-100 dark:bg-[#161F29] hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/8 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-xl font-bold text-[11px] active-spring"
            title="View corridor timetable"
          >
            <Clock className="w-3 h-3 text-amber-500" />
            <span className="font-mono tabular-nums text-[#0F766E] dark:text-[#14B8A6]">{drivers.length}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setShowSafeZoneModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6] text-[11px] font-bold active-spring"
            title="Change CCTV Safe Pickup Hub"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hub</span>
          </button>
        </div>
      </div>

      {/* Route Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[410px] floating-surface rounded-2xl p-4 shadow-floating-lg dark:shadow-floating-dark-lg max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 active-spring"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Back</span>
              </button>
              <div className="text-center">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Set Commute Corridor</h3>
                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Ajah - Lekki - VI - Marina</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 py-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Pickup Origin
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#090D11] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus-within:border-[#0F766E] dark:focus-within:border-[#14B8A6]">
                  <MapPin className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <input
                    type="text"
                    value={originQuery}
                    onChange={(e) => {
                      setOriginQuery(e.target.value);
                      setActiveInput('origin');
                    }}
                    placeholder="Enter pickup origin..."
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Destination
                </label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#090D11] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 focus-within:border-[#0F766E] dark:focus-within:border-[#14B8A6]">
                  <Car className="w-3.5 h-3.5 text-amber-500" />
                  <input
                    type="text"
                    value={destQuery}
                    onChange={(e) => {
                      setDestQuery(e.target.value);
                      setActiveInput('dest');
                    }}
                    placeholder="Enter destination..."
                    className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 py-1 max-h-[220px]">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block px-1 mb-1">
                Verified Corridor Landmarks
              </span>
              {(activeInput === 'origin' ? filteredOrigins : filteredDestinations).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc, activeInput)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#090D11] hover:bg-teal-500/10 border border-slate-200/70 dark:border-white/5 text-left flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{loc.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{loc.area}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0F766E] dark:text-[#14B8A6] bg-teal-500/10 px-2.5 py-0.5 rounded-md">
                    Select
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleApplyRoute}
              className="w-full mt-3 py-2.5 btn-electric-mint text-xs rounded-xl active-spring"
            >
              Update Commute Route
            </button>
          </div>
        </div>
      )}

      {/* Safe Zone Picker Modal */}
      {showSafeZoneModal && (
        <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[410px] floating-surface rounded-2xl p-4 shadow-floating-lg dark:shadow-floating-dark-lg max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-white/8">
              <button
                onClick={() => setShowSafeZoneModal(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 active-spring"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Back</span>
              </button>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                CCTV Safe Pickup Hubs
              </h3>
              <button
                onClick={() => setShowSafeZoneModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2.5">
              <SafeZoneSelector />
            </div>
            <button
              onClick={() => setShowSafeZoneModal(false)}
              className="w-full mt-2 py-2.5 btn-electric-mint text-xs rounded-xl active-spring"
            >
              Confirm Safe Zone Hub
            </button>
          </div>
        </div>
      )}

      {/* Corridor Departures Sheet */}
      <DeparturesSheet
        isOpen={showDeparturesSheet}
        onClose={() => setShowDeparturesSheet(false)}
      />
    </>
  );
};
