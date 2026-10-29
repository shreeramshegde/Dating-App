import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, X, MapPin, Sparkles, RotateCcw } from 'lucide-react';
import { DiscoveryCard, SwipeType } from '../types';

interface SwipeDeckProps {
  cards: DiscoveryCard[];
  onSwipe: (targetUserId: string, type: SwipeType) => void;
  onResetDeck: () => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  cards,
  onSwipe,
  onResetDeck,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeCard = cards[currentIndex] || null;
  const nextCard = cards[currentIndex + 1] || null;

  // Motion values for smooth drag physics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0.85, 1, 0.85]);

  // Dynamic stamp opacity
  const likeOpacity = useTransform(x, [40, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-40, -120], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      triggerSwipe('LIKE');
    } else if (info.offset.x < -threshold) {
      triggerSwipe('PASS');
    }
  };

  const triggerSwipe = (type: SwipeType) => {
    if (!activeCard) return;
    onSwipe(activeCard.userId, type);
    setCurrentIndex((prev) => prev + 1);
    x.set(0);
  };

  if (!activeCard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-hinge-stone flex items-center justify-center text-hinge-black border border-hinge-border">
          <Sparkles className="w-8 h-8 text-amber-600 animate-pulse" />
        </div>
        <h3 className="font-serif font-bold text-3xl text-hinge-black">
          You're all caught up!
        </h3>
        <p className="text-sm text-neutral-600 leading-relaxed font-normal">
          No more profiles nearby matching your preferences. Expand your distance or age filters to see more people.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            onResetDeck();
          }}
          className="px-6 py-3 rounded-full bg-hinge-black text-white text-xs font-bold flex items-center gap-2 shadow-md hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Revisit Deck</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[580px] flex items-center justify-center select-none">
      {/* Background / Next Card Preview */}
      {nextCard && (
        <div className="absolute w-full h-[520px] rounded-[36px] overflow-hidden bg-white border border-hinge-border shadow-subtle scale-95 opacity-60 pointer-events-none transform translate-y-4">
          <img
            src={nextCard.photos[0]?.photoUrl}
            alt={nextCard.firstName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Active Foreground Card with Framer Motion Drag */}
      <AnimatePresence>
        <motion.div
          key={activeCard.userId}
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="absolute w-full h-[520px] rounded-[36px] overflow-hidden bg-white border border-hinge-border shadow-2xl cursor-grab active:cursor-grabbing z-20"
        >
          {/* Photos */}
          <div className="relative w-full h-full">
            <img
              src={activeCard.photos[0]?.photoUrl}
              alt={activeCard.firstName}
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

            {/* LIKE Stamp on Drag Right */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 font-black text-3xl uppercase tracking-widest px-4 py-1.5 rounded-2xl rotate-[-15deg] pointer-events-none shadow-lg bg-black/30 backdrop-blur-sm"
            >
              LIKE
            </motion.div>

            {/* NOPE Stamp on Drag Left */}
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 font-black text-3xl uppercase tracking-widest px-4 py-1.5 rounded-2xl rotate-[15deg] pointer-events-none shadow-lg bg-black/30 backdrop-blur-sm"
            >
              NOPE
            </motion.div>

            {/* Card Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6 text-white text-left pointer-events-none">
              <div className="flex items-baseline gap-2">
                <h2 className="font-serif text-3xl font-bold">{activeCard.firstName}</h2>
                <span className="text-2xl font-light text-neutral-300">{activeCard.age}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium mt-1">
                <MapPin className="w-3.5 h-3.5 text-hinge-terracotta" />
                <span>{activeCard.city}</span>
                {activeCard.distanceKm !== null && (
                  <span>• {activeCard.distanceKm.toFixed(1)} km away</span>
                )}
              </div>

              <p className="mt-3 text-xs text-neutral-200 line-clamp-3 leading-relaxed font-normal bg-black/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                {activeCard.bio}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30">
        <button
          onClick={() => triggerSwipe('PASS')}
          title="Pass (Swipe Left)"
          className="w-14 h-14 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black border border-hinge-border flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all group"
        >
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
        </button>

        <button
          onClick={() => triggerSwipe('LIKE')}
          title="Like (Swipe Right)"
          className="w-16 h-16 rounded-full bg-hinge-black hover:bg-neutral-800 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all group"
        >
          <Heart className="w-7 h-7 fill-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};
