'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { CalendarCheck, QrCode, MessageCircle, AlertOctagon, Navigation, Sparkles } from 'lucide-react';
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
    <nav className="fixed bottom-2.5 inset-x-2.5 z-40 max-w-[414px] mx-auto rounded-3xl bg-white/90 dark:bg-[#10161D]/90 backdrop-blur-xl px-2.5 py-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_12px_35px_-5px_rgba(0,0,0,0.12)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_20px_45px_-5px_rgba(0,0,0,0.8)] transition-all">
      <div className="flex items-center justify-around">
        {/* Tab 1: Swipe Cards Deck */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('deck');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active-spring ${
            activeTab === 'deck'
              ? 'text-[#0F766E] dark:text-[#14B8A6] font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Swipe carpool cards deck"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Swipe</span>
        </button>

        {/* Tab 2: Street Discovery Map */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('map');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active-spring ${
            activeTab === 'map'
              ? 'text-[#0F766E] dark:text-[#14B8A6] font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Street-level carpool discovery map"
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Map</span>
        </button>

        {/* Tab 3: Booked Rides */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('matches');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active-spring ${
            activeTab === 'matches'
              ? 'text-[#0F766E] dark:text-[#14B8A6] font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CalendarCheck className="w-5 h-5" />
            {matchCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#0F766E] dark:bg-[#14B8A6] text-white dark:text-[#051614] text-[9px] font-mono font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {matchCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Rides</span>
        </button>

        {/* Central Distress Beacon Button */}
        <button
          onClick={() => {
            triggerHaptic('sos');
            triggerSosBeacon();
          }}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl min-h-[44px] transition-all active-spring ${
            isSosActive || activeTab === 'sos'
              ? 'bg-rose-600 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_4px_16px_rgba(225,29,72,0.4)]'
              : 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shadow-floating-sm hover:bg-rose-100'
          }`}
        >
          <AlertOctagon className="w-5 h-5" />
          <span className="text-[8px] font-extrabold uppercase tracking-wider mt-0.5">SOS</span>
        </button>

        {/* Tab 4: In-App Messenger */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('chats');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active-spring ${
            activeTab === 'chats'
              ? 'text-[#0F766E] dark:text-[#14B8A6] font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#0F766E] dark:bg-[#14B8A6] text-white dark:text-[#051614] text-[9px] font-mono font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Chats</span>
        </button>

        {/* Tab 5: LASTMA Non-Commercial Pass */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('pass');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-h-[44px] active-spring ${
            activeTab === 'pass'
              ? 'text-[#0F766E] dark:text-[#14B8A6] font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <QrCode className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Pass</span>
        </button>
      </div>
    </nav>
  );
};
