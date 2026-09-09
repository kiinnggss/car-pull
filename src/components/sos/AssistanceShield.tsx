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
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { formatNgn } from '@/lib/utils';

export const AssistanceShield: React.FC = () => {
  const {
    activeIncident,
    selectedProvider,
    sosCountdownSeconds,
    decrementSosCountdown,
    setShieldVisibility,
    cancelEmergency,
    releaseEscrow,
  } = useAppStore();

  const [receiptApproved, setReceiptApproved] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Local lightweight countdown timer
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
    <div className="fixed inset-0 z-50 bg-white text-zinc-900 overflow-y-auto px-4 py-5 flex flex-col items-center justify-between max-w-[430px] mx-auto animate-in fade-in duration-150">
      {/* Top Legal Authority Header - Clean Banner */}
      <div className="w-full space-y-2.5">
        <div className="bg-amber-50 rounded-2xl p-3 text-center border-l-4 border-amber-500">
          <div className="flex items-center justify-center gap-1.5 text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 animate-bounce" />
            <span className="text-xs font-black uppercase tracking-wider">
              AUTHORIZED BREAKDOWN RECOVERY IN PROGRESS
            </span>
          </div>
          <p className="text-[10px] text-amber-800 mt-0.5 font-mono">
            LASTMA / FRSC / POLICE IMPOUNDMENT EXEMPTION (SEC 44)
          </p>
        </div>

        {/* Dynamic Countdown Timer Shield - Soft Gradient */}
        <div className="bg-gradient-to-b from-purple-50/80 to-white rounded-3xl p-5 text-center border border-purple-100 shadow-sm">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">
            ESTIMATED UNIT ARRIVAL
          </span>
          <div className="text-4xl font-black text-zinc-900 tracking-tight my-1 font-mono flex items-center justify-center gap-2">
            <Clock className="w-6 h-6 text-red-600 animate-pulse" />
            <span>{formattedCountdown}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full text-xs text-zinc-700 font-mono shadow-2xs">
            <span>Auth Code:</span>
            <strong className="text-[#7C3AED]">{activeIncident.dispatchAuthCode}</strong>
          </div>
        </div>
      </div>

      {/* Operator & Vehicle Digital Clearance Credentials - Streamlined Card */}
      <div className="w-full my-3 bg-zinc-50 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2.5">
          <div className="flex items-center gap-2.5">
            <img
              src={selectedProvider.operator_photo}
              alt={selectedProvider.operator_name}
              className="w-12 h-12 rounded-2xl object-cover"
            />
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-sm font-black text-zinc-900">{selectedProvider.operator_name}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-zinc-500">{selectedProvider.name}</p>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-0.5 font-semibold">
                {selectedProvider.lasdri_id}
              </span>
            </div>
          </div>

          <a
            href={`tel:${selectedProvider.phone}`}
            className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform"
            title="Call Operator"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        {/* Tow Truck Clearance Info Line */}
        <div className="flex items-center justify-between text-xs py-1">
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-medium">Plate</span>
            <span className="font-black text-zinc-900 font-mono tracking-wider">{selectedProvider.plate_number}</span>
          </div>
          <span className="text-zinc-300">•</span>
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-medium">Equipment</span>
            <span className="font-semibold text-zinc-800">{selectedProvider.truck_type}</span>
          </div>
          <span className="text-zinc-300">•</span>
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-medium">Escrow</span>
            <span className="font-black text-emerald-700">{formatNgn(activeIncident.escrowAmountNgn)}</span>
          </div>
        </div>

        {/* Replacement Parts Review Bar */}
        <div className="bg-white rounded-2xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-700">
            <FileCheck className="w-4 h-4 text-[#7C3AED]" />
            <span className="font-medium text-[11px]">Parts Receipt Approval</span>
          </div>
          <button
            onClick={() => setShowReceiptModal(true)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
              receiptApproved
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-[#7C3AED] text-white'
            }`}
          >
            {receiptApproved ? 'Approved' : 'Review'}
          </button>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="w-full space-y-2 pb-2">
        <button
          onClick={handleWhatsAppShare}
          className="w-full min-h-[46px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>1-Tap WhatsApp Emergency Share</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShieldVisibility(false)}
            className="min-h-[42px] bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-2xl transition-colors"
          >
            Minimize Shield
          </button>

          <button
            onClick={cancelEmergency}
            className="min-h-[42px] bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-red-600" />
            <span>Cancel SOS</span>
          </button>
        </div>
      </div>

      {/* Parts Receipt Inspection Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[340px] bg-white rounded-3xl p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Parts Purchase Receipt
              </h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-50 p-3 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Vendor:</span>
                <span className="text-zinc-900 font-medium">Ladipo Lekki Express Parts</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Item:</span>
                <span className="text-zinc-900 font-medium">OEM Fan Belt & Coolant (5L)</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Total:</span>
                <span className="text-emerald-700 font-black">₦14,500</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 leading-tight">
              Approving releases funds directly to the verified auto parts distributor.
            </p>

            <button
              onClick={handleApprovePartsReceipt}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95"
            >
              Approve Receipt & Release Escrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
