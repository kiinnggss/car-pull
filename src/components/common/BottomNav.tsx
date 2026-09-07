'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Compass, CalendarCheck, QrCode, Wallet, AlertOctagon } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeMatches, isSosActive, triggerSosBeacon } = useAppStore();

  const matchCount = activeMatches.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto bg-white/98 border-t border-zinc-200 px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Tab 1: Corridor Swipe Deck */}
        <button
          onClick={() => setActiveTab('deck')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[48px] ${
            activeTab === 'deck'
              ? 'text-[#7C3AED] font-bold'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'deck' ? 'text-[#7C3AED]' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Corridor</span>
        </button>

        {/* Tab 2: Matches & Daily Locks */}
        <button
          onClick={() => setActiveTab('matches')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[48px] ${
            activeTab === 'matches'
              ? 'text-[#7C3AED] font-bold'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <div className="relative">
            <CalendarCheck className={`w-5 h-5 ${activeTab === 'matches' ? 'text-[#7C3AED]' : ''}`} />
            {matchCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#7C3AED] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {matchCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Matches</span>
        </button>

        {/* Central Distress Beacon Button */}
        <button
          onClick={triggerSosBeacon}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-2xl min-h-[48px] transition-all transform active:scale-90 ${
            isSosActive || activeTab === 'sos'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400'
              : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
          }`}
        >
          <AlertOctagon className="w-5 h-5 text-red-500" />
          <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5">SOS</span>
        </button>

        {/* Tab 4: LASTMA Non-Commercial Pass */}
        <button
          onClick={() => setActiveTab('pass')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[48px] ${
            activeTab === 'pass'
              ? 'text-[#7C3AED] font-bold'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <QrCode className={`w-5 h-5 ${activeTab === 'pass' ? 'text-[#7C3AED]' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Pass</span>
        </button>

        {/* Tab 5: Zero-Cash Escrow Wallet */}
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[48px] ${
            activeTab === 'wallet'
              ? 'text-[#7C3AED] font-bold'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Wallet className={`w-5 h-5 ${activeTab === 'wallet' ? 'text-[#7C3AED]' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Escrow</span>
        </button>
      </div>
    </nav>
  );
};
