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
    <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-xs overflow-y-auto p-2 sm:p-3 overscroll-contain flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-[420px] bg-[#FAF8F3] rounded-t-3xl sm:rounded-3xl p-4 space-y-3 shadow-2xl border border-[#DDD4C5] max-h-[88vh] flex flex-col my-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Header with Step-Back Navigation */}
        <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-2.5">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#141210] border border-[#DDD4C5] font-bold text-xs transition-all active:scale-95 shadow-2xs"
            title="Return to corridor deck"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E]" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h3 className="text-sm font-serif font-black text-[#141210] tracking-tight">
              Corridor Schedule
            </h3>
            <span className="text-[10px] text-[#70665A] font-semibold block">
              {commuteDirection === 'morning' ? 'AM Outbound: Ajah → VI' : 'PM Return: VI → Ajah'}
            </span>
          </div>

          <button
            onClick={handleBack}
            className="w-7 h-7 rounded-full bg-white hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center border border-[#DDD4C5] transition-colors"
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
                ? 'bg-[#0D6E6E] text-white shadow-2xs'
                : 'bg-white text-[#70665A] hover:text-[#141210] border border-[#DDD4C5]'
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
                  ? 'bg-[#0D6E6E] text-white shadow-2xs'
                  : 'bg-white text-[#70665A] hover:text-[#141210] border border-[#DDD4C5]'
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
                className={`bg-white rounded-2xl p-3 border transition-all ${
                  isSelected
                    ? 'border-[#0D6E6E] ring-2 ring-[#0D6E6E]/20 shadow-xs'
                    : 'border-[#DDD4C5] hover:border-stone-400'
                }`}
              >
                {/* Time & Cost Header */}
                <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-[#0D6E6E] bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                      {driver.corridor.departure_time}
                    </span>
                    <span className="text-[10px] font-bold text-[#70665A] flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#0D6E6E]" />
                      {driver.corridor.available_seats} seats left
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-[#141210]">
                      {formatNgn(driver.corridor.fuel_split_ngn)}
                    </span>
                    <span className="text-[9px] text-[#70665A] block uppercase font-mono">
                      Fair Split
                    </span>
                  </div>
                </div>

                {/* Driver Info & Vehicle Plate */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-10 h-10 rounded-xl bg-[#0D6E6E] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden border border-[#DDD4C5]">
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
                        <h4 className="text-xs font-serif font-black text-[#141210]">
                          {driver.name}
                        </h4>
                        <ShieldCheck className="w-3 h-3 text-[#0D6E6E]" />
                      </div>
                      <span className="text-[10px] font-bold text-[#0D6E6E] block">
                        {driver.employer}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle & Plate Tag */}
                  <div className="text-right text-xs">
                    <div className="flex items-center gap-1 text-[#141210] font-semibold text-[11px]">
                      <Car className="w-3 h-3 text-[#70665A]" />
                      <span>{driver.vehicle.make} {driver.vehicle.model}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-[#C25E2E] bg-[#FFF9EE] px-1.5 py-0.2 rounded border border-[#C25E2E]/30 inline-block mt-0.5">
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
                        ? 'bg-[#EEF7F7] text-[#0D6E6E] border border-[#0D6E6E]/40 font-black'
                        : 'bg-[#0D6E6E] hover:bg-[#094E4E] text-white'
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
        <div className="border-t border-[#DDD4C5] pt-2 text-center text-[10px] text-[#70665A]">
          <span>Lagos State Transport Reform Act (Sec 44): Non-Commercial Commute</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
