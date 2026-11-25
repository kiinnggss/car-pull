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
    <nav className="w-full flex-shrink-0 z-40 floating-dock px-2 pt-1.5 pb-2">
      <div className="grid grid-cols-6 gap-1">
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
                className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors active-press ${
                  isActive || activeIncident
                    ? 'bg-red-600 text-white'
                    : 'text-red-600 dark:text-red-400 hover:bg-red-500/10'
                }`}
              >
                <Icon className="w-[18px] h-[18px] stroke-[2.1]" />
                <span className="text-[10px] font-semibold mt-0.5 leading-none">
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
              className="relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors active-press"
              style={
                isActive
                  ? {
                      color: 'var(--accent-primary)',
                      backgroundColor: 'var(--bg-subtle)',
                    }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <div className="relative">
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'stroke-[2.4]' : 'stroke-[1.9]'}`} />
                {item.badge !== undefined && (
                  <span
                    className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-mono tabular-nums font-bold flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--accent-primary-fg)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 leading-none ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
