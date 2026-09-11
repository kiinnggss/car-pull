'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ChatInbox } from './ChatInbox';
import { ChatThreadView } from './ChatThreadView';

export const ChatHub: React.FC = () => {
  const { activeThreadId, setActiveThreadId } = useAppStore();

  // Listen to browser popstate to return to inbox if inside a thread
  useEffect(() => {
    if (!activeThreadId) return;

    window.history.pushState({ view: 'chat_thread', threadId: activeThreadId }, '');

    const handlePop = () => {
      setActiveThreadId(null);
    };

    window.addEventListener('popstate', handlePop);
    return () => {
      window.removeEventListener('popstate', handlePop);
    };
  }, [activeThreadId, setActiveThreadId]);

  if (activeThreadId) {
    return <ChatThreadView threadId={activeThreadId} />;
  }

  return <ChatInbox />;
};
