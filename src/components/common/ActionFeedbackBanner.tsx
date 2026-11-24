'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';

export const ActionFeedbackBanner: React.FC = () => {
  const { feedbackBanner, clearFeedbackBanner } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!feedbackBanner) return;
    const timer = setTimeout(() => {
      clearFeedbackBanner();
    }, 3200);
    return () => clearTimeout(timer);
  }, [feedbackBanner, clearFeedbackBanner]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {feedbackBanner && (
        <motion.div
          key={feedbackBanner.id}
          initial={{ opacity: 0, y: -32, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[960] w-[calc(100%-28px)] max-w-[392px] pointer-events-auto"
        >
          <div
            className="rounded-full p-2 pl-2.5 pr-2 shadow-2xl relative overflow-hidden flex items-center justify-between gap-2.5 backdrop-blur-xl"
            style={{
              backgroundColor: 'var(--bg-sheet)',
              color: 'var(--text-primary)',
              border: 'var(--card-border-width, 1px) solid var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary-fg)',
                }}
              >
                <Check className="w-4 h-4 stroke-[2.8]" />
              </span>
              <div className="min-w-0">
                <span className="text-xs font-extrabold block truncate leading-tight">
                  {feedbackBanner.title}
                </span>
                <span
                  className="text-[10.5px] font-medium block truncate leading-tight mt-0.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {feedbackBanner.subtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {feedbackBanner.badge && (
                <span
                  className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {feedbackBanner.badge}
                </span>
              )}
              <button
                type="button"
                onClick={clearFeedbackBanner}
                className="w-7 h-7 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 active-press"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 3.2, ease: 'linear' }}
              className="absolute bottom-0 left-4 right-4 h-[2px] origin-left rounded-full opacity-80"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
