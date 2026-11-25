'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ThemeSwitcherModal } from '@/components/common/ThemeSwitcherModal';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { signInWithSupabase, signUpWithSupabase } from '@/lib/supabase/realtime';
import { ArrowRight, Palette, Sun, Moon } from 'lucide-react';

export const AuthLanding: React.FC = () => {
  const { login, registerRider, registerDriver, applySupabaseUser, showFeedbackBanner, theme, toggleTheme } = useAppStore();
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
      <div className="min-h-screen sm:min-h-0 flex-1 bg-[var(--bg-sheet)] text-[var(--text-primary)] flex flex-col justify-between px-6 py-7 select-none">
        {/* Top Row: Plain Wordmark + Theme Trigger */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base tracking-tight">CarPull</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                supabaseLive ? 'bg-emerald-500' : 'bg-[var(--accent-signal)]'
              }`}
              title={supabaseLive ? 'Supabase Live' : 'Local Sandbox'}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] active-press"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              aria-label="Open Theme Switcher"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] active-press"
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content: Directly on Canvas, Zero Boxes */}
        <div className="my-auto py-8 space-y-8">
          <div className="space-y-2">
            <h1 className="font-display text-[32px] font-bold tracking-tight leading-[1.1]">
              Share your daily Lagos commute.
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Verified peers along Ajah, Lekki, and Victoria Island with capped fuel splits.
            </p>
          </div>

          {/* Plain Underlined Tabs */}
          <div className="flex items-center gap-6 border-b border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className="pb-2.5 text-sm relative transition-colors"
              style={{
                color: mode === 'signin' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: mode === 'signin' ? 600 : 400,
              }}
            >
              Sign in
              {mode === 'signin' && (
                <span
                  className="absolute left-0 right-0 bottom-0 h-[2px]"
                  style={{ backgroundColor: 'var(--accent-signal)' }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className="pb-2.5 text-sm relative transition-colors"
              style={{
                color: mode === 'signup' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: mode === 'signup' ? 600 : 400,
              }}
            >
              Create account
              {mode === 'signup' && (
                <span
                  className="absolute left-0 right-0 bottom-0 h-[2px]"
                  style={{ backgroundColor: 'var(--accent-signal)' }}
                />
              )}
            </button>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-4">
                <input
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="Work email or phone"
                  className="w-full py-2.5 bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden transition-colors"
                />
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full py-2.5 bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 btn-electric-mint text-sm flex items-center justify-center gap-2 active-press disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Connecting...' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Plain Role Links */}
              <div className="flex items-center gap-5 text-xs">
                <span className="text-[var(--text-secondary)]">Role</span>
                <button
                  type="button"
                  onClick={() => setSignupRole('rider')}
                  className={signupRole === 'rider' ? 'font-bold text-[var(--text-primary)] underline underline-offset-4' : 'text-[var(--text-secondary)]'}
                >
                  Rider
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('driver')}
                  className={signupRole === 'driver' ? 'font-bold text-[var(--text-primary)] underline underline-offset-4' : 'text-[var(--text-secondary)]'}
                >
                  Driver
                </button>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full py-2 bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Work email"
                  className="w-full py-2 bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803..."
                    className="w-full py-2 bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-sm font-mono text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={employer}
                    onChange={(e) => setEmployer(e.target.value)}
                    placeholder="Company"
                    className="w-full py-2 bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden"
                  />
                </div>

                {signupRole === 'driver' && (
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      placeholder="Make"
                      className="w-full py-2 bg-transparent border-b border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-hidden"
                    />
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Model"
                      className="w-full py-2 bg-transparent border-b border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-hidden"
                    />
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      placeholder="Plate"
                      className="w-full py-2 bg-transparent border-b border-[var(--border-subtle)] text-xs font-mono uppercase text-[var(--text-primary)] focus:outline-hidden"
                    />
                    <select
                      value={totalSeats}
                      onChange={(e) => setTotalSeats(Number(e.target.value))}
                      className="col-span-3 py-2 bg-transparent border-b border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-hidden"
                    >
                      <option value={1}>1 available seat</option>
                      <option value={2}>2 available seats</option>
                      <option value={3}>3 available seats</option>
                      <option value={4}>4 available seats</option>
                    </select>
                  </div>
                )}

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full py-2 bg-transparent border-b border-[var(--border-subtle)] focus:border-[var(--accent-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 btn-electric-mint text-sm flex items-center justify-center gap-2 active-press disabled:opacity-60"
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

        {/* Footer: Plain Text Demo Links */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Preview as</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleQuickDemo('rider')}
              className="font-semibold hover:underline underline-offset-4 active-press"
              style={{ color: 'var(--accent-signal)' }}
            >
              Rider
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('driver')}
              className="font-semibold text-[var(--text-primary)] hover:underline underline-offset-4 active-press"
            >
              Driver
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
