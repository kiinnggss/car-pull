'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProfileCard } from './ProfileCard';
import { QuickBidPills } from './QuickBidPills';
import { RoutePlannerBar } from './RoutePlannerBar';
import { RotateCcw, Sparkles, Compass, Car, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
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
  const [bookedTicket, setBookedTicket] = useState<{
    driver: CorridorDriver;
    fareNgn: number;
  } | null>(null);

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
        setBookedTicket({ driver: driverSnapshot, fareNgn: fareSnapshot });
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
      setBookedTicket({ driver: driverSnapshot, fareNgn: fareSnapshot });
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

      {/* Animated Boarding Pass Ticket Modal */}
      <AnimatePresence>
        {bookedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setBookedTicket(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 28, rotateX: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              className="w-full max-w-[350px] rounded-[28px] overflow-hidden shadow-2xl relative"
              style={{
                backgroundColor: 'var(--bg-sheet)',
                color: 'var(--text-primary)',
                border: 'var(--card-border-width, 1px) solid var(--border-subtle)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Boarding Pass Header */}
              <div
                className="px-5 pt-4 pb-3.5 flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary-fg)',
                }}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[11px] font-mono font-black uppercase tracking-wider">
                    Seat Locked
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/15 text-[10.5px] font-mono font-black">
                  <KeyRound className="w-3 h-3" />
                  <span>PIN {offlinePin || '4829'}</span>
                </div>
              </div>

              {/* Driver & Vehicle Stub */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={bookedTicket.driver.avatar}
                    alt={bookedTicket.driver.name}
                    className="w-12 h-12 rounded-2xl object-cover object-top flex-shrink-0 border"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-display font-black truncate">
                      {bookedTicket.driver.name}
                    </h4>
                    <p
                      className="text-[11px] font-medium truncate"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {bookedTicket.driver.vehicle.make} {bookedTicket.driver.vehicle.model}
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {bookedTicket.driver.vehicle.plate_number}
                  </span>
                </div>

                {/* Live Pickup Progress Track */}
                <div
                  className="p-3.5 rounded-2xl space-y-2.5"
                  style={{ backgroundColor: 'var(--bg-subtle)' }}
                >
                  <div className="flex items-center justify-between text-[10.5px] font-bold">
                    <span className="truncate max-w-[165px]">
                      {selectedSafeZone.name}
                    </span>
                    <span className="font-mono font-black">
                      {bookedTicket.driver.corridor.departure_time}
                    </span>
                  </div>

                  <div className="relative h-5 flex items-center">
                    <div
                      className="w-full h-1 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--border-subtle)' }}
                    >
                      <motion.div
                        initial={{ width: '10%' }}
                        animate={{ width: '58%' }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                      />
                    </div>
                    <motion.div
                      initial={{ left: '10%' }}
                      animate={{ left: '54%' }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--accent-primary-fg)',
                      }}
                    >
                      <Car className="w-3.5 h-3.5" />
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Zero-Cash Escrow Held
                    </span>
                    <span className="font-mono font-black">
                      {formatNgn(bookedTicket.fareNgn)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Perforated Tear Line with Side Notches */}
              <div className="relative flex items-center px-4">
                <span
                  className="w-4 h-4 rounded-full -ml-6 flex-shrink-0"
                  style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
                />
                <div
                  className="flex-1 border-t-2 border-dashed mx-1"
                  style={{ borderColor: 'var(--border-subtle)' }}
                />
                <span
                  className="w-4 h-4 rounded-full -mr-6 flex-shrink-0"
                  style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
                />
              </div>

              {/* Ticket Actions */}
              <div className="p-4 pt-3.5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setBookedTicket(null)}
                  className="py-2.5 rounded-full text-xs font-extrabold active-press transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--bg-subtle)' }}
                >
                  Keep Swiping
                </button>
                <button
                  onClick={() => {
                    setBookedTicket(null);
                    setActiveTab('matches');
                  }}
                  className="py-2.5 rounded-full text-xs font-extrabold flex items-center justify-center gap-1.5 active-press transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-primary-fg)',
                  }}
                >
                  <span>View Ride</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
