'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  MessageCircle,
  Search,
  CheckCheck,
  Clock,
  Car,
  ShieldCheck,
  Compass,
  Phone,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  Users,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const ChatInbox: React.FC = () => {
  const {
    chatThreads,
    setActiveThreadId,
    theme,
    toggleTheme,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'driver' | 'rider'>('all');

  const filteredThreads = chatThreads.filter((thread) => {
    const matchesFilter = activeFilter === 'all' || thread.partnerRole === activeFilter;
    const matchesSearch =
      thread.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.partnerEmployer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.routeSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalUnread = chatThreads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in">
      {/* Header with Title & Theme Toggle */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-serif font-black text-[#141210] dark:text-[#EDE8E1] flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-[#0D6E6E] dark:text-[#14B8A6]" />
              Commute Chats
            </h2>
            {totalUnread > 0 && (
              <span className="bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-[#121110] text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                {totalUnread} New
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#70665A] dark:text-stone-400 font-medium">
            Real-time coordination with verified carpool peers
          </p>
        </div>

        {/* Quick Theme Switcher Pill */}
        <button
          onClick={() => {
            triggerHaptic('switch');
            toggleTheme();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#DDD4C5] dark:border-stone-700 text-xs font-bold text-[#141210] dark:text-stone-200 shadow-2xs active-press transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px]">Dark</span>
            </>
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#70665A] dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search co-riders, drivers, or routes..."
          className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#1E1B18] border border-[#DDD4C5] dark:border-stone-800 rounded-2xl text-xs font-medium text-[#141210] dark:text-[#EDE8E1] placeholder:text-[#70665A]/60 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-[#0D6E6E] dark:focus:ring-[#14B8A6] transition-all shadow-2xs"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        {(
          [
            { id: 'all', label: 'All Threads' },
            { id: 'driver', label: 'Drivers' },
            { id: 'rider', label: 'Co-Riders' },
          ] as const
        ).map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('tap');
                setActiveFilter(tab.id);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all active-press border ${
                isActive
                  ? 'bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-[#121110] border-[#0D6E6E] dark:border-[#14B8A6] shadow-2xs'
                  : 'bg-white dark:bg-[#1E1B18] text-[#70665A] dark:text-stone-400 border-[#DDD4C5] dark:border-stone-800 hover:text-[#141210] dark:hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Threads List */}
      <div className="space-y-2">
        {filteredThreads.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1B18] rounded-3xl p-6 text-center border border-[#DDD4C5] dark:border-stone-800 space-y-2">
            <MessageCircle className="w-8 h-8 text-[#70665A]/40 dark:text-stone-600 mx-auto" />
            <p className="text-xs font-bold text-[#141210] dark:text-stone-300">No chats found</p>
            <p className="text-[11px] text-[#70665A] dark:text-stone-500">
              When you accept or match a ride, direct in-app chat opens here automatically.
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const hasUnread = thread.unreadCount > 0;
            return (
              <button
                key={thread.id}
                onClick={() => {
                  triggerHaptic('tap');
                  setActiveThreadId(thread.id);
                }}
                className={`w-full text-left bg-white dark:bg-[#1E1B18] rounded-2xl p-3 border transition-all active-press shadow-2xs hover:shadow-xs flex items-center gap-3 ${
                  hasUnread
                    ? 'border-[#0D6E6E]/40 dark:border-[#14B8A6]/40 ring-1 ring-[#0D6E6E]/15 dark:ring-[#14B8A6]/20'
                    : 'border-[#DDD4C5] dark:border-stone-800'
                }`}
              >
                {/* Avatar with Online Badge */}
                <div className="relative flex-shrink-0">
                  <img
                    src={thread.partnerAvatar}
                    alt={thread.partnerName}
                    className="w-12 h-12 rounded-2xl object-cover border border-[#DDD4C5] dark:border-stone-700"
                  />
                  {thread.isOnline && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1E1B18]"
                      title="Online now"
                    />
                  )}
                </div>

                {/* Thread Middle Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className="text-xs font-serif font-black text-[#141210] dark:text-[#EDE8E1] truncate">
                        {thread.partnerName}
                      </h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-stone-800 text-[#70665A] dark:text-stone-300 flex-shrink-0">
                        {thread.partnerRole === 'driver' ? 'Driver' : 'Co-Rider'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#70665A] dark:text-stone-500 flex-shrink-0">
                      {thread.lastMessageTimestamp}
                    </span>
                  </div>

                  {/* Route & Car Pill */}
                  <div className="flex items-center gap-1 text-[10px] text-[#70665A] dark:text-stone-400 mt-0.5 truncate font-medium">
                    <Compass className="w-3 h-3 text-[#0D6E6E] dark:text-[#14B8A6] flex-shrink-0" />
                    <span className="truncate">{thread.routeSummary}</span>
                    {thread.vehiclePlate && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[#C25E2E] dark:text-amber-400 flex-shrink-0">
                          {thread.vehiclePlate}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Last Message Snippet */}
                  <div className="flex items-center justify-between mt-1">
                    <p
                      className={`text-xs truncate ${
                        hasUnread
                          ? 'font-bold text-[#141210] dark:text-white'
                          : 'text-[#70665A] dark:text-stone-400'
                      }`}
                    >
                      {thread.lastMessage}
                    </p>
                    {hasUnread && (
                      <span className="ml-1.5 w-4 h-4 rounded-full bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-[#121110] text-[9px] font-black flex items-center justify-center flex-shrink-0">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
