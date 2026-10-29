import React, { useState } from 'react';
import { Sparkles, MessageCircleHeart, User, SlidersHorizontal, Radio, Globe } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface NavbarProps {
  activeTab: 'explore' | 'matches' | 'profile';
  setActiveTab: (tab: 'explore' | 'matches' | 'profile') => void;
  matchesCount: number;
  unreadCount: number;
  onOpenFilters: () => void;
  useMock: boolean;
  onToggleMock: (val: boolean) => void;
  onGoToLanding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  matchesCount: _matchesCount,
  unreadCount,
  onOpenFilters,
  useMock,
  onToggleMock,
  onGoToLanding,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-hinge-cream/95 backdrop-blur-md border-b border-hinge-border">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Lost & Found Logo */}
        <div 
          onClick={onGoToLanding} 
          className="flex items-center gap-2 cursor-pointer group select-none"
          title="Back to Lost & Found Homepage"
        >
          <span className="font-serif font-black text-2xl tracking-tight text-hinge-black">
            lost & found
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-hinge-stone text-neutral-700 border border-hinge-border">
            app
          </span>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-white p-1 rounded-full border border-hinge-border shadow-subtle">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeTab === 'explore'
                ? 'bg-hinge-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Explore Deck</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeTab === 'matches'
                ? 'bg-hinge-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <MessageCircleHeart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Matches & Chat</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-hinge-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Profile</span>
          </button>
        </nav>

        {/* Right Tools (Filters, Landing Page Link & Backend API Status) */}
        <div className="flex items-center gap-2">
          {activeTab === 'explore' && (
            <button
              onClick={onOpenFilters}
              title="Preferences & Filters"
              className="p-2 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black border border-hinge-border transition-colors shadow-subtle"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          {/* Switch to Landing Page */}
          <button
            onClick={onGoToLanding}
            title="View Marketing Website"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-neutral-100 text-neutral-700 border border-hinge-border transition-colors shadow-subtle"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            <span>Site</span>
          </button>

          {/* Backend Connection Indicator */}
          <div className="relative">
            <button
              onClick={() => setShowConfig(!showConfig)}
              title="API Backend Status"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                useMock
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${useMock ? 'text-amber-600' : 'text-emerald-600 animate-pulse'}`} />
              <span className="hidden md:inline">{useMock ? 'Mock API' : 'Live API'}</span>
            </button>

            {showConfig && (
              <div className="absolute right-0 mt-2 w-72 p-5 rounded-3xl bg-white shadow-2xl border border-hinge-border z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-hinge-black">Backend Connection</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${useMock ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {useMock ? 'Mock' : 'Live'}
                  </span>
                </div>

                <div className="py-3 text-xs text-neutral-600 space-y-2">
                  <p>
                    Target Backend:
                    <span className="block mt-1 font-mono text-[11px] text-neutral-800 bg-neutral-100 px-2 py-1 rounded border border-neutral-200 truncate">
                      {API_BASE_URL}
                    </span>
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Toggle to test with realistic mock data while teammates develop backend or AWS endpoints.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-700">Use Mock Fallback</span>
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
