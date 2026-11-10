'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
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
  const { drivers, selectDriverById, currentDriver } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const timeSlots = Array.from(new Set(drivers.map((d) => d.corridor.departure_time)));

  const filteredDrivers =
    selectedTimeFilter === 'all'
      ? drivers
      : drivers.filter((d) => d.corridor.departure_time === selectedTimeFilter);

  return createPortal(
    <div className="fixed inset-0 z-[600] bg-slate-950/70 backdrop-blur-xs overflow-y-auto p-2 sm:p-3 overscroll-contain flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-[410px] floating-surface rounded-2xl p-4 space-y-3.5 max-h-[88vh] flex flex-col my-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header with Step-Back Navigation */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-white/8">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-100 font-bold text-xs transition-all active-press"
            title="Return to corridor deck"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Corridor Schedule
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold block">
              VERIFIED TIMETABLE
            </span>
          </div>

          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Time Slot Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedTimeFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-xs border ${
              selectedTimeFilter === 'all'
                ? 'btn-electric-mint border-transparent'
                : 'bg-slate-100 dark:bg-[#171F29] border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300'
            }`}
          >
            All ({drivers.length})
          </button>
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTimeFilter(time)}
              className={`px-3 py-1.5 rounded-xl font-mono font-bold whitespace-nowrap transition-all text-xs border ${
                selectedTimeFilter === time
                  ? 'btn-electric-mint border-transparent'
                  : 'bg-slate-100 dark:bg-[#171F29] border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300'
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
                className={`bg-slate-50/90 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/8 rounded-2xl p-3.5 transition-all space-y-2.5 ${
                  isSelected ? 'ring-1 ring-[#0F766E] dark:ring-[#14B8A6]' : ''
                }`}
              >
                {/* Time & Cost Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-white/8">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono tabular-nums font-bold text-[#0F766E] dark:text-[#14B8A6] bg-teal-500/12 border border-teal-500/20 px-2.5 py-0.5 rounded-lg">
                      {driver.corridor.departure_time}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6]" />
                      {driver.corridor.available_seats} SEATS
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {formatNgn(driver.corridor.fuel_split_ngn)}
                    </span>
                    <span className="text-[8.5px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
                      FAIR SPLIT
                    </span>
                  </div>
                </div>

                {/* Driver Info & Vehicle Plate */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden border border-slate-200/80 dark:border-white/10">
                      <span>{driver.name.split(' ').map((n) => n[0]).join('')}</span>
                      <img
                        src={driver.avatar}
                        alt={driver.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                          {driver.name}
                        </h4>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
                      </div>
                      <span className="text-[10px] font-semibold text-[#0F766E] dark:text-[#14B8A6] truncate block">
                        {driver.employer}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-xs flex-shrink-0">
                    <div className="flex items-center justify-end gap-1 text-slate-700 dark:text-slate-200 font-bold text-[10.5px] mb-1">
                      <Car className="w-3 h-3 text-slate-400" />
                      <span>
                        {driver.vehicle.make} {driver.vehicle.model}
                      </span>
                    </div>
                    <span className="plate-badge">{driver.vehicle.plate_number}</span>
                  </div>
                </div>

                {/* Action CTA Button */}
                <button
                  onClick={() => {
                    selectDriverById(driver.id);
                    onClose();
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active-press ${
                    isSelected
                      ? 'bg-teal-500/12 border border-teal-500/25 text-[#0F766E] dark:text-[#14B8A6]'
                      : 'btn-electric-mint'
                  }`}
                >
                  <span>{isSelected ? 'Active On Your Deck' : 'Select & View Profile'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Muted Legal Notice */}
        <div className="pt-1 text-center text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span>LAGOS TRANSPORT REFORM ACT (SEC 44) • NON-COMMERCIAL</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
