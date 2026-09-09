'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Compass, CalendarCheck, QrCode, Wallet, AlertOctagon, Navigation } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeMatches, isSosActive, triggerSosBeacon } = useAppStore();

  const matchCount = activeMatches.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto bg-[#FAF8F5]/98 backdrop-blur-md border-t border-[#E7E2D8] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Tab 1: Corridor Swipe Deck & Live Map Toggle */}
        <button
          onClick={() => setActiveTab(activeTab === 'deck' ? 'map' : 'deck')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] ${
            activeTab === 'deck' || activeTab === 'map'
              ? 'text-[#7C3AED] font-black'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
          title="Tap to toggle between Card Deck and Live Corridor Map"
        >
          {activeTab === 'map' ? (
            <Navigation className="w-5 h-5 text-[#7C3AED]" />
          ) : (
            <Compass className={`w-5 h-5 ${activeTab === 'deck' ? 'text-[#7C3AED]' : ''}`} />
          )}
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">
            {activeTab === 'map' ? 'Live Map' : 'Corridor'}
          </span>
        </button>

        {/* Tab 2: Matches & Daily Locks */}
        <button
          onClick={() => setActiveTab('matches')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] ${
            activeTab === 'matches'
              ? 'text-[#7C3AED] font-black'
              : 'text-[#78716C] hover:text-[#1C1917]'
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
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Matches</span>
        </button>

        {/* Central Distress Beacon Button */}
        <button
          onClick={triggerSosBeacon}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl min-h-[44px] transition-all transform active:scale-95 ${
            isSosActive || activeTab === 'sos'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
          }`}
        >
          <AlertOctagon className="w-5 h-5 text-red-500" />
          <span className="text-[8px] font-extrabold uppercase tracking-wider mt-0.5">SOS</span>
        </button>

        {/* Tab 4: LASTMA Non-Commercial Pass */}
        <button
          onClick={() => setActiveTab('pass')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] ${
            activeTab === 'pass'
              ? 'text-[#7C3AED] font-black'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <QrCode className={`w-5 h-5 ${activeTab === 'pass' ? 'text-[#7C3AED]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Pass</span>
        </button>

        {/* Tab 5: Zero-Cash Escrow Wallet */}
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] ${
            activeTab === 'wallet'
              ? 'text-[#7C3AED] font-black'
              : 'text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Wallet className={`w-5 h-5 ${activeTab === 'wallet' ? 'text-[#7C3AED]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Escrow</span>
        </button>
      </div>
    </nav>
  );
};
