import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MessageCircle, Sparkles, X, PawPrint } from 'lucide-react';
import { PetResponse, UserProfile } from '../types';

interface MatchCelebrationModalProps {
  pet: PetResponse;
  currentUser: UserProfile;
  onStartChat: () => void;
  onClose: () => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  pet,
  currentUser,
  onStartChat,
  onClose,
}) => {
  useEffect(() => {
    // Confetti blast
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  const petPhotoUrl = pet.photos[0]?.photoUrl || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80';
  const userPhotoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[36px] bg-white border border-amber-300 p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mutual Spark Avatars */}
        <div className="relative pt-4 flex items-center justify-center">
          {/* User Avatar */}
          <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl translate-x-3 -rotate-6">
            <img
              src={userPhotoUrl}
              alt={currentUser.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Spark Center Icon */}
          <div className="absolute z-30 w-12 h-12 rounded-full bg-amber-400 text-neutral-900 border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
            <PawPrint className="w-6 h-6 fill-neutral-900" />
          </div>

          {/* Pet Avatar */}
          <div className="relative z-20 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl -translate-x-3 rotate-6">
            <img
              src={petPhotoUrl}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Text Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Adoption Inquiry Connected</span>
          </div>

          <h2 className="font-serif text-3xl font-bold tracking-tight text-hinge-black">
            It's a Match with {pet.name}!
          </h2>

          <p className="text-xs text-neutral-600 max-w-xs mx-auto leading-relaxed">
            <strong>{pet.ownerName}</strong> has been notified of your adoption interest. Reach out now to introduce yourself and schedule a visit!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onStartChat}
            className="w-full py-3.5 rounded-full font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-xl shadow-neutral-900/15 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-amber-400" />
            <span>Message {pet.ownerName}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-full font-semibold text-xs text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            Keep Browsing Pets
          </button>
        </div>
      </div>
    </div>
  );
};
