import React from 'react';
import { 
  Sparkles, 
  MessageCircleHeart, 
  User, 
  SlidersHorizontal, 
  Radio, 
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
    <header className="sticky top-0 z-40 w-full bg-hinge-cream/95 backdrop-blur-md border-b border-hinge-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* MeaowMatch Brand Logo */}
        <div 
          onClick={() => setActiveTab('explore')} 
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          title="MeaowMatch Pet Adoption & Rescue"
        >
          <div className="w-9 h-9 rounded-2xl bg-hinge-black text-amber-300 flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-xl tracking-tight text-hinge-black">
                MeaowMatch
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {isGuest ? 'Guest Preview' : (userRole || 'ADOPTER')}
              </span>
            </div>
            {userName && (
              <p className="text-[10px] text-neutral-500 font-medium truncate max-w-[120px] sm:max-w-none text-left">
                {userName}
              </p>
            )}
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-white p-1 rounded-full border border-hinge-border shadow-subtle overflow-x-auto scrollbar-none">
          {/* 1. Adoption Deck */}
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'explore'
                ? 'bg-hinge-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Adopt Pets</span>
          </button>

          {/* 2. Emergency Rescue Radar */}
          <button
            onClick={() => setActiveTab('rescue')}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'rescue'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-neutral-600 hover:text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Emergency Radar</span>
            {criticalAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {criticalAlertsCount}
              </span>
            )}
          </button>

          {/* 3. Conversations & Active Inquiries */}
          <button
            onClick={() => setActiveTab('matches')}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'matches'
                ? 'bg-hinge-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <MessageCircleHeart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Messages</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          {/* 4. Shelter & Rehomer Listings */}
          <button
            onClick={() => setActiveTab('my-pets')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'my-pets'
                ? 'bg-hinge-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <PawPrint className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">My Listings</span>
          </button>

          {/* 5. User Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-hinge-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Profile</span>
          </button>
        </nav>

        {/* Right Tools & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Action: Report Animal in Distress */}
          <button
            onClick={onOpenReportRescue}
            title="Report an injured or stray animal"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 transition-colors shadow-subtle"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">Report Distress</span>
          </button>

          {/* Quick Action: Post a Pet for Adoption */}
          <button
            onClick={onOpenCreatePet}
            title="Post a pet for adoption or foster"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors shadow-subtle"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>Post Pet</span>
          </button>

          {/* Filter Preferences Button (Visible when in explore or rescue) */}
          {(activeTab === 'explore' || activeTab === 'rescue') && (
            <button
              onClick={onOpenFilters}
              title="Filters & Preferences"
              className="p-2 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black border border-hinge-border transition-colors shadow-subtle"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          {/* Live AWS Backend Connected Pill */}
          <div 
            title="Connected to AWS EC2 Backend: http://3.25.130.67:8080"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-300 text-emerald-800"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="hidden xl:inline">AWS Backend</span>
          </div>

          {/* Sign In (Guest) or Sign Out (User) */}
          {isGuest ? (
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-hinge-black text-white hover:bg-neutral-800 shadow-sm transition-all"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
