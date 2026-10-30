import React, { useState } from 'react';
import { 
  Mail, 
  MapPin, 
  ShieldCheck, 
  PawPrint, 
  Check, 
  LogOut
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { api } from '../services/api';

interface ProfileViewProps {
  currentUser: UserProfile;
  matchesCount: number;
  myPetsCount: number;
  onUpdateUser: (updated: UserProfile) => void;
  onSignOut: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  matchesCount,
  myPetsCount,
  onUpdateUser,
  onSignOut,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.fullName || 'Animal Lover');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [role, setRole] = useState<UserRole>((currentUser?.role as UserRole) || 'ADOPTER');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateProfile({
        fullName,
        phone,
        city,
        role,
      });
      onUpdateUser(updated);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    ADOPTER: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200' },
    REHOMER: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200' },
    RESCUER: { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200' },
  };

  const activeRole = currentUser?.role || 'ADOPTER';
  const roleStyle = roleColors[activeRole] || roleColors.ADOPTER;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-left">
      {/* Profile Header Card */}
      <div className="bg-white rounded-[32px] p-7 sm:p-9 border border-hinge-border shadow-subtle relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl bg-neutral-900 text-amber-300 flex items-center justify-center font-serif text-3xl font-bold shadow-md shrink-0">
              <PawPrint className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-hinge-black">
                  {currentUser?.fullName || currentUser?.email?.split('@')[0] || 'Animal Lover'}
                </h2>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>

              <p className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser?.email || 'N/A'}</span>
              </p>

              <div className="pt-1 flex items-center gap-2">
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                  {activeRole}
                </span>

                <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  <span>{currentUser?.city || 'Austin, TX'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="py-2.5 px-5 rounded-full text-xs font-bold bg-hinge-black hover:bg-neutral-800 text-white shadow-sm transition-all"
            >
              {isEditing ? 'Cancel' : 'Edit Profile & Role'}
            </button>

            <button
              onClick={onSignOut}
              className="p-2.5 rounded-full border border-hinge-border text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-neutral-100 space-y-4 animate-in fade-in">
            <h4 className="font-serif font-bold text-lg text-hinge-black">Update Details</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Active Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-bold focus:outline-none"
                >
                  <option value="ADOPTER">🐾 ADOPTER (Looking to adopt)</option>
                  <option value="REHOMER">🏡 REHOMER (Shelter / Pet Owner)</option>
                  <option value="RESCUER">🚨 RESCUER (Report & Dispatch)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-6 rounded-full text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Role Descriptions & Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-hinge-border shadow-subtle space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
            🐾
          </div>
          <span className="block text-3xl font-serif font-bold text-hinge-black">{matchesCount}</span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">Active Inquiries</h4>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Conversations connecting adopters with foster guardians and animal shelters.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-hinge-border shadow-subtle space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            🏡
          </div>
          <span className="block text-3xl font-serif font-bold text-hinge-black">{myPetsCount}</span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">Pets Listed</h4>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Active adoption and foster profiles created by your account or shelter.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-hinge-border shadow-subtle space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
            🚨
          </div>
          <span className="block text-3xl font-serif font-bold text-rose-700">24/7</span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">Rescue Dispatch</h4>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Emergency radar broadcasting coordinates to nearby veterinary first responders.
          </p>
        </div>
      </div>
    </div>
  );
};
