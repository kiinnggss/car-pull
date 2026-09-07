'use client';

import React from 'react';
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

export default function Home() {
  const { activeTab, activeRole } = useAppStore();

  return (
    <main className="w-full max-w-[430px] min-h-screen bg-white border-x border-zinc-200 relative flex flex-col justify-between shadow-xl text-zinc-900 overflow-x-hidden">
      {/* Top Application Header */}
      <Header />

      {/* Primary Dynamic Content Area */}
      <div className="flex-1 w-full pt-3">
        {activeTab === 'deck' && (activeRole === 'driver' ? <DriverSeatDeck /> : <SwipeDeck />)}
        {activeTab === 'map' && <CorridorMap />}
        {activeTab === 'matches' && <MatchesList />}
        {activeTab === 'pass' && <CommutePass />}
        {activeTab === 'safezones' && (
          <div className="px-3 pb-24 max-w-[390px] mx-auto">
            <SafeZoneSelector />
          </div>
        )}
        {activeTab === 'wallet' && <EscrowWallet />}
        {activeTab === 'sos' && <EmergencyBeacon />}
      </div>

      {/* Fixed Bottom Ergonomic Thumb-Zone Navigation */}
      <BottomNav />
    </main>
  );
}
