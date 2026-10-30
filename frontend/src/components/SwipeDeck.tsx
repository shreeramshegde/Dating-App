import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  Heart, 
  X, 
  MapPin, 
  Sparkles, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Info,
  Clock,
  Home
} from 'lucide-react';
import { PetResponse, SwipeType } from '../types';

interface SwipeDeckProps {
  pets: PetResponse[];
  onSwipe: (petId: string, type: SwipeType) => void;
  onResetDeck: () => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  pets,
  onSwipe,
  onResetDeck,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showFullDetails, setShowFullDetails] = useState(false);

  const activePet = pets[currentIndex];
  const nextPet = pets[currentIndex + 1];

  // Motion physics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-15, 15]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -40], [1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 110) {
      triggerSwipe('LIKE');
    } else if (info.offset.x < -110) {
      triggerSwipe('PASS');
    }
  };

  const triggerSwipe = (type: SwipeType) => {
    if (!activePet) return;
    onSwipe(activePet.id, type);
    setCurrentIndex((prev) => prev + 1);
    setActivePhotoIdx(0);
    setShowFullDetails(false);
    x.set(0);
  };

  const nextPhoto = (e: React.MouseEvent, photosLen: number) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev + 1) % photosLen);
  };

  const prevPhoto = (e: React.MouseEvent, photosLen: number) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev - 1 + photosLen) % photosLen);
  };

  const formatAge = (months: number) => {
    if (!months || months <= 0) return 'Young';
    if (months < 12) return `${months} mo`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years}y ${rem}m` : `${years} yr`;
  };

  if (!activePet) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200">
          <Sparkles className="w-8 h-8 animate-pulse text-amber-600" />
        </div>
        <h3 className="font-serif font-bold text-3xl text-hinge-black">
          You've seen all pets nearby!
        </h3>
        <p className="text-sm text-neutral-600 leading-relaxed font-normal">
          No more adoptable pets matching your current filters. Expand your distance or species filters to discover more companions.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            onResetDeck();
          }}
          className="px-6 py-3 rounded-full bg-hinge-black text-white text-xs font-bold flex items-center gap-2 shadow-md hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Revisit Adoption Deck</span>
        </button>
      </div>
    );
  }

  const photos = activePet.photos && activePet.photos.length > 0
    ? activePet.photos
    : [{ id: 'placeholder', photoUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80', displayOrder: 0, isPrimary: true }];

  return (
    <div className="relative w-full max-w-sm mx-auto h-[620px] flex items-center justify-center select-none">
      {/* Background / Next Pet Card Preview */}
      {nextPet && (
        <div className="absolute inset-0 rounded-[36px] bg-white border border-hinge-border overflow-hidden scale-95 translate-y-4 opacity-50 shadow-subtle pointer-events-none">
          <img
            src={nextPet.photos[0]?.photoUrl}
            alt={nextPet.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Foreground Active Draggable Card */}
      <motion.div
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 rounded-[36px] bg-white border border-hinge-border overflow-hidden shadow-hinge cursor-grab active:cursor-grabbing flex flex-col"
      >
        {/* Dynamic Stamp Overlays */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-6 left-6 z-30 px-5 py-1.5 border-4 border-emerald-600 text-emerald-600 rounded-2xl font-black text-2xl tracking-wider rotate-[-15deg] pointer-events-none bg-white/70 backdrop-blur-xs shadow-lg uppercase"
        >
          ADOPT 🐾
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-6 right-6 z-30 px-5 py-1.5 border-4 border-rose-600 text-rose-600 rounded-2xl font-black text-2xl tracking-wider rotate-[15deg] pointer-events-none bg-white/70 backdrop-blur-xs shadow-lg uppercase"
        >
          PASS ❌
        </motion.div>

        {/* Top Image Showcase */}
        <div className="relative flex-1 bg-neutral-900 overflow-hidden">
          <img
            src={photos[activePhotoIdx]?.photoUrl}
            alt={activePet.name}
            className="w-full h-full object-cover"
          />

          {/* Photo Dots Carousel Indicator */}
          {photos.length > 1 && (
            <div className="absolute top-3 inset-x-0 flex items-center justify-center gap-1.5 z-20">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activePhotoIdx ? 'w-6 bg-white shadow-md' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Photo Left/Right Click Navigators */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => prevPhoto(e, photos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-xs hover:bg-black/60 transition-colors z-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => nextPhoto(e, photos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-xs hover:bg-black/60 transition-colors z-20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Top Badges (Listing Type & Urgency) */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md">
              {activePet.listingType === 'FOSTER' ? 'Foster Needed' : 'For Adoption'}
            </span>

            {activePet.urgency === 'HIGH' && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                Urgent Home
              </span>
            )}
          </div>

          {/* Gradient Overlay for bottom text */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-10" />

          {/* Core Pet Identity in Photo Gradient */}
          <div className="absolute bottom-4 left-4 right-4 z-20 text-white space-y-1 text-left">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="font-serif text-3xl font-bold tracking-tight">
                  {activePet.name}
                </h2>
                <span className="text-base text-neutral-300 font-medium">
                  • {formatAge(activePet.ageMonths)}
                </span>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/20 backdrop-blur-md">
                {activePet.species}
              </span>
            </div>

            <p className="text-xs text-neutral-200 font-medium truncate">
              {activePet.breed} • {activePet.gender} • {activePet.size}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-amber-300 pt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{activePet.city} ({activePet.distanceKm ? `${activePet.distanceKm} km away` : 'Nearby'})</span>
            </div>
          </div>
        </div>

        {/* Card Lower Section: Details & Description */}
        <div className="p-4 bg-white space-y-3 text-left">
          {/* Health & Shelter Badges */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold truncate max-w-[210px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{activePet.healthStatus}</span>
            </div>

            <button
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="text-neutral-500 hover:text-black flex items-center gap-1 text-[11px] font-semibold"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showFullDetails ? 'Less' : 'More'}</span>
            </button>
          </div>

          {/* Description Snippet or Expanded */}
          <p className={`text-xs text-neutral-700 leading-relaxed font-sans ${showFullDetails ? '' : 'line-clamp-2'}`}>
            "{activePet.description}"
          </p>

          {showFullDetails && (
            <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-600 space-y-1">
              <div className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-amber-700" />
                <span>Guardian: <strong>{activePet.ownerName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Status: <strong className="text-emerald-700">{activePet.status}</strong></span>
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-center gap-6">
            {/* Pass Button */}
            <button
              onClick={() => triggerSwipe('PASS')}
              title="Pass"
              className="w-13 h-13 rounded-full bg-white hover:bg-neutral-50 text-neutral-400 hover:text-rose-600 border border-neutral-200 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Adopt / Like Button */}
            <button
              onClick={() => triggerSwipe('LIKE')}
              title="Adopt / Send Inquiry"
              className="w-16 h-16 rounded-full bg-hinge-black hover:bg-neutral-800 text-white shadow-xl shadow-neutral-900/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
              <Heart className="w-7 h-7 text-amber-400 fill-amber-400" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
