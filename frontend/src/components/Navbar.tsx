import React, { useState } from 'react';
import { 
  Sparkles, 
  MessageCircleHeart, 
  User, 
  SlidersHorizontal, 
  Radio, 
  Globe, 
  AlertTriangle, 
  PawPrint,
  PlusCircle
} from 'lucide-react';
import { API_BASE_URL } from '../services/api';
import { UserRole } from '../types';

export type NavTab = 'explore' | 'rescue' | 'matches' | 'my-pets' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  matchesCount: number;
  unreadCount: number;
  criticalAlertsCount: number;
  userRole?: UserRole;
  onOpenFilters: () => void;
  onOpenReportRescue: () => void;
  onOpenCreatePet: () => void;
  useMock: boolean;
  onToggleMock: (val: boolean) => void;
  onGoToLanding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  matchesCount: _matchesCount,
  unreadCount,
  criticalAlertsCount,
  userRole = 'ADOPTER',
  onOpenFilters,
  onOpenReportRescue,
  onOpenCreatePet,
  useMock,
  onToggleMock,
  onGoToLanding,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-hinge-cream/95 backdrop-blur-md border-b border-hinge-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* MeaowMatch Brand Logo */}
        <div 
          onClick={onGoToLanding} 
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          title="Back to MeaowMatch Homepage"
        >
          <div className="w-9 h-9 rounded-2xl bg-hinge-black text-white flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform">
            <PawPrint className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-xl tracking-tight text-hinge-black">
                MeaowMatch
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Rescue & Adopt
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 font-medium hidden sm:block">
              Pet Adoption & Animal Rescue
            </p>
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

          {/* Marketing Site Link */}
          <button
            onClick={onGoToLanding}
            title="View MeaowMatch Homepage"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-neutral-100 text-neutral-700 border border-hinge-border transition-colors shadow-subtle"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            <span>Site</span>
          </button>

          {/* Backend Connection Indicator */}
          <div className="relative">
            <button
              onClick={() => setShowConfig(!showConfig)}
              title="Backend Connection Status"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                useMock
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${useMock ? 'text-amber-600' : 'text-emerald-600 animate-pulse'}`} />
              <span className="hidden xl:inline">{useMock ? 'Mock API' : 'Live API'}</span>
            </button>

            {showConfig && (
              <div className="absolute right-0 mt-2 w-80 p-5 rounded-3xl bg-white shadow-2xl border border-hinge-border z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-hinge-black">
                    Backend Connection
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${useMock ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {useMock ? 'Mock' : 'Live Backend'}
                  </span>
                </div>

                <div className="py-3 text-xs text-neutral-600 space-y-2">
                  <p>
                    Target EC2 Endpoint:
                    <span className="block mt-1 font-mono text-[11px] text-neutral-800 bg-neutral-100 px-2 py-1 rounded border border-neutral-200 truncate">
                      {API_BASE_URL}
                    </span>
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Role: <strong className="text-neutral-800">{userRole}</strong>. Supports instant adoption inquiries, emergency rescue alerts, and live STOMP messaging.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-700">Use Evaluator Mock</span>
                  <input
                    type="checkbox"
                    checked={useMock}
                    onChange={(e) => onToggleMock(e.target.checked)}
                    className="w-4 h-4 accent-hinge-black cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
