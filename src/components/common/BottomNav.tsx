'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Compass, CalendarCheck, QrCode, MessageCircle, AlertOctagon, Navigation } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeMatches,
    unreadChatCount,
    isSosActive,
    triggerSosBeacon,
  } = useAppStore();

  const matchCount = activeMatches.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto bg-[#F6F2EA]/98 dark:bg-[#141210]/98 backdrop-blur-md border-t border-[#DDD4C5] dark:border-stone-800 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg safe-bottom transition-colors">
      <div className="flex items-center justify-around">
        {/* Tab 1: Street Carpool Discovery Map */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('map');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active-press ${
            activeTab === 'map' || activeTab === 'deck'
              ? 'text-[#0D6E6E] dark:text-[#14B8A6] font-black'
              : 'text-[#70665A] dark:text-stone-400 hover:text-[#141210] dark:hover:text-stone-200'
          }`}
          title="Street-level carpool discovery map"
        >
          <Navigation className={`w-5 h-5 ${activeTab === 'map' || activeTab === 'deck' ? 'text-[#0D6E6E] dark:text-[#14B8A6]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Map</span>
        </button>

        {/* Tab 2: Booked Rides */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('matches');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active-press ${
            activeTab === 'matches'
              ? 'text-[#0D6E6E] dark:text-[#14B8A6] font-black'
              : 'text-[#70665A] dark:text-stone-400 hover:text-[#141210] dark:hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <CalendarCheck className={`w-5 h-5 ${activeTab === 'matches' ? 'text-[#0D6E6E] dark:text-[#14B8A6]' : ''}`} />
            {matchCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-[#121110] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-[#141210]">
                {matchCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Rides</span>
        </button>

        {/* Central Distress Beacon Button */}
        <button
          onClick={() => {
            triggerHaptic('sos');
            triggerSosBeacon();
          }}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl min-h-[44px] transition-all transform active-press ${
            isSosActive || activeTab === 'sos'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60'
          }`}
        >
          <AlertOctagon className="w-5 h-5 text-red-500 dark:text-red-400" />
          <span className="text-[8px] font-extrabold uppercase tracking-wider mt-0.5">SOS</span>
        </button>

        {/* Tab 4: In-App Messenger */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('chats');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active-press ${
            activeTab === 'chats'
              ? 'text-[#0D6E6E] dark:text-[#14B8A6] font-black'
              : 'text-[#70665A] dark:text-stone-400 hover:text-[#141210] dark:hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 ${activeTab === 'chats' ? 'text-[#0D6E6E] dark:text-[#14B8A6]' : ''}`} />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-[#121110] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-[#141210]">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Chats</span>
        </button>

        {/* Tab 5: LASTMA Non-Commercial Pass */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('pass');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active-press ${
            activeTab === 'pass'
              ? 'text-[#0D6E6E] dark:text-[#14B8A6] font-black'
              : 'text-[#70665A] dark:text-stone-400 hover:text-[#141210] dark:hover:text-stone-200'
          }`}
        >
          <QrCode className={`w-5 h-5 ${activeTab === 'pass' ? 'text-[#0D6E6E] dark:text-[#14B8A6]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Pass</span>
        </button>
      </div>
    </nav>
  );
};
