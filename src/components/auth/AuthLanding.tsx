'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  ShieldCheck,
  Car,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  Fuel,
  Building2,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';
import { getAssetPath } from '@/lib/assets';
import confetti from 'canvas-confetti';

export const AuthLanding: React.FC = () => {
  const { login, registerRider, registerDriver } = useAppStore();
  const [authMode, setAuthMode] = useState<'signin' | 'signup_rider' | 'signup_driver'>('signin');

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState('femi.adeyemi@dangote.com');
  const [signInPassword, setSignInPassword] = useState('••••••••');

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
  const [carMake, setCarMake] = useState('Toyota');
  const [carModel, setCarModel] = useState('Camry');
  const [carYear, setCarYear] = useState('2022');
  const [carColor, setCarColor] = useState('Silver Metallic');
  const [carPlate, setCarPlate] = useState('APP-842-EY');
  const [carSeats, setCarSeats] = useState(3);
  const [carHasAc, setCarHasAc] = useState(true);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    login(signInIdentifier, 'rider');
  };

  const handleRiderSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderName.trim()) return;
    registerRider({
      fullName: riderName,
      email: riderEmail || `${riderName.toLowerCase().replace(/\s+/g, '.')}@corporate.ng`,
      phone: riderPhone || '+234 812 000 1234',
      employer: riderCompany || 'Corporate Professional',
    });
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#10B981', '#F59E0B'],
    });
  };

  const handleDriverSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) return;
    registerDriver({
      fullName: driverName,
      email: driverEmail || `${driverName.toLowerCase().replace(/\s+/g, '.')}@corporate.ng`,
      phone: driverPhone || '+234 803 111 5678',
      employer: driverCompany || 'Executive Driver',
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
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#10B981', '#F59E0B'],
    });
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-white flex flex-col justify-between p-4 py-6 space-y-6">
      {/* Clean Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2 pt-2">
        <div className="w-16 h-16 rounded-3xl p-1 bg-gradient-to-tr from-[#7C3AED] to-amber-400 shadow-md flex items-center justify-center">
          <img
            src={getAssetPath('/logo.png')}
            alt="CAR PULL Logo"
            className="w-full h-full rounded-[20px] object-cover"
          />
        </div>

        <div>
          <span className="bg-[#7C3AED] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-block shadow-xs">
            CAR PULL LAGOS
          </span>
          <h1 className="text-xl font-black text-zinc-900 tracking-tight mt-1.5">
            Executive Corridor Carpooling
          </h1>
          <p className="text-xs text-zinc-500 max-w-[290px] mx-auto mt-1 leading-relaxed">
            Share fuel costs along the Ajah ➔ VI ➔ Marina expressway corridor with verified peers.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-zinc-50/90 border border-zinc-200/80 rounded-3xl p-4 shadow-sm space-y-4">
        {/* Simple 3-Tab Segmented Selector */}
        <div className="grid grid-cols-3 gap-1 bg-zinc-200/70 p-1 rounded-2xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`py-2 rounded-xl transition-all ${
              authMode === 'signin'
                ? 'bg-white text-zinc-950 shadow-xs font-black'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signup_rider')}
            className={`py-2 rounded-xl transition-all ${
              authMode === 'signup_rider'
                ? 'bg-white text-zinc-950 shadow-xs font-black'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Join Rider
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signup_driver')}
            className={`py-2 rounded-xl transition-all ${
              authMode === 'signup_driver'
                ? 'bg-[#7C3AED] text-white shadow-xs font-black'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            + Register Car
          </button>
        </div>

        {/* 1. SIGN IN MODE */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Work Email or Phone
              </label>
              <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-2xl px-3 py-2.5 shadow-2xs">
                <Mail className="w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="femi.adeyemi@dangote.com"
                  className="w-full bg-transparent text-xs font-semibold text-zinc-900 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Password / OTP
              </label>
              <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-2xl px-3 py-2.5 shadow-2xs">
                <Lock className="w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-zinc-900 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-98 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to CAR PULL</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick 1-Tap Demo Logins */}
            <div className="pt-2 border-t border-zinc-200/80 space-y-2">
              <span className="text-[9px] uppercase font-extrabold text-zinc-400 tracking-wider block text-center">
                Instant Demo Access (No Typing Needed)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => login('femi.adeyemi@dangote.com', 'rider')}
                  className="p-2.5 bg-white hover:bg-purple-50 hover:border-purple-200 border border-zinc-200 rounded-2xl text-left transition-all active:scale-95 shadow-2xs group"
                >
                  <span className="text-[10px] font-black text-zinc-900 block group-hover:text-[#7C3AED]">
                    ⚡ Commuter Rider
                  </span>
                  <span className="text-[9px] text-zinc-500 block line-clamp-1">
                    Femi (Dangote)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => login('babatunde.adeleke@flutterwave.com', 'driver')}
                  className="p-2.5 bg-white hover:bg-purple-50 hover:border-purple-200 border border-zinc-200 rounded-2xl text-left transition-all active:scale-95 shadow-2xs group"
                >
                  <span className="text-[10px] font-black text-zinc-900 block group-hover:text-[#7C3AED]">
                    🚘 Verified Driver
                  </span>
                  <span className="text-[9px] text-zinc-500 block line-clamp-1">
                    Babatunde (Toyota Camry)
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. RIDER SIGN UP MODE */}
        {authMode === 'signup_rider' && (
          <form onSubmit={handleRiderSignUp} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-2xl px-3 py-2 shadow-2xs">
                <User className="w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  placeholder="e.g. Chioma Okafor"
                  className="w-full bg-transparent text-xs font-semibold text-zinc-900 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Work Email (Corporate Domain)
              </label>
              <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-2xl px-3 py-2 shadow-2xs">
                <Mail className="w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={riderEmail}
                  onChange={(e) => setRiderEmail(e.target.value)}
                  placeholder="chioma@kpmg.com"
                  className="w-full bg-transparent text-xs font-semibold text-zinc-900 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Phone Number
                </label>
                <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-2xl px-2.5 py-2 shadow-2xs">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="tel"
                    value={riderPhone}
                    onChange={(e) => setRiderPhone(e.target.value)}
                    placeholder="+234 812..."
                    className="w-full bg-transparent text-xs font-semibold text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Employer / Company
                </label>
                <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-2xl px-2.5 py-2 shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={riderCompany}
                    onChange={(e) => setRiderCompany(e.target.value)}
                    placeholder="e.g. KPMG"
                    className="w-full bg-transparent text-xs font-semibold text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-98 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Create Rider Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. SIGN UP DRIVER'S CAR MODE */}
        {authMode === 'signup_driver' && (
          <form onSubmit={handleDriverSignUp} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Driver's Full Name & Company
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-2xl px-2.5 py-2 shadow-2xs">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-transparent text-xs font-semibold text-zinc-900 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-2xl px-2.5 py-2 shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={driverCompany}
                    onChange={(e) => setDriverCompany(e.target.value)}
                    placeholder="Workplace"
                    className="w-full bg-transparent text-xs font-semibold text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Work Email (For Verification)
              </label>
              <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-2xl px-3 py-2 shadow-2xs">
                <Mail className="w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={driverEmail}
                  onChange={(e) => setDriverEmail(e.target.value)}
                  placeholder="driver@company.com"
                  className="w-full bg-transparent text-xs font-semibold text-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Vehicle Registration Section */}
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-wider flex items-center gap-1">
                  <Car className="w-3.5 h-3.5" />
                  Vehicle Details
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Lagos Sec 44 Compliant
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">
                    Car Brand / Make
                  </label>
                  <input
                    type="text"
                    value={carMake}
                    onChange={(e) => setCarMake(e.target.value)}
                    placeholder="e.g. Toyota, Honda, Mazda"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-zinc-900 focus:outline-none shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">
                    Model
                  </label>
                  <input
                    type="text"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    placeholder="e.g. Camry, Corolla"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-zinc-900 focus:outline-none shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-purple-900 block mb-0.5">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    value={carPlate}
                    onChange={(e) => setCarPlate(e.target.value)}
                    placeholder="e.g. APP-842-EY"
                    className="w-full bg-white border-2 border-[#7C3AED] rounded-xl px-2.5 py-1.5 text-xs font-black font-mono text-purple-900 focus:outline-none uppercase shadow-2xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">
                    Year & Color
                  </label>
                  <div className="flex gap-1 min-w-0">
                    <input
                      type="text"
                      value={carYear}
                      onChange={(e) => setCarYear(e.target.value)}
                      placeholder="2022"
                      className="w-14 min-w-0 bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs font-bold text-zinc-900 focus:outline-none shadow-2xs"
                    />
                    <input
                      type="text"
                      value={carColor}
                      onChange={(e) => setCarColor(e.target.value)}
                      placeholder="Silver"
                      className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-xl px-2 py-1.5 text-xs font-bold text-zinc-900 focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Seats & AC Toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-purple-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-700">Seats:</span>
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCarSeats(num)}
                      className={`w-6 h-6 rounded-lg text-[10px] font-black transition-all ${
                        carSeats === num
                          ? 'bg-[#7C3AED] text-white shadow-2xs'
                          : 'bg-white text-zinc-600 border border-zinc-200'
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
                    className="w-4 h-4 text-[#7C3AED] rounded"
                  />
                  <span className="text-[10px] font-bold text-zinc-800">AC Active</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] active:scale-98 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4 text-amber-300" />
              <span>Register Car & Sign In as Driver</span>
            </button>
          </form>
        )}
      </div>

      {/* 3 Simple Value Pillars - Clean & Calm */}
      <div className="grid grid-cols-3 gap-2 text-center pt-2">
        <div className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <span className="text-[10px] font-black text-zinc-800 block">Verified Peers</span>
          <span className="text-[8px] text-zinc-500">Corporate NIN/BVN</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100">
          <Fuel className="w-5 h-5 text-[#7C3AED] mx-auto mb-1" />
          <span className="text-[10px] font-black text-zinc-800 block">Fair Fuel Split</span>
          <span className="text-[8px] text-zinc-500">Zero Commercial Surge</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100">
          <MapPin className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <span className="text-[10px] font-black text-zinc-800 block">CCTV Safe Hubs</span>
          <span className="text-[8px] text-zinc-500">Off-street Boarding</span>
        </div>
      </div>
    </div>
  );
};
