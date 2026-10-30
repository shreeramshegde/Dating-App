import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Trash2, 
  PawPrint, 
  ShieldCheck, 
  ArrowRight,
  MapPin
} from 'lucide-react';
import { Species, ListingType, Urgency, PetGender, PetSize } from '../types';
import { api } from '../services/api';

interface CreatePetModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePetModal: React.FC<CreatePetModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('CAT');
  const [breed, setBreed] = useState('');
  const [ageMonths, setAgeMonths] = useState<number>(12);
  const [gender, setGender] = useState<PetGender>('FEMALE');
  const [size, setSize] = useState<PetSize>('MEDIUM');
  const [listingType, setListingType] = useState<ListingType>('ADOPTION');
  const [urgency, setUrgency] = useState<Urgency>('NORMAL');
  const [healthStatus, setHealthStatus] = useState('Vaccinated, spayed/neutered, microchipped');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Austin, TX');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setError(null);

    try {
      const publicUrl = await api.uploadPhotoToS3(file);
      setPhotos((prev) => [...prev, publicUrl]);
    } catch {
      setError('Could not upload photo to storage.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Pet name is required');
      return;
    }
    if (photos.length === 0) {
      setError('Please attach at least 1 photo of the pet.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.createPet({
        name: name.trim(),
        species,
        breed: breed.trim() || 'Mixed Breed',
        ageMonths: Number(ageMonths),
        gender,
        size,
        listingType,
        urgency,
        healthStatus,
        description,
        city,
        latitude: 30.2672,
        longitude: -97.7431,
        photoUrls: photos,
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create pet listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl my-8 rounded-[36px] bg-white border border-amber-300 p-7 sm:p-9 shadow-2xl space-y-6 text-left animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
              <PawPrint className="w-3.5 h-3.5" />
              <span>Rehomer & Shelter Portal</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-hinge-black">
              List a Pet for Adoption
            </h2>
            <p className="text-xs text-neutral-500">
              Create an adoption or foster profile visible to thousands of verified animal lovers.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photos Upload Strip (6 Slots) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Pet Photos ({photos.length}/6)
              </label>
              {isUploading && (
                <span className="text-xs text-amber-700 font-semibold animate-pulse">
                  Uploading to S3...
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {photos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 group bg-neutral-100">
                  <img src={url} alt="Pet thumbnail" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[8px] bg-black/70 text-white px-1.5 py-0.2 rounded-full font-bold">
                      Main
                    </span>
                  )}
                </div>
              ))}

              {photos.length < 6 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-100/50 flex flex-col items-center justify-center cursor-pointer transition-colors text-amber-800">
                  <Camera className="w-5 h-5 text-amber-600" />
                  <span className="text-[9px] font-bold mt-1">+ Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Name & Species */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Pet Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Luna"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Species *</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species)}
                className="w-full px-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black font-semibold focus:outline-none"
              >
                <option value="CAT">Cat / Kitten</option>
                <option value="DOG">Dog / Puppy</option>
                <option value="BIRD">Bird (Parrot, Cockatiel)</option>
                <option value="SMALL_ANIMAL">Small Animal (Bunny, Guinea Pig)</option>
                <option value="REPTILE">Reptile (Gecko, Turtle)</option>
                <option value="OTHER">Other / Farm Animal</option>
              </select>
            </div>
          </div>

          {/* Breed & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Breed / Mix</label>
              <input
                type="text"
                placeholder="e.g. Domestic Shorthair"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Age in Months</label>
              <input
                type="number"
                min="1"
                max="240"
                placeholder="14"
                value={ageMonths}
                onChange={(e) => setAgeMonths(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Gender & Size & Listing Type & Urgency */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as PetGender)}
                className="w-full px-3 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium focus:outline-none"
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as PetSize)}
                className="w-full px-3 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium focus:outline-none"
              >
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Type</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value as ListingType)}
                className="w-full px-3 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium focus:outline-none"
              >
                <option value="ADOPTION">Adoption</option>
                <option value="FOSTER">Foster</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as Urgency)}
                className="w-full px-3 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium focus:outline-none"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Urgent</option>
              </select>
            </div>
          </div>

          {/* Health & Medical Status */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Health, Vaccinations & Medical History
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Vaccinated, spayed, negative for FIV/FeLV"
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Personality & Story
            </label>
            <textarea
              rows={3}
              placeholder="Tell adopters about their temperament, favorite toys, good with children/other pets, and what kind of home suits them best."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium focus:outline-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">City / Shelter Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Austin, TX"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full py-3.5 rounded-full font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50"
            >
              <PawPrint className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Publishing Pet Listing...' : 'Publish Pet for Adoption'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
