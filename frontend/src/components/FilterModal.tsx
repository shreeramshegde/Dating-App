import React, { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { GenderPreference } from '../types';

interface FilterModalProps {
  maxDistanceKm: number;
  minAgePref: number;
  maxAgePref: number;
  genderPreference: GenderPreference;
  onClose: () => void;
  onApply: (filters: {
    maxDistanceKm: number;
    minAgePref: number;
    maxAgePref: number;
    genderPreference: GenderPreference;
  }) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  maxDistanceKm: initialDistance,
  minAgePref: initialMinAge,
  maxAgePref: initialMaxAge,
  genderPreference: initialGenderPref,
  onClose,
  onApply,
}) => {
  const [maxDistanceKm, setMaxDistanceKm] = useState(initialDistance);
  const [minAgePref, setMinAgePref] = useState(initialMinAge);
  const [maxAgePref, setMaxAgePref] = useState(initialMaxAge);
  const [genderPreference, setGenderPreference] = useState<GenderPreference>(initialGenderPref);

  const handleApply = () => {
    onApply({
      maxDistanceKm,
      minAgePref,
      maxAgePref,
      genderPreference,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[32px] bg-white border border-hinge-border p-7 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-left"
      >
        <div className="flex items-center justify-between pb-3 border-b border-hinge-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-hinge-black" />
            <h3 className="font-serif font-bold text-xl text-hinge-black">Dating Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Max Distance */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-neutral-700">Maximum Distance</span>
            <span className="text-hinge-black">{maxDistanceKm} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={maxDistanceKm}
            onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
            className="w-full accent-hinge-black cursor-pointer"
          />
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-neutral-700">Age Range</span>
            <span className="text-hinge-black">{minAgePref} - {maxAgePref}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-neutral-500 font-semibold">Min Age</span>
              <input
                type="number"
                min={18}
                max={maxAgePref}
                value={minAgePref}
                onChange={(e) => setMinAgePref(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black font-semibold"
              />
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-semibold">Max Age</span>
              <input
                type="number"
                min={minAgePref}
                max={70}
                value={maxAgePref}
                onChange={(e) => setMaxAgePref(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Gender Preference */}
        <div className="space-y-2">
          <span className="block text-xs font-bold text-neutral-700">Interested In</span>
          <div className="grid grid-cols-3 gap-2">
            {(['EVERYONE', 'FEMALE', 'MALE'] as GenderPreference[]).map((pref) => (
              <button
                key={pref}
                type="button"
                onClick={() => setGenderPreference(pref)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  genderPreference === pref
                    ? 'bg-hinge-black border-hinge-black text-white'
                    : 'bg-hinge-cream border-hinge-border text-neutral-700 hover:text-black'
                }`}
              >
                {pref === 'EVERYONE' ? 'Everyone' : pref === 'FEMALE' ? 'Women' : 'Men'}
              </button>
            ))}
          </div>
        </div>

        {/* Apply */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-600 hover:text-black"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-md"
          >
            Apply Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
