import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Navigation, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Species, Urgency } from '../types';
import { api } from '../services/api';

interface ReportRescueModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportRescueModal: React.FC<ReportRescueModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [titleOrName, setTitleOrName] = useState('');
  const [species, setSpecies] = useState<Species>('DOG');
  const [urgency, setUrgency] = useState<Urgency>('CRITICAL');
  const [injuryDetails, setInjuryDetails] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Austin, TX');
  const [addressNote, setAddressNote] = useState('');
  const [latitude, setLatitude] = useState<number>(30.2849);
  const [longitude, setLongitude] = useState<number>(-97.7341);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          alert('Could not access GPS. Please check location permissions.');
        }
      );
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setError(null);

    try {
      const publicUrl = await api.uploadPhotoToS3(file);
      setPhotoUrls((prev) => [...prev, publicUrl]);
    } catch {
      setError('Could not upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!injuryDetails.trim()) {
      setError('Please provide details on the animal’s condition or injuries.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.reportRescueAlert({
        titleOrName: titleOrName.trim() || `Urgent ${species} rescue report`,
        species,
        urgency,
        injuryDetails,
        description,
        city,
        addressNote,
        latitude,
        longitude,
        photoUrls: photoUrls.length > 0 ? photoUrls : [
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80'
        ],
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit rescue alert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl my-8 rounded-[36px] bg-white border border-rose-300 p-7 sm:p-9 shadow-2xl space-y-6 text-left animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Emergency Animal Dispatch</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-hinge-black">
              Report Animal in Distress
            </h2>
            <p className="text-xs text-neutral-500">
              Broadcast coordinates and photos to veterinary teams and rescuers within 50 km.
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
          {/* Urgency Pill Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Emergency Urgency Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUrgency('CRITICAL')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  urgency === 'CRITICAL'
                    ? 'bg-rose-700 text-white border-rose-700 shadow-md ring-2 ring-rose-200'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>CRITICAL (Immediate Life Threat)</span>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('HIGH')}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  urgency === 'HIGH'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-200'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span>HIGH (Needs Care Today)</span>
              </button>
            </div>
          </div>

          {/* Species & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Species</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species)}
                className="w-full px-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black font-semibold focus:outline-none"
              >
                <option value="DOG">Dog / Puppy</option>
                <option value="CAT">Cat / Kitten</option>
                <option value="BIRD">Bird / Raptor</option>
                <option value="SMALL_ANIMAL">Small Animal (Bunny, Hamster)</option>
                <option value="REPTILE">Reptile (Turtle, Gecko)</option>
                <option value="OTHER">Other / Farm Animal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Headline or Title</label>
              <input
                type="text"
                placeholder="e.g. Limping puppy near highway"
                value={titleOrName}
                onChange={(e) => setTitleOrName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Condition & Medical Note */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Injuries / Medical Condition *
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Suspected fractured front leg, shivering, unable to walk, bleeding."
              value={injuryDetails}
              onChange={(e) => setInjuryDetails(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black font-medium focus:outline-none"
            />
          </div>

          {/* Description & Situation */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Situation & Landmark Notes
            </label>
            <textarea
              rows={2}
              placeholder="Behind Shell gas station dumpster near highway 183 access road. Has wooden pallet shelter."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black font-medium focus:outline-none"
            />
          </div>

          {/* Location & GPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700">Location & Coordinates</label>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-[11px] text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span>Use Current GPS</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="City, State"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium"
                />
              </div>

              <input
                type="text"
                placeholder="Specific landmark / Street note"
                value={addressNote}
                onChange={(e) => setAddressNote(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs font-medium"
              />
            </div>
          </div>

          {/* Photos Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">
              Attach Photos ({photoUrls.length}/3)
            </label>

            <div className="flex items-center gap-3">
              {photoUrls.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-neutral-200">
                  <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              ))}

              {photoUrls.length < 3 && (
                <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/50 hover:bg-rose-100 flex flex-col items-center justify-center cursor-pointer transition-colors text-rose-700">
                  <Camera className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-1">{isUploading ? '...' : '+ Photo'}</span>
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full py-3.5 rounded-full font-bold text-white bg-rose-700 hover:bg-rose-800 shadow-xl shadow-rose-900/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Broadcasting Alert...' : 'Broadcast Emergency Rescue Alert'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
