import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, User, Phone, MapPin, PawPrint } from 'lucide-react';
import { api } from '../services/api';
import { AuthResponse, UserRole } from '../types';

interface AuthModalProps {
  onSuccess: (auth: AuthResponse) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ADOPTER');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Austin, TX');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await api.register(
          email.trim(), 
          password, 
          role, 
          fullName.trim() || undefined, 
          phone.trim() || undefined, 
          city.trim() || undefined
        );
        onSuccess(res);
      } else {
        const res = await api.login(email.trim(), password);
        onSuccess(res);
      }
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message;
      const validationMap = err?.response?.data?.validationErrors;
      let msg = serverMsg;
      if (validationMap && typeof validationMap === 'object') {
        msg = Object.values(validationMap).join(', ');
      }
      setError(msg || err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hinge-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[36px] bg-white border border-hinge-border p-8 shadow-2xl space-y-6 text-left">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-hinge-black text-amber-300 flex items-center justify-center shadow-subtle">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-black text-2xl tracking-tight text-hinge-black">
              MeaowMatch
            </span>
            <p className="text-[10px] text-neutral-500 font-medium">
              Pet Adoption & Animal Rescue Network
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-neutral-100 rounded-2xl border border-neutral-200">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isSignUp ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              isSignUp ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'
            }`}
          >
            Create Account
          </button>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold text-hinge-black">
            {isSignUp ? 'Create your profile' : 'Welcome back'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isSignUp
              ? 'Join as an Adopter, Shelter/Rehomer, or Emergency Rescuer.'
              : 'Log in to manage your pets, view adoption inquiries, and active alerts.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection (Registration only) */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { r: 'ADOPTER', label: 'Adopter', desc: 'Looking to adopt' },
                  { r: 'REHOMER', label: 'Rehomer', desc: 'Shelter / Owner' },
                  { r: 'RESCUER', label: 'Rescuer', desc: 'Spotter / First Aid' },
                ].map((item) => (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => setRole(item.r as UserRole)}
                    className={`py-2 px-2 rounded-2xl border text-center transition-all ${
                      role === item.r
                        ? 'bg-hinge-black text-white border-hinge-black shadow-sm'
                        : 'bg-hinge-cream/40 border-hinge-border text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[9px] opacity-75">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Full Name (Sign Up Only) */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black placeholder-neutral-400 focus:outline-none focus:border-hinge-black font-medium"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black placeholder-neutral-400 focus:outline-none focus:border-hinge-black font-medium"
              />
            </div>
          </div>

          {/* Password (min 8 characters) */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Password (min. 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black placeholder-neutral-400 focus:outline-none focus:border-hinge-black font-medium"
              />
            </div>
          </div>

          {/* Phone & City (Sign Up Only) */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">City</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Austin, TX"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50"
          >
            <span>{isLoading ? 'Connecting to AWS backend...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </form>
      </div>
    </div>
  );
};
