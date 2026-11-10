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
      setErrorMessage('Please enter a valid 10-digit NUBAN account number.');
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
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#10B981', '#0F766E', '#FFFFFF'],
      });
      setTimeout(() => {
        setWithdrawSuccess(false);
        setShowWithdrawModal(false);
      }, 1600);
    }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in pt-1">
      {/* Escrow Balance Console */}
      <div className="floating-surface rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-slate-200/70 dark:border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/12 border border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                CAR PULL ESCROW
              </span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" /> Zero-Cash Protection
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowInfoModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#171F29] hover:bg-slate-200/70 dark:hover:bg-[#1E2936] text-slate-700 dark:text-slate-200 text-[11px] font-bold active-spring transition-all border border-slate-200/80 dark:border-white/10"
            title="How Escrow Payouts Work"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Rules</span>
          </button>
        </div>

        {/* Hairline-Divided Dual Balance Metrics */}
        <div className="grid grid-cols-2 divide-x divide-slate-200/70 dark:divide-white/8 border-b border-slate-200/70 dark:border-white/8">
          <div className="p-4">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block mb-1">
              AVAILABLE TO WITHDRAW
            </span>
            <span className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white tracking-tight block">
              {formatNgn(escrowBalanceNgn)}
            </span>
          </div>

          <div className="p-4 text-right">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center justify-end gap-1 mb-1">
              <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" /> HELD IN ACTIVE TRIPS
            </span>
            <span className="text-2xl font-black font-mono tabular-nums text-amber-600 dark:text-amber-400 tracking-tight block">
              {formatNgn(heldEscrowNgn)}
            </span>
          </div>
        </div>

        {/* Action Strip */}
        <div className="p-3 bg-slate-50/70 dark:bg-[#0D1218]/60 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => topUpWallet(10000)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-100 bg-white dark:bg-[#171F29] hover:bg-slate-100 dark:hover:bg-[#1E2936] border border-slate-200/80 dark:border-white/10 active-spring transition-all"
              title="Add ₦10,000 via Paystack"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
              <span>Top-up (+₦10k)</span>
            </button>

            <button
              onClick={() => {
                setErrorMessage('');
                setShowWithdrawModal(true);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl btn-electric-mint text-xs font-black active-spring transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          </div>

          <div className="text-center text-[10px] font-mono text-slate-500 dark:text-slate-400">
            NIBSS Instant Payment (NIP) • Zero Payout Fee
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            ESCROW AUDIT LEDGER
          </h3>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">REAL-TIME</span>
        </div>

        <div className="floating-surface rounded-2xl overflow-hidden divide-y divide-slate-200/70 dark:divide-white/8">
          {escrowTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    tx.type === 'WITHDRAWAL'
                      ? 'bg-slate-100 dark:bg-[#171F29] border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300'
                      : tx.type.includes('RELEASE') || tx.type === 'TOPUP'
                      ? 'bg-teal-500/12 border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6]'
                      : tx.type === 'FLAKE_PENALTY'
                      ? 'bg-amber-500/12 border-amber-500/20 text-amber-700 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-[#171F29] border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tx.type === 'WITHDRAWAL' ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : tx.type.includes('HOLD') ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : tx.type === 'TOPUP' ? (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                    {tx.description}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    <span className="truncate">{tx.reference}</span>
                    <span>•</span>
                    <span className="flex-shrink-0">{tx.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span
                  className={`text-xs font-black font-mono tabular-nums block ${
                    tx.type === 'TOPUP'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : tx.type.includes('HOLD')
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {tx.type === 'TOPUP' ? '+' : '-'}
                  {formatNgn(tx.amountNgn)}
                </span>
                <span
                  className={`inline-block text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-md border ${
                    tx.type === 'WITHDRAWAL'
                      ? 'bg-slate-100 dark:bg-[#171F29] border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300'
                      : tx.status === 'held'
                      ? 'bg-amber-500/12 border-amber-500/20 text-amber-800 dark:text-amber-300'
                      : 'bg-teal-500/12 border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6]'
                  }`}
                >
                  {tx.type === 'WITHDRAWAL' ? 'SENT' : tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-[370px] floating-surface rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-white/8">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-teal-500/12 border border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Withdraw to Bank</h3>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    NIBSS Instant Payment (NIP)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-[#171F29] active-spring"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-slate-100">Transfer Initiated</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                    {formatNgn(numAmount)}
                  </span>{' '}
                  sent to {selectedBank}. Arrives in 10 to 30 seconds.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmWithdrawal} className="space-y-3 text-xs">
                <div className="bg-slate-100/80 dark:bg-[#171F29] px-3 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/8 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Available Balance</span>
                  <span className="font-black font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {formatNgn(escrowBalanceNgn)}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Destination Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-2.5 bg-slate-100/80 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  >
                    {NIGERIAN_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">
                    NUBAN Account Number (10 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="0123456789"
                    className="w-full p-2.5 bg-slate-100/80 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 rounded-xl text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                  {accountNumber.length === 10 && (
                    <div className="mt-1.5 px-2.5 py-1.5 bg-emerald-500/12 border border-emerald-500/20 rounded-xl flex items-center justify-between text-[10px] text-emerald-800 dark:text-emerald-300">
                      <span className="font-mono font-bold">NIBSS VERIFIED:</span>
                      <strong className="uppercase font-mono">{user.fullName}</strong>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                      Amount to Withdraw (₦)
                    </label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(escrowBalanceNgn.toString())}
                      className="text-[10px] font-bold text-[#0F766E] dark:text-[#14B8A6] hover:underline font-mono tabular-nums"
                    >
                      Max: {formatNgn(escrowBalanceNgn)}
                    </button>
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full p-2.5 bg-slate-100/80 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 rounded-xl text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />

                  <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                    {[5000, 10000, 20000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setWithdrawAmount(preset.toString())}
                        className="py-1.5 rounded-lg text-[10px] font-bold font-mono tabular-nums text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#171F29] hover:bg-slate-200/70 dark:hover:bg-[#1E2936] border border-slate-200/80 dark:border-white/8 active-spring transition-all"
                      >
                        {formatNgn(preset)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(escrowBalanceNgn.toString())}
                      className="py-1.5 rounded-lg text-[10px] font-bold font-mono tabular-nums text-[#0F766E] dark:text-[#14B8A6] bg-teal-500/12 border border-teal-500/25 active-spring transition-all"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="bg-slate-100/80 dark:bg-[#171F29] p-3 rounded-xl border border-slate-200/80 dark:border-white/8 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>NIP Settlement</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">INSTANT (₦0 FEE)</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-0.5">
                    <span>Net Credited</span>
                    <span className="text-[#0F766E] dark:text-[#14B8A6] text-xs font-mono tabular-nums font-black">
                      {formatNgn(numAmount)}
                    </span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-500/12 border border-red-500/25 p-2.5 rounded-xl flex items-center gap-1.5 text-[10px] text-red-700 dark:text-red-300 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isAccountValid || !isAmountValid}
                  className="w-full py-3 btn-electric-mint disabled:opacity-40 text-xs font-black rounded-xl active-spring transition-all"
                >
                  Confirm Instant Withdrawal ({formatNgn(numAmount)})
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* HOW IT WORKS / PAYOUT RULES MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[350px] floating-surface rounded-2xl p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-white/8">
              <h3 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                How Escrow Payouts Work
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-[#171F29]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-teal-500/12 border border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6] font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  01
                </span>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Commuter Deposits:</strong> Unused wallet balance can be withdrawn back to your commercial bank at any time via NIBSS rails.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-emerald-500/12 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  02
                </span>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Driver Fuel Split:</strong> Held funds unlock automatically when the passenger confirms boarding or drop-off at the designated safe hub.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-amber-500/12 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  03
                </span>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Roadside Dispatch:</strong> Tow and mechanic escrow unlocks once the vehicle reaches the workshop or the photo receipt is approved.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs rounded-xl active-spring transition-all"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
