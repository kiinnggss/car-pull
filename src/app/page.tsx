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
import { ActionFeedbackBanner } from '@/components/common/ActionFeedbackBanner';
import { applyThemeToDocument } from '@/lib/themes';
import { subscribeToCorridorRealtime } from '@/lib/supabase/realtime';

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    isAuthenticated,
    backendMode,
    user,
    hydrateSupabaseSession,
    receiveRemoteChatMessage,
    receiveRemoteMatchStatus,
    colorTheme,
    customAccentHex,
    transparentDock,
    activeThreadId,
  } = useAppStore();

  useEffect(() => {
    void hydrateSupabaseSession();
  }, [hydrateSupabaseSession]);

  useEffect(() => {
    if (!isAuthenticated || backendMode !== 'supabase') return;
    return subscribeToCorridorRealtime({
      currentUserId: user.id,
      onRemoteChat: receiveRemoteChatMessage,
      onRemoteMatchStatus: ({ id, status }) => receiveRemoteMatchStatus(id, status),
    });
  }, [
    isAuthenticated,
    backendMode,
    user.id,
    receiveRemoteChatMessage,
    receiveRemoteMatchStatus,
  ]);

  useEffect(() => {
    applyThemeToDocument(colorTheme, customAccentHex, transparentDock);
  }, [colorTheme, customAccentHex, transparentDock]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab !== 'map') {
      window.history.pushState({ tab: activeTab }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      const targetTab = e.state?.tab;
      if (targetTab) {
        if (targetTab !== activeTab) {
          setActiveTab(targetTab);
        }
      } else if (activeTab !== 'map') {
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
      <main className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] sm:max-h-[92vh] sm:my-auto sm:rounded-2xl bg-[var(--bg-sheet)] sm:border sm:border-[var(--border-subtle)] relative flex flex-col justify-between sm:shadow-xl text-[var(--text-primary)] overflow-x-hidden">
        <AuthLanding />
        <ActionFeedbackBanner />
      </main>
    );
  }

  const isMapTab = activeTab === 'map';
  const isDeckTab = activeTab === 'deck';
  const isChatThreadOpen = activeTab === 'chats' && !!activeThreadId;

  return (
    <main className="w-full max-w-[430px] h-screen h-[100dvh] sm:h-[844px] sm:max-h-[92vh] sm:my-auto sm:rounded-2xl bg-[var(--bg-sheet)] sm:border sm:border-[var(--border-subtle)] relative flex flex-col justify-between sm:shadow-xl text-[var(--text-primary)] overflow-hidden">
      {/* Top Application Bar (Hidden when inside full-screen chat thread) */}
      {!isChatThreadOpen && <Header />}

      {/* Primary Viewport Content Area */}
      <div
        className={`flex-1 w-full flex flex-col min-h-0 relative z-10 ${
          isChatThreadOpen || isMapTab
            ? 'h-full overflow-hidden p-0'
            : 'pt-1 overflow-y-auto no-scrollbar pb-3'
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

      {/* Minimalist Bottom Navigation Dock */}
      {!isChatThreadOpen && <BottomNav />}
      <ActionFeedbackBanner />
    </main>
  );
}
