'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatNgn } from '@/lib/utils';
import {
  Wallet,
  Lock,
  ArrowDownRight,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const NIGERIAN_BANKS = [
  'Guaranty Trust Bank (GTBank)',
  'Access Bank',
  'Zenith Bank',
  'Kuda Microfinance Bank',
  'OPay Digital Services',
  'Moniepoint MFB',
  'United Bank for Africa (UBA)',
  'First Bank of Nigeria',
];

export const EscrowWallet: React.FC = () => {
  const { escrowBalanceNgn, heldEscrowNgn, escrowTransactions, topUpWallet, withdrawFunds, user } = useAppStore();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('0124891024');
  const [withdrawAmount, setWithdrawAmount] = useState('10000');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const numAmount = parseInt(withdrawAmount, 10) || 0;
  const isAccountValid = accountNumber.length === 10;
  const isAmountValid = numAmount > 0 && numAmount <= escrowBalanceNgn;

  const handleConfirmWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAccountValid) {
      setErrorMessage('Enter a valid 10-digit NUBAN account number.');
      return;
    }
    if (!isAmountValid) {
      setErrorMessage(`Amount must be between ₦500 and ${formatNgn(escrowBalanceNgn)}.`);
      return;
    }

    setErrorMessage('');
    const success = withdrawFunds(numAmount, selectedBank, accountNumber, user.fullName.toUpperCase());
    if (success) {
      setWithdrawSuccess(true);
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#0B0C0E', '#DF8E52'],
      });
      setTimeout(() => {
        setWithdrawSuccess(false);
        setShowWithdrawModal(false);
      }, 1600);
    }
  };

  return (
    <div className="w-full max-w-[404px] mx-auto pb-24 px-3 space-y-3.5 animate-in fade-in pt-1">
      {/* 1. Uber Green Inspired Volt Escrow Hero Card */}
      <div className="volt-surface rounded-[32px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] text-[10px] font-mono font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            ZERO-CASH ESCROW
          </div>

          <button
            onClick={() => setShowInfoModal(true)}
            className="px-3 py-1 rounded-full bg-white/80 hover:bg-white text-[#0B0C0E] text-xs font-extrabold flex items-center gap-1 active-press"
            title="How Escrow Payouts Work"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Rules</span>
          </button>
        </div>

        {/* Concentric Balance Display */}
        <div className="flex items-end justify-between gap-2 pt-1">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-70 block">
              AVAILABLE TO WITHDRAW
            </span>
            <span className="text-3xl font-display font-black font-mono tabular-nums tracking-tight block mt-0.5">
              {formatNgn(escrowBalanceNgn)}
            </span>
          </div>

          <div className="text-right bg-[#0B0C0E]/10 px-3.5 py-2 rounded-2xl">
            <span className="text-[9px] font-mono uppercase font-bold opacity-75 flex items-center justify-end gap-1">
              <Lock className="w-2.5 h-2.5" /> HELD IN TRIPS
            </span>
            <span className="text-base font-black font-mono tabular-nums block">
              {formatNgn(heldEscrowNgn)}
            </span>
          </div>
        </div>

        {/* Uber Green Bottom Pill Bar Inside Hero */}
        <div className="bg-white/90 rounded-full p-1.5 pl-3 flex items-center justify-between gap-2">
          <button
            onClick={() => topUpWallet(10000)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-full text-xs font-extrabold hover:bg-black/5 active-press"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Top-up (+₦10k)</span>
          </button>

          <button
            onClick={() => {
              setErrorMessage('');
              setShowWithdrawModal(true);
            }}
            className="py-2.5 px-5 rounded-full bg-[#0B0C0E] text-white text-xs font-extrabold flex items-center gap-1.5 active-press"
          >
            <ArrowUpRight className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Withdraw Now</span>
          </button>
        </div>
      </div>

      {/* 2. Uber Green "Payment Method" Card */}
      <div className="floating-surface rounded-[28px] p-4 space-y-2.5">
        <span className="text-xs font-extrabold text-[#0B0C0E] dark:text-white block">
          Payout Rail
        </span>
        <div className="p-3.5 rounded-2xl bg-[#F4F5F7] dark:bg-[#1E2028] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center -space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-red-500 inline-block" />
              <span className="w-5 h-5 rounded-full bg-[#FF9F0A] opacity-90 inline-block" />
            </div>
            <span className="text-xs font-mono font-bold text-[#0B0C0E] dark:text-white">
              NIBSS •••• 1024
            </span>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="text-[10px] font-mono uppercase font-extrabold text-[var(--text-secondary)] dark:text-[var(--accent-primary)]"
          >
            CHANGE
          </button>
        </div>
      </div>

      {/* 3. Transaction History Ledger */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-display font-black text-[#0B0C0E] dark:text-white">
            Escrow Activity
          </h3>
          <span className="text-[10px] text-[#525866] dark:text-[#9BA1AE] font-mono font-bold">
            REAL-TIME
          </span>
        </div>

        <div className="space-y-2">
          {escrowTransactions.map((tx) => (
            <div
              key={tx.id}
              className="floating-surface rounded-[24px] p-3.5 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'TOPUP' || tx.type.includes('RELEASE')
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                      : tx.type === 'FLAKE_PENALTY'
                      ? 'bg-[#FF9F0A] text-[#0B0C0E]'
                      : 'bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white'
                  }`}
                >
                  {tx.type === 'WITHDRAWAL' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : tx.type.includes('HOLD') ? (
                    <Lock className="w-4 h-4" />
                  ) : tx.type === 'TOPUP' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-[#0B0C0E] dark:text-white truncate">
                    {tx.description}
                  </h4>
                  <div className="text-[10px] text-[#525866] dark:text-[#9BA1AE] font-mono tabular-nums truncate">
                    {tx.reference} • {tx.timestamp}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-black font-mono tabular-nums block text-[#0B0C0E] dark:text-white">
                  {tx.type === 'TOPUP' ? '+' : '-'}
                  {formatNgn(tx.amountNgn)}
                </span>
                <span className="inline-block text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[var(--text-secondary)] dark:text-[var(--accent-primary)]">
                  {tx.type === 'WITHDRAWAL' ? 'SENT' : tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-[380px] floating-surface rounded-[32px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-black text-[#0B0C0E] dark:text-white">
                    Withdraw to Bank
                  </h3>
                  <span className="text-[10px] font-mono text-[#525866] dark:text-[#9BA1AE]">
                    NIBSS INSTANT PAYOUT
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-display font-black text-[#0B0C0E] dark:text-white">
                  Transfer Initiated
                </h4>
                <p className="text-xs text-[#525866] dark:text-[#9BA1AE]">
                  <span className="font-mono tabular-nums font-bold text-[#0B0C0E] dark:text-white">
                    {formatNgn(numAmount)}
                  </span>{' '}
                  sent to {selectedBank}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmWithdrawal} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[#525866] dark:text-[#9BA1AE] mb-1">
                    Destination Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F4F5F7] dark:bg-[#1E2028] rounded-full text-xs font-bold text-[#0B0C0E] dark:text-white focus:outline-hidden"
                  >
                    {NIGERIAN_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[#525866] dark:text-[#9BA1AE] mb-1">
                    NUBAN Account Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="0123456789"
                    className="w-full px-4 py-3 bg-[#F4F5F7] dark:bg-[#1E2028] rounded-full text-xs font-mono tabular-nums font-bold text-[#0B0C0E] dark:text-white focus:outline-hidden"
                  />
                  {accountNumber.length === 10 && (
                    <div className="mt-1.5 px-3.5 py-1.5 bg-[var(--accent-primary)]/15 rounded-full flex items-center justify-between text-[10px] text-[var(--text-primary)]">
                      <span className="font-mono font-bold">VERIFIED:</span>
                      <strong className="uppercase font-mono">{user.fullName}</strong>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[#525866] dark:text-[#9BA1AE] mb-1">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F4F5F7] dark:bg-[#1E2028] rounded-full text-xs font-mono tabular-nums font-bold text-[#0B0C0E] dark:text-white focus:outline-hidden"
                  />
                </div>

                {errorMessage && (
                  <div className="bg-red-500/12 p-3 rounded-2xl flex items-center gap-1.5 text-[11px] text-red-600 font-bold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isAccountValid || !isAmountValid}
                  className="w-full py-3.5 btn-electric-mint disabled:opacity-40 text-xs font-extrabold rounded-full active-press"
                >
                  Confirm Payout ({formatNgn(numAmount)})
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* RULES MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[360px] floating-surface rounded-[32px] p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-black text-[#0B0C0E] dark:text-white">
                Escrow Rules
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-[#525866] dark:text-[#9BA1AE] text-[11px] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#F4F5F7] dark:bg-[#1E2028]">
                <strong className="text-[#0B0C0E] dark:text-white block">01. Commuter Deposits</strong>
                Unused balance can be withdrawn back to any Nigerian bank via NIBSS instant rails.
              </div>
              <div className="p-3 rounded-2xl bg-[#F4F5F7] dark:bg-[#1E2028]">
                <strong className="text-[#0B0C0E] dark:text-white block">02. Fuel Split Release</strong>
                Held funds unlock automatically when the rider confirms boarding at the safe hub.
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-3 btn-electric-mint font-extrabold text-xs rounded-full active-press"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
