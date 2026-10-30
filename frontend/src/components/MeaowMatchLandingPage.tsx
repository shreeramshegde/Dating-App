import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  PawPrint,
  AlertTriangle,
  Home,
  CheckCircle2,
  Heart,
  Eye,
  Activity,
  ChevronRight
} from 'lucide-react';
import { Species } from '../types';

interface MeaowMatchLandingPageProps {
  onLaunchApp: () => void;
  onOpenSignIn: () => void;
  onOpenRescue: () => void;
  onBrowseGuest?: () => void;
}

const PREVIEW_PETS = [
  {
    id: 'luna',
    name: 'Luna',
    species: 'CAT' as Species,
    breed: 'Domestic Short Hair',
    age: '14 mo',
    city: 'Austin, TX',
    photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    tags: ['Litter Trained', 'Affectionate', 'Gentle'],
    health: 'Spayed & Vaccinated',
    guardian: 'Austin Animal Haven',
  },
  {
    id: 'barnaby',
    name: 'Barnaby',
    species: 'DOG' as Species,
    breed: 'Australian Shepherd Mix',
    age: '2 yrs',
    city: 'Austin, TX',
    photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    tags: ['Active', 'Loves Hiking', 'Kid Friendly'],
    health: 'Neutered & Heartworm Free',
    guardian: 'Hill Country Rescue',
  },
  {
    id: 'kiwi',
    name: 'Kiwi & Sunny',
    species: 'BIRD' as Species,
    breed: 'Peach-faced Lovebirds',
    age: '1.5 yrs',
    city: 'Austin, TX',
    photo: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80',
    tags: ['Bonded Pair', 'Singing Whistles', 'Docile'],
    health: 'Avian Vet Checked',
    guardian: 'Avian Sanctuary',
  },
  {
    id: 'thumper',
    name: 'Thumper & Clover',
    species: 'SMALL_ANIMAL' as Species,
    breed: 'Holland Lop Bunnies',
    age: '18 mo',
    city: 'Austin, TX',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80',
    tags: ['Indoor Free Roam', 'Hay Lovers', 'Gentle'],
    health: 'Neutered & Spayed',
    guardian: 'Rabbit Sanctuary',
  },
  {
    id: 'ziggy',
    name: 'Ziggy',
    species: 'REPTILE' as Species,
    breed: 'Central Bearded Dragon',
    age: '3 yrs',
    city: 'Cedar Park, TX',
    photo: 'https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&w=600&q=80',
    tags: ['Shoulder Percher', 'Very Calm', 'Loves Greens'],
    health: 'Strong Calcium & UVB Healthy',
    guardian: 'Herp Society',
  },
  {
    id: 'milo',
    name: 'Milo',
    species: 'DOG' as Species,
    breed: 'Golden Retriever Mix',
    age: '8 mo',
    city: 'Round Rock, TX',
    photo: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80',
    tags: ['Foster Needed', 'Playful Pup', 'Dog Friendly'],
    health: 'Up to Date on Shots',
    guardian: 'Foster Network',
  },
];

const SAMPLE_STORIES = [
  {
    pet: 'Luna',
    story: 'Luna was found shivering in an alley in South Austin. Through MeaowMatch, Sarah connected with Austin Animal Haven within hours and brought her home.',
    family: 'Sarah & Luna',
    location: 'Austin, TX',
    photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    badge: 'Adopted Cat',
  },
  {
    pet: 'Barnaby',
    story: 'Barnaby’s previous family relocated overseas. Hill Country Rescue listed him and matched him with Marcus, a marathon trail runner who takes him on hill trails.',
    family: 'Marcus & Barnaby',
    location: 'Austin, TX',
    photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    badge: 'Adopted Dog',
  },
  {
    pet: 'Thumper & Clover',
    story: 'These bonded lop bunnies were surrendered together. Their new family built a custom indoor rabbit nursery filled with fresh timothy hay and organic greens.',
    family: 'The Campbell Family',
    location: 'Round Rock, TX',
    photo: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80',
    badge: 'Adopted Bunnies',
  },
];

export const MeaowMatchLandingPage: React.FC<MeaowMatchLandingPageProps> = ({
  onLaunchApp,
  onOpenSignIn,
  onOpenRescue,
  onBrowseGuest,
}) => {
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<'ALL' | Species>('ALL');

  const filteredPets = selectedSpeciesFilter === 'ALL'
    ? PREVIEW_PETS
    : PREVIEW_PETS.filter((p) => p.species === selectedSpeciesFilter);

  return (
    <div className="min-h-screen bg-hinge-cream text-hinge-black font-sans selection:bg-hinge-black selection:text-white flex flex-col text-left">
      {/* 1. Top Navigation Bar */}
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
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-neutral-600">
            <a href="#browse-pets" className="hover:text-black transition-colors">Adoptable Pets</a>
            <a href="#how-it-works" className="hover:text-black transition-colors">How It Works</a>
            <a href="#rescue-radar" className="hover:text-rose-700 transition-colors flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Emergency Radar
            </a>
            <a href="#stories" className="hover:text-black transition-colors">Success Stories</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-2.5">
            {onBrowseGuest && (
              <button
                onClick={onBrowseGuest}
                className="hidden sm:flex text-xs font-semibold text-neutral-600 hover:text-black px-3 py-2 transition-colors items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Guest Preview</span>
              </button>
            )}

            <button
              onClick={onOpenSignIn}
              className="text-xs font-semibold text-neutral-800 hover:text-black px-3.5 py-2 transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={onLaunchApp}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-md transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-98"
            >
              <span>Get Started</span>
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Over 2,400+ Dogs, Cats, Birds & Rescues Rehomed</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-hinge-black leading-[1.08]">
              Find your companion. <br />
              Rescue animals in need.
            </h1>

            <p className="text-lg text-neutral-700 font-normal leading-relaxed max-w-xl">
              MeaowMatch unites animal adopters, verified shelters, and emergency field spotters on one ethical platform. Discover adoptable companions across all species — or broadcast real-time GPS alerts to coordinate aid for injured animals.
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

            {/* Quick 3 Roles Pill */}
            <div className="pt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-500 font-medium">
              <span className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">3 Unified Portals:</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-100/70 text-amber-900 border border-amber-200">1. Adopters</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-900 border border-emerald-200">2. Rehomers & Shelters</span>
              <span className="px-2.5 py-1 rounded-full bg-rose-100/70 text-rose-900 border border-rose-200">3. Emergency Rescuers</span>
            </div>
          </div>

          {/* Right Column: Interactive Pet Card Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-[42px] bg-neutral-900 p-3.5 shadow-2xl border-4 border-neutral-800">
              {/* Phone Camera Notch */}
              <div className="absolute top-6 inset-x-0 mx-auto w-24 h-4 rounded-full bg-neutral-950 z-30" />

              <div className="rounded-[34px] bg-hinge-cream overflow-hidden border border-neutral-700/50 p-4 space-y-3.5">
                {/* Simulated App Header */}
                <div className="pt-4 flex items-center justify-between text-xs font-serif font-bold text-hinge-black">
                  <span className="flex items-center gap-1.5">
                    <PawPrint className="w-3.5 h-3.5 text-amber-600" /> MeaowMatch
                  </span>
                  <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Shelter
                  </span>
                </div>

                {/* Simulated Pet Card Image */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-subtle border border-neutral-200 bg-neutral-100 group">
                  <img
                    src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80"
                    alt="Luna the Cat"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                  <div className="absolute top-3 left-3 flex gap-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-md">
                      For Adoption
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-serif text-2xl font-bold">Luna</h3>
                      <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md font-semibold">
                        CAT • 14 mo
                      </span>
                    </div>
                    <p className="text-xs text-neutral-200">Domestic Short Hair • Spayed</p>
                    <p className="text-[10px] text-amber-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> Austin Animal Haven (2.4 km away)
                    </p>
                  </div>
                </div>

                {/* Health & Personality Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-hinge-border shadow-subtle space-y-2 text-left">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="font-bold text-neutral-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Health Records Verified
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      FeLV/FIV Negative
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                      🐾 Affectionate
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                      🕊️ Bird Watcher
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                      🐕 Good with calm dogs
                    </span>
                  </div>

                  {/* Quick Action Preview */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={onLaunchApp}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-hinge-black hover:bg-neutral-800 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Send Adoption Inquiry</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Multi-Species Adoptable Pets Showcase */}
      <section id="browse-pets" className="py-20 bg-white border-y border-hinge-border px-5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Multi-Species Platform
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-hinge-black">
                Meet companions waiting for homes.
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed font-normal">
                Every animal deserves care, from puppies and senior cats to parrots, bonded bunnies, and geckos.
              </p>
            </div>

            {/* Species Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { value: 'ALL', label: 'All Animals' },
                { value: 'DOG', label: '🐕 Dogs' },
                { value: 'CAT', label: '🐈 Cats' },
                { value: 'BIRD', label: '🦜 Birds' },
                { value: 'REPTILE', label: '🦎 Reptiles' },
                { value: 'SMALL_ANIMAL', label: '🐇 Small Pets' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedSpeciesFilter(tab.value as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedSpeciesFilter === tab.value
                      ? 'bg-hinge-black text-white shadow-sm'
                      : 'bg-hinge-cream text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <div
                key={pet.id}
                className="group rounded-3xl bg-hinge-cream/40 border border-hinge-border p-4 shadow-subtle hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Photo with species badge */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                    <img
                      src={pet.photo}
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-md">
                        {pet.species}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 rounded-xl">
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-serif text-xl font-bold">{pet.name}</h3>
                        <span className="text-xs text-neutral-200 font-medium">{pet.age}</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 truncate">{pet.breed}</p>
                    </div>
                  </div>

                  {/* Badges & Health */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{pet.health}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {pet.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-full border border-neutral-200 text-neutral-700">
                          {t}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-neutral-500 flex items-center gap-1 pt-1">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      <span>{pet.guardian} • {pet.city}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={onLaunchApp}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-hinge-black hover:bg-neutral-800 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Adopt {pet.name}</span>
                </button>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={onLaunchApp}
              className="px-8 py-3.5 rounded-full text-sm font-bold text-neutral-900 bg-amber-300 hover:bg-amber-400 shadow-md inline-flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              <span>Explore All Pets in Swipe Deck</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Core Philosophy: 3 Pillars Grid */}
      <section id="how-it-works" className="py-20 bg-hinge-stone/30 border-b border-hinge-border px-5">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Purpose-Built Architecture
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-hinge-black">
              Three personas. One unified rescue mission.
            </h2>
            <p className="text-base text-neutral-600 leading-relaxed">
              Whether you are ready to welcome a new family member, rehoming a pet ethically, or reporting an animal hit by a car, MeaowMatch handles each workflow with precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Persona 1: Adopter */}
            <div className="p-7 rounded-3xl bg-white border border-hinge-border space-y-4 shadow-subtle flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-subtle text-amber-700">
                  <Heart className="w-6 h-6 fill-amber-600 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Persona 1</span>
                  <h3 className="font-serif text-2xl font-bold text-hinge-black">
                    The Adopter
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Swipe through nearby adoptable dogs, cats, bunnies, and birds. Review complete medical charts, vaccination history, and temperament notes before sending an inquiry.
                </p>
                <ul className="text-xs text-neutral-700 space-y-2 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Swipe gesture deck with distance filters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-time STOMP messaging with guardians
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Schedule meet & greets seamlessly
                  </li>
                </ul>
              </div>

              <button
                onClick={onLaunchApp}
                className="mt-4 w-full py-2.5 rounded-full text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-900 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Start Browsing</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Persona 2: Rehomer & Shelter */}
            <div className="p-7 rounded-3xl bg-white border border-hinge-border space-y-4 shadow-subtle flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-subtle text-emerald-700">
                  <Home className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Persona 2</span>
                  <h3 className="font-serif text-2xl font-bold text-hinge-black">
                    Rehomer & Shelter
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Post pets looking for permanent homes or temporary foster families. Upload high-res photos via direct S3 pre-signed URLs, specify dietary/housing needs, and screen applicants.
                </p>
                <ul className="text-xs text-neutral-700 space-y-2 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 3-step S3 pre-signed direct upload
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Foster vs Permanent Adoption toggles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Track active inquiries in one inbox
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenSignIn}
                className="mt-4 w-full py-2.5 rounded-full text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-900 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Shelter Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Persona 3: Emergency Rescuer */}
            <div className="p-7 rounded-3xl bg-white border border-rose-300 ring-1 ring-rose-200 space-y-4 shadow-subtle flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shadow-subtle text-rose-700">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Persona 3</span>
                  <h3 className="font-serif text-2xl font-bold text-hinge-black">
                    Emergency Rescuer
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Spotted an injured, hit-by-car, or trapped stray animal? Capture GPS coordinates instantly, note critical injuries, and dispatch notifications to volunteer ambulances within 50 km.
                </p>
                <ul className="text-xs text-neutral-700 space-y-2 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-600" /> 1-click GPS device location capture
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-600" /> Critical / High urgency broadcast alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-600" /> Live rescue coordination chat room
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenRescue}
                className="mt-4 w-full py-2.5 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Emergency Radar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Emergency Animal Rescue Radar Section */}
      <section id="rescue-radar" className="py-16 bg-neutral-900 text-white px-5 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>24/7 Citizen Emergency Radar</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Seen an injured or abandoned animal?
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Every second counts for an animal trapped in a storm drain, hit by traffic, or shivering in extreme weather. Use our emergency reporting feature to alert nearby veterinary volunteers instantly.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onOpenRescue}
                className="px-6 py-3 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Open Live Rescue Radar</span>
              </button>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-neutral-800 border border-neutral-700 space-y-4">
            <h3 className="font-serif text-xl font-bold">
              Join the Volunteer Rescuer Network
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Sign up with the RESCUER persona to receive immediate notifications whenever an animal needs emergency help within your postal code. Claim alerts, coordinate medical transport, and save lives.
            </p>
            <button
              onClick={onOpenSignIn}
              className="w-full py-3.5 rounded-full font-bold text-neutral-900 bg-amber-300 hover:bg-amber-400 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all"
            >
              <span>Register as Volunteer Rescuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Adoption Success Stories */}
      <section id="stories" className="py-20 bg-hinge-cream border-t border-hinge-border px-5">
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
            {SAMPLE_STORIES.map((story, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white border border-hinge-border shadow-subtle p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    {story.badge}
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

      {/* 7. Footer */}
      <footer className="mt-auto bg-hinge-cream border-t border-hinge-border py-12 px-5 text-xs text-neutral-600">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <PawPrint className="w-5 h-5 text-neutral-800" />
            <span className="font-serif font-black text-2xl text-hinge-black">MeaowMatch</span>
            <span className="text-[11px] text-neutral-500">© 2026 MeaowMatch, Inc. Ethical pet adoption & animal rescue network.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-neutral-700">
            <button onClick={onLaunchApp} className="hover:text-black">Web App</button>
            <a href="#browse-pets" className="hover:text-black">Adopt Pets</a>
            <a href="#how-it-works" className="hover:text-black">How it Works</a>
            <a href="#rescue-radar" className="hover:text-black">Rescue Radar</a>
            <a href="#stories" className="hover:text-black">Stories</a>
            <button onClick={onOpenSignIn} className="hover:text-black">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
