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
    <div className="fixed inset-0 z-[700] bg-black/75 backdrop-blur-xs overflow-y-auto p-2 sm:p-3 overscroll-contain flex items-center justify-center animate-in fade-in duration-150">
      <div className="w-full max-w-[390px] bg-[#FAF8F3] rounded-3xl p-4 space-y-3.5 shadow-2xl border border-[#DDD4C5] my-auto animate-in zoom-in-95 duration-150">
        {/* Header with Step-Back Navigation */}
        <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#141210] border border-[#DDD4C5] font-bold text-xs transition-all active:scale-95 shadow-2xs"
            title="Go back"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E]" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h3 className="text-sm font-serif font-black text-[#141210] tracking-tight">
              Trust &amp; Verification
            </h3>
            <span className="text-[10px] text-[#70665A] font-semibold block">
              Lagos Executive Safe Harbor
            </span>
          </div>

          <button
            onClick={handleBack}
            className="w-7 h-7 rounded-full bg-white hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center border border-[#DDD4C5] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Driver Summary Card */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#DDD4C5] shadow-2xs">
          <div className="relative w-12 h-12 rounded-xl bg-[#0D6E6E] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden border border-[#DDD4C5]">
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
              <h4 className="font-serif font-black text-sm text-[#141210]">{driver.name}</h4>
              <ShieldCheck className="w-4 h-4 text-[#0D6E6E]" />
            </div>
            <p className="text-xs font-bold text-[#0D6E6E]">{driver.employer}</p>
            <span className="text-[10px] text-[#70665A] font-semibold">
              {driver.trips_completed} verified carpool trips ({driver.rating} ★)
            </span>
          </div>
        </div>

        {/* 4 Trust Verification Pillars */}
        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-white rounded-xl border border-[#DDD4C5] flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-50 text-[#0D6E6E] flex-shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-[#141210] block text-[11px]">
                1. Corporate Domain Verified
              </span>
              <p className="text-[10px] text-[#70665A] mt-0.5 leading-snug">
                Email authenticated under <strong className="text-[#0D6E6E]">@{driver.employer_domain}</strong> with active corporate directory confirmation.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-[#DDD4C5] flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-[#141210] block text-[11px]">
                2. Government NIN / BVN Match
              </span>
              <p className="text-[10px] text-[#70665A] mt-0.5 leading-snug">
                National Identity Number (NIN) and Bank Verification Number (BVN) cross-referenced and cleared via Dojah.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-[#DDD4C5] flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-50 text-[#C25E2E] flex-shrink-0 mt-0.5">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-[#141210] block text-[11px]">
                3. Vehicle Roadworthiness &amp; Plate Log
              </span>
              <p className="text-[10px] text-[#70665A] mt-0.5 leading-snug">
                {driver.vehicle.make} {driver.vehicle.model} ({driver.vehicle.color}) with plate <strong className="font-mono text-[#C25E2E]">{driver.vehicle.plate_number}</strong> verified against Lagos state vehicle registry.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-[#EEF7F7] rounded-xl border border-[#0D6E6E]/30 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#0D6E6E] text-white flex-shrink-0 mt-0.5">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-[#0D6E6E] block text-[11px]">
                4. Statutory Non-Commercial Safe Harbor
              </span>
              <p className="text-[10px] text-[#141210] mt-0.5 leading-snug">
                Protected under <strong>Lagos State Transport Law (Cap T1, Sec 44)</strong>. Cost-sharing fuel offset only; strictly non-profit and exempt from commercial taxi permits.
              </p>
            </div>
          </div>
        </div>

        {/* Close CTA */}
        <button
          onClick={handleBack}
          className="w-full py-2.5 bg-[#0D6E6E] hover:bg-[#094E4E] text-white font-bold text-xs rounded-xl shadow-xs active:scale-[0.99] transition-all"
        >
          Close &amp; Return to Deck
        </button>
      </div>
    </div>,
    document.body
  );
};
