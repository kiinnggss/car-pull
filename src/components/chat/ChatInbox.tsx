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
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3 animate-in fade-in pt-1">
      {/* Header Console */}
      <div className="floating-surface rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5 tracking-tight">
                <MessageCircle className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                Corridor Comms
              </h2>
              {totalUnread > 0 && (
                <span className="bg-teal-500/12 text-[#0F766E] dark:text-[#14B8A6] text-[10px] font-mono tabular-nums font-extrabold px-2 py-0.5 rounded-md border border-teal-500/25">
                  {totalUnread} UNREAD
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Encrypted pickup coordination with verified peers
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE RELAY</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search peers, employers, routes, or plates..."
            className="w-full pl-8 pr-8 py-2 bg-slate-100/80 dark:bg-[#171F29] rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200/80 dark:border-white/8 focus:outline-hidden focus:border-[#0F766E] dark:focus:border-[#14B8A6] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Segmented Filter Control */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100/90 dark:bg-[#171F29] border border-slate-200/70 dark:border-white/8">
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
                className={`py-1.5 rounded-lg text-[11px] font-extrabold transition-all active-press ${
                  isActive
                    ? 'bg-white dark:bg-[#11171E] text-[#0F766E] dark:text-[#14B8A6] shadow-2xs border border-slate-200/80 dark:border-white/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-2">
        {filteredThreads.length === 0 ? (
          <div className="floating-surface rounded-2xl p-6 text-center space-y-2">
            <MessageCircle className="w-7 h-7 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-extrabold text-slate-900 dark:text-slate-200">No active threads match</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              When you reserve or accept a seat along the corridor, direct peer messaging opens here.
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const hasUnread = thread.unreadCount > 0;
            const isEnRoute = thread.tripStatus === 'en-route';
            const isScheduled = thread.tripStatus === 'scheduled';

            return (
              <button
                key={thread.id}
                onClick={() => {
                  triggerHaptic('tap');
                  setActiveThreadId(thread.id);
                }}
                className={`w-full text-left floating-surface rounded-2xl p-3.5 transition-all active-press flex items-start gap-3 relative ${
                  hasUnread
                    ? 'ring-1 ring-[#0F766E]/40 dark:ring-[#14B8A6]/40'
                    : ''
                }`}
              >
                {/* Avatar with Online Indicator */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <div className="relative w-11 h-11 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-mono font-bold text-xs border border-slate-200/80 dark:border-white/10 overflow-hidden">
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
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#11171E] z-10"
                      title="Online now"
                    />
                  )}
                </div>

                {/* Thread Telemetry & Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                        {thread.partnerName}
                      </h4>
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#171F29] border border-slate-200/70 dark:border-white/8 text-slate-600 dark:text-slate-300 flex-shrink-0">
                        {thread.partnerRole === 'driver' ? 'DRIVER' : 'CO-RIDER'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono tabular-nums text-slate-400 dark:text-slate-500 flex-shrink-0">
                      {thread.lastMessageTimestamp}
                    </span>
                  </div>

                  {/* Employer & Trip Status Strip */}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate font-semibold">
                      {thread.partnerEmployer}
                    </span>

                    {isEnRoute && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        EN ROUTE
                      </span>
                    )}

                    {isScheduled && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/12 text-amber-800 dark:text-amber-300 text-[9px] font-mono font-bold border border-amber-500/25">
                        SCHEDULED
                      </span>
                    )}

                    {thread.escrowSecuredNgn && (
                      <span className="inline-flex items-center gap-0.5 text-[9.5px] text-[#0F766E] dark:text-[#14B8A6] font-mono tabular-nums font-bold">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        ₦{thread.escrowSecuredNgn.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Route & Plate Row */}
                  <div className="flex items-center justify-between gap-2 text-[10px] text-slate-600 dark:text-slate-400 mt-1.5">
                    <div className="flex items-center gap-1 truncate">
                      <Compass className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
                      <span className="truncate font-medium">{thread.routeSummary}</span>
                    </div>
                    {thread.vehiclePlate && (
                      <span className="plate-badge flex-shrink-0">{thread.vehiclePlate}</span>
                    )}
                  </div>

                  {/* Last Message Snippet & Unread Counter */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/70 dark:border-white/8">
                    <p
                      className={`text-xs truncate ${
                        hasUnread
                          ? 'font-extrabold text-slate-900 dark:text-slate-100'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {thread.lastMessage}
                    </p>
                    {hasUnread && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-md bg-[#0F766E] dark:bg-[#14B8A6] text-white dark:text-slate-950 text-[9px] font-mono tabular-nums font-black flex-shrink-0">
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
