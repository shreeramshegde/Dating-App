import React from 'react';
import { 
  Sparkles, 
  MessageCircleHeart, 
  User, 
  SlidersHorizontal, 
  AlertTriangle, 
  PawPrint, 
  PlusCircle, 
  LogOut 
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab = 'explore' | 'rescue' | 'matches' | 'my-pets' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  matchesCount: number;
  unreadCount: number;
  criticalAlertsCount: number;
  userRole?: UserRole;
  userName?: string;
  isGuest?: boolean;
  onOpenAuth?: () => void;
  onOpenFilters: () => void;
  onOpenReportRescue: () => void;
  onOpenCreatePet: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  criticalAlertsCount,
  userRole = 'ADOPTER',
  userName,
  isGuest = false,
  onOpenAuth,
  onOpenFilters,
  onOpenReportRescue,
  onOpenCreatePet,
  onSignOut,
}) => {
  return (
    <>
      {/* 1. Main Top Header Bar (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 w-full bg-hinge-cream/95 backdrop-blur-md border-b border-hinge-border overflow-hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-1.5 sm:gap-4 overflow-hidden">
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('explore')} 
            className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
            title="MeaowMatch Pet Adoption & Rescue"
          >
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-2xl bg-hinge-black text-amber-300 flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform shrink-0">
              <PawPrint className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-serif font-black text-lg sm:text-xl tracking-tight text-hinge-black whitespace-nowrap">
                  MeaowMatch
                </span>
                <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 whitespace-nowrap">
                  {isGuest ? 'Guest' : (userRole || 'ADOPTER')}
                </span>
              </div>
              {userName && !isGuest && (
                <span className="text-[10px] text-neutral-500 font-medium truncate max-w-[90px] sm:max-w-[130px] pt-0.5">
                  {userName}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Center Navigation (Visible on md: and above - NEVER scrolls or clips Profile) */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-white p-1 rounded-full border border-hinge-border shadow-subtle shrink-0">
            {/* 1. Adopt Pets */}
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'explore'
                  ? 'bg-hinge-black text-white shadow-sm'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Adopt</span>
            </button>

            {/* 2. Emergency Rescue Radar */}
            <button
              onClick={() => setActiveTab('rescue')}
              className={`relative flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'rescue'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Radar</span>
              {criticalAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white animate-pulse">
                  {criticalAlertsCount}
                </span>
              )}
            </button>

            {/* 3. Messages & Inquiries */}
            <button
              onClick={() => setActiveTab('matches')}
              className={`relative flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'bg-hinge-black text-white shadow-sm'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <MessageCircleHeart className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">Messages</span>
              <span className="lg:hidden">Chat</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* 4. Shelter & Rehomer Listings */}
            <button
              onClick={() => setActiveTab('my-pets')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'my-pets'
                  ? 'bg-hinge-black text-white shadow-sm'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <PawPrint className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Listings</span>
            </button>

            {/* 5. User Profile (ALWAYS 100% visible on desktop without scrolling) */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-hinge-black text-white shadow-sm'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Right Action Tools & Auth */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Quick Filter Button */}
            {(activeTab === 'explore' || activeTab === 'rescue') && (
              <button
                onClick={onOpenFilters}
                title="Filter by Species or Distance"
                className="p-1.5 sm:p-2 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black border border-hinge-border transition-colors shadow-subtle shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}

            {/* Quick Report Distress Button */}
            <button
              onClick={onOpenReportRescue}
              title="Report an injured or stray animal"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 transition-colors shadow-subtle whitespace-nowrap shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="hidden xl:inline">Report Distress</span>
              <span className="xl:hidden">Report</span>
            </button>

            {/* Quick Post Pet Button (Desktop only on xl screens) */}
            <button
              onClick={onOpenCreatePet}
              title="Post a pet for adoption or foster"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors shadow-subtle whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Post Pet</span>
            </button>

            {/* Sign In (Guest) or Sign Out (User) — Single-line guaranteed */}
            {isGuest ? (
              <button
                onClick={onOpenAuth}
                className="px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold bg-hinge-black text-white hover:bg-neutral-800 shadow-sm transition-all whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 sm:p-2 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-rose-600 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Mobile Floating Bottom Navigation Bar (Visible only on mobile < md) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-2 py-1.5 flex items-center justify-around shadow-lg select-none">
        {/* Mobile Tab 1: Adopt */}
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'explore'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-400 font-medium hover:text-neutral-700'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === 'explore' ? 'text-amber-500 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Adopt</span>
        </button>

        {/* Mobile Tab 2: Radar */}
        <button
          onClick={() => setActiveTab('rescue')}
          className={`relative flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'rescue'
              ? 'text-rose-700 font-bold'
              : 'text-neutral-400 font-medium hover:text-neutral-700'
          }`}
        >
          <AlertTriangle className={`w-5 h-5 ${activeTab === 'rescue' ? 'text-rose-600 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Radar</span>
          {criticalAlertsCount > 0 && (
            <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* Mobile Tab 3: Messages */}
        <button
          onClick={() => setActiveTab('matches')}
          className={`relative flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'matches'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-400 font-medium hover:text-neutral-700'
          }`}
        >
          <MessageCircleHeart className={`w-5 h-5 ${activeTab === 'matches' ? 'text-neutral-950 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Chat</span>
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* Mobile Tab 4: Listings */}
        <button
          onClick={() => setActiveTab('my-pets')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'my-pets'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-400 font-medium hover:text-neutral-700'
          }`}
        >
          <PawPrint className={`w-5 h-5 ${activeTab === 'my-pets' ? 'text-amber-600 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Listings</span>
        </button>

        {/* Mobile Tab 5: Profile (100% visible on mobile, never hidden) */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'profile'
              ? 'text-neutral-950 font-bold'
              : 'text-neutral-400 font-medium hover:text-neutral-700'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-neutral-950 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Profile</span>
        </button>
      </nav>
    </>
  );
};
