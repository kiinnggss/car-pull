'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
  Car,
  Users,
  ShieldCheck,
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
    <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-xs overflow-y-auto p-3 overscroll-contain flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-[404px] floating-surface rounded-[32px] p-5 space-y-3.5 max-h-[88vh] flex flex-col my-auto animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-black text-[var(--text-primary)]">
              Corridor Departures
            </h3>
            <span className="text-[11px] text-[var(--text-secondary)]">
              Verified commuters leaving today
            </span>
          </div>

          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center active-press"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Time Slot Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedTimeFilter('all')}
            className={`px-3.5 py-1.5 rounded-full font-extrabold whitespace-nowrap transition-all text-xs ${
              selectedTimeFilter === 'all'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            All ({drivers.length})
          </button>
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTimeFilter(time)}
              className={`px-3.5 py-1.5 rounded-full font-mono font-bold whitespace-nowrap transition-all text-xs ${
                selectedTimeFilter === time
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              {time}
            </button>
          ))}
        </div>

        {/* Departure Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 no-scrollbar">
          {filteredDrivers.map((driver) => {
            const isSelected = currentDriver?.id === driver.id;

            return (
              <div
                key={driver.id}
                className={`p-3.5 rounded-[24px] transition-all space-y-2.5 ${
                  isSelected
                    ? 'volt-surface'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={driver.avatar}
                      alt={driver.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-extrabold truncate">{driver.name}</h4>
                        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                      </div>
                      <span className="text-[10px] opacity-75 truncate block">
                        {driver.employer} • {driver.vehicle.make} {driver.vehicle.model}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] text-[10px] font-mono font-black flex-shrink-0">
                    {driver.corridor.departure_time}
                  </span>
                </div>

                {/* Uber Green Price + Select Pill Row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black font-mono tabular-nums">
                      {formatNgn(driver.corridor.fuel_split_ngn)}
                    </span>
                    <span className="text-[10px] font-mono opacity-75 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {driver.corridor.available_seats} seats
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      selectDriverById(driver.id);
                      onClose();
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 active-press ${
                      isSelected
                        ? 'bg-[var(--bg-sheet)] text-[var(--text-primary)]'
                        : 'btn-electric-mint'
                    }`}
                  >
                    <span>{isSelected ? 'On Deck' : 'View Card'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};
