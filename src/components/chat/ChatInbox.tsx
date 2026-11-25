'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Search, X } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const ChatInbox: React.FC = () => {
  const { chatThreads, setActiveThreadId } = useAppStore();

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

  return (
    <div className="w-full pb-20 px-5 pt-4 space-y-4 animate-in fade-in">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
          Messages
        </h2>
        <div className="flex items-center gap-4 text-xs">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'driver', label: 'Drivers' },
              { id: 'rider', label: 'Riders' },
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
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 400,
                }}
                className="active-press"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Borderless Search Line */}
      <div className="relative border-b border-[var(--border-subtle)] pb-2">
        <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-0 top-1/2 -translate-y-1/2 -mt-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search name, route, or plate"
          className="w-full pl-6 pr-6 py-1 bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mt-1 text-[var(--text-secondary)]"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Hairline Conversation Rows */}
      {filteredThreads.length === 0 ? (
        <p className="text-xs text-[var(--text-secondary)] py-10 text-center">
          No conversations found.
        </p>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)]">
          {filteredThreads.map((thread) => {
            const hasUnread = thread.unreadCount > 0;
            return (
              <button
                key={thread.id}
                onClick={() => {
                  triggerHaptic('tap');
                  setActiveThreadId(thread.id);
                }}
                className="w-full text-left py-3.5 flex items-start gap-3 active-press"
              >
                <div className="relative w-11 h-11 rounded-full bg-[var(--bg-subtle)] overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-mono font-bold">
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

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${hasUnread ? 'font-bold text-[var(--text-primary)]' : 'font-semibold text-[var(--text-primary)]'}`}>
                      {thread.partnerName}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-secondary)] flex-shrink-0">
                      {thread.lastMessageTimestamp}
                    </span>
                  </div>

                  <p className={`text-xs truncate ${hasUnread ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {thread.lastMessage}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px] text-[var(--text-secondary)]">
                    <span className="truncate">{thread.routeSummary}</span>
                    {hasUnread && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: 'var(--accent-signal)' }}
                      />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
