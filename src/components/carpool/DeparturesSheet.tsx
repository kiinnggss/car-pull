'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
  Clock,
  Car,
  Users,
  ShieldCheck,
  ArrowLeft,
  X,
  ArrowRight,
} from 'lucide-react';

interface DeparturesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeparturesSheet: React.FC<DeparturesSheetProps> = ({ isOpen, onClose }) => {
  const { drivers, selectDriverById, currentDriver, commuteDirection } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Back button integration: hardware or browser back navigates back a step
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: 'departures' }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleBack = () => {
    if (window.history.state?.modal === 'departures') {
      window.history.back();
    } else {
      onClose();
    }
  };

  // Distinct departure times
  const timeSlots = Array.from(new Set(drivers.map((d) => d.corridor.departure_time)));

  const filteredDrivers = selectedTimeFilter === 'all'
    ? drivers
    : drivers.filter((d) => d.corridor.departure_time === selectedTimeFilter);

  return createPortal(
    <div className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-xs overflow-y-auto p-2 sm:p-3 overscroll-contain flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-[420px] bg-white dark:bg-[#12161A] rounded-t-3xl sm:rounded-3xl p-4 space-y-3 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[88vh] flex flex-col my-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Header with Step-Back Navigation */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-bold text-xs transition-all active:scale-95 shadow-2xs"
            title="Return to corridor deck"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#F58A25]" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Corridor Schedule
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
              Flexible Timetable &amp; Community Rides
            </span>
          </div>

          <button
            onClick={handleBack}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Time Slot Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedTimeFilter('all')}
            className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all text-xs ${
              selectedTimeFilter === 'all'
                ? 'bg-[#0F766E] text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            All Departures ({drivers.length})
          </button>
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTimeFilter(time)}
              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all text-xs ${
                selectedTimeFilter === time
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              {time}
            </button>
          ))}
        </div>

        {/* Departure Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          {filteredDrivers.map((driver) => {
            const isSelected = currentDriver?.id === driver.id;

            return (
              <div
                key={driver.id}
                className={`bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border transition-all ${
                  isSelected
                    ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Time & Cost Header */}
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#0F766E] dark:text-[#14B8A6] bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                      {driver.corridor.departure_time}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6]" />
                      {driver.corridor.available_seats} seats left
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {formatNgn(driver.corridor.fuel_split_ngn)}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
                      Fair Split
                    </span>
                  </div>
                </div>

                {/* Driver Info & Vehicle Plate */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                      <span>{driver.name.split(' ').map((n) => n[0]).join('')}</span>
                      <img
                        src={driver.avatar}
                        alt={driver.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {driver.name}
                        </h4>
                        <ShieldCheck className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6]" />
                      </div>
                      <span className="text-[10px] font-semibold text-[#0F766E] dark:text-[#14B8A6] block">
                        {driver.employer}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle & Plate Tag */}
                  <div className="text-right text-xs">
                    <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold text-[11px]">
                      <Car className="w-3 h-3 text-slate-400" />
                      <span>{driver.vehicle.make} {driver.vehicle.model}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-[#F58A25] bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/60 inline-block mt-0.5">
                      {driver.vehicle.plate_number}
                    </span>
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      selectDriverById(driver.id);
                      onClose();
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.99] ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-[#14B8A6] border border-[#0F766E]/40 font-bold'
                        : 'bg-[#0F766E] hover:bg-[#0D655E] text-white'
                    }`}
                  >
                    <span>{isSelected ? 'Active On Your Deck' : `Select & View Profile`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Muted Legal Notice */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-center text-[10px] text-slate-500 dark:text-slate-400">
          <span>Lagos State Transport Reform Act (Sec 44): Non-Commercial Commute</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
