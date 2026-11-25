'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ThemeSwitcherModal } from '@/components/common/ThemeSwitcherModal';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { signInWithSupabase, signUpWithSupabase } from '@/lib/supabase/realtime';
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
} from 'lucide-react';

export const AuthLanding: React.FC = () => {
  const { login, registerRider, registerDriver, applySupabaseUser, showFeedbackBanner } = useAppStore();
  const supabaseLive = isSupabaseConfigured();

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
  const [plateNumber, setPlateNumber] = useState('LSR-482-KJ');
  const [totalSeats, setTotalSeats] = useState(3);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInIdentifier.trim()) {
      setError('Enter your work email or phone number.');
      return;
    }
    setError('');

    if (supabaseLive) {
      if (!signInIdentifier.includes('@') || !signInPassword.trim()) {
        setError('Supabase sign-in requires your email and password.');
        return;
      }
      setIsSubmitting(true);
      const res = await signInWithSupabase(signInIdentifier.trim(), signInPassword);
      setIsSubmitting(false);
      if (!res.ok || !res.userId) {
        setError(res.error || 'Could not sign in with Supabase.');
        return;
      }
      applySupabaseUser({
        userId: res.userId,
        email: res.email,
        fullName: res.fullName,
        employer: res.employer,
        phone: res.phone,
        role: res.role,
      });
      showFeedbackBanner('Supabase Connected', 'Live corridor sync active', 'REALTIME');
      return;
    }

    login(signInIdentifier.trim(), 'rider');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Complete your name, work email, and phone number.');
      return;
    }
    if (signupRole === 'driver' && !plateNumber.trim()) {
      setError('Enter your vehicle plate number.');
      return;
    }
    setError('');

    if (supabaseLive) {
      if (!password.trim() || password.length < 6) {
        setError('Set a password of at least 6 characters for Supabase Auth.');
        return;
      }
      setIsSubmitting(true);
      const res = await signUpWithSupabase({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        employer: employer.trim() || (signupRole === 'driver' ? 'Verified Corporate Driver' : 'Verified Corporate Member'),
        role: signupRole,
      });
      setIsSubmitting(false);
      if (!res.ok || !res.userId) {
        setError(res.error || 'Could not create Supabase account.');
        return;
      }
      applySupabaseUser({
        userId: res.userId,
        email: res.email,
        fullName: res.fullName,
        employer: res.employer,
        phone: res.phone,
        role: res.role,
      });
      showFeedbackBanner('Account Verified', 'Synced to Supabase Realtime', 'LIVE');
      return;
    }

    if (signupRole === 'rider') {
      registerRider({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employer: employer.trim() || 'Verified Corporate Member',
      });
    } else {
      registerDriver({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employer: employer.trim() || 'Verified Corporate Driver',
        vehicle: {
          make: vehicleMake.trim() || 'Toyota',
          model: vehicleModel.trim() || 'Camry',
          year: 2021,
          color: 'Silver',
          plate_number: plateNumber.trim().toUpperCase(),
          total_seats: totalSeats,
          has_ac: true,
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
      <div className="min-h-screen sm:min-h-0 flex-1 bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-between p-5 select-none">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-primary-fg)',
              }}
            >
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <div>
              <span className="font-display font-bold text-sm block leading-none">
                CarPull
              </span>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    supabaseLive ? 'bg-emerald-500' : 'bg-[var(--accent-signal)]'
                  }`}
                />
                {supabaseLive ? 'Supabase Live' : 'Lagos Sec 44'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            aria-label="Open Theme Switcher"
            title="Appearance & Themes"
            className="w-9 h-9 rounded-xl bg-[var(--bg-sheet)] text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center justify-center active-press"
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Copy */}
        <div className="my-5 space-y-2">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight leading-[1.12] text-[var(--text-primary)]">
            Share your daily Lagos commute.
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Verified corporate peers along Ajah, Lekki, and Victoria Island with capped fuel splits and CCTV pickup hubs.
          </p>
        </div>

        {/* Clean Auth Card */}
        <div className="floating-surface p-4 space-y-4">
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--bg-subtle)]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-[var(--bg-sheet)] text-[var(--text-primary)] shadow-2xs'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-[var(--bg-sheet)] text-[var(--text-primary)] shadow-2xs'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Create account
            </button>
          </div>

          {error && (
            <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div className="space-y-2.5">
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="Work email or phone"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[var(--bg-subtle)] border border-transparent focus:border-[var(--accent-primary)] text-[13px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden"
                  />
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[var(--bg-subtle)] border border-transparent focus:border-[var(--accent-primary)] text-[13px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 btn-electric-mint text-[13px] flex items-center justify-center gap-2 active-press disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Connecting...' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignupRole('rider')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    signupRole === 'rider'
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                      : 'bg-[var(--bg-subtle)] border-transparent text-[var(--text-secondary)]'
                  }`}
                >
                  <UserCheck className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Rider</div>
                    <div className="text-[10px] opacity-75">Book seats</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSignupRole('driver')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    signupRole === 'driver'
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                      : 'bg-[var(--bg-subtle)] border-transparent text-[var(--text-secondary)]'
                  }`}
                >
                  <Car className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Driver</div>
                    <div className="text-[10px] opacity-75">Share fuel</div>
                  </div>
                </button>
              </div>

              <div className="space-y-2 max-h-[210px] overflow-y-auto pr-0.5 no-scrollbar">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-[var(--bg-subtle)] text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Work email"
                      className="w-full h-10 pl-8 pr-2.5 rounded-xl bg-[var(--bg-subtle)] text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 803..."
                      className="w-full h-10 pl-8 pr-2.5 rounded-xl bg-[var(--bg-subtle)] text-xs font-mono font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={employer}
                    onChange={(e) => setEmployer(e.target.value)}
                    placeholder="Company or work hub"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-[var(--bg-subtle)] text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                </div>

                {signupRole === 'driver' && (
                  <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={vehicleMake}
                        onChange={(e) => setVehicleMake(e.target.value)}
                        placeholder="Make"
                        className="h-9 px-3 rounded-lg bg-[var(--bg-sheet)] text-xs font-medium text-[var(--text-primary)]"
                      />
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder="Model"
                        className="h-9 px-3 rounded-lg bg-[var(--bg-sheet)] text-xs font-medium text-[var(--text-primary)]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        placeholder="Plate"
                        className="h-9 px-3 rounded-lg bg-[var(--bg-sheet)] text-xs font-mono font-semibold uppercase text-[var(--text-primary)]"
                      />
                      <select
                        value={totalSeats}
                        onChange={(e) => setTotalSeats(Number(e.target.value))}
                        className="h-9 px-3 rounded-lg bg-[var(--bg-sheet)] text-xs font-medium text-[var(--text-primary)]"
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
                  <Lock className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-[var(--bg-subtle)] text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 btn-electric-mint text-[13px] flex items-center justify-center gap-2 active-press disabled:opacity-60"
              >
                <span>
                  {isSubmitting
                    ? 'Creating account...'
                    : signupRole === 'driver'
                      ? 'Start driving'
                      : 'Create account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Compact Demo Access Strip */}
        <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] space-y-2">
          <span className="text-[11px] font-medium text-[var(--text-secondary)] block text-center">
            Or explore immediately with a demo profile
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('rider')}
              className="h-10 px-3 rounded-xl bg-[var(--bg-sheet)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-1.5 active-press"
            >
              <UserCheck className="w-3.5 h-3.5 opacity-75" />
              <span>Demo Rider</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('driver')}
              className="h-10 px-3 rounded-xl bg-[var(--bg-sheet)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-1.5 active-press"
            >
              <Car className="w-3.5 h-3.5 opacity-75" />
              <span>Demo Driver</span>
            </button>
          </div>
        </div>
      </div>

      <ThemeSwitcherModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </>
  );
};
