import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  PawPrint,
  AlertTriangle,
  Play,
  Pause,
  Home
} from 'lucide-react';
const FEATURED_PET = {
  name: 'Luna',
  species: 'CAT',
  breed: 'Domestic Short Hair',
  ageMonths: 14,
  city: 'Austin, TX',
  photos: [
    {
      photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    },
  ],
};

interface MeaowMatchLandingPageProps {
  onLaunchApp: () => void;
  onOpenSignIn: () => void;
  onOpenRescue: () => void;
}

const SAMPLE_PET_STORIES = [
  {
    pet: 'Luna',
    story: 'Luna was found shivering in an alley in Austin. Through MeaowMatch, Sarah connected with Austin Animal Haven within hours and brought her home.',
    family: 'Sarah & Luna',
    location: 'Austin, TX',
    photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    type: 'Adopted Cat',
  },
  {
    pet: 'Barnaby',
    story: 'Barnaby’s previous family had to relocate overseas. Hill Country Rescue listed him and matched him with an active trail runner who takes him hiking every weekend.',
    family: 'Marcus & Barnaby',
    location: 'Austin, TX',
    photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    type: 'Adopted Dog',
  },
  {
    pet: 'Thumper & Clover',
    story: 'These bonded lop bunnies were surrendered together. Their new family built a custom indoor bunny room filled with organic timothy hay and fresh greens.',
    family: 'The Campbell Family',
    location: 'Round Rock, TX',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80',
    type: 'Adopted Bunnies',
  },
];

export const MeaowMatchLandingPage: React.FC<MeaowMatchLandingPageProps> = ({
  onLaunchApp,
  onOpenSignIn,
  onOpenRescue,
}) => {
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const featuredPet = FEATURED_PET;

  return (
    <div className="min-h-screen bg-hinge-cream text-hinge-black font-sans selection:bg-hinge-black selection:text-white flex flex-col text-left">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-hinge-cream/90 backdrop-blur-md border-b border-hinge-border">
        <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-hinge-black text-amber-300 flex items-center justify-center shadow-subtle">
              <PawPrint className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif font-black text-2xl tracking-tight text-hinge-black">
                MeaowMatch
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold text-neutral-500 uppercase tracking-widest pl-3 ml-2 border-l border-hinge-border">
                Adoption & Emergency Rescue Network
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-neutral-600">
            <a href="#how-it-works" className="hover:text-black transition-colors">How It Works</a>
            <a href="#rescue" className="hover:text-rose-700 transition-colors flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Emergency Radar
            </a>
            <a href="#stories" className="hover:text-black transition-colors">Adoption Stories</a>
            <a href="#welfare" className="hover:text-black transition-colors">Animal Welfare</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSignIn}
              className="text-xs font-semibold text-neutral-700 hover:text-black px-3.5 py-2 transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={onLaunchApp}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-md transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-98"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-5 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column Statement */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Over 2,400+ Animals Rehomed & Rescued This Year</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-hinge-black leading-[1.08]">
              Find your companion. <br />
              Rescue animals in need.
            </h1>

            <p className="text-lg text-neutral-700 font-normal leading-relaxed max-w-xl">
              MeaowMatch replaces commercial pet stores with an ethical community platform. Swipe through verified adoptable dogs, cats, bunnies, birds, and reptiles — or dispatch immediate aid to injured strays on our 24/7 rescue radar.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={onLaunchApp}
                className="px-8 py-4 rounded-full text-base font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-xl shadow-neutral-900/15 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-98 transition-all"
              >
                <span>Browse Adoptable Pets</span>
                <ArrowRight className="w-5 h-5 text-amber-300" />
              </button>

              <button
                onClick={onOpenRescue}
                className="px-6 py-4 rounded-full text-sm font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 flex items-center justify-center gap-2 transition-colors shadow-subtle"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Open Emergency Radar</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-[42px] bg-neutral-900 p-3.5 shadow-2xl border-4 border-neutral-800">
              {/* Phone Camera Notch */}
              <div className="absolute top-6 inset-x-0 mx-auto w-24 h-4 rounded-full bg-neutral-950 z-30" />

              <div className="rounded-[34px] bg-hinge-cream overflow-hidden border border-neutral-700/50 p-4 space-y-3.5">
                {/* Simulated App Header */}
                <div className="pt-4 flex items-center justify-between text-xs font-serif font-bold text-hinge-black">
                  <span className="flex items-center gap-1">
                    <PawPrint className="w-3.5 h-3.5 text-amber-600" /> MeaowMatch
                  </span>
                  <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Shelter
                  </span>
                </div>

                {/* Simulated Card Image */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-subtle border border-neutral-200 bg-neutral-100">
                  <img
                    src={featuredPet.photos[0]?.photoUrl}
                    alt={featuredPet.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-serif text-2xl font-bold">{featuredPet.name}</h3>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                        {featuredPet.species}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-200">{featuredPet.breed} • 14 mo</p>
                    <p className="text-[10px] text-amber-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {featuredPet.city} (2.4 km away)
                    </p>
                  </div>
                </div>

                {/* Simulated Audio Note */}
                <div className="p-3 rounded-2xl bg-white border border-hinge-border shadow-subtle space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="font-semibold text-neutral-800 flex items-center gap-1">
                      <PawPrint className="w-3 h-3 text-amber-600" /> Temperament Soundbite
                    </span>
                    <span className="text-[10px]">0:18</span>
                  </div>
                  <p className="text-xs font-serif italic text-neutral-800">
                    "Luna purring loudly while getting chin scratches"
                  </p>

                  <div className="flex items-center gap-2.5 pt-0.5">
                    <button
                      onClick={() => setIsPlayingSound(!isPlayingSound)}
                      className="w-7 h-7 rounded-full bg-hinge-black text-white flex items-center justify-center shrink-0"
                    >
                      {isPlayingSound ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                    </button>
                    <div className="flex-1 flex items-center gap-1 h-4">
                      {[30, 60, 40, 85, 55, 95, 40, 75, 50, 30, 80, 60, 35].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-1 rounded-full ${
                            isPlayingSound ? 'bg-amber-500 animate-pulse' : 'bg-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Philosophy: Ethical Pet Adoption */}
      <section id="how-it-works" className="py-20 bg-white border-y border-hinge-border px-5">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Ethical By Design
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-hinge-black">
              Animal adoption shouldn't be complicated.
            </h2>
            <p className="text-base text-neutral-600 leading-relaxed">
              We empower animal lovers, licensed rescue shelters, and emergency spotters through one collaborative platform built for animal welfare.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-3xl bg-hinge-cream border border-hinge-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-hinge-border flex items-center justify-center shadow-subtle text-amber-700">
                <PawPrint className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-hinge-black">
                1. All Animals Welcome
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                From rescue puppies and senior cats to bonded bunnies, birds, and geckos. Every species finds a loving home.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-hinge-cream border border-hinge-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-hinge-border flex items-center justify-center shadow-subtle text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-hinge-black">
                2. S3 Verified Records
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Direct high-resolution photo uploads, vaccination verification, microchip records, and temperament details.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-hinge-cream border border-hinge-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-hinge-border flex items-center justify-center shadow-subtle text-rose-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-hinge-black">
                3. Emergency Dispatch
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Spotted an injured dog or cat? Broadcast GPS coordinates instantly to veterinary ambulances and volunteer rescuers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-hinge-cream border border-hinge-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-hinge-border flex items-center justify-center shadow-subtle text-sky-700">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-hinge-black">
                4. Live STOMP Chat
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Direct real-time communication between adopters, shelters, and spotters with zero middleman friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Adoption Success Stories */}
      <section id="stories" className="py-20 bg-hinge-stone/40 border-t border-hinge-border px-5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Real Impact
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-hinge-black">
              They found their humans.
            </h2>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Heartwarming stories from animal lovers who matched and rescued companions on MeaowMatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_PET_STORIES.map((story, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white border border-hinge-border shadow-subtle p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    {story.type}
                  </span>
                  <p className="font-serif italic text-base text-hinge-black leading-snug">
                    "{story.story}"
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200">
                    <img src={story.photo} alt={story.pet} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-hinge-black">{story.family}</h4>
                    <p className="text-[11px] text-neutral-500">{story.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Emergency Animal Rescue Radar Banner */}
      <section id="rescue" className="py-16 bg-neutral-900 text-white px-5 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>24/7 Citizen Emergency Radar</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Seen an injured or abandoned animal?
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Every second counts for an animal trapped in a storm drain, hit by traffic, or shivering in winter weather. Use our emergency reporting feature to alert nearby rescuers instantly.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-neutral-800 border border-neutral-700 space-y-4">
            <h3 className="font-serif text-xl font-bold">
              Join the Volunteer Rescuer Network
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Sign up with the RESCUER role to receive immediate mobile alerts whenever an animal needs emergency help within your postal code.
            </p>
            <button
              onClick={onOpenRescue}
              className="w-full py-3.5 rounded-full font-bold text-neutral-900 bg-amber-300 hover:bg-amber-400 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all"
            >
              <span>View Emergency Rescue Radar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto bg-hinge-cream border-t border-hinge-border py-12 px-5 text-xs text-neutral-600">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <PawPrint className="w-5 h-5 text-neutral-800" />
            <span className="font-serif font-black text-2xl text-hinge-black">MeaowMatch</span>
            <span className="text-[11px] text-neutral-500">© 2026 MeaowMatch, Inc. Ethical pet adoption & animal rescue network.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-neutral-700">
            <button onClick={onLaunchApp} className="hover:text-black">Web App</button>
            <a href="#how-it-works" className="hover:text-black">How it Works</a>
            <a href="#rescue" className="hover:text-black">Rescue Radar</a>
            <a href="#stories" className="hover:text-black">Stories</a>
            <button onClick={onOpenSignIn} className="hover:text-black">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
