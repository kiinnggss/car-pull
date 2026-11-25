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
  const { escrowBalanceNgn, heldEscrowNgn, escrowTransactions, topUpWallet, withdrawFunds, user, showFeedbackBanner } = useAppStore();

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
      showFeedbackBanner(
        'Payout Initiated',
        `${formatNgn(numAmount)} queued to ${selectedBank}`,
        'NGN'
      );
      setTimeout(() => {
        setWithdrawSuccess(false);
        setShowWithdrawModal(false);
      }, 1600);
    }
  };

  return (
    <div className="w-full pb-20 px-5 pt-4 space-y-6 animate-in fade-in">
      {/* Open Balance Header */}
      <div className="space-y-4 pb-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
            Wallet
          </h2>
          <button
            onClick={() => setShowInfoModal(true)}
            className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] active-press"
          >
            How it works
          </button>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs text-[var(--text-secondary)] block">Available</span>
            <span className="text-3xl font-display font-bold font-mono tabular-nums tracking-tight block mt-0.5 text-[var(--text-primary)]">
              {formatNgn(escrowBalanceNgn)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-[var(--text-secondary)] block">Held in trips</span>
            <span className="text-base font-mono tabular-nums font-semibold block mt-0.5" style={{ color: 'var(--accent-signal)' }}>
              {formatNgn(heldEscrowNgn)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => {
              setErrorMessage('');
              setShowWithdrawModal(true);
            }}
            className="flex-1 h-11 btn-electric-mint text-xs flex items-center justify-center gap-1.5 active-press"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>

          <button
            onClick={() => topUpWallet(10000)}
            className="h-11 px-4 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-1.5 active-press"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add ₦10k</span>
          </button>
        </div>
      </div>

      {/* 3. Transaction History Ledger */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-display font-black text-[var(--text-primary)]">
            Escrow Activity
          </h3>
          <span className="text-[10px] text-[var(--text-secondary)] font-mono font-bold">
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
                      : 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
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
                  <h4 className="text-xs font-extrabold text-[var(--text-primary)] truncate">
                    {tx.description}
                  </h4>
                  <div className="text-[10px] text-[var(--text-secondary)] font-mono tabular-nums truncate">
                    {tx.reference} • {tx.timestamp}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-black font-mono tabular-nums block text-[var(--text-primary)]">
                  {tx.type === 'TOPUP' ? '+' : '-'}
                  {formatNgn(tx.amountNgn)}
                </span>
                <span className="inline-block text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] dark:text-[var(--accent-primary)]">
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
                  <h3 className="text-sm font-display font-black text-[var(--text-primary)]">
                    Withdraw to Bank
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                    NIBSS INSTANT PAYOUT
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-display font-black text-[var(--text-primary)]">
                  Transfer Initiated
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  <span className="font-mono tabular-nums font-bold text-[var(--text-primary)]">
                    {formatNgn(numAmount)}
                  </span>{' '}
                  sent to {selectedBank}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmWithdrawal} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[var(--text-secondary)] mb-1">
                    Destination Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--bg-subtle)] rounded-full text-xs font-bold text-[var(--text-primary)] focus:outline-hidden"
                  >
                    {NIGERIAN_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[var(--text-secondary)] mb-1">
                    NUBAN Account Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="0123456789"
                    className="w-full px-4 py-3 bg-[var(--bg-subtle)] rounded-full text-xs font-mono tabular-nums font-bold text-[var(--text-primary)] focus:outline-hidden"
                  />
                  {accountNumber.length === 10 && (
                    <div className="mt-1.5 px-3.5 py-1.5 bg-[var(--accent-primary)]/15 rounded-full flex items-center justify-between text-[10px] text-[var(--text-primary)]">
                      <span className="font-mono font-bold">VERIFIED:</span>
                      <strong className="uppercase font-mono">{user.fullName}</strong>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-[var(--text-secondary)] mb-1">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--bg-subtle)] rounded-full text-xs font-mono tabular-nums font-bold text-[var(--text-primary)] focus:outline-hidden"
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
              <h3 className="text-base font-display font-black text-[var(--text-primary)]">
                Escrow Rules
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-[var(--text-secondary)] text-[11px] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[var(--bg-subtle)]">
                <strong className="text-[var(--text-primary)] block">01. Commuter Deposits</strong>
                Unused balance can be withdrawn back to any Nigerian bank via NIBSS instant rails.
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-subtle)]">
                <strong className="text-[var(--text-primary)] block">02. Fuel Split Release</strong>
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
