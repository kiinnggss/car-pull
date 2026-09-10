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
} from 'lucide-react';
import { getAssetPath } from '@/lib/assets';
import confetti from 'canvas-confetti';

export const AuthLanding: React.FC = () => {
  const { login, registerRider, registerDriver } = useAppStore();
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [signUpRole, setSignUpRole] = useState<'rider' | 'driver'>('rider');

  // Sign In Form State (starts completely empty)
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
    login(signInIdentifier || 'femi.adeyemi@dangote.com', 'rider');
  };

  const handleRiderSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riderName.trim()) return;
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
      colors: ['#0D6E6E', '#C25E2E', '#7C3AED'],
    });
  };

  const handleDriverSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) return;
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
      colors: ['#0D6E6E', '#C25E2E', '#7C3AED'],
    });
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#F6F2EA] text-[#141210] flex flex-col justify-between p-4 py-5 space-y-3">
      {/* Brand Header with Responsive Logo & Fancy Typography */}
      <div className="flex flex-col items-center text-center space-y-2 pt-1">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-white border border-[#C25E2E]/40 shadow-xs flex items-center justify-center">
          <img
            src={getAssetPath('/logo.png')}
            alt="CAR PULL Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#0D6E6E] text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest shadow-2xs">
            <span>CAR PULL LAGOS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-[#141210] tracking-tight mt-1">
            Community &amp; Social Carpooling
          </h1>
          <p className="text-[11px] text-[#70665A] max-w-[320px] mx-auto leading-tight mt-0.5">
            Ride together, meet great people, and share fuel splits across Lagos—any day, any time.
          </p>
        </div>
      </div>

      {/* Main Form Container - Dense & Flowing */}
      <div className="bg-white border border-[#DDD4C5] rounded-2xl p-3.5 shadow-sm space-y-3">
        {/* 2-Tab Segmented Selector (Sign In vs Create Account) */}
        <div className="grid grid-cols-2 gap-1 bg-[#ECE5D8] p-1 rounded-xl text-xs font-bold border border-[#DDD4C5]">
          <button
            type="button"
            onClick={() => setAuthTab('signin')}
            className={`py-1.5 rounded-lg transition-all ${
              authTab === 'signin'
                ? 'bg-white text-[#141210] shadow-2xs font-black'
                : 'text-[#70665A] hover:text-[#141210]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthTab('signup')}
            className={`py-1.5 rounded-lg transition-all ${
              authTab === 'signup'
                ? 'bg-white text-[#141210] shadow-2xs font-black'
                : 'text-[#70665A] hover:text-[#141210]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1. SIGN IN TAB */}
        {authTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-2.5 pt-0.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#70665A] uppercase tracking-wider block">
                Work Email or Phone
              </label>
              <div className="flex items-center gap-2 bg-[#F8F5EE] border border-[#DDD4C5] focus-within:border-[#0D6E6E] rounded-xl px-3 py-2 transition-colors">
                <Mail className="w-4 h-4 text-[#70665A] flex-shrink-0" />
                <input
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="e.g. name@corporate.ng or +234..."
                  className="w-full bg-transparent text-xs font-bold text-[#141210] placeholder:text-[#A89F91] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#70665A] uppercase tracking-wider block">
                Password or OTP
              </label>
              <div className="flex items-center gap-2 bg-[#F8F5EE] border border-[#DDD4C5] focus-within:border-[#0D6E6E] rounded-xl px-3 py-2 transition-colors">
                <Lock className="w-4 h-4 text-[#70665A] flex-shrink-0" />
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-xs font-bold text-[#141210] placeholder:text-[#A89F91] focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-[#0D6E6E] to-[#094E4E] hover:opacity-95 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Sign In to CAR PULL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Instant Demo Shortcuts in Logo Colors */}
            <div className="pt-2 border-t border-[#DDD4C5] flex items-center justify-between text-[10px]">
              <span className="font-bold text-[#70665A] uppercase tracking-wider text-[9px]">
                Instant Demo:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => login('femi.adeyemi@dangote.com', 'rider')}
                  className="px-2 py-1 bg-[#F8F5EE] hover:bg-teal-50 hover:text-[#0D6E6E] text-[#141210] rounded-lg font-bold transition-colors flex items-center gap-1 border border-[#DDD4C5]"
                >
                  <User className="w-3 h-3 text-[#0D6E6E]" />
                  <span>Rider (Femi)</span>
                </button>
                <button
                  type="button"
                  onClick={() => login('babatunde.adeleke@flutterwave.com', 'driver')}
                  className="px-2 py-1 bg-[#F8F5EE] hover:bg-amber-50 hover:text-[#C25E2E] text-[#141210] rounded-lg font-bold transition-colors flex items-center gap-1 border border-[#DDD4C5]"
                >
                  <Car className="w-3 h-3 text-[#C25E2E]" />
                  <span>Driver (Babatunde)</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. SIGN UP TAB (With Back to Sign In Option) */}
        {authTab === 'signup' && (
          <div className="space-y-2.5 pt-0.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#DDD4C5]">
              <button
                type="button"
                onClick={() => setAuthTab('signin')}
                className="flex items-center gap-1 text-[11px] font-bold text-[#C25E2E] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              <div className="flex bg-[#ECE5D8] p-0.5 rounded-lg border border-[#DDD4C5] text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setSignUpRole('rider')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    signUpRole === 'rider' ? 'bg-[#0D6E6E] text-white font-black' : 'text-[#70665A]'
                  }`}
                >
                  Rider
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpRole('driver')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    signUpRole === 'driver' ? 'bg-[#0D6E6E] text-white font-black' : 'text-[#70665A]'
                  }`}
                >
                  Driver
                </button>
              </div>
            </div>

            {/* Rider Sign Up Form */}
            {signUpRole === 'rider' && (
              <form onSubmit={handleRiderSignUp} className="space-y-2 pt-0.5">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-[#70665A] uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#F8F5EE] border border-[#DDD4C5] rounded-xl px-2.5 py-1.5">
                    <User className="w-3.5 h-3.5 text-[#70665A]" />
                    <input
                      type="text"
                      value={riderName}
                      onChange={(e) => setRiderName(e.target.value)}
                      placeholder="e.g. Chioma Okafor"
                      className="w-full bg-transparent text-xs font-bold text-[#141210] placeholder:text-[#A89F91] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-[#70665A] uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#F8F5EE] border border-[#DDD4C5] rounded-xl px-2.5 py-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#70665A]" />
                    <input
                      type="email"
                      value={riderEmail}
                      onChange={(e) => setRiderEmail(e.target.value)}
                      placeholder="chioma@example.com"
                      className="w-full bg-transparent text-xs font-bold text-[#141210] placeholder:text-[#A89F91] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-[#70665A] uppercase tracking-wider block">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-1 bg-[#F8F5EE] border border-[#DDD4C5] rounded-xl px-2 py-1.5">
                      <Phone className="w-3 h-3 text-[#70665A]" />
                      <input
                        type="tel"
                        value={riderPhone}
                        onChange={(e) => setRiderPhone(e.target.value)}
                        placeholder="+234 812..."
                        className="w-full bg-transparent text-xs font-bold text-[#141210] placeholder:text-[#A89F91] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-[#70665A] uppercase tracking-wider block">
                      Work / Community
                    </label>
                    <div className="flex items-center gap-1 bg-[#F8F5EE] border border-[#DDD4C5] rounded-xl px-2 py-1.5">
                      <Building2 className="w-3 h-3 text-[#70665A]" />
                      <input
                        type="text"
                        value={riderCompany}
                        onChange={(e) => setRiderCompany(e.target.value)}
                        placeholder="e.g. Designer, Tech, Studio"
                        className="w-full bg-transparent text-xs font-bold text-[#141210] placeholder:text-[#A89F91] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0D6E6E] hover:bg-[#094E4E] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 mt-1"
                >
                  <span>Create Rider Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Driver & Car Sign Up Form */}
            {signUpRole === 'driver' && (
              <form onSubmit={handleDriverSignUp} className="space-y-2 pt-0.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-[#70665A] uppercase tracking-wider block">
                      Full Name
                    </label>
                    <div className="flex items-center gap-1 bg-[#F8F5EE] border border-[#DDD4C5] rounded-xl px-2 py-1.5">
                      <User className="w-3 h-3 text-[#70665A]" />
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="e.g. Tunde Balogun"
                        className="w-full bg-transparent text-xs font-bold text-[#141210] placeholder:text-[#A89F91] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-[#70665A] uppercase tracking-wider block">
                      Work / Field
                    </label>
                    <div className="flex items-center gap-1 bg-[#F8F5EE] border border-[#DDD4C5] rounded-xl px-2 py-1.5">
                      <Building2 className="w-3 h-3 text-[#70665A]" />
                      <input
                        type="text"
                        value={driverCompany}
                        onChange={(e) => setDriverCompany(e.target.value)}
                        placeholder="e.g. Tech Lead, Architect"
                        className="w-full bg-transparent text-xs font-bold text-[#141210] placeholder:text-[#A89F91] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-[#70665A] uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#F8F5EE] border border-[#DDD4C5] rounded-xl px-2.5 py-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#70665A]" />
                    <input
                      type="email"
                      value={driverEmail}
                      onChange={(e) => setDriverEmail(e.target.value)}
                      placeholder="tunde@example.com"
                      className="w-full bg-transparent text-xs font-bold text-[#141210] placeholder:text-[#A89F91] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Flowing Vehicle Details Box */}
                <div className="bg-[#F8F5EE] border border-[#DDD4C5] rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-[#0D6E6E] uppercase tracking-wider flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      Vehicle Details
                    </span>
                    <span className="text-[8px] font-black text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                      Sec 44 Compliant
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[8px] font-bold text-[#70665A] block mb-0.5">Brand</label>
                      <input
                        type="text"
                        value={carMake}
                        onChange={(e) => setCarMake(e.target.value)}
                        placeholder="e.g. Toyota"
                        className="w-full bg-white border border-[#DDD4C5] rounded-lg px-2 py-1 text-xs font-bold text-[#141210] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-[#70665A] block mb-0.5">Model</label>
                      <input
                        type="text"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        placeholder="e.g. Camry"
                        className="w-full bg-white border border-[#DDD4C5] rounded-lg px-2 py-1 text-xs font-bold text-[#141210] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[8px] font-bold text-[#C25E2E] block mb-0.5">Plate Number *</label>
                      <input
                        type="text"
                        value={carPlate}
                        onChange={(e) => setCarPlate(e.target.value)}
                        placeholder="APP-842-EY"
                        className="w-full bg-white border border-[#C25E2E] rounded-lg px-2 py-1 text-xs font-black font-mono text-[#C25E2E] uppercase focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-[#70665A] block mb-0.5">Year & Color</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={carYear}
                          onChange={(e) => setCarYear(e.target.value)}
                          placeholder="2022"
                          className="w-12 bg-white border border-[#DDD4C5] rounded-lg px-1.5 py-1 text-xs font-bold text-[#141210] focus:outline-none"
                        />
                        <input
                          type="text"
                          value={carColor}
                          onChange={(e) => setCarColor(e.target.value)}
                          placeholder="Silver"
                          className="flex-1 min-w-0 bg-white border border-[#DDD4C5] rounded-lg px-1.5 py-1 text-xs font-bold text-[#141210] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seats & AC Options */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#DDD4C5] text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-[#70665A]">Seats:</span>
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCarSeats(num)}
                          className={`w-5 h-5 rounded-md text-[10px] font-black transition-all ${
                            carSeats === num
                              ? 'bg-[#0D6E6E] text-white shadow-2xs'
                              : 'bg-white text-[#70665A] border border-[#DDD4C5]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={carHasAc}
                        onChange={(e) => setCarHasAc(e.target.checked)}
                        className="w-3.5 h-3.5 text-[#0D6E6E] rounded"
                      />
                      <span className="text-[9px] font-bold text-[#141210]">AC Active</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0D6E6E] hover:bg-[#094E4E] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 mt-1"
                >
                  <Car className="w-3.5 h-3.5 text-[#FBBF24]" />
                  <span>Register Vehicle & Start Driving</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Flowing Value Pillars in Logo Colors */}
      <div className="grid grid-cols-3 gap-1.5 text-center pt-0.5">
        <div className="p-2 rounded-xl bg-white border border-[#DDD4C5] flex flex-col items-center">
          <ShieldCheck className="w-4 h-4 text-[#0D6E6E] mb-0.5" />
          <span className="text-[9px] font-bold text-[#141210] leading-tight">Verified Peers</span>
          <span className="text-[8px] text-[#70665A]">NIN / Work Domain</span>
        </div>
        <div className="p-2 rounded-xl bg-white border border-[#DDD4C5] flex flex-col items-center">
          <Fuel className="w-4 h-4 text-[#C25E2E] mb-0.5" />
          <span className="text-[9px] font-bold text-[#141210] leading-tight">Fair Fuel Split</span>
          <span className="text-[8px] text-[#70665A]">Zero Commercial Fare</span>
        </div>
        <div className="p-2 rounded-xl bg-white border border-[#DDD4C5] flex flex-col items-center">
          <MapPin className="w-4 h-4 text-[#D97706] mb-0.5" />
          <span className="text-[9px] font-bold text-[#141210] leading-tight">Safe Hubs</span>
          <span className="text-[8px] text-[#70665A]">Off-Street CCTV</span>
        </div>
      </div>
    </div>
  );
};
