'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  ShieldAlert,
  ShieldCheck,
  Phone,
  Clock,
  Share2,
  FileCheck,
  XCircle,
  X,
} from 'lucide-react';
import { formatNgn } from '@/lib/utils';

export const AssistanceShield: React.FC = () => {
  const {
    activeIncident,
    selectedProvider,
    sosCountdownSeconds,
    setShieldVisibility,
    cancelEmergency,
    releaseEscrow,
  } = useAppStore();

  const [receiptApproved, setReceiptApproved] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [localSeconds, setLocalSeconds] = useState(sosCountdownSeconds || 720);

  useEffect(() => {
    if (localSeconds <= 0) return;
    const interval = setInterval(() => {
      setLocalSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [localSeconds]);

  if (!activeIncident || !selectedProvider) return null;

  const minutes = Math.floor(localSeconds / 60);
  const seconds = localSeconds % 60;
  const formattedCountdown = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `CAR PULL EMERGENCY CLEARANCE: I am broken down at ${activeIncident.locationDescription}. Official recovery vehicle EN ROUTE: ${selectedProvider.truck_type} (${selectedProvider.plate_number}), Operator: ${selectedProvider.operator_name} (${selectedProvider.phone}). Authorization Code: ${activeIncident.dispatchAuthCode}. Protected under Lagos State Transport Recovery Act.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleApprovePartsReceipt = () => {
    setReceiptApproved(true);
    setShowReceiptModal(false);
    releaseEscrow(`ESC-SOS-${activeIncident.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F1F5F9] dark:bg-[#090D11] text-slate-900 dark:text-slate-100 overflow-y-auto px-4 py-4 flex flex-col items-center justify-between max-w-[430px] mx-auto animate-in fade-in duration-150">
      {/* Top Legal Authority Header */}
      <div className="w-full space-y-2.5">
        <div className="bg-amber-500/12 border border-amber-500/30 rounded-2xl p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-900 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-mono font-black uppercase tracking-wider">
              AUTHORIZED BREAKDOWN RECOVERY
            </span>
          </div>
          <p className="text-[10px] text-amber-800 dark:text-amber-300/90 mt-0.5 font-mono">
            LASTMA / FRSC IMPOUNDMENT EXEMPTION (SEC 44)
          </p>
        </div>

        {/* Dynamic Countdown Timer Shield */}
        <div className="floating-surface rounded-2xl p-4 text-center space-y-2">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold block">
            ESTIMATED RECOVERY UNIT ARRIVAL
          </span>
          <div className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-mono tabular-nums flex items-center justify-center gap-2">
            <Clock className="w-6 h-6 text-red-600 dark:text-red-400 animate-pulse" />
            <span>{formattedCountdown}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 px-3 py-1 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 font-mono tabular-nums">
            <span>AUTH TOKEN:</span>
            <strong className="text-[#0F766E] dark:text-[#14B8A6]">{activeIncident.dispatchAuthCode}</strong>
          </div>
        </div>
      </div>

      {/* Operator & Vehicle Digital Clearance Credentials */}
      <div className="w-full my-2.5 floating-surface rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-slate-200/70 dark:border-white/8">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={selectedProvider.operator_photo}
              alt={selectedProvider.operator_name}
              className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 dark:border-white/10 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                  {selectedProvider.operator_name}
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{selectedProvider.name}</p>
              <span className="text-[9px] font-mono tabular-nums text-emerald-700 dark:text-emerald-300 bg-emerald-500/12 border border-emerald-500/20 px-1.5 py-0.5 rounded-md inline-block mt-1 font-bold">
                {selectedProvider.lasdri_id}
              </span>
            </div>
          </div>

          <a
            href={`tel:${selectedProvider.phone}`}
            className="w-10 h-10 rounded-xl btn-electric-mint flex items-center justify-center active-spring transition-transform flex-shrink-0"
            title="Call Operator"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        {/* Hairline-Divided Tow Truck Clearance Info */}
        <div className="grid grid-cols-3 divide-x divide-slate-200/70 dark:divide-white/8 border-b border-slate-200/70 dark:border-white/8 text-xs">
          <div className="p-3">
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block uppercase font-bold">
              PLATE
            </span>
            <span className="plate-badge mt-1 inline-block">{selectedProvider.plate_number}</span>
          </div>
          <div className="p-3">
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block uppercase font-bold">
              EQUIPMENT
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block mt-1 truncate">
              {selectedProvider.truck_type}
            </span>
          </div>
          <div className="p-3 text-right">
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block uppercase font-bold">
              ESCROW
            </span>
            <span className="font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400 block mt-1">
              {formatNgn(activeIncident.escrowAmountNgn)}
            </span>
          </div>
        </div>

        {/* Replacement Parts Review Bar */}
        <div className="p-3 bg-slate-50/70 dark:bg-[#0D1218]/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <FileCheck className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
            <span className="font-bold text-[11px]">Parts Receipt Verification</span>
          </div>
          <button
            onClick={() => setShowReceiptModal(true)}
            className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition-all active-spring ${
              receiptApproved
                ? 'bg-emerald-500/12 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300'
                : 'btn-electric-mint'
            }`}
          >
            {receiptApproved ? 'Approved' : 'Review Receipt'}
          </button>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="w-full space-y-2 pb-1">
        <button
          onClick={handleWhatsAppShare}
          className="w-full min-h-[44px] btn-electric-mint font-black text-xs rounded-xl flex items-center justify-center gap-2 active-spring transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Emergency Clearance on WhatsApp</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShieldVisibility(false)}
            className="min-h-[40px] bg-white dark:bg-[#11171E] hover:bg-slate-100 dark:hover:bg-[#171F29] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors active-spring"
          >
            Minimize Shield
          </button>

          <button
            onClick={cancelEmergency}
            className="min-h-[40px] bg-red-500/12 hover:bg-red-500/20 border border-red-500/25 text-red-700 dark:text-red-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 active-spring"
          >
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>Cancel SOS</span>
          </button>
        </div>
      </div>

      {/* Parts Receipt Inspection Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[340px] floating-surface rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-white/8">
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Parts Purchase Receipt
              </h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#171F29] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-100/80 dark:bg-[#171F29] p-3 rounded-xl border border-slate-200/80 dark:border-white/8 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Vendor</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">Ladipo Lekki Express Parts</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Item</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">OEM Fan Belt & Coolant (5L)</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/70 dark:border-white/8">
                <span>Total Verified</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono tabular-nums font-black">
                  ₦14,500
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Approving releases held escrow directly to the verified auto parts distributor.
            </p>

            <button
              onClick={handleApprovePartsReceipt}
              className="w-full py-2.5 btn-electric-mint font-black text-xs rounded-xl active-press transition-all"
            >
              Approve Receipt & Release Escrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
