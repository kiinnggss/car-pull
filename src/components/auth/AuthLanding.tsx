'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  ShieldCheck,
  Car,
  User,
  Lock,
  ArrowRight,
  MapPin,
  Fuel,
  Building2,
  Phone,
  Mail,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { getAssetPath } from '@/lib/assets';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '@/lib/haptics';

export const AuthLanding: React.FC = () => {
  const { login, registerRider, registerDriver, theme, toggleTheme } = useAppStore();
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [signUpRole, setSignUpRole] = useState<'rider' | 'driver'>('rider');

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Rider Sign Up State
  const [riderName, setRiderName] = useState('');
  const [riderEmail, setRiderEmail] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderCompany, setRiderCompany] = useState('');

  // Driver & Car Sign Up State
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverCompany, setDriverCompany] = useState('');
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [carColor, setCarColor] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [carSeats, setCarSeats] = useState(3);
  const [carHasAc, setCarHasAc] = useState(true);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('match');
    login(signInIdentifier || 'femi.adeyemi@dangote.com', 'rider');
  };

  const handleRiderSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderName.trim()) return;
    triggerHaptic('match');
    registerRider({
      fullName: riderName.trim(),
      email: riderEmail.trim() || `${riderName.toLowerCase().replace(/\s+/g, '.')}@corporate.ng`,
      phone: riderPhone.trim() || '+234 812 000 1234',
      employer: riderCompany.trim() || 'Corporate Professional',
    });
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.6 },
      colors: ['#0F766E', '#D97706', '#14B8A6'],
    });
  };

  const handleDriverSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) return;
    triggerHaptic('match');
    registerDriver({
      fullName: driverName.trim(),
      email: driverEmail.trim() || `${driverName.toLowerCase().replace(/\s+/g, '.')}@corporate.ng`,
      phone: driverPhone.trim() || '+234 803 111 5678',
      employer: driverCompany.trim() || 'Executive Driver',
      vehicle: {
        make: carMake.trim() || 'Toyota',
        model: carModel.trim() || 'Corolla',
        year: parseInt(carYear) || 2022,
        color: carColor.trim() || 'Silver',
        plate_number: carPlate.trim().toUpperCase() || 'EPE-101-XZ',
        total_seats: Number(carSeats) || 3,
        has_ac: carHasAc,
      },
    });
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#0F766E', '#D97706', '#14B8A6'],
    });
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-full bg-[#F1F5F9] dark:bg-[#090D11] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 py-5 space-y-4">
      {/* Top Status & Theme Bar */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-600/20 dark:border-teal-400/20 text-[#0F766E] dark:text-[#14B8A6] text-[10px] font-bold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>LAGOS SEC 44 SAFE HARBOR</span>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('switch');
            toggleTheme();
          }}
          className="p-2 rounded-xl floating-surface text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white active-spring"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Brand Identity Header */}
      <div className="flex items-center gap-3.5 pt-1">
        <div className="w-14 h-14 rounded-2xl p-2 floating-surface flex items-center justify-center flex-shrink-0">
          <img
            src={getAssetPath('/logo.png')}
            alt="CAR PULL Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              CAR PULL
            </h1>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              AJAH - VI - MARINA
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
            Peer-to-peer commuter transit, escrow fuel splits, and LASDRI roadside dispatch.
          </p>
        </div>
      </div>

      {/* Main Authentication Surface */}
      <div className="floating-surface rounded-2xl p-4 space-y-3.5">
        {/* 2-Tab Segmented Control */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-[#0C1117] p-1 rounded-xl text-xs font-bold border border-slate-200/70 dark:border-white/5">
          <button
            type="button"
            onClick={() => setAuthTab('signin')}
            className={`py-2 rounded-lg transition-all active-spring ${
              authTab === 'signin'
                ? 'bg-white dark:bg-[#18212C] text-slate-900 dark:text-white shadow-xs font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthTab('signup')}
            className={`py-2 rounded-lg transition-all active-spring ${
              authTab === 'signup'
                ? 'bg-white dark:bg-[#18212C] text-slate-900 dark:text-white shadow-xs font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1. SIGN IN TAB */}
        {authTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="signin-identifier"
                className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block"
              >
                Work Email or Phone Number
              </label>
              <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#0C1117] border border-slate-200/90 dark:border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#0F766E] dark:focus-within:border-[#14B8A6] focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <input
                  id="signin-identifier"
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="name@company.ng or +234..."
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="signin-password"
                className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block"
              >
                Password or Passcode
              </label>
              <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#0C1117] border border-slate-200/90 dark:border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#0F766E] dark:focus-within:border-[#14B8A6] focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                <input
                  id="signin-password"
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 btn-electric-mint text-xs rounded-xl flex items-center justify-center gap-1.5 active-spring"
            >
              <span>Sign In to Corridor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Instant Demo Personas */}
            <div className="pt-2.5 border-t border-slate-200/70 dark:border-white/8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  Quick Demo Access
                </span>
                <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400">
                  1-Tap Login
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('match');
                    login('femi.adeyemi@dangote.com', 'rider');
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0C1117] hover:bg-teal-500/10 dark:hover:bg-teal-500/15 border border-slate-200/80 dark:border-white/10 hover:border-teal-500/40 text-left transition-all active-spring group"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0F766E] dark:text-[#14B8A6]">
                      <User className="w-3 h-3" />
                      Rider
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#0F766E] dark:group-hover:text-[#14B8A6] transition-colors" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
                    Femi Adeyemi
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Dangote • Ajah to VI
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('match');
                    login('babatunde.adeleke@flutterwave.com', 'driver');
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0C1117] hover:bg-amber-500/10 dark:hover:bg-amber-500/15 border border-slate-200/80 dark:border-white/10 hover:border-amber-500/40 text-left transition-all active-spring group"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                      <Car className="w-3 h-3" />
                      Driver
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
                    Babatunde Adeleke
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Flutterwave • 3 Seats
                  </div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. SIGN UP TAB */}
        {authTab === 'signup' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthTab('signin')}
                className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              <div className="flex bg-slate-100 dark:bg-[#0C1117] p-0.5 rounded-xl border border-slate-200/70 dark:border-white/5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setSignUpRole('rider')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    signUpRole === 'rider'
                      ? 'bg-[#0F766E] dark:bg-[#14B8A6] text-white dark:text-[#041E1B] font-extrabold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Rider
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpRole('driver')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    signUpRole === 'driver'
                      ? 'bg-[#0F766E] dark:bg-[#14B8A6] text-white dark:text-[#041E1B] font-extrabold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Driver
                </button>
              </div>
            </div>

            {/* Rider Sign Up Form */}
            {signUpRole === 'rider' && (
              <form onSubmit={handleRiderSignUp} className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Full Name
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0C1117] border border-slate-200/90 dark:border-white/10 rounded-xl px-3 py-2 focus-within:border-[#0F766E] dark:focus-within:border-[#14B8A6] transition-all">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={riderName}
                      onChange={(e) => setRiderName(e.target.value)}
                      placeholder="Chioma Okafor"
                      className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Work Email
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0C1117] border border-slate-200/90 dark:border-white/10 rounded-xl px-3 py-2 focus-within:border-[#0F766E] dark:focus-within:border-[#14B8A6] transition-all">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={riderEmail}
                      onChange={(e) => setRiderEmail(e.target.value)}
                      placeholder="chioma@paystack.com"
                      className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Phone
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0C1117] border border-slate-200/90 dark:border-white/10 rounded-xl px-2.5 py-2 focus-within:border-[#0F766E] transition-all">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="tel"
                        value={riderPhone}
                        onChange={(e) => setRiderPhone(e.target.value)}
                        placeholder="+234 812..."
                        className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Organization
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0C1117] border border-slate-200/90 dark:border-white/10 rounded-xl px-2.5 py-2 focus-within:border-[#0F766E] transition-all">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={riderCompany}
                        onChange={(e) => setRiderCompany(e.target.value)}
                        placeholder="Paystack"
                        className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 btn-electric-mint rounded-xl flex items-center justify-center gap-1.5 text-xs active-spring mt-1"
                >
                  <span>Create Rider Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Driver & Car Sign Up Form */}
            {signUpRole === 'driver' && (
              <form onSubmit={handleDriverSignUp} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Full Name
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0C1117] border border-slate-200/90 dark:border-white/10 rounded-xl px-2.5 py-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="Tunde Balogun"
                        className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Organization
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0C1117] border border-slate-200/90 dark:border-white/10 rounded-xl px-2.5 py-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={driverCompany}
                        onChange={(e) => setDriverCompany(e.target.value)}
                        placeholder="Access Bank"
                        className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Work Email
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0C1117] border border-slate-200/90 dark:border-white/10 rounded-xl px-3 py-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={driverEmail}
                      onChange={(e) => setDriverEmail(e.target.value)}
                      placeholder="tunde@accessbank.com"
                      className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Vehicle Specs Module */}
                <div className="bg-slate-50 dark:bg-[#0C1117] border border-slate-200/80 dark:border-white/8 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#0F766E] dark:text-[#14B8A6] flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5" />
                      Vehicle Registration
                    </span>
                    <span className="text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      SEC 44 EXEMPT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                        Make
                      </label>
                      <input
                        type="text"
                        value={carMake}
                        onChange={(e) => setCarMake(e.target.value)}
                        placeholder="Toyota"
                        className="w-full bg-white dark:bg-[#11171E] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                        Model
                      </label>
                      <input
                        type="text"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        placeholder="Camry"
                        className="w-full bg-white dark:bg-[#11171E] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 block mb-0.5">
                        Lagos Plate
                      </label>
                      <input
                        type="text"
                        value={carPlate}
                        onChange={(e) => setCarPlate(e.target.value)}
                        placeholder="APP-842-EY"
                        className="w-full plate-badge rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                        Year &amp; Color
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={carYear}
                          onChange={(e) => setCarYear(e.target.value)}
                          placeholder="2022"
                          className="w-14 bg-white dark:bg-[#11171E] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={carColor}
                          onChange={(e) => setCarColor(e.target.value)}
                          placeholder="Silver"
                          className="flex-1 min-w-0 bg-white dark:bg-[#11171E] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Seats:
                      </span>
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCarSeats(num)}
                          className={`w-6 h-6 rounded-md text-[11px] font-mono font-bold transition-all ${
                            carSeats === num
                              ? 'bg-[#0F766E] dark:bg-[#14B8A6] text-white dark:text-[#041E1B]'
                              : 'bg-white dark:bg-[#11171E] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={carHasAc}
                        onChange={(e) => setCarHasAc(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#0F766E] rounded"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        AC Verified
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 btn-electric-mint rounded-xl flex items-center justify-center gap-1.5 text-xs active-spring mt-1"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Register Vehicle &amp; Start Driving</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Architectural Trust Strip (Hairline-divided instead of separate small cards) */}
      <div className="floating-surface rounded-2xl grid grid-cols-3 divide-x divide-slate-200/80 dark:divide-white/8 py-2.5 px-1 text-center">
        <div className="px-2 flex flex-col items-center">
          <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6] mb-1" />
          <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Verified Peers
          </span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
            NIN &amp; Work Domain
          </span>
        </div>
        <div className="px-2 flex flex-col items-center">
          <Fuel className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1" />
          <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Zero-Cash Split
          </span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
            1.2x PMS Ceiling
          </span>
        </div>
        <div className="px-2 flex flex-col items-center">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
          <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
            Safe Hubs
          </span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
            Off-Street CCTV
          </span>
        </div>
      </div>
    </div>
  );
};
