'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  MessageCircle,
  Search,
  CheckCheck,
  Clock,
  Compass,
  Car,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
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
    <div className="w-full max-w-[390px] mx-auto pb-24 px-3 space-y-3.5 animate-in fade-in">
      {/* Header with Title & Live Peer Badge */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5 tracking-tight">
              <span className="p-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <MessageCircle className="w-4 h-4" />
              </span>
              Commute Chats
            </h2>
            {totalUnread > 0 && (
              <span className="bg-teal-500/15 text-teal-700 dark:text-teal-300 text-[10px] font-mono tabular-nums font-black px-2 py-0.5 rounded-full border border-teal-500/25">
                {totalUnread} New
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Coordination and updates with verified corridor peers
          </p>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Hub</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search peers, employers, routes, or plates..."
          className="w-full pl-9 pr-8 py-2.5 bg-white/70 dark:bg-[#121921]/70 backdrop-blur-xl rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200/80 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.03)] focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 dark:focus:ring-teal-400/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active-press border ${
                isActive
                  ? 'bg-teal-700 dark:bg-teal-500 text-white dark:text-slate-950 border-teal-700 dark:border-teal-500 shadow-sm'
                  : 'bg-white/60 dark:bg-[#121921]/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200/60 dark:border-white/5'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Threads List */}
      <div className="space-y-2.5">
        {filteredThreads.length === 0 ? (
          <div className="bg-white/70 dark:bg-[#121921]/70 backdrop-blur-xl rounded-3xl p-6 text-center space-y-2 border border-slate-200/80 dark:border-white/10 shadow-sm">
            <MessageCircle className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-900 dark:text-slate-300">No chats found</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              When you accept or match a ride, direct in-app chat opens here automatically.
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
                className={`w-full text-left bg-white/75 dark:bg-[#121921]/75 backdrop-blur-xl rounded-2xl p-3.5 transition-all active-press border flex items-start gap-3 relative shadow-[0_4px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:border-teal-500/40 dark:hover:border-teal-400/40 ${
                  hasUnread
                    ? 'border-teal-500/50 dark:border-teal-400/50 ring-1 ring-teal-500/20'
                    : 'border-slate-200/80 dark:border-white/10'
                }`}
              >
                {/* Avatar with Online & Role Badge */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <img
                    src={thread.partnerAvatar}
                    alt={thread.partnerName}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10 shadow-sm"
                  />
                  {thread.isOnline && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121921]"
                      title="Online now"
                    />
                  )}
                </div>

                {/* Thread Details */}
                <div className="flex-1 min-w-0">
                  {/* Top Row: Name, Role Pill, Trip Status, Timestamp */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                        {thread.partnerName}
                      </h4>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex-shrink-0">
                        {thread.partnerRole === 'driver' ? 'Driver' : 'Co-Rider'}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono tabular-nums text-slate-400 dark:text-slate-500 flex-shrink-0">
                      {thread.lastMessageTimestamp}
                    </span>
                  </div>

                  {/* Second Row: Employer / Vehicle / Status Pills */}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate font-medium">
                      {thread.partnerEmployer}
                    </span>

                    {isEnRoute && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold border border-emerald-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        En Route
                      </span>
                    )}

                    {isScheduled && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[9px] font-bold border border-amber-500/25">
                        Scheduled
                      </span>
                    )}

                    {thread.escrowSecuredNgn && (
                      <span className="inline-flex items-center gap-0.5 text-[9.5px] text-teal-700 dark:text-teal-300 font-mono font-bold">
                        <ShieldCheck className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                        ₦{thread.escrowSecuredNgn.toLocaleString()} Escrow
                      </span>
                    )}
                  </div>

                  {/* Route & Plate Pill */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400 mt-1 truncate">
                    <Compass className="w-3 h-3 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                    <span className="truncate">{thread.routeSummary}</span>
                    {thread.vehiclePlate && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">
                          {thread.vehiclePlate}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Last Message Snippet & Unread Counter */}
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100 dark:border-white/5">
                    <p
                      className={`text-xs truncate ${
                        hasUnread
                          ? 'font-bold text-slate-900 dark:text-slate-100'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {thread.lastMessage}
                    </p>
                    {hasUnread && (
                      <span className="ml-1.5 w-4 h-4 rounded-full bg-teal-600 dark:bg-teal-400 text-white dark:text-slate-950 text-[9px] font-black flex items-center justify-center flex-shrink-0 shadow-2xs">
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
