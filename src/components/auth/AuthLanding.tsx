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

  // Rider Sign Up State (starts completely empty)
  const [riderName, setRiderName] = useState('');
  const [riderEmail, setRiderEmail] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderCompany, setRiderCompany] = useState('');

  // Driver & Car Sign Up State (starts completely empty)
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
      colors: ['#7C3AED', '#10B981', '#D97706'],
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
      colors: ['#7C3AED', '#10B981', '#D97706'],
    });
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FAF8F5] text-[#1C1917] flex flex-col justify-between p-4 py-5 space-y-4">
      {/* Brand Header with Responsive, Fully Visible Logo */}
      <div className="flex flex-col items-center text-center space-y-2 pt-1">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-[#FAF8F5] border border-[#E7E2D8] shadow-xs flex items-center justify-center">
          <img
            src={getAssetPath('/logo.png')}
            alt="CAR PULL Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#7C3AED] text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest shadow-2xs">
            <span>CAR PULL LAGOS</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-[#1C1917] tracking-tight mt-1">
            Executive Corridor Carpooling
          </h1>
          <p className="text-[11px] text-[#78716C] max-w-[300px] mx-auto leading-tight mt-0.5">
            Share verified fuel splits along the Ajah → VI → Marina corporate corridor.
          </p>
        </div>
      </div>

      {/* Main Form Container - Warm, Dense & Streamlined */}
      <div className="bg-white border border-[#E7E2D8] rounded-2xl p-3.5 shadow-sm space-y-3">
        {/* Streamlined 2-Tab Segmented Selector (Sign In vs Create Account) */}
        <div className="grid grid-cols-2 gap-1 bg-[#F4F0E8] p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthTab('signin')}
            className={`py-1.5 rounded-lg transition-all ${
              authTab === 'signin'
                ? 'bg-white text-[#1C1917] shadow-xs font-black'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthTab('signup')}
            className={`py-1.5 rounded-lg transition-all ${
              authTab === 'signup'
                ? 'bg-white text-[#1C1917] shadow-xs font-black'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1. SIGN IN TAB */}
        {authTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-2.5 pt-0.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block">
                Work Email or Phone
              </label>
              <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E7E2D8] focus-within:border-[#7C3AED] rounded-xl px-3 py-2 transition-colors">
                <Mail className="w-4 h-4 text-[#A89F91] flex-shrink-0" />
                <input
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="e.g. name@corporate.ng or +234..."
                  className="w-full bg-transparent text-xs font-semibold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block">
                Password or OTP
              </label>
              <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E7E2D8] focus-within:border-[#7C3AED] rounded-xl px-3 py-2 transition-colors">
                <Lock className="w-4 h-4 text-[#A89F91] flex-shrink-0" />
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-xs font-semibold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Sign In to CAR PULL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Streamlined, Non-Intrusive 1-Tap Demo Shortcuts */}
            <div className="pt-2 border-t border-[#E7E2D8] flex items-center justify-between text-[10px]">
              <span className="font-bold text-[#78716C] uppercase tracking-wider text-[9px]">
                Instant Demo:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => login('femi.adeyemi@dangote.com', 'rider')}
                  className="px-2 py-1 bg-[#F4F0E8] hover:bg-purple-50 hover:text-[#7C3AED] text-[#1C1917] rounded-lg font-bold transition-colors flex items-center gap-1"
                >
                  <User className="w-3 h-3 text-[#7C3AED]" />
                  <span>Rider (Femi)</span>
                </button>
                <button
                  type="button"
                  onClick={() => login('babatunde.adeleke@flutterwave.com', 'driver')}
                  className="px-2 py-1 bg-[#F4F0E8] hover:bg-purple-50 hover:text-[#7C3AED] text-[#1C1917] rounded-lg font-bold transition-colors flex items-center gap-1"
                >
                  <Car className="w-3 h-3 text-[#7C3AED]" />
                  <span>Driver (Babatunde)</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. SIGN UP TAB */}
        {authTab === 'signup' && (
          <div className="space-y-2.5 pt-0.5">
            {/* Sub-toggle: Rider vs Driver */}
            <div className="grid grid-cols-2 gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#E7E2D8] text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSignUpRole('rider')}
                className={`py-1 rounded-md transition-all flex items-center justify-center gap-1 ${
                  signUpRole === 'rider'
                    ? 'bg-[#7C3AED] text-white shadow-2xs font-black'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <User className="w-3 h-3" />
                <span>Join as Rider</span>
              </button>
              <button
                type="button"
                onClick={() => setSignUpRole('driver')}
                className={`py-1 rounded-md transition-all flex items-center justify-center gap-1 ${
                  signUpRole === 'driver'
                    ? 'bg-[#7C3AED] text-white shadow-2xs font-black'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <Car className="w-3 h-3" />
                <span>Register as Driver</span>
              </button>
            </div>

            {/* Rider Sign Up Form */}
            {signUpRole === 'rider' && (
              <form onSubmit={handleRiderSignUp} className="space-y-2 pt-1">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-[#78716C] uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl px-2.5 py-1.5">
                    <User className="w-3.5 h-3.5 text-[#A89F91]" />
                    <input
                      type="text"
                      value={riderName}
                      onChange={(e) => setRiderName(e.target.value)}
                      placeholder="e.g. Chioma Okafor"
                      className="w-full bg-transparent text-xs font-semibold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-[#78716C] uppercase tracking-wider block">
                    Work Email (Corporate Domain)
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl px-2.5 py-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#A89F91]" />
                    <input
                      type="email"
                      value={riderEmail}
                      onChange={(e) => setRiderEmail(e.target.value)}
                      placeholder="chioma@company.com"
                      className="w-full bg-transparent text-xs font-semibold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-[#78716C] uppercase tracking-wider block">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl px-2 py-1.5">
                      <Phone className="w-3 h-3 text-[#A89F91]" />
                      <input
                        type="tel"
                        value={riderPhone}
                        onChange={(e) => setRiderPhone(e.target.value)}
                        placeholder="+234 812..."
                        className="w-full bg-transparent text-xs font-semibold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-[#78716C] uppercase tracking-wider block">
                      Employer / Workplace
                    </label>
                    <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl px-2 py-1.5">
                      <Building2 className="w-3 h-3 text-[#A89F91]" />
                      <input
                        type="text"
                        value={riderCompany}
                        onChange={(e) => setRiderCompany(e.target.value)}
                        placeholder="e.g. KPMG"
                        className="w-full bg-transparent text-xs font-semibold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 mt-1"
                >
                  <span>Create Rider Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* Driver & Car Sign Up Form */}
            {signUpRole === 'driver' && (
              <form onSubmit={handleDriverSignUp} className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-[#78716C] uppercase tracking-wider block">
                      Full Name
                    </label>
                    <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl px-2 py-1.5">
                      <User className="w-3 h-3 text-[#A89F91]" />
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-transparent text-xs font-semibold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-[#78716C] uppercase tracking-wider block">
                      Workplace
                    </label>
                    <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl px-2 py-1.5">
                      <Building2 className="w-3 h-3 text-[#A89F91]" />
                      <input
                        type="text"
                        value={driverCompany}
                        onChange={(e) => setDriverCompany(e.target.value)}
                        placeholder="e.g. Stanbic IBTC"
                        className="w-full bg-transparent text-xs font-semibold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-[#78716C] uppercase tracking-wider block">
                    Work Email
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl px-2.5 py-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#A89F91]" />
                    <input
                      type="email"
                      value={driverEmail}
                      onChange={(e) => setDriverEmail(e.target.value)}
                      placeholder="driver@company.com"
                      className="w-full bg-transparent text-xs font-semibold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dense Vehicle Details Box */}
                <div className="bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-[#7C3AED] uppercase tracking-wider flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      Vehicle Information
                    </span>
                    <span className="text-[8px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                      Sec 44 Compliant
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[8px] font-bold text-[#78716C] block mb-0.5">
                        Brand / Make
                      </label>
                      <input
                        type="text"
                        value={carMake}
                        onChange={(e) => setCarMake(e.target.value)}
                        placeholder="e.g. Toyota"
                        className="w-full bg-white border border-[#E7E2D8] rounded-lg px-2 py-1 text-xs font-bold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-[#78716C] block mb-0.5">
                        Model
                      </label>
                      <input
                        type="text"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        placeholder="e.g. Camry"
                        className="w-full bg-white border border-[#E7E2D8] rounded-lg px-2 py-1 text-xs font-bold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[8px] font-bold text-purple-900 block mb-0.5">
                        Plate Number *
                      </label>
                      <input
                        type="text"
                        value={carPlate}
                        onChange={(e) => setCarPlate(e.target.value)}
                        placeholder="APP-842-EY"
                        className="w-full bg-white border border-[#7C3AED] rounded-lg px-2 py-1 text-xs font-black font-mono text-purple-900 placeholder:text-purple-300 uppercase focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-[#78716C] block mb-0.5">
                        Year & Color
                      </label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={carYear}
                          onChange={(e) => setCarYear(e.target.value)}
                          placeholder="2022"
                          className="w-12 bg-white border border-[#E7E2D8] rounded-lg px-1.5 py-1 text-xs font-bold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                        />
                        <input
                          type="text"
                          value={carColor}
                          onChange={(e) => setCarColor(e.target.value)}
                          placeholder="Silver"
                          className="flex-1 min-w-0 bg-white border border-[#E7E2D8] rounded-lg px-1.5 py-1 text-xs font-bold text-[#1C1917] placeholder:text-[#A89F91] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seats & AC Options */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E7E2D8] text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-[#78716C]">Seats:</span>
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCarSeats(num)}
                          className={`w-5 h-5 rounded-md text-[10px] font-black transition-all ${
                            carSeats === num
                              ? 'bg-[#7C3AED] text-white shadow-2xs'
                              : 'bg-white text-[#78716C] border border-[#E7E2D8]'
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
                        className="w-3.5 h-3.5 text-[#7C3AED] rounded"
                      />
                      <span className="text-[9px] font-bold text-[#1C1917]">AC Active</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 mt-1"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Register Vehicle & Start Driving</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Streamlined Compact Value Props - Clean, Calm, Dense */}
      <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
        <div className="p-2 rounded-xl bg-white border border-[#E7E2D8] flex flex-col items-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mb-0.5" />
          <span className="text-[9px] font-black text-[#1C1917] leading-tight">Verified Peers</span>
          <span className="text-[8px] text-[#78716C]">NIN / Work Email</span>
        </div>
        <div className="p-2 rounded-xl bg-white border border-[#E7E2D8] flex flex-col items-center">
          <Fuel className="w-4 h-4 text-[#7C3AED] mb-0.5" />
          <span className="text-[9px] font-black text-[#1C1917] leading-tight">Fair Fuel Split</span>
          <span className="text-[8px] text-[#78716C]">Zero Surge Pricing</span>
        </div>
        <div className="p-2 rounded-xl bg-white border border-[#E7E2D8] flex flex-col items-center">
          <MapPin className="w-4 h-4 text-amber-600 mb-0.5" />
          <span className="text-[9px] font-black text-[#1C1917] leading-tight">Safe Hubs</span>
          <span className="text-[8px] text-[#78716C]">Off-Street CCTV</span>
        </div>
      </div>
    </div>
  );
};
