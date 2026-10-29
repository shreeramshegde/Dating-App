import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, MessageCircle, Sparkles, X } from 'lucide-react';
import { DiscoveryCard, UserProfile } from '../types';

interface MatchCelebrationModalProps {
  matchedProfile: DiscoveryCard | null;
  currentUser: UserProfile;
  matchId: string | null;
  onStartChat: (matchId: string) => void;
  onClose: () => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  matchedProfile,
  currentUser,
  matchId,
  onStartChat,
  onClose,
}) => {
  useEffect(() => {
    if (matchedProfile) {
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1B3B36', '#A24838', '#EAE4D8', '#121212'],
      });
    }
  }, [matchedProfile]);

  if (!matchedProfile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[36px] bg-white border border-hinge-border p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Floating Sparks Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-hinge-stone text-hinge-dark border border-hinge-border text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-hinge-terracotta" />
          It's a Match!
        </div>

        <h2 className="text-3xl font-serif font-bold text-hinge-black tracking-tight">
          Mutual Spark!
        </h2>
        <p className="text-sm text-neutral-600 -mt-2">
          You and <span className="font-bold text-hinge-black">{matchedProfile.firstName}</span> liked each other.
        </p>

        {/* Dual Avatars with Overlap */}
        <div className="relative flex items-center justify-center py-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl -mr-4 z-10 bg-neutral-200">
            <img
              src={currentUser.photos[0]?.photoUrl}
              alt={currentUser.firstName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-10 h-10 rounded-full bg-hinge-black flex items-center justify-center text-white z-20 shadow-md">
            <Heart className="w-5 h-5 fill-white animate-bounce" />
          </div>

          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl -ml-4 z-10 bg-neutral-200">
            <img
              src={matchedProfile.photos[0]?.photoUrl}
              alt={matchedProfile.firstName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Profile Bio quote snippet */}
        <div className="p-4 rounded-2xl bg-hinge-cream border border-hinge-border text-left text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-500">
            About {matchedProfile.firstName}
          </span>
          <p className="font-serif italic text-xs text-hinge-black font-medium leading-relaxed">
            "{matchedProfile.bio}"
          </p>
        </div>

        {/* Buttons */}
        <div className="pt-2 space-y-3">
          <button
            onClick={() => onStartChat(matchId || `match_${matchedProfile.userId}`)}
            className="w-full py-4 px-6 rounded-full font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Say Hello to {matchedProfile.firstName}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-full text-xs font-semibold text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};
