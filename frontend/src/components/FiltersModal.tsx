import React, { useState } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { Species, ListingType } from '../types';

interface FiltersModalProps {
  currentSpecies?: Species;
  currentListingType?: ListingType;
  currentDistance: number;
  onApply: (species?: Species, listingType?: ListingType, distance?: number) => void;
  onClose: () => void;
}

const SPECIES_OPTIONS: Array<{ value: Species | 'ALL'; label: string; icon: string }> = [
  { value: 'ALL', label: 'All Animals', icon: '🐾' },
  { value: 'DOG', label: 'Dogs & Puppies', icon: '🐕' },
  { value: 'CAT', label: 'Cats & Kittens', icon: '🐈' },
  { value: 'SMALL_ANIMAL', label: 'Bunnies & Small Pets', icon: '🐇' },
  { value: 'BIRD', label: 'Birds', icon: '🦜' },
  { value: 'REPTILE', label: 'Reptiles', icon: '🦎' },
  { value: 'OTHER', label: 'Other Rescues', icon: '🦔' },
];

export const FiltersModal: React.FC<FiltersModalProps> = ({
  currentSpecies,
  currentListingType,
  currentDistance,
  onApply,
  onClose,
}) => {
  const [selectedSpecies, setSelectedSpecies] = useState<Species | 'ALL'>(currentSpecies || 'ALL');
  const [selectedListingType, setSelectedListingType] = useState<ListingType | 'ALL'>(currentListingType || 'ALL');
  const [distance, setDistance] = useState<number>(currentDistance || 50);

  const handleApply = () => {
    onApply(
      selectedSpecies === 'ALL' ? undefined : selectedSpecies,
      selectedListingType === 'ALL' ? undefined : selectedListingType,
      distance
    );
    onClose();
  };

  const handleReset = () => {
    setSelectedSpecies('ALL');
    setSelectedListingType('ALL');
    setDistance(50);
    onApply(undefined, undefined, 50);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[36px] bg-white border border-hinge-border p-7 sm:p-8 shadow-2xl space-y-6 text-left animate-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-3 border-b border-hinge-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-hinge-black" />
            <h2 className="font-serif font-bold text-2xl text-hinge-black">
              Adoption Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Species Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
            Filter by Species
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SPECIES_OPTIONS.map((opt) => {
              const isSelected = selectedSpecies === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedSpecies(opt.value)}
                  className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-hinge-black text-white border-hinge-black shadow-sm'
                      : 'bg-hinge-cream/40 border-hinge-border text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Listing Type Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
            Listing Intent
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 'ALL', label: 'All Listings' },
              { val: 'ADOPTION', label: 'Forever Home' },
              { val: 'FOSTER', label: 'Foster Care' },
            ].map((t) => (
              <button
                key={t.val}
                type="button"
                onClick={() => setSelectedListingType(t.val as any)}
                className={`py-2 px-3 rounded-2xl border text-xs font-semibold text-center transition-all ${
                  selectedListingType === t.val
                    ? 'bg-hinge-black text-white border-hinge-black shadow-sm'
                    : 'bg-hinge-cream/40 border-hinge-border text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Distance Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Maximum Distance
            </label>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {distance} km
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="150"
            step="5"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full accent-hinge-black cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-400">
            <span>5 km (Local)</span>
            <span>150 km (Regional)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="py-3 px-5 rounded-full text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 px-5 rounded-full text-xs font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
