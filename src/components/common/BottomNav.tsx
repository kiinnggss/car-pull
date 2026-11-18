'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Layers, Compass, CalendarCheck, MessageCircle, QrCode, AlertOctagon } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeMatches, activeIncident, chatThreads } = useAppStore();

  const totalUnreadChats = chatThreads.reduce((sum, t) => sum + t.unreadCount, 0);

  const navItems = [
    {
      id: 'deck' as const,
      label: 'Swipe',
      icon: Layers,
    },
    {
      id: 'map' as const,
      label: 'Map',
      icon: Compass,
    },
    {
      id: 'matches' as const,
      label: 'Rides',
      icon: CalendarCheck,
      badge: activeMatches.length > 0 ? activeMatches.length : undefined,
    },
    {
      id: 'chats' as const,
      label: 'Chats',
      icon: MessageCircle,
      badge: totalUnreadChats > 0 ? totalUnreadChats : undefined,
    },
    {
      id: 'pass' as const,
      label: 'Pass',
      icon: QrCode,
    },
    {
      id: 'sos' as const,
      label: 'SOS',
      icon: AlertOctagon,
      isDanger: true,
    },
  ];

  return (
    <nav
      className="w-full flex-shrink-0 z-40 px-3 pb-2.5 pt-1.5 backdrop-blur-xl"
      style={{ backgroundColor: 'color-mix(in srgb, var(--bg-canvas) 88%, transparent)' }}
    >
      <div className="max-w-[398px] mx-auto floating-dock rounded-full p-1.5 grid grid-cols-6 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isDanger) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerHaptic('warning');
                  setActiveTab('sos');
                }}
                className={`relative flex flex-col items-center justify-center py-2 rounded-full transition-all active-press ${
                  isActive || activeIncident
                    ? 'bg-red-600 text-white'
                    : 'bg-red-500/12 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
                <span className="text-[9px] font-extrabold tracking-tight mt-0.5 leading-none">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                triggerHaptic('tap');
                setActiveTab(item.id);
              }}
              className="relative flex flex-col items-center justify-center py-2 rounded-full transition-all active-press"
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--accent-primary-fg)',
                    }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <div className="relative">
                <Icon className="w-4 h-4 stroke-[2.2]" />
                {item.badge !== undefined && (
                  <span
                    className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] px-1 rounded-full text-[8.5px] font-mono tabular-nums font-black flex items-center justify-center"
                    style={
                      isActive
                        ? { backgroundColor: '#FFFFFF', color: '#0B0C0E' }
                        : {
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--accent-primary-fg)',
                          }
                    }
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-extrabold tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
