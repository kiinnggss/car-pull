'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Layers, Compass, CalendarCheck, MessageCircle, QrCode, AlertOctagon } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeMatches, activeIncident, chatThreads } = useAppStore();

  const totalUnreadChats = chatThreads.reduce((sum, t) => sum + t.unreadCount, 0);

  const navItems = [
    { id: 'deck' as const, label: 'Discover', icon: Layers },
    { id: 'map' as const, label: 'Map', icon: Compass },
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
    { id: 'pass' as const, label: 'Pass', icon: QrCode },
    { id: 'sos' as const, label: 'SOS', icon: AlertOctagon, isDanger: true },
  ];

  return (
    <nav className="w-full flex-shrink-0 z-40 floating-dock px-2 pt-2 pb-2.5">
      <div className="grid grid-cols-6">
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
                className={`relative flex flex-col items-center justify-center py-1 transition-colors active-press ${
                  isActive || activeIncident
                    ? 'text-red-600 dark:text-red-400 font-bold'
                    : 'text-red-500/75 dark:text-red-400/75'
                }`}
              >
                <Icon className="w-[19px] h-[19px] stroke-[2]" />
                <span className="text-[10px] mt-1 leading-none">{item.label}</span>
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
              className="relative flex flex-col items-center justify-center py-1 transition-colors active-press"
              style={{
                color: isActive ? 'var(--accent-signal)' : 'var(--text-secondary)',
              }}
            >
              <div className="relative">
                <Icon className={`w-[19px] h-[19px] ${isActive ? 'stroke-[2.3]' : 'stroke-[1.7]'}`} />
                {item.badge !== undefined && (
                  <span
                    className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-1 rounded-full text-[9px] font-mono tabular-nums font-bold flex items-center justify-center text-white"
                    style={{
                      backgroundColor: 'var(--accent-signal)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 leading-none ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
