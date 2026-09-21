'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  Car,
  FileCheck,
  ArrowLeft,
  X,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { CorridorDriver } from '@/lib/types';

interface DriverTrustModalProps {
  driver: CorridorDriver;
  isOpen: boolean;
  onClose: () => void;
}

export const DriverTrustModal: React.FC<DriverTrustModalProps> = ({
  driver,
  isOpen,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Back button integration: hardware or browser back navigates back a step
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: 'driver-trust' }, '');

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
    if (window.history.state?.modal === 'driver-trust') {
      window.history.back();
    } else {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-xs overflow-y-auto p-2 sm:p-3 overscroll-contain flex items-center justify-center animate-in fade-in duration-150">
      <div className="w-full max-w-[390px] bg-white dark:bg-[#12161A] rounded-3xl p-4 space-y-3.5 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
        {/* Header with Step-Back Navigation */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-bold text-xs transition-all active:scale-95 shadow-2xs"
            title="Go back"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#F58A25]" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Trust &amp; Verification
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
              Lagos Executive Safe Harbor
            </span>
          </div>

          <button
            onClick={handleBack}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Driver Summary Card */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="relative w-12 h-12 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
            <span>{driver.name.split(' ').map((n) => n[0]).join('')}</span>
            <img
              src={driver.avatar}
              alt={driver.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{driver.name}</h4>
              <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
            </div>
            <p className="text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6]">{driver.employer}</p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {driver.trips_completed} verified carpool trips ({driver.rating} ★)
            </span>
          </div>
        </div>

        {/* 4 Trust Verification Pillars */}
        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">
                1. Corporate Domain Verified
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Email authenticated under <strong className="text-[#0F766E] dark:text-[#14B8A6]">@{driver.employer_domain}</strong> with active corporate directory confirmation.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">
                2. Government NIN / BVN Match
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                National Identity Number (NIN) and Bank Verification Number (BVN) cross-referenced and cleared via Dojah.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-[#F58A25] flex-shrink-0 mt-0.5">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">
                3. Vehicle Roadworthiness &amp; Plate Log
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.color}) with plate <strong className="font-mono text-[#F58A25]">{driver.vehicle.plate_number}</strong> verified against Lagos state vehicle registry.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-teal-50/50 dark:bg-teal-950/30 rounded-xl border border-[#0F766E]/25 dark:border-teal-800/40 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#0F766E] text-white flex-shrink-0 mt-0.5">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#0F766E] dark:text-[#14B8A6] block text-[11px]">
                4. Statutory Non-Commercial Safe Harbor
              </span>
              <p className="text-[10px] text-slate-700 dark:text-slate-300 mt-0.5 leading-snug">
                Protected under <strong>Lagos State Transport Law (Cap T1, Sec 44)</strong>. Cost-sharing fuel offset only; strictly non-profit and exempt from commercial taxi permits.
              </p>
            </div>
          </div>
        </div>

        {/* Close CTA */}
        <button
          onClick={handleBack}
          className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl shadow-xs active:scale-[0.99] transition-all"
        >
          Close &amp; Return to Deck
        </button>
      </div>
    </div>,
    document.body
  );
};
