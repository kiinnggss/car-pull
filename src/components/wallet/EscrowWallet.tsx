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
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3.5 animate-in fade-in">
      {/* Balance Card - Clean Slate Surface */}
      <div className="bg-white dark:bg-[#12161A] rounded-2xl p-4.5 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-[#14B8A6]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold block">
                CAR PULL Escrow
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Zero-Cash Protection
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Top-up Button */}
            <button
              onClick={() => topUpWallet(10000)}
              className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-2xs active:scale-95 transition-all border border-slate-200 dark:border-slate-700"
              title="Add ₦10,000 via Paystack"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>+₦10k</span>
            </button>

            {/* Withdraw Button */}
            <button
              onClick={() => {
                setErrorMessage('');
                setShowWithdrawModal(true);
              }}
              className="flex items-center gap-1 bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs active:scale-95 transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Balance Metrics - Inline Dual Metrics without Double Boxes */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Available To Withdraw</span>
            <span className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {formatNgn(escrowBalanceNgn)}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:border-slate-800" />

          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block flex items-center justify-end gap-1">
              <Lock className="w-2.5 h-2.5 text-[#F58A25]" /> Held In Active Trips
            </span>
            <span className="text-xl font-black text-amber-700 dark:text-amber-400 tracking-tight">
              {formatNgn(heldEscrowNgn)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <span>Funds payout via NIBSS Instant Payment (NIP)</span>
          <button
            onClick={() => setShowInfoModal(true)}
            className="text-[#0F766E] dark:text-[#14B8A6] font-bold flex items-center gap-0.5 hover:underline"
          >
            <HelpCircle className="w-3 h-3" /> Payout rules
          </button>
        </div>
      </div>

      {/* Transaction History Ledger - Flowing Clean Items */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Escrow Audit Ledger
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Real-Time</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#12161A] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          {escrowTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    tx.type === 'WITHDRAWAL'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      : tx.type.includes('RELEASE') || tx.type === 'TOPUP'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-[#14B8A6]'
                      : tx.type === 'FLAKE_PENALTY'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{tx.description}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    <span>{tx.reference}</span>
                    <span>• {tx.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span
                  className={`text-xs font-bold block ${
                    tx.type === 'TOPUP'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : tx.type === 'WITHDRAWAL'
                      ? 'text-slate-800 dark:text-slate-200'
                      : tx.type.includes('HOLD')
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {tx.type === 'TOPUP' ? '+' : '-'}
                  {formatNgn(tx.amountNgn)}
                </span>
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                    tx.type === 'WITHDRAWAL'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      : tx.status === 'held'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                      : 'bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-[#14B8A6] border-teal-200 dark:border-teal-800/60'
                  }`}
                >
                  {tx.type === 'WITHDRAWAL' ? 'Sent' : tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-[370px] bg-white dark:bg-[#12161A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-[#14B8A6]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Withdraw to Bank</h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">NIBSS Instant Payment (NIP)</span>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Transfer Initiated!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatNgn(numAmount)} sent to {selectedBank}. Arrives in 10-30 seconds.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmWithdrawal} className="space-y-3 text-xs">
                {/* Available Balance Reminder */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Available Balance:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatNgn(escrowBalanceNgn)}</span>
                </div>

                {/* Bank Select */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Select Destination Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  >
                    {NIGERIAN_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Number & Auto Name Inquiry */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    NUBAN Account Number (10 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="0123456789"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  />
                  {accountNumber.length === 10 && (
                    <div className="mt-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-between text-[10px] text-emerald-800 dark:text-emerald-300">
                      <span className="font-semibold">NIBSS Verified Name:</span>
                      <strong className="uppercase">{user.fullName}</strong>
                    </div>
                  )}
                </div>

                {/* Amount to Withdraw */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Amount to Withdraw (₦)
                    </label>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(escrowBalanceNgn.toString())}
                      className="text-[10px] font-bold text-[#0F766E] dark:text-[#14B8A6] hover:underline"
                    >
                      Max: {formatNgn(escrowBalanceNgn)}
                    </button>
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  />

                  {/* Quick Pill presets */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[5000, 10000, 20000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setWithdrawAmount(preset.toString())}
                        className="flex-1 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-colors"
                      >
                        +{formatNgn(preset)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fees & Summary */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl space-y-1 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span>NIP Transfer Settlement:</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">Instant (Zero Fee)</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-0.5 border-t border-slate-200 dark:border-slate-800">
                    <span>Net Amount Credited:</span>
                    <span className="text-[#0F766E] dark:text-[#14B8A6] text-xs font-bold">{formatNgn(numAmount)}</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 dark:bg-red-950/40 p-2 rounded-xl flex items-center gap-1.5 text-[10px] text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isAccountValid || !isAmountValid}
                  className="w-full py-3 bg-[#0F766E] hover:bg-[#0D655E] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[340px] bg-white dark:bg-[#12161A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                How Escrow Payouts Work
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-[#14B8A6] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Commuter Deposits:</strong> Unused wallet balance can be withdrawn back to your commercial bank at any time via Paystack NIBSS rails.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Driver Fuel Split:</strong> Held funds are unlocked and become withdrawable automatically when the passenger confirms drop-off at the designated safe zone.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Tow & Mechanic Earnings:</strong> Roadside fees are released immediately once the vehicle reaches the destination workshop or photo parts receipt is approved.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
