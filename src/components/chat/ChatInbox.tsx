'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  MessageCircle,
  Search,
  Compass,
  ShieldCheck,
  X,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const ChatInbox: React.FC = () => {
  const {
    chatThreads,
    setActiveThreadId,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'driver' | 'rider'>('all');

  const filteredThreads = chatThreads.filter((thread) => {
    const matchesFilter = activeFilter === 'all' || thread.partnerRole === activeFilter;
    const matchesSearch =
      thread.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.partnerEmployer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.routeSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (thread.vehiclePlate && thread.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const totalUnread = chatThreads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <div className="w-full max-w-[404px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in pt-1">
      {/* Header & Search Sheet */}
      <div className="floating-surface rounded-[28px] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-black text-[var(--text-primary)] tracking-tight">
                Messages
              </h2>
              {totalUnread > 0 && (
                <span className="bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] text-[10px] font-mono tabular-nums font-black px-2.5 py-0.5 rounded-full">
                  {totalUnread} NEW
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              Direct pickup coordination with corridor peers
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] dark:text-[var(--accent-primary)] text-[10px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>

        {/* Pill Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#525866] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search peers, companies, routes, or plates..."
            className="w-full pl-10 pr-8 py-2.5 bg-[var(--bg-subtle)] rounded-full text-xs font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525866] p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Segmented Pill Filter */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-[var(--bg-subtle)]">
          {(
            [
              { id: 'all', label: 'All Chats' },
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
                className={`py-1.5 rounded-full text-[11px] font-extrabold transition-all active-press ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-2.5">
        {filteredThreads.length === 0 ? (
          <div className="floating-surface rounded-[28px] p-6 text-center space-y-2">
            <MessageCircle className="w-7 h-7 text-[#525866] mx-auto" />
            <p className="text-xs font-extrabold text-[var(--text-primary)]">No conversations found</p>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Connect with a driver or co-rider on the Swipe Deck to open a direct thread.
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const hasUnread = thread.unreadCount > 0;
            const isEnRoute = thread.tripStatus === 'en-route';

            return (
              <button
                key={thread.id}
                onClick={() => {
                  triggerHaptic('tap');
                  setActiveThreadId(thread.id);
                }}
                className={`w-full text-left floating-surface rounded-[28px] p-4 transition-all active-press flex items-start gap-3.5 relative ${
                  hasUnread ? 'ring-2 ring-[#0B0C0E] dark:ring-[var(--accent-primary)]' : ''
                }`}
              >
                {/* Circular Avatar with Online Dot */}
                <div className="relative flex-shrink-0">
                  <div className="relative w-12 h-12 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] flex items-center justify-center font-mono font-bold text-xs overflow-hidden">
                    <span>{thread.partnerName.split(' ').map((n) => n[0]).join('')}</span>
                    <img
                      src={thread.partnerAvatar}
                      alt={thread.partnerName}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  {thread.isOnline && (
                    <span
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[var(--accent-primary)] ring-2 ring-white dark:ring-[#14161B] z-10"
                      title="Online now"
                    />
                  )}
                </div>

                {/* Thread Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className="text-sm font-display font-black text-[var(--text-primary)] truncate">
                        {thread.partnerName}
                      </h4>
                      {isEnRoute && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] text-[9px] font-mono font-black">
                          EN ROUTE
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono tabular-nums text-[var(--text-secondary)] flex-shrink-0">
                      {thread.lastMessageTimestamp}
                    </span>
                  </div>

                  {/* Route & Plate */}
                  <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--text-secondary)] mt-1">
                    <span className="truncate font-semibold flex items-center gap-1">
                      <Compass className="w-3 h-3 text-[#FF9F0A] flex-shrink-0" />
                      {thread.routeSummary}
                    </span>
                    {thread.vehiclePlate && (
                      <span className="plate-badge flex-shrink-0">{thread.vehiclePlate}</span>
                    )}
                  </div>

                  {/* Last Message & Unread Pill */}
                  <div className="flex items-center justify-between mt-2">
                    <p
                      className={`text-xs truncate ${
                        hasUnread
                          ? 'font-extrabold text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {thread.lastMessage}
                    </p>
                    {hasUnread && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] text-[10px] font-mono font-black flex items-center justify-center flex-shrink-0">
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
