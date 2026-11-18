'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  ShieldCheck,
  Phone,
  Clock,
  Share2,
  FileCheck,
  XCircle,
  X,
  Truck,
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
    <div className="fixed inset-0 z-50 bg-[#F4F5F7] dark:bg-[#0B0C0E] text-[#0B0C0E] dark:text-white overflow-y-auto px-4 py-4 flex flex-col items-center justify-between max-w-[430px] mx-auto animate-in fade-in duration-150">
      {/* 1. Charlie Waite "The re-designed Uber App" Live Recovery Progress Card */}
      <div className="w-full space-y-3">
        <div className="bg-[#0B0C0E] dark:bg-[#14161B] rounded-[32px] p-5 text-white space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C8FF00] font-bold block">
                AUTHORIZED RECOVERY EN ROUTE
              </span>
              <div className="text-3xl font-display font-black font-mono tabular-nums text-white flex items-center gap-2 mt-1">
                <Clock className="w-6 h-6 text-[#C8FF00]" />
                <span>{formattedCountdown}</span>
              </div>
            </div>

            <div className="relative w-13 h-13 rounded-full ring-2 ring-[#C8FF00] overflow-hidden flex-shrink-0">
              <img
                src={selectedProvider.operator_photo}
                alt={selectedProvider.operator_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Horizontal Tow Truck Track */}
          <div className="py-1">
            <div className="relative h-1.5 w-full rounded-full bg-white/20 flex items-center">
              <div className="h-full w-[64%] rounded-full bg-[#C8FF00]" />
              <div
                style={{ left: '60%' }}
                className="absolute -translate-x-1/2 w-9 h-4.5 rounded-full bg-white text-[#0B0C0E] flex items-center justify-center shadow-md"
              >
                <Truck className="w-3 h-3" />
              </div>
              <span className="absolute right-0 w-2.5 h-2.5 rounded-full bg-[#FF9F0A]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="font-extrabold block">{selectedProvider.operator_name}</span>
              <span className="text-[11px] text-white/70">{selectedProvider.truck_type}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#C8FF00] text-[#0B0C0E] font-mono text-xs font-black">
              {selectedProvider.plate_number}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Operator & Escrow Details Sheet */}
      <div className="w-full my-3 floating-surface rounded-[32px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#525866] dark:text-[#9BA1AE] font-bold block">
              DISPATCH AUTH CODE
            </span>
            <strong className="text-sm font-mono font-black text-[#0B0C0E] dark:text-[#C8FF00]">
              {activeIncident.dispatchAuthCode}
            </strong>
          </div>

          <a
            href={`tel:${selectedProvider.phone}`}
            className="w-11 h-11 rounded-full bg-[#C8FF00] text-[#0B0C0E] flex items-center justify-center active-press shadow-md"
            title="Call Operator"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F4F5F7] dark:bg-[#1E2028] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold">
            <FileCheck className="w-4 h-4 text-[#FF9F0A]" />
            <span>Parts Receipt Verification</span>
          </div>
          <button
            onClick={() => setShowReceiptModal(true)}
            className="px-3.5 py-1.5 rounded-full btn-electric-mint text-[11px] font-extrabold active-press"
          >
            {receiptApproved ? 'Approved' : 'Review'}
          </button>
        </div>
      </div>

      {/* 3. Bottom Action Pills */}
      <div className="w-full space-y-2 pb-1">
        <button
          onClick={handleWhatsAppShare}
          className="w-full py-3.5 btn-volt font-extrabold text-xs rounded-full flex items-center justify-center gap-2 active-press"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Clearance on WhatsApp</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShieldVisibility(false)}
            className="py-3 rounded-full bg-white dark:bg-[#14161B] text-[#0B0C0E] dark:text-white font-extrabold text-xs active-press"
          >
            Minimize Shield
          </button>

          <button
            onClick={cancelEmergency}
            className="py-3 rounded-full bg-red-500/12 text-red-600 dark:text-red-400 font-extrabold text-xs flex items-center justify-center gap-1.5 active-press"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel SOS</span>
          </button>
        </div>
      </div>

      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[350px] floating-surface rounded-[32px] p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-black text-[#0B0C0E] dark:text-white">
                Parts Purchase Receipt
              </h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F4F5F7] dark:bg-[#1E2028] p-3.5 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#525866] dark:text-[#9BA1AE]">Vendor</span>
                <span className="font-bold">Ladipo Lekki Express</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#525866] dark:text-[#9BA1AE]">Item</span>
                <span className="font-bold">OEM Belt &amp; Coolant</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#525866] dark:text-[#9BA1AE]">Total</span>
                <span className="font-mono font-black text-[#0B0C0E] dark:text-[#C8FF00]">₦14,500</span>
              </div>
            </div>

            <button
              onClick={handleApprovePartsReceipt}
              className="w-full py-3 btn-electric-mint font-extrabold text-xs rounded-full active-press"
            >
              Approve &amp; Release Escrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
