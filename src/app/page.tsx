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
  const { activeTab, setActiveTab, activeRole, isAuthenticated, theme } = useAppStore();

  // Sync theme class to document root
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, [theme]);

  // Browser & Device back-button handling:
  // When user is on any secondary tab, pressing back navigates back to 'deck' instead of exiting the PWA
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab !== 'map') {
      window.history.pushState({ tab: activeTab }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
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
      <main className="w-full max-w-[430px] min-h-screen bg-[#F6F2EA] dark:bg-[#121110] border-x border-[#DDD4C5] dark:border-stone-800 relative flex flex-col justify-between shadow-2xl text-[#141210] dark:text-[#EDE8E1] overflow-x-hidden">
        <AuthLanding />
      </main>
    );
  }

  const isMapTab = activeTab === 'map';
  const isDeckTab = activeTab === 'deck';

  return (
    <main className="w-full max-w-[430px] h-screen h-[100dvh] bg-[#ECE6DC] dark:bg-[#0E0D0C] border-x border-[#DDD4C5] dark:border-stone-800 relative flex flex-col justify-between shadow-2xl text-[#141210] dark:text-[#EDE8E1] overflow-hidden">
      {/* Persistent Living Street Map Canvas Underlay */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-300 ${
          isMapTab
            ? 'opacity-100 pointer-events-auto'
            : isDeckTab
            ? 'opacity-85 pointer-events-none'
            : 'opacity-30 pointer-events-none filter blur-[1px]'
        }`}
      >
        <CorridorMap isBackgroundUnderlay={!isMapTab} />
      </div>

      {/* Top Application Header (Frosted Glass Floating Over Map) */}
      <Header />

      {/* Primary Dynamic Content Area */}
      <div className="flex-1 w-full pt-1 pb-[70px] flex flex-col min-h-0 overflow-y-auto no-scrollbar relative z-10">
        {isDeckTab && (activeRole === 'driver' ? <DriverSeatDeck /> : <SwipeDeck />)}
        {activeTab === 'matches' && <MatchesList />}
        {activeTab === 'chats' && <ChatHub />}
        {activeTab === 'pass' && <CommutePass />}
        {activeTab === 'safezones' && (
          <div className="px-3 pb-24 max-w-[390px] mx-auto">
            <SafeZoneSelector />
          </div>
        )}
        {activeTab === 'wallet' && <EscrowWallet />}
        {activeTab === 'sos' && <EmergencyBeacon />}
      </div>

      {/* Fixed Bottom Ergonomic Thumb-Zone Navigation (Frosted Glass Floating Over Map) */}
      <BottomNav />
    </main>
  );
}
