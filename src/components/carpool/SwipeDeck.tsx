'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProfileCard } from './ProfileCard';
import { QuickBidPills } from './QuickBidPills';
import { RoutePlannerBar } from './RoutePlannerBar';
import {
  RotateCcw,
  Sparkles,
  Compass,
  Check,
  ArrowRight,
  X,
  Car,
  ShieldCheck,
  KeyRound,
  Handshake,
} from 'lucide-react';
import { CorridorDriver } from '@/lib/types';
import { formatNgn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import { scoreDriverForRoute } from '@/lib/routeMatching';

export const SwipeDeck: React.FC = () => {
  const {
    user,
    currentDriver,
    drivers,
    activeDriverIndex,
    swipeLeft,
    swipeRight,
    resetDeck,
    resetDeckFilters,
    customBidNgn,
    selectedSafeZone,
    setActiveTab,
    offlinePin,
    matchFeedbackStyle,
    riderRoute,
  } = useAppStore();

  const [exitX, setExitX] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    id: number;
    driver: CorridorDriver;
    fareNgn: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!confirmation || matchFeedbackStyle !== 'pill') return;
    const timer = setTimeout(() => {
      setConfirmation(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [confirmation, matchFeedbackStyle]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [25, 110], [0, 1]);
  const nopeOpacity = useTransform(x, [-25, -110], [0, 1]);

  const confirmDriverBooking = (driverSnapshot: CorridorDriver, fareSnapshot: number) => {
    setExitX(280);
    triggerHaptic('match');
    setTimeout(() => {
      swipeRight();
      setConfirmation({
        id: Date.now(),
        driver: driverSnapshot,
        fareNgn: fareSnapshot,
      });
      setExitX(0);
      x.set(0);
    }, 220);
  };

  const handleDragEnd = (_event: any, info: any) => {
    const threshold = 95;
    if (info.offset.x > threshold && currentDriver) {
      confirmDriverBooking(currentDriver, customBidNgn);
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
    confirmDriverBooking(currentDriver, customBidNgn);
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

  const confirmationOverlay =
    mounted &&
    createPortal(
      <AnimatePresence>
        {/* OPTION 1 (Default): Animated Boarding Pass Ticket */}
        {confirmation && matchFeedbackStyle === 'ticket' && (
          <motion.div
            key={`ticket-${confirmation.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[950] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setConfirmation(null)}
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

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={confirmation.driver.avatar}
                    alt={confirmation.driver.name}
                    className="w-12 h-12 rounded-2xl object-cover object-top flex-shrink-0 border"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-display font-black truncate">
                      {confirmation.driver.name}
                    </h4>
                    <p
                      className="text-[11px] font-medium truncate"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {confirmation.driver.vehicle.make} {confirmation.driver.vehicle.model}
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {confirmation.driver.vehicle.plate_number}
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-2xl space-y-2.5"
                  style={{ backgroundColor: 'var(--bg-subtle)' }}
                >
                  <div className="flex items-center justify-between text-[10.5px] font-bold">
                    <span className="truncate max-w-[165px]">{selectedSafeZone.name}</span>
                    <span className="font-mono font-black">
                      {confirmation.driver.corridor.departure_time}
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
                      {formatNgn(confirmation.fareNgn)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center px-4">
                <span className="w-4 h-4 rounded-full -ml-6 flex-shrink-0 bg-black/75" />
                <div
                  className="flex-1 border-t-2 border-dashed mx-1"
                  style={{ borderColor: 'var(--border-subtle)' }}
                />
                <span className="w-4 h-4 rounded-full -mr-6 flex-shrink-0 bg-black/75" />
              </div>

              <div className="p-4 pt-3.5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setConfirmation(null)}
                  className="py-2.5 rounded-full text-xs font-extrabold active-press transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--bg-subtle)' }}
                >
                  Keep Swiping
                </button>
                <button
                  onClick={() => {
                    setConfirmation(null);
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

        {/* OPTION 2: Dual-Avatar Connection Ripple */}
        {confirmation && matchFeedbackStyle === 'ripple' && (
          <motion.div
            key={`ripple-${confirmation.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[950] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setConfirmation(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              className="w-full max-w-[340px] rounded-[30px] p-6 text-center space-y-5 shadow-2xl"
              style={{
                backgroundColor: 'var(--bg-sheet)',
                color: 'var(--text-primary)',
                border: 'var(--card-border-width, 1px) solid var(--border-subtle)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Concentric Pulsing Ring + Sliding Avatars */}
              <div className="relative h-24 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0.08, 0.45] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-24 h-24 rounded-full"
                  style={{ border: '2px solid var(--accent-primary)' }}
                />
                <motion.div
                  animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0.25, 0.7] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  className="absolute w-20 h-20 rounded-full"
                  style={{ border: '1.5px solid var(--accent-primary)' }}
                />

                <div className="relative z-10 flex items-center justify-center -space-x-3">
                  <motion.img
                    initial={{ x: -34, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-14 h-14 rounded-full object-cover object-top ring-4"
                    style={{ ['--tw-ring-color' as any]: 'var(--bg-sheet)' }}
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 460, damping: 20, delay: 0.12 }}
                    className="w-7 h-7 rounded-full flex items-center justify-center z-20 shadow-md"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--accent-primary-fg)',
                    }}
                  >
                    <Handshake className="w-3.5 h-3.5" />
                  </motion.div>
                  <motion.img
                    initial={{ x: 34, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                    src={confirmation.driver.avatar}
                    alt={confirmation.driver.name}
                    className="w-14 h-14 rounded-full object-cover object-top ring-4"
                    style={{ ['--tw-ring-color' as any]: 'var(--bg-sheet)' }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span
                  className="text-[10px] font-mono font-black uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Corridor Connected
                </span>
                <h4 className="text-lg font-display font-black">
                  You &amp; {confirmation.driver.name.split(' ')[0]}
                </h4>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <strong className="font-mono font-black" style={{ color: 'var(--text-primary)' }}>
                    {formatNgn(confirmation.fareNgn)}
                  </strong>{' '}
                  held in escrow · {selectedSafeZone.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setConfirmation(null)}
                  className="py-2.5 rounded-full text-xs font-extrabold active-press"
                  style={{ backgroundColor: 'var(--bg-subtle)' }}
                >
                  Keep Swiping
                </button>
                <button
                  onClick={() => {
                    setConfirmation(null);
                    setActiveTab('matches');
                  }}
                  className="py-2.5 rounded-full text-xs font-extrabold active-press"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-primary-fg)',
                  }}
                >
                  View Ride
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* OPTION 3: Top-Down Live Dispatch Pill (Zero Modal) */}
        {confirmation && matchFeedbackStyle === 'pill' && (
          <motion.div
            key={`pill-${confirmation.id}`}
            initial={{ opacity: 0, y: -36, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -28, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-[950] w-[calc(100%-28px)] max-w-[392px] pointer-events-auto"
          >
            <div
              className="rounded-full p-1.5 pl-2 pr-1.5 shadow-2xl relative overflow-hidden flex items-center justify-between gap-2.5 backdrop-blur-xl"
              style={{
                backgroundColor: 'var(--bg-sheet)',
                color: 'var(--text-primary)',
                border: 'var(--card-border-width, 1px) solid var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={confirmation.driver.avatar}
                    alt={confirmation.driver.name}
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
                      {formatNgn(confirmation.fareNgn)} locked
                    </span>
                    <span className="opacity-40">·</span>
                    <span className="truncate">{confirmation.driver.name.split(' ')[0]}</span>
                  </div>
                  <div
                    className="text-[10px] font-mono truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {selectedSafeZone.name} · PIN {offlinePin || '4829'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => {
                    setConfirmation(null);
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
                  onClick={() => setConfirmation(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 active-press"
                  aria-label="Dismiss dispatch pill"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

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
      </AnimatePresence>,
      document.body
    );

  const matchMeta = currentDriver
    ? scoreDriverForRoute(currentDriver, riderRoute)
    : null;

  if (!currentDriver) {
    const isFilterEmpty = drivers.length === 0;
    return (
      <>
        {confirmationOverlay}
        <div className="flex flex-col justify-between h-full min-h-0">
          <RoutePlannerBar />
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-primary-fg)',
              }}
            >
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-display font-black">
                {isFilterEmpty
                  ? 'No drivers match your filters'
                  : 'All Corridor Peers Reviewed'}
              </h3>
              <p
                className="text-xs max-w-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isFilterEmpty
                  ? 'Try clearing a filter chip or switching departure windows to see more verified drivers along this route.'
                  : 'You have swiped through every verified driver for this departure window. Reload the deck or explore the live street map.'}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={isFilterEmpty ? resetDeckFilters : resetDeck}
                className="px-5 py-3 btn-electric-mint text-xs font-extrabold rounded-full flex items-center gap-2 active-press"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isFilterEmpty ? 'Reset Filters' : 'Reload Deck'}</span>
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className="px-5 py-3 rounded-full border text-xs font-extrabold flex items-center gap-2 active-press"
                style={{
                  backgroundColor: 'var(--bg-sheet)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <Compass className="w-4 h-4" />
                <span>Open Map</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="relative w-full max-w-[404px] mx-auto flex flex-col justify-between h-full min-h-0 select-none">
      <RoutePlannerBar />

      <div className="relative w-full px-3 flex-1 min-h-0 flex flex-col">
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
              style={{
                opacity: likeOpacity,
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-primary-fg)',
              }}
              className="absolute top-12 left-5 z-30 font-mono font-black text-xs px-3.5 py-1.5 rounded-full -rotate-12 pointer-events-none uppercase tracking-wider shadow-lg"
            >
              CONNECT · {formatNgn(customBidNgn)}
            </motion.div>

            {/* Swipe Left Stamp */}
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-12 right-5 z-30 bg-red-600 text-white font-mono font-black text-xs px-3.5 py-1.5 rounded-full rotate-12 pointer-events-none uppercase tracking-wider shadow-lg"
            >
              PASS
            </motion.div>

            <ProfileCard
              driver={currentDriver}
              matchPercent={matchMeta?.matchPercent}
              matchReason={matchMeta?.matchReason}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full px-3 flex-shrink-0">
        <QuickBidPills onReject={handleManualReject} onAccept={handleManualAccept} />
      </div>

      {confirmationOverlay}
    </div>
  );
};
