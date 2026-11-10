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
    <div className="fixed inset-0 z-[700] bg-slate-950/70 backdrop-blur-xs overflow-y-auto p-3 overscroll-contain flex items-center justify-center animate-in fade-in duration-150">
      <div className="w-full max-w-[390px] floating-surface rounded-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header with Step-Back Navigation */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200/70 dark:border-white/8">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-100 font-bold text-xs active-press transition-all"
            title="Go back"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Trust &amp; Verification
            </h3>
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
              LAGOS SEC 44 DOSSIER
            </span>
          </div>

          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Driver Summary Banner */}
        <div className="p-4 bg-slate-50/70 dark:bg-[#0D1218]/60 border-b border-slate-200/70 dark:border-white/8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden border border-slate-200/80 dark:border-white/10">
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
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 truncate">
                  {driver.name}
                </h4>
                <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
              </div>
              <p className="text-xs font-bold text-[#0F766E] dark:text-[#14B8A6] truncate">
                {driver.employer}
              </p>
              <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {driver.trips_completed} TRIPS • {driver.rating} ★
              </span>
            </div>
          </div>

          <span className="plate-badge flex-shrink-0">{driver.vehicle.plate_number}</span>
        </div>

        {/* 4 Trust Verification Pillars (Hairline-Divided) */}
        <div className="divide-y divide-slate-200/70 dark:divide-white/8 text-xs">
          <div className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/12 border border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-[11px]">
                01. Corporate Domain Authenticated
              </span>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Verified work email under{' '}
                <strong className="font-mono text-[#0F766E] dark:text-[#14B8A6]">
                  @{driver.employer_domain}
                </strong>{' '}
                with active corporate directory confirmation.
              </p>
            </div>
          </div>

          <div className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/12 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-[11px]">
                02. Government NIN / BVN Match
              </span>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                National Identity Number (NIN) and Bank Verification Number (BVN) cross-referenced via Dojah identity rails.
              </p>
            </div>
          </div>

          <div className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/12 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-[11px]">
                03. Vehicle Registry &amp; Roadworthiness
              </span>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.color}) registered under{' '}
                <strong className="font-mono text-slate-900 dark:text-slate-100">
                  {driver.vehicle.plate_number}
                </strong>{' '}
                verified against Lagos State VIS records.
              </p>
            </div>
          </div>

          <div className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/12 border border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-[11px]">
                04. Statutory Non-Commercial Safe Harbor
              </span>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Protected under <strong>Lagos State Transport Law (Cap T1, Sec 44)</strong>. Cost-sharing fuel offset only; exempt from commercial hackney permits.
              </p>
            </div>
          </div>
        </div>

        {/* Close CTA */}
        <div className="p-4 border-t border-slate-200/70 dark:border-white/8">
          <button
            onClick={handleBack}
            className="w-full py-2.5 btn-electric-mint font-black text-xs rounded-xl active-press transition-all"
          >
            Close &amp; Return to Deck
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
