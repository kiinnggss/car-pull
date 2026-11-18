'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProfileCard } from './ProfileCard';
import { QuickBidPills } from './QuickBidPills';
import { RoutePlannerBar } from './RoutePlannerBar';
import { RotateCcw, Sparkles, Compass, Check, ArrowRight, X } from 'lucide-react';
import { CorridorDriver } from '@/lib/types';
import { formatNgn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

export const SwipeDeck: React.FC = () => {
  const {
    currentDriver,
    drivers,
    activeDriverIndex,
    swipeLeft,
    swipeRight,
    resetDeck,
    customBidNgn,
    selectedSafeZone,
    setActiveTab,
    offlinePin,
  } = useAppStore();

  const [exitX, setExitX] = useState<number>(0);
  const [dispatchPill, setDispatchPill] = useState<{
    id: number;
    driver: CorridorDriver;
    fareNgn: number;
  } | null>(null);

  useEffect(() => {
    if (!dispatchPill) return;
    const timer = setTimeout(() => {
      setDispatchPill(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [dispatchPill]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [25, 110], [0, 1]);
  const nopeOpacity = useTransform(x, [-25, -110], [0, 1]);

  const handleDragEnd = (_event: any, info: any) => {
    const threshold = 95;
    if (info.offset.x > threshold && currentDriver) {
      const driverSnapshot = currentDriver;
      const fareSnapshot = customBidNgn;
      setExitX(280);
      triggerHaptic('match');
      setTimeout(() => {
        swipeRight();
        setDispatchPill({
          id: Date.now(),
          driver: driverSnapshot,
          fareNgn: fareSnapshot,
        });
        setExitX(0);
        x.set(0);
      }, 220);
    } else if (info.offset.x < -threshold) {
      setExitX(-280);
      triggerHaptic('tap');
      setTimeout(() => {
        swipeLeft();
        setExitX(0);
        x.set(0);
      }, 200);
    }
  };

  const handleManualAccept = () => {
    if (!currentDriver) return;
    const driverSnapshot = currentDriver;
    const fareSnapshot = customBidNgn;
    setExitX(280);
    triggerHaptic('match');
    setTimeout(() => {
      swipeRight();
      setDispatchPill({
        id: Date.now(),
        driver: driverSnapshot,
        fareNgn: fareSnapshot,
      });
      setExitX(0);
      x.set(0);
    }, 220);
  };

  const handleManualReject = () => {
    setExitX(-280);
    triggerHaptic('tap');
    setTimeout(() => {
      swipeLeft();
      setExitX(0);
      x.set(0);
    }, 200);
  };

  if (!currentDriver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#C8FF00] text-[#0B0C0E] flex items-center justify-center shadow-lg">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-display font-black text-[#0B0C0E] dark:text-white">
            All Corridor Peers Reviewed
          </h3>
          <p className="text-xs text-[#525866] dark:text-[#9BA1AE] max-w-xs">
            You have swiped through every verified driver for this departure window. Reload the deck or explore the live street map.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={resetDeck}
            className="px-5 py-3 btn-electric-mint text-xs font-extrabold rounded-full flex items-center gap-2 active-press"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Deck</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className="px-5 py-3 rounded-full bg-white dark:bg-[#14161B] border border-black/10 dark:border-white/10 text-xs font-extrabold text-[#0B0C0E] dark:text-white flex items-center gap-2 active-press"
          >
            <Compass className="w-4 h-4" />
            <span>Open Map</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[404px] mx-auto flex flex-col justify-between h-full min-h-0 select-none">
      {/* Compact Route & Wishes Trigger Bar */}
      <RoutePlannerBar />

      {/* Swipeable Full-Bleed Card Stack */}
      <div className="relative w-full px-3 flex-1 min-h-0 flex flex-col">
        {/* Next Card Peek Stack */}
        {activeDriverIndex + 1 < drivers.length && (
          <div className="absolute inset-x-6 top-2 bottom-1 rounded-[30px] bg-black/25 dark:bg-white/5 scale-[0.96] translate-y-1.5 pointer-events-none" />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentDriver.id}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={{ x: exitX }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-full flex-1 min-h-0 cursor-grab active:cursor-grabbing relative z-10 flex flex-col"
          >
            {/* Swipe Right Stamp */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-12 left-5 z-30 bg-[#C8FF00] text-[#0B0C0E] font-mono font-black text-xs px-3.5 py-1.5 rounded-full -rotate-12 pointer-events-none uppercase tracking-wider shadow-lg"
            >
              CONNECT • {formatNgn(customBidNgn)}
            </motion.div>

            {/* Swipe Left Stamp */}
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-12 right-5 z-30 bg-red-600 text-white font-mono font-black text-xs px-3.5 py-1.5 rounded-full rotate-12 pointer-events-none uppercase tracking-wider shadow-lg"
            >
              PASS
            </motion.div>

            <ProfileCard driver={currentDriver} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Action Dock */}
      <div className="w-full px-3 flex-shrink-0">
        <QuickBidPills onReject={handleManualReject} onAccept={handleManualAccept} />
      </div>

      {/* Top-Down Live Dispatch Pill (Zero Modal, Dynamic Island Style) */}
      <AnimatePresence>
        {dispatchPill && (
          <motion.div
            key={dispatchPill.id}
            initial={{ opacity: 0, y: -36, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -28, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-[600] w-[calc(100%-28px)] max-w-[392px] pointer-events-auto"
          >
            <div
              className="rounded-full p-1.5 pl-2 pr-1.5 shadow-2xl relative overflow-hidden flex items-center justify-between gap-2.5 backdrop-blur-xl"
              style={{
                backgroundColor: 'var(--bg-sheet)',
                color: 'var(--text-primary)',
                border: 'var(--card-border-width, 1px) solid var(--border-subtle)',
              }}
            >
              {/* Animated Checkmark + Driver Avatar */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={dispatchPill.driver.avatar}
                    alt={dispatchPill.driver.name}
                    className="w-9 h-9 rounded-full object-cover object-top"
                  />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.08 }}
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-black/40"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--accent-primary-fg)',
                    }}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </motion.span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold truncate">
                    <span className="font-mono font-black">
                      {formatNgn(dispatchPill.fareNgn)} locked
                    </span>
                    <span className="opacity-40">·</span>
                    <span className="truncate">{dispatchPill.driver.name.split(' ')[0]}</span>
                  </div>
                  <div
                    className="text-[10px] font-mono truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {selectedSafeZone.name} · PIN {offlinePin || '4829'}
                  </div>
                </div>
              </div>

              {/* Right: View Ride Pill + Dismiss */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => {
                    setDispatchPill(null);
                    setActiveTab('matches');
                  }}
                  className="h-8 px-3 rounded-full text-[11px] font-extrabold flex items-center gap-1 active-press"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-primary-fg)',
                  }}
                >
                  <span>View Ride</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => setDispatchPill(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 active-press"
                  aria-label="Dismiss dispatch pill"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subtle 4.5s Drain Bar along bottom edge */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4.5, ease: 'linear' }}
                className="absolute bottom-0 left-4 right-4 h-[2px] origin-left rounded-full opacity-75"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
