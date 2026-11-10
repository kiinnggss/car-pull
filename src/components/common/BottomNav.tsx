'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { CalendarCheck, QrCode, MessageCircle, AlertOctagon, Navigation, Layers } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeMatches,
    unreadChatCount,
    isSosActive,
    triggerSosBeacon,
    activeThreadId,
  } = useAppStore();

  if (activeTab === 'chats' && activeThreadId) {
    return null;
  }

  const matchCount = activeMatches.length;

  const navButtonClass = (isActive: boolean) =>
    `relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all min-h-[46px] active-spring ${
      isActive
        ? 'bg-teal-500/12 dark:bg-teal-400/15 text-[#0F766E] dark:text-[#14B8A6] font-extrabold'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-semibold'
    }`;

  return (
    <nav className="fixed sm:absolute bottom-2.5 inset-x-2.5 z-40 max-w-[410px] mx-auto rounded-2xl bg-white/95 dark:bg-[#0E141B]/95 backdrop-blur-xl px-2 py-1.5 floating-dock transition-all">
      <div className="grid grid-cols-6 items-center gap-1">
        {/* Tab 1: Commuter Deck */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('deck');
          }}
          className={navButtonClass(activeTab === 'deck')}
          title="Corridor commuter deck"
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Deck</span>
        </button>

        {/* Tab 2: Street Discovery Map */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('map');
          }}
          className={navButtonClass(activeTab === 'map')}
          title="Street-level carpool discovery map"
        >
          <Navigation className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Map</span>
        </button>

        {/* Tab 3: Booked Rides */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('matches');
          }}
          className={navButtonClass(activeTab === 'matches')}
          title="Booked carpool rides"
        >
          <div className="relative">
            <CalendarCheck className="w-4 h-4" />
            {matchCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#0F766E] dark:bg-[#14B8A6] text-white dark:text-[#041E1B] text-[9px] font-mono font-extrabold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                {matchCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Rides</span>
        </button>

        {/* Tab 4: In-App Messenger */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            setActiveTab('chats');
          }}
          className={navButtonClass(activeTab === 'chats')}
          title="Corridor peer chats"
        >
          <div className="relative">
            <MessageCircle className="w-4 h-4" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#0F766E] dark:bg-[#14B8A6] text-white dark:text-[#041E1B] text-[9px] font-mono font-extrabold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
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
          className={navButtonClass(activeTab === 'pass')}
          title="Section 44 statutory commute pass"
        >
          <QrCode className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Pass</span>
        </button>

        {/* Tab 6: Distress Beacon Button */}
        <button
          onClick={() => {
            triggerHaptic('sos');
            triggerSosBeacon();
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl min-h-[46px] transition-all active-spring ${
            isSosActive || activeTab === 'sos'
              ? 'bg-rose-600 text-white font-extrabold shadow-sm'
              : 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-bold border border-rose-500/20'
          }`}
          title="LASDRI Roadside SOS Beacon"
        >
          <AlertOctagon className="w-4 h-4" />
          <span className="text-[9.5px] uppercase tracking-wider mt-0.5">SOS</span>
        </button>
      </div>
    </nav>
  );
};
