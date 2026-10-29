import React, { useState } from 'react';
import { Camera, Trash2, ArrowRight, MapPin } from 'lucide-react';
import { UserProfile, Gender, GenderPreference } from '../types';
import { api } from '../services/api';

interface OnboardingModalProps {
  currentUser: UserProfile;
  onCompleted: (updatedProfile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentUser,
  onCompleted,
}) => {
  const [firstName, setFirstName] = useState(currentUser.firstName || '');
  const [birthDate, setBirthDate] = useState(currentUser.birthDate || '2000-01-01');
  const [gender, setGender] = useState<Gender>(currentUser.gender || 'MALE');
  const [genderPreference, setGenderPreference] = useState<GenderPreference>(currentUser.genderPreference || 'EVERYONE');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [city, setCity] = useState(currentUser.city || 'San Francisco');
  const [photos, setPhotos] = useState(currentUser.photos || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setError(null);

    try {
      const isPrimary = photos.length === 0;
      const uploadedUrl = await api.uploadPhoto(file, isPrimary);
      setPhotos((prev) => [
        ...prev,
        {
          id: `photo_${Date.now()}`,
          photoUrl: uploadedUrl,
          displayOrder: prev.length,
          isPrimary,
        },
      ]);
    } catch (err: any) {
      setError('Failed to upload photo to S3 storage.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (photos.length === 0) {
      setError('Please upload at least 1 profile photo');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await api.updateMyProfile({
        firstName,
        birthDate,
        gender,
        genderPreference,
        bio,
        city,
        latitude: 37.7749,
        longitude: -122.4194,
        maxDistanceKm: 50,
        minAgePref: 18,
        maxAgePref: 35,
      });

      onCompleted({
        ...updated,
        photos,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to complete profile onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl my-8 rounded-[36px] bg-white border border-hinge-border p-7 sm:p-9 shadow-2xl space-y-6 text-left animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-2xl tracking-tight text-hinge-black">hinge</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-hinge-stone text-neutral-700">
              Onboarding
            </span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-hinge-black">
            Build your profile
          </h2>
          <p className="text-xs text-neutral-500">
            Tell us about yourself to start matching with great people.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 6-slot Photo Uploader with S3 Presign */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Your Photos ({photos.length}/6)
              </label>
              {isUploading && (
                <span className="text-xs text-hinge-terracotta font-semibold animate-pulse">
                  Uploading to S3...
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {photos.map((p, idx) => (
                <div key={p.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-hinge-border group bg-neutral-100">
                  <img src={p.photoUrl} alt="Upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(p.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-2 py-0.5 rounded-full text-white font-bold">
                    #{idx + 1}
                  </span>
                </div>
              ))}

              {photos.length < 6 && (
                <label className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-hinge-border hover:border-hinge-black flex flex-col items-center justify-center cursor-pointer bg-hinge-cream/50 transition-colors">
                  <Camera className="w-6 h-6 text-neutral-400 mb-1" />
                  <span className="text-[11px] font-bold text-neutral-600">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">First Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-sm text-hinge-black focus:outline-none focus:border-hinge-black font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Birth Date</label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-sm text-hinge-black focus:outline-none focus:border-hinge-black font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">I am a</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-sm text-hinge-black focus:outline-none focus:border-hinge-black font-semibold"
              >
                <option value="MALE">Man</option>
                <option value="FEMALE">Woman</option>
                <option value="OTHER">Non-binary / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Interested in</label>
              <select
                value={genderPreference}
                onChange={(e) => setGenderPreference(e.target.value as GenderPreference)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-sm text-hinge-black focus:outline-none focus:border-hinge-black font-semibold"
              >
                <option value="EVERYONE">Everyone</option>
                <option value="FEMALE">Women</option>
                <option value="MALE">Men</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">City</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-sm text-hinge-black focus:outline-none focus:border-hinge-black font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">About Me (Bio)</label>
            <textarea
              rows={3}
              placeholder="Tell others what excites you, what your weekends look like, or what kind of connection you seek..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-sm text-hinge-black focus:outline-none focus:border-hinge-black resize-none font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full py-4 rounded-full font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Saving Profile...' : 'Complete & Start Swiping'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
