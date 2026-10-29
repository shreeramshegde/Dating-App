import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HingeLandingPage } from './components/HingeLandingPage';
import { SwipeDeck } from './components/SwipeDeck';
import { MatchCelebrationModal } from './components/MatchCelebrationModal';
import { ChatView } from './components/ChatView';
import { ProfileEditorModal } from './components/ProfileEditorModal';
import { OnboardingModal } from './components/OnboardingModal';
import { FilterModal } from './components/FilterModal';
import { AuthModal } from './components/AuthModal';
import { CURRENT_USER } from './data/mockProfiles';
import { UserProfile, DiscoveryCard, MatchItem, SwipeType } from './types';
import { api } from './services/api';
import { wsService } from './services/websocket';
import { User, CheckCircle2 } from 'lucide-react';

export function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');

  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [discoveryCards, setDiscoveryCards] = useState<DiscoveryCard[]>([]);
  const [activeTab, setActiveTab] = useState<'explore' | 'matches' | 'profile'>('explore');
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  // Modals state
  const [celebrationMatch, setCelebrationMatch] = useState<{
    profile: DiscoveryCard;
    matchId: string | null;
  } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Settings
  const [useMock, setUseMock] = useState<boolean>(api.useMock);

  // Load feed and matches on mount
  useEffect(() => {
    let isMounted = true;
    api.getDiscoveryFeed().then((cards) => {
      if (isMounted) setDiscoveryCards(cards);
    });

    api.getMatches().then((m) => {
      if (isMounted) setMatches(m);
    });

    // Connect WebSocket client
    const token = api.getToken();
    wsService.connect(token);

    // Listen for real-time match notifications
    const unsubNotif = wsService.onMatchNotification((notif) => {
      if (notif.type === 'MATCH' && isMounted) {
        api.getMatches().then(setMatches);
      }
    });

    return () => {
      isMounted = false;
      unsubNotif();
    };
  }, []);

  const handleToggleMock = (enabled: boolean) => {
    api.setMockFallback(enabled);
    setUseMock(enabled);
    api.getDiscoveryFeed().then(setDiscoveryCards);
    api.getMatches().then(setMatches);
  };

  const handleSwipe = async (targetUserId: string, type: SwipeType) => {
    try {
      const response = await api.submitSwipe(targetUserId, type);
      if (response.match && response.matchedProfile) {
        setCelebrationMatch({
          profile: response.matchedProfile,
          matchId: response.matchId,
        });

        // Add to matches
        setMatches((prev) => [
          {
            matchId: response.matchId || `match_${targetUserId}`,
            targetUserId: response.matchedProfile!.userId,
            targetFirstName: response.matchedProfile!.firstName,
            targetPhotoUrl: response.matchedProfile!.photos[0]?.photoUrl || '',
            lastMessage: null,
            lastMessageTime: null,
            unreadCount: 0,
            matchedAt: 'Just now',
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  const handleStartChatFromMatch = (matchId: string) => {
    setCelebrationMatch(null);
    setSelectedMatchId(matchId);
    setActiveTab('matches');
  };

  const handleUnmatch = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
    if (selectedMatchId === matchId) {
      setSelectedMatchId('');
    }
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setCurrentUser(updated);
  };

  // If in Landing Page mode (Lost & Found marketing site):
  if (viewMode === 'landing') {
    return (
      <>
        <HingeLandingPage
          onLaunchApp={() => setViewMode('app')}
          onOpenSignIn={() => setShowAuth(true)}
        />
        {showAuth && (
          <AuthModal
            onSuccess={async (authData) => {
              setShowAuth(false);
              const myProfile = await api.getMyProfile();
              setCurrentUser(myProfile);
              if (!authData.profileCompleted) {
                setShowOnboarding(true);
              }
              setViewMode('app');
            }}
            onClose={() => setShowAuth(false)}
          />
        )}
      </>
    );
  }

  // Live Web App view:
  return (
    <div className="min-h-screen bg-hinge-cream text-hinge-black flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        matchesCount={matches.length}
        unreadCount={matches.reduce((acc, m) => acc + m.unreadCount, 0)}
        onOpenFilters={() => setShowFilters(true)}
        useMock={useMock}
        onToggleMock={handleToggleMock}
        onGoToLanding={() => setViewMode('landing')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center">
        {/* TAB 1: EXPLORE DECK */}
        {activeTab === 'explore' && (
          <div className="w-full pt-4">
            <SwipeDeck
              cards={discoveryCards}
              onSwipe={handleSwipe}
              onResetDeck={() => api.getDiscoveryFeed().then(setDiscoveryCards)}
            />
          </div>
        )}

        {/* TAB 2: MATCHES & CHAT */}
        {activeTab === 'matches' && (
          <div className="w-full">
            <ChatView
              matches={matches}
              currentUser={currentUser}
              selectedMatchId={selectedMatchId}
              onSelectMatch={setSelectedMatchId}
              onUnmatch={handleUnmatch}
            />
          </div>
        )}

        {/* TAB 3: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="w-full max-w-lg mx-auto space-y-6 animate-in fade-in duration-200 pb-12 text-left">
            {/* User Profile Header Card */}
            <div className="bg-white rounded-[32px] p-7 border border-hinge-border shadow-subtle relative overflow-hidden">
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-hinge-border shadow-sm bg-neutral-100">
                  <img
                    src={currentUser.photos[0]?.photoUrl}
                    alt={currentUser.firstName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-serif font-bold text-hinge-black">
                      {currentUser.firstName}, {currentUser.age}
                    </h2>
                    <CheckCircle2 className="w-5 h-5 text-sky-500" />
                  </div>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">{currentUser.city}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-hinge-stone text-neutral-800 border border-hinge-border">
                    Interested in {currentUser.genderPreference.toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="mt-5 text-sm text-neutral-700 leading-relaxed italic border-t border-hinge-border pt-4 font-serif">
                "{currentUser.bio}"
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowProfileEditor(true)}
                  className="flex-1 py-3 px-5 rounded-full text-xs font-bold bg-hinge-black hover:bg-neutral-800 text-white shadow-sm flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" /> Edit Profile & Photos
                </button>
                <button
                  onClick={() => setShowAuth(true)}
                  className="py-3 px-5 rounded-full text-xs font-semibold bg-white hover:bg-neutral-50 text-neutral-700 border border-hinge-border"
                >
                  Switch Account
                </button>
              </div>
            </div>

            {/* Photos Preview */}
            <div className="bg-white rounded-[32px] p-7 border border-hinge-border shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Your Photo Gallery ({currentUser.photos.length}/6)
                </h3>
                <button
                  onClick={() => setShowProfileEditor(true)}
                  className="text-xs font-bold text-hinge-black hover:underline"
                >
                  Manage
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {currentUser.photos.map((p) => (
                  <div key={p.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-hinge-border bg-neutral-100">
                    <img src={p.photoUrl} alt="Gallery" className="w-full h-full object-cover" />
                    {p.isPrimary && (
                      <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-2 py-0.5 rounded-full text-white font-bold">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-hinge-border text-center shadow-subtle">
                <span className="block text-3xl font-serif font-bold text-hinge-black">{matches.length}</span>
                <span className="text-xs text-neutral-500 mt-1 font-semibold">Active Matches</span>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-hinge-border text-center shadow-subtle">
                <span className="block text-3xl font-serif font-bold text-emerald-700">100%</span>
                <span className="text-xs text-neutral-500 mt-1 font-semibold">Profile Completed</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Celebration Modal: It's a match! */}
      {celebrationMatch && (
        <MatchCelebrationModal
          matchedProfile={celebrationMatch.profile}
          currentUser={currentUser}
          matchId={celebrationMatch.matchId}
          onStartChat={handleStartChatFromMatch}
          onClose={() => setCelebrationMatch(null)}
        />
      )}

      {/* Edit Profile Modal */}
      {showProfileEditor && (
        <ProfileEditorModal
          currentUser={currentUser}
          onClose={() => setShowProfileEditor(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Preferences / Filter Modal */}
      {showFilters && (
        <FilterModal
          maxDistanceKm={currentUser.maxDistanceKm}
          minAgePref={currentUser.minAgePref}
          maxAgePref={currentUser.maxAgePref}
          genderPreference={currentUser.genderPreference}
          onClose={() => setShowFilters(false)}
          onApply={(updatedFilters) => {
            setCurrentUser((prev) => ({
              ...prev,
              ...updatedFilters,
            }));
            api.updateMyProfile({
              firstName: currentUser.firstName,
              birthDate: currentUser.birthDate || '1998-05-14',
              gender: currentUser.gender,
              genderPreference: updatedFilters.genderPreference,
              bio: currentUser.bio,
              city: currentUser.city,
              maxDistanceKm: updatedFilters.maxDistanceKm,
              minAgePref: updatedFilters.minAgePref,
              maxAgePref: updatedFilters.maxAgePref,
            });
          }}
        />
      )}

      {/* Onboarding Modal for incomplete profile */}
      {showOnboarding && (
        <OnboardingModal
          currentUser={currentUser}
          onCompleted={(completedUser) => {
            setCurrentUser(completedUser);
            setShowOnboarding(false);
          }}
        />
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onSuccess={async (authData) => {
            setShowAuth(false);
            const myProfile = await api.getMyProfile();
            setCurrentUser(myProfile);
            if (!authData.profileCompleted) {
              setShowOnboarding(true);
            }
            setViewMode('app');
          }}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}

export default App;
