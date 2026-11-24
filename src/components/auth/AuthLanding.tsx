'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ThemeSwitcherModal } from '@/components/common/ThemeSwitcherModal';
import {
  Zap,
  Car,
  UserCheck,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  Building2,
  User,
  Palette,
  Check,
} from 'lucide-react';

export const AuthLanding: React.FC = () => {
  const { login, registerRider, registerDriver } = useAppStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [signupRole, setSignupRole] = useState<'rider' | 'driver'>('rider');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employer, setEmployer] = useState('');
  const [password, setPassword] = useState('');

  const [vehicleMake, setVehicleMake] = useState('Toyota');
  const [vehicleModel, setVehicleModel] = useState('Camry');
  const [vehicleYear, setVehicleYear] = useState('2021');
  const [vehicleColor, setVehicleColor] = useState('Midnight Black');
  const [plateNumber, setPlateNumber] = useState('LSR-482-KJ');
  const [totalSeats, setTotalSeats] = useState(3);
  const [hasAc, setHasAc] = useState(true);

  const [error, setError] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInIdentifier.trim()) {
      setError('Enter your work email or phone number.');
      return;
    }
    setError('');
    login(signInIdentifier.trim(), 'rider');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Complete your name, work email, and phone number.');
      return;
    }
    setError('');

    if (signupRole === 'rider') {
      registerRider({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employer: employer.trim() || 'Verified Corporate Member',
      });
    } else {
      if (!plateNumber.trim()) {
        setError('Enter your vehicle plate number.');
        return;
      }
      registerDriver({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employer: employer.trim() || 'Verified Corporate Driver',
        vehicle: {
          make: vehicleMake.trim() || 'Toyota',
          model: vehicleModel.trim() || 'Camry',
          year: parseInt(vehicleYear, 10) || 2021,
          color: vehicleColor.trim() || 'Silver',
          plate_number: plateNumber.trim().toUpperCase(),
          total_seats: totalSeats,
          has_ac: hasAc,
        },
      });
    }
  };

  const handleQuickDemo = (demoRole: 'rider' | 'driver') => {
    login(
      demoRole === 'rider' ? 'femi.adeyemi@dangote.com' : 'babatunde@flutterwave.com',
      demoRole
    );
  };

  return (
    <>
      <div className="min-h-screen sm:min-h-0 flex-1 bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-between p-3.5 select-none">
        {/* Accent Hero Card with Concentric Radar Rings */}
        <div className="volt-surface rounded-[32px] p-5 relative overflow-hidden">
          {/* Top Row: Brand Pill & Theme Switcher */}
          <div className="flex items-center justify-between relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] text-[10px] font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              CAR PULL · SEC 44
            </div>

            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              aria-label="Open Theme Switcher"
              title="Appearance & Themes"
              className="w-9 h-9 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] flex items-center justify-center active-press transition-transform relative border border-[var(--border-subtle)]"
            >
              <Palette className="w-4 h-4" />
              <span
                className="w-2.5 h-2.5 rounded-full absolute -top-0.5 -right-0.5 border border-white dark:border-black"
                style={{ backgroundColor: 'var(--accent-signal)' }}
              />
            </button>
          </div>

          {/* Concentric Rings Emblem */}
          <div className="my-4 flex flex-col items-center justify-center relative z-10">
            <div className="w-28 h-28 rounded-full border border-current/20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-current/35 flex items-center justify-center">
                <div className="w-13 h-13 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight mt-3 text-center leading-none">
              Share the Corridor.
            </h1>
            <p className="text-xs font-medium opacity-80 text-center mt-1.5 max-w-[260px] leading-snug">
              Swipe verified corporate peers along Ajah, Lekki, and Victoria Island with zero-cash fuel splits.
            </p>
          </div>
        </div>

        {/* 1-Tap Demo Access Bento Tiles */}
        <div className="my-3 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-[var(--text-primary)]">
              Instant Demo Access
            </span>
            <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)]">
              1-TAP SANDBOX
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Active Tile: Rider Demo */}
            <button
              type="button"
              onClick={() => handleQuickDemo('rider')}
              className="volt-surface p-3.5 rounded-[24px] text-left flex flex-col justify-between min-h-[108px] active-press transition-transform relative overflow-hidden"
            >
              <div className="flex items-start justify-between w-full">
                <div>
                  <span className="text-xs font-extrabold block">Femi Adeyemi</span>
                  <span className="text-[10px] opacity-80 block mt-0.5">Rider · Dangote</span>
                </div>
                <span className="w-5 h-5 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold flex items-center gap-1">
                  Swipe Deck <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>

            {/* Secondary Tile: Driver Demo */}
            <button
              type="button"
              onClick={() => handleQuickDemo('driver')}
              className="floating-surface p-3.5 rounded-[24px] text-left flex flex-col justify-between min-h-[108px] active-press transition-transform"
            >
              <div className="flex items-start justify-between w-full">
                <div>
                  <span className="text-xs font-extrabold block text-[var(--text-primary)]">
                    Babatunde A.
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
                    Driver · 3 Seats
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)]">
                  AC
                </span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-[var(--text-primary)] flex items-center gap-1">
                  Host Ride <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Main Auth Sheet Card */}
        <div className="floating-surface p-4 space-y-3.5">
          {/* Segmented Pill Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-full bg-[var(--bg-subtle)]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`py-2 rounded-full text-xs font-extrabold transition-all ${
                mode === 'signin'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`py-2 rounded-full text-xs font-extrabold transition-all ${
                mode === 'signup'
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="px-3.5 py-2 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-[11px] font-bold">
              {error}
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-2.5">
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-secondary)] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="signin-id"
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="Work email or phone (+234...)"
                  className="w-full pl-10 pr-4 py-3 rounded-full bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="signin-pw"
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Password or passcode"
                  className="w-full pl-10 pr-4 py-3 rounded-full bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 btn-electric-mint text-xs font-extrabold rounded-full flex items-center justify-center gap-2 active-press"
              >
                <span>Continue to Corridor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignupRole('rider')}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
                    signupRole === 'rider'
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                      : 'bg-[var(--bg-subtle)] border-transparent text-[var(--text-secondary)]'
                  }`}
                >
                  <UserCheck className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-extrabold">Rider</div>
                    <div className="text-[9px] opacity-75">Book seats</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSignupRole('driver')}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
                    signupRole === 'driver'
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                      : 'bg-[var(--bg-subtle)] border-transparent text-[var(--text-secondary)]'
                  }`}
                >
                  <Car className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-extrabold">Car Owner</div>
                    <div className="text-[9px] opacity-75">Offset fuel</div>
                  </div>
                </button>
              </div>

              <div className="space-y-2 max-h-[210px] overflow-y-auto pr-0.5 no-scrollbar">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name (e.g. Chidi Nwosu)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Work Email"
                      className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 803..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] font-mono"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={employer}
                    onChange={(e) => setEmployer(e.target.value)}
                    placeholder="Employer / Victoria Island Hub"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                </div>

                {signupRole === 'driver' && (
                  <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={vehicleMake}
                        onChange={(e) => setVehicleMake(e.target.value)}
                        placeholder="Make (Toyota)"
                        className="px-3 py-2 rounded-full bg-[var(--bg-sheet)] text-xs font-semibold text-[var(--text-primary)]"
                      />
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder="Model (Camry)"
                        className="px-3 py-2 rounded-full bg-[var(--bg-sheet)] text-xs font-semibold text-[var(--text-primary)]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        placeholder="Plate (LSR-482-KJ)"
                        className="px-3 py-2 rounded-full bg-[var(--bg-sheet)] text-xs font-mono font-bold uppercase text-[var(--text-primary)]"
                      />
                      <select
                        value={totalSeats}
                        onChange={(e) => setTotalSeats(Number(e.target.value))}
                        className="px-3 py-2 rounded-full bg-[var(--bg-sheet)] text-xs font-bold text-[var(--text-primary)]"
                      >
                        <option value={1}>1 Seat</option>
                        <option value={2}>2 Seats</option>
                        <option value={3}>3 Seats</option>
                        <option value={4}>4 Seats</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create Passcode"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 btn-electric-mint text-xs font-extrabold rounded-full flex items-center justify-center gap-2 active-press"
              >
                <span>{signupRole === 'driver' ? 'Launch Driver Deck' : 'Join Corridor'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      <ThemeSwitcherModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </>
  );
};
