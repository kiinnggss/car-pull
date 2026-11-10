'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Header } from '@/components/common/Header';
import { BottomNav } from '@/components/common/BottomNav';
import { SwipeDeck } from '@/components/carpool/SwipeDeck';
import { DriverSeatDeck } from '@/components/carpool/DriverSeatDeck';
import { MatchesList } from '@/components/carpool/MatchesList';
import { SafeZoneSelector } from '@/components/carpool/SafeZoneSelector';
import { EscrowWallet } from '@/components/wallet/EscrowWallet';
import { EmergencyBeacon } from '@/components/sos/EmergencyBeacon';
import { CommutePass } from '@/components/pass/CommutePass';
import { CorridorMap } from '@/components/map/CorridorMap';
import { AuthLanding } from '@/components/auth/AuthLanding';
import { ChatHub } from '@/components/chat/ChatHub';

export default function Home() {
  const { activeTab, setActiveTab, activeRole, isAuthenticated, theme, activeThreadId } = useAppStore();

  // Sync theme class to document root
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, [theme]);

  // Browser & Device back-button handling
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab !== 'map') {
      window.history.pushState({ tab: activeTab }, '');
    }

    const handlePopState = () => {
      if (activeTab !== 'map') {
        setActiveTab('map');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab, setActiveTab, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <main className="w-full max-w-[430px] min-h-screen sm:min-h-[844px] sm:max-h-[92vh] sm:my-auto sm:rounded-[28px] bg-[#F1F5F9] dark:bg-[#090D11] sm:border sm:border-slate-300/80 dark:sm:border-white/10 relative flex flex-col justify-between shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.85)] text-slate-900 dark:text-slate-100 overflow-x-hidden">
        <AuthLanding />
      </main>
    );
  }

  const isMapTab = activeTab === 'map';
  const isDeckTab = activeTab === 'deck';
  const isChatThreadOpen = activeTab === 'chats' && !!activeThreadId;

  return (
    <main className="w-full max-w-[430px] h-screen h-[100dvh] sm:h-[860px] sm:max-h-[94vh] sm:my-auto sm:rounded-[28px] bg-[#F1F5F9] dark:bg-[#090D11] sm:border sm:border-slate-300/80 dark:sm:border-white/10 relative flex flex-col justify-between shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.85)] text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Top Application Header (Hidden when inside full-screen chat thread) */}
      {!isChatThreadOpen && <Header />}

      {/* Primary Dynamic Content Area */}
      <div
        className={`flex-1 w-full flex flex-col min-h-0 relative z-10 ${
          isChatThreadOpen || isMapTab
            ? 'h-full overflow-hidden p-0'
            : isDeckTab
            ? 'pt-2 overflow-hidden pb-[68px]'
            : 'pt-2 overflow-y-auto no-scrollbar pb-24'
        }`}
      >
        {isMapTab && <CorridorMap isBackgroundUnderlay={false} />}
        {isDeckTab && (activeRole === 'driver' ? <DriverSeatDeck /> : <SwipeDeck />)}
        {activeTab === 'matches' && <MatchesList />}
        {activeTab === 'chats' && <ChatHub />}
        {activeTab === 'pass' && <CommutePass />}
        {activeTab === 'safezones' && (
          <div className="px-3 pb-24 max-w-[400px] mx-auto w-full">
            <SafeZoneSelector />
          </div>
        )}
        {activeTab === 'wallet' && <EscrowWallet />}
        {activeTab === 'sos' && <EmergencyBeacon />}
      </div>

      {/* Fixed Bottom Navigation (Hidden when inside full-screen chat thread) */}
      {!isChatThreadOpen && <BottomNav />}
    </main>
  );
}
