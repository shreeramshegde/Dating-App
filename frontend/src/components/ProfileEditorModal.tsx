import React, { useState } from 'react';
import { X, Save, Trash2, Camera, Check } from 'lucide-react';
import { UserProfile, Gender, GenderPreference } from '../types';
import { api } from '../services/api';

interface ProfileEditorModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  currentUser,
  onClose,
  onSave,
}) => {
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [birthDate, setBirthDate] = useState(currentUser.birthDate || '1998-05-14');
  const [gender, setGender] = useState<Gender>(currentUser.gender);
  const [genderPreference, setGenderPreference] = useState<GenderPreference>(currentUser.genderPreference);
  const [bio, setBio] = useState(currentUser.bio);
  const [city, setCity] = useState(currentUser.city);
  const [photos, setPhotos] = useState(currentUser.photos);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);

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
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async (id: string) => {
    await api.deletePhoto(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await api.updateMyProfile({
      firstName,
      birthDate,
      gender,
      genderPreference,
      bio,
      city,
      latitude: currentUser.latitude || 37.7749,
      longitude: currentUser.longitude || -122.4194,
      maxDistanceKm: currentUser.maxDistanceKm,
      minAgePref: currentUser.minAgePref,
      maxAgePref: currentUser.maxAgePref,
    });

    onSave({
      ...updated,
      photos,
    });
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl my-8 rounded-[36px] bg-white border border-hinge-border p-7 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-left"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hinge-border">
          <div>
            <h2 className="font-serif font-bold text-2xl text-hinge-black">Edit Your Profile</h2>
            <p className="text-xs text-neutral-500">Update your details and photo gallery</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos manager */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Photos ({photos.length}/6)
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
                  <img src={p.photoUrl} alt="Profile photo" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(p.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove photo"
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

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-hinge-black text-sm focus:border-hinge-black focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Birth Date</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-hinge-black text-sm focus:border-hinge-black focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-hinge-black text-sm focus:border-hinge-black focus:outline-none font-semibold"
              >
                <option value="MALE">Man</option>
                <option value="FEMALE">Woman</option>
                <option value="OTHER">Non-binary / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Interested In</label>
              <select
                value={genderPreference}
                onChange={(e) => setGenderPreference(e.target.value as GenderPreference)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-hinge-black text-sm focus:border-hinge-black focus:outline-none font-semibold"
              >
                <option value="EVERYONE">Everyone</option>
                <option value="FEMALE">Women</option>
                <option value="MALE">Men</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-hinge-black text-sm focus:border-hinge-black focus:outline-none font-medium"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">About Me (Bio)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-hinge-black text-sm focus:border-hinge-black focus:outline-none resize-none font-medium"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-hinge-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-neutral-600 hover:text-black"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-hinge-black hover:bg-neutral-800 flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              {isSavedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSavedNotice ? 'Saved!' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
