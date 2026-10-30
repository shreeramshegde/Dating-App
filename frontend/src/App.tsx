import { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { MeaowMatchLandingPage } from './components/MeaowMatchLandingPage';
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
import { CURRENT_USER } from './data/mockPets';
import { UserProfile, PetResponse, MatchItem, SwipeType, Species, ListingType } from './types';
import { api } from './services/api';
import { wsService } from './services/websocket';

export function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('explore');

  // Core Data State
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
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
  const [showAuth, setShowAuth] = useState(false);
  const [showReportRescue, setShowReportRescue] = useState(false);
  const [showCreatePet, setShowCreatePet] = useState(false);

  // Filters State
  const [filterSpecies, setFilterSpecies] = useState<Species | undefined>();
  const [filterListingType, setFilterListingType] = useState<ListingType | undefined>();
  const [filterDistance, setFilterDistance] = useState<number>(50);

  // Settings
  const [useMock, setUseMock] = useState<boolean>(api.useMock);

  // Initial Load on mount
  useEffect(() => {
    let isMounted = true;

    // Load Discovery Pets
    api.getDiscoveryPets(filterSpecies, filterListingType, currentUser.latitude, currentUser.longitude, filterDistance)
      .then((pets) => {
        if (isMounted) setDiscoveryPets(pets);
      });

    // Load Rescue Alerts
    api.getNearbyRescueAlerts(filterSpecies, currentUser.latitude, currentUser.longitude, filterDistance)
      .then((alerts) => {
        if (isMounted) setRescueAlerts(alerts);
      });

    // Load Matches & Inquiries
    api.getMatches().then((m) => {
      if (isMounted) setMatches(m);
    });

    // Load My Listed Pets
    api.getMyPets().then((pets) => {
      if (isMounted) setMyPets(pets);
    });

    // Listen for real-time STOMP match notifications
    const unsubNotif = wsService.onMatchNotification((notif) => {
      if (isMounted) {
        console.log('[App] Received real-time notification:', notif);
        api.getMatches().then(setMatches);
      }
    });

    return () => {
      isMounted = false;
      unsubNotif();
    };
  }, []);

  // Sync WebSocket connection with authentication status and mock mode
  useEffect(() => {
    const token = api.getToken();
    if (token && !useMock && !token.startsWith('mock_')) {
      wsService.connect(token);
    } else {
      wsService.disconnect();
    }
  }, [currentUser, useMock]);

  const handleToggleMock = (enabled: boolean) => {
    api.setMockFallback(enabled);
    setUseMock(enabled);
    if (enabled) {
      wsService.disconnect();
    } else {
      const token = api.getToken();
      if (token && !token.startsWith('mock_')) {
        wsService.connect(token);
      }
    }
    api.getDiscoveryPets().then(setDiscoveryPets);
    api.getNearbyRescueAlerts().then(setRescueAlerts);
    api.getMatches().then(setMatches);
    api.getMyPets().then(setMyPets);
  };

  const handleApplyFilters = (species?: Species, listingType?: ListingType, distance?: number) => {
    setFilterSpecies(species);
    setFilterListingType(listingType);
    if (distance) setFilterDistance(distance);

    api.getDiscoveryPets(species, listingType, currentUser.latitude, currentUser.longitude, distance || 50)
      .then(setDiscoveryPets);

    api.getNearbyRescueAlerts(species, currentUser.latitude, currentUser.longitude, distance || 50)
      .then(setRescueAlerts);
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

        // Add to active matches list
        setMatches((prev) => [
          {
            matchId: response.matchId || `match_${petId}`,
            matchedUserId: response.matchedPet!.ownerId,
            matchedUserName: response.matchedPet!.ownerName,
            matchedUserRole: 'REHOMER',
            pet: response.matchedPet!,
            matchType: response.matchedPet!.listingType,
            lastMessage: `Adoption inquiry submitted for ${response.matchedPet!.name}`,
            unreadCount: 0,
            matchedAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  // Claim Rescue Alert Handler
  const handleClaimRescue = async (alertId: string) => {
    try {
      const res = await api.respondToRescueAlert(alertId);
      // Reload matches
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

  const handleSignOut = () => {
    api.setToken(null);
    wsService.disconnect();
    setViewMode('landing');
  };

  const criticalAlertsCount = rescueAlerts.filter((a) => a.urgency === 'CRITICAL').length;

  // If in Landing Page mode:
  if (viewMode === 'landing') {
    return (
      <>
        <MeaowMatchLandingPage
          onLaunchApp={() => setViewMode('app')}
          onOpenSignIn={() => setShowAuth(true)}
          onOpenRescue={() => {
            setActiveTab('rescue');
            setViewMode('app');
          }}
        />
        {showAuth && (
          <AuthModal
            onSuccess={async (authData) => {
              setShowAuth(false);
              const myProfile = await api.getCurrentUser();
              setCurrentUser({
                ...myProfile,
                role: authData.role || myProfile.role,
                fullName: authData.fullName || myProfile.fullName,
              });
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
        criticalAlertsCount={criticalAlertsCount}
        userRole={currentUser.role}
        onOpenFilters={() => setShowFilters(true)}
        onOpenReportRescue={() => setShowReportRescue(true)}
        onOpenCreatePet={() => setShowCreatePet(true)}
        useMock={useMock}
        onToggleMock={handleToggleMock}
        onGoToLanding={() => setViewMode('landing')}
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
                api.getDiscoveryPets(filterSpecies, filterListingType, currentUser.latitude, currentUser.longitude, filterDistance)
                  .then(setDiscoveryPets);
              }}
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

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onSuccess={async (authData) => {
            setShowAuth(false);
            const myProfile = await api.getCurrentUser();
            setCurrentUser({
              ...myProfile,
              role: authData.role || myProfile.role,
              fullName: authData.fullName || myProfile.fullName,
            });
          }}
          onClose={() => setShowAuth(false)}
        />
      )}

      {/* Emergency Report Animal Modal */}
      {showReportRescue && (
        <ReportRescueModal
          onClose={() => setShowReportRescue(false)}
          onSuccess={() => {
            setShowReportRescue(false);
            api.getNearbyRescueAlerts(filterSpecies, currentUser.latitude, currentUser.longitude, filterDistance)
              .then(setRescueAlerts);
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
            api.getDiscoveryPets().then(setDiscoveryPets);
            setActiveTab('my-pets');
          }}
        />
      )}
    </div>
  );
}
export default App;
