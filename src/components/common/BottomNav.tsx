'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Compass, CalendarCheck, QrCode, MessageCircle, AlertOctagon, Navigation, Sparkles } from 'lucide-react';
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto bg-white/90 dark:bg-[#0E1216]/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg safe-bottom transition-colors">
      <div className="flex items-center justify-around">
        {/* Tab 1: Swipe Cards Deck */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('deck');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active:scale-95 ${
            activeTab === 'deck'
              ? 'text-[#0F766E] dark:text-[#14B8A6] font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Swipe carpool cards deck"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Swipe</span>
        </button>

        {/* Tab 2: Street Discovery Map */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('map');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active:scale-95 ${
            activeTab === 'map'
              ? 'text-[#0F766E] dark:text-[#14B8A6] font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Street-level carpool discovery map"
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Map</span>
        </button>

        {/* Tab 3: Booked Rides */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('matches');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active:scale-95 ${
            activeTab === 'matches'
              ? 'text-[#0F766E] dark:text-[#14B8A6] font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CalendarCheck className="w-5 h-5" />
            {matchCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#0F766E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {matchCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Rides</span>
        </button>

        {/* Central Distress Beacon Button */}
        <button
          onClick={() => {
            triggerHaptic('sos');
            triggerSosBeacon();
          }}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl min-h-[44px] transition-all active:scale-95 ${
            isSosActive || activeTab === 'sos'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-rose-600 dark:text-rose-400 hover:bg-rose-50'
          }`}
        >
          <AlertOctagon className="w-5 h-5" />
          <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">SOS</span>
        </button>

        {/* Tab 4: In-App Messenger */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('chats');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active:scale-95 ${
            activeTab === 'chats'
              ? 'text-[#0F766E] dark:text-[#14B8A6] font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#0F766E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Chats</span>
        </button>

        {/* Tab 5: LASTMA Non-Commercial Pass */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('pass');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active:scale-95 ${
            activeTab === 'pass'
              ? 'text-[#0F766E] dark:text-[#14B8A6] font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Pass</span>
        </button>
      </div>
    </nav>
  );
};
