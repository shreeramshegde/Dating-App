import { useState, useEffect, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { SwipeDeck } from './components/SwipeDeck';
import { RescueAlertsView } from './components/RescueAlertsView';
import { MyPetsView } from './components/MyPetsView';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { MatchCelebrationModal } from './components/MatchCelebrationModal';
import { FiltersModal } from './components/FiltersModal';
import { AuthModal } from './components/AuthModal';
import { ReportRescueModal } from './components/ReportRescueModal';
import { CreatePetModal } from './components/CreatePetModal';
import { UserProfile, PetResponse, MatchItem, SwipeType, Species, ListingType, AuthResponse } from './types';
import { api } from './services/api';
import { wsService } from './services/websocket';

export function App() {
  // Authentication State
  const [token, setToken] = useState<string | null>(() => api.getToken());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('explore');

  // Real Backend Data State
  const [discoveryPets, setDiscoveryPets] = useState<PetResponse[]>([]);
  const [rescueAlerts, setRescueAlerts] = useState<PetResponse[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [myPets, setMyPets] = useState<PetResponse[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  // Modals state
  const [celebrationPet, setCelebrationPet] = useState<{
    pet: PetResponse;
    matchId: string | null;
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showReportRescue, setShowReportRescue] = useState(false);
  const [showCreatePet, setShowCreatePet] = useState(false);

  // Filters State
  const [filterSpecies, setFilterSpecies] = useState<Species | undefined>();
  const [filterListingType, setFilterListingType] = useState<ListingType | undefined>();
  const [filterDistance, setFilterDistance] = useState<number>(50);

  // Fetch all backend data for authenticated user
  const loadBackendData = useCallback((user: UserProfile) => {
    // 1. Fetch Discovery Pets
    api.getDiscoveryPets(filterSpecies, filterListingType, user.latitude, user.longitude, filterDistance)
      .then(setDiscoveryPets);

    // 2. Fetch Nearby Emergency Rescue Alerts
    api.getNearbyRescueAlerts(filterSpecies, user.latitude, user.longitude, filterDistance)
      .then(setRescueAlerts);

    // 3. Fetch Matches & Inquiries
    api.getMatches().then(setMatches);

    // 4. Fetch My Listed Pets
    api.getMyPets().then(setMyPets);
  }, [filterSpecies, filterListingType, filterDistance]);

  // Authenticate and load profile on mount or token change
  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      setIsLoadingUser(false);
      wsService.disconnect();
      return;
    }

    setIsLoadingUser(true);
    api.getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
        loadBackendData(user);
        // Connect real-time STOMP WebSocket
        wsService.connect(token);
      })
      .catch((err) => {
        console.warn('[App] Could not fetch current user from backend, clearing token:', err);
        api.setToken(null);
        setToken(null);
        setCurrentUser(null);
        wsService.disconnect();
      })
      .finally(() => {
        setIsLoadingUser(false);
      });
  }, [token, loadBackendData]);

  // Real-time STOMP notification listener
  useEffect(() => {
    if (!token) return;

    const unsubNotif = wsService.onMatchNotification((notif) => {
      console.log('[WebSocket] Real-time notification received:', notif);
      api.getMatches().then(setMatches);
    });

    return () => {
      unsubNotif();
    };
  }, [token]);

  // Handle successful login or register
  const handleAuthSuccess = (auth: AuthResponse) => {
    api.setToken(auth.token);
    setToken(auth.token);
  };

  // Sign out
  const handleSignOut = () => {
    api.setToken(null);
    setToken(null);
    setCurrentUser(null);
    wsService.disconnect();
  };

  // Apply filters
  const handleApplyFilters = (species?: Species, listingType?: ListingType, distance?: number) => {
    setFilterSpecies(species);
    setFilterListingType(listingType);
    if (distance) setFilterDistance(distance);

    if (currentUser) {
      api.getDiscoveryPets(species, listingType, currentUser.latitude, currentUser.longitude, distance || 50)
        .then(setDiscoveryPets);

      api.getNearbyRescueAlerts(species, currentUser.latitude, currentUser.longitude, distance || 50)
        .then(setRescueAlerts);
    }
  };

  // Swiping Handler
  const handleSwipe = async (petId: string, type: SwipeType) => {
    try {
      const response = await api.submitSwipe(petId, type);
      if (response.match && response.matchedPet) {
        setCelebrationPet({
          pet: response.matchedPet,
          matchId: response.matchId,
        });

        // Refresh matches
        api.getMatches().then(setMatches);
      }
    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  // Claim Rescue Alert Handler
  const handleClaimRescue = async (alertId: string) => {
    try {
      const res = await api.respondToRescueAlert(alertId);
      const updatedMatches = await api.getMatches();
      setMatches(updatedMatches);
      setSelectedMatchId(res.matchId);
      setActiveTab('matches');
    } catch (err) {
      console.error('Claim rescue error:', err);
    }
  };

  const handleStartChatFromCelebration = () => {
    if (celebrationPet) {
      const mId = celebrationPet.matchId || `match_${celebrationPet.pet.id}`;
      setSelectedMatchId(mId);
      setCelebrationPet(null);
      setActiveTab('matches');
    }
  };

  const handleCloseConversation = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
    if (selectedMatchId === matchId) {
      setSelectedMatchId('');
    }
  };

  const handleDeletePet = async (petId: string) => {
    await api.deletePet(petId);
    setMyPets((prev) => prev.filter((p) => p.id !== petId));
  };

  // Loading Screen
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-hinge-cream flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        <p className="mt-4 font-serif text-lg text-neutral-800">
          Connecting to MeaowMatch backend...
        </p>
      </div>
    );
  }

  // If not logged in, render the pure Authentication view
  if (!token || !currentUser) {
    return <AuthModal onSuccess={handleAuthSuccess} />;
  }

  const criticalAlertsCount = rescueAlerts.filter((a) => a.urgency === 'CRITICAL').length;

  // Authenticated Application
  return (
    <div className="min-h-screen bg-hinge-cream text-hinge-black flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        matchesCount={matches.length}
        unreadCount={matches.reduce((acc, m) => acc + m.unreadCount, 0)}
        criticalAlertsCount={criticalAlertsCount}
        userRole={currentUser.role}
        userName={currentUser.fullName}
        onOpenFilters={() => setShowFilters(true)}
        onOpenReportRescue={() => setShowReportRescue(true)}
        onOpenCreatePet={() => setShowCreatePet(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex flex-col">
        {/* 1. Pet Adoption Deck View */}
        {activeTab === 'explore' && (
          <div className="flex-1 flex flex-col justify-center py-4">
            <SwipeDeck
              pets={discoveryPets}
              onSwipe={handleSwipe}
              onResetDeck={() => {
                if (currentUser) {
                  api.getDiscoveryPets(filterSpecies, filterListingType, currentUser.latitude, currentUser.longitude, filterDistance)
                    .then(setDiscoveryPets);
                }
              }}
              onOpenCreatePet={() => setShowCreatePet(true)}
            />
          </div>
        )}

        {/* 2. Emergency Rescue Radar View */}
        {activeTab === 'rescue' && (
          <RescueAlertsView
            alerts={rescueAlerts}
            onClaimRescue={handleClaimRescue}
            onOpenReportModal={() => setShowReportRescue(true)}
          />
        )}

        {/* 3. Messages & Inquiries View */}
        {activeTab === 'matches' && (
          <ChatView
            matches={matches}
            currentUser={currentUser}
            selectedMatchId={selectedMatchId}
            onSelectMatch={setSelectedMatchId}
            onUnmatch={handleCloseConversation}
          />
        )}

        {/* 4. Shelter & Rehomer My Pets View */}
        {activeTab === 'my-pets' && (
          <MyPetsView
            myPets={myPets}
            onOpenCreatePet={() => setShowCreatePet(true)}
            onDeletePet={handleDeletePet}
          />
        )}

        {/* 5. User Profile View */}
        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            matchesCount={matches.length}
            myPetsCount={myPets.length}
            onUpdateUser={setCurrentUser}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Celebration Modal: Adoption Match! */}
      {celebrationPet && (
        <MatchCelebrationModal
          pet={celebrationPet.pet}
          currentUser={currentUser}
          onStartChat={handleStartChatFromCelebration}
          onClose={() => setCelebrationPet(null)}
        />
      )}

      {/* Preferences / Filter Modal */}
      {showFilters && (
        <FiltersModal
          currentSpecies={filterSpecies}
          currentListingType={filterListingType}
          currentDistance={filterDistance}
          onApply={handleApplyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Emergency Report Animal Modal */}
      {showReportRescue && (
        <ReportRescueModal
          onClose={() => setShowReportRescue(false)}
          onSuccess={() => {
            setShowReportRescue(false);
            if (currentUser) {
              api.getNearbyRescueAlerts(filterSpecies, currentUser.latitude, currentUser.longitude, filterDistance)
                .then(setRescueAlerts);
            }
            setActiveTab('rescue');
          }}
        />
      )}

      {/* Post Pet for Adoption Modal */}
      {showCreatePet && (
        <CreatePetModal
          onClose={() => setShowCreatePet(false)}
          onSuccess={() => {
            setShowCreatePet(false);
            api.getMyPets().then(setMyPets);
            if (currentUser) {
              api.getDiscoveryPets(filterSpecies, filterListingType, currentUser.latitude, currentUser.longitude, filterDistance)
                .then(setDiscoveryPets);
            }
            setActiveTab('my-pets');
          }}
        />
      )}
    </div>
  );
}
export default App;
