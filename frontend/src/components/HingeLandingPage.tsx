import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  Sparkles, 
  ArrowRight, 
  MessageCircle, 
  Mic, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  RefreshCw,
  QrCode,
  Smartphone
} from 'lucide-react';
import { MOCK_DISCOVERY_CARDS } from '../data/mockProfiles';

interface HingeLandingPageProps {
  onLaunchApp: () => void;
  onOpenSignIn: () => void;
}

const SAMPLE_PROMPTS = [
  { question: "The best way to win me over is", answer: "Suggest an obscure museum, followed by arguing playfully over who makes the most authentic matcha latte." },
  { question: "Together, we could", answer: "Build a Spotify playlist that flows seamlessly from jazz fusion into 90s French house music." },
  { question: "My most controversial opinion is", answer: "Brunch is overrated; late night tacos with sparkling lime water easily takes the crown every single time." },
  { question: "A boundary of mine is", answer: "Never talking through movies, but pausing every 10 minutes to analyze the cinematography is totally acceptable." },
  { question: "I get way too excited about", answer: "Vintage Super 8 cameras, discovering forgotten indie bands, and spicy street food." },
];

export const HingeLandingPage: React.FC<HingeLandingPageProps> = ({
  onLaunchApp,
  onOpenSignIn,
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);

  const featuredProfile = MOCK_DISCOVERY_CARDS[0]; // Sophia

  const handleNextPrompt = () => {
    setActivePromptIndex((prev) => (prev + 1) % SAMPLE_PROMPTS.length);
  };

  return (
    <div className="min-h-screen bg-hinge-cream text-hinge-black font-sans selection:bg-hinge-black selection:text-white flex flex-col">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 w-full bg-hinge-cream/90 backdrop-blur-md border-b border-hinge-border">
        <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="font-serif font-black text-3xl tracking-tight text-hinge-black">
              lost & found
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-hinge-muted uppercase tracking-widest pl-3 border-l border-hinge-border">
              The dating app designed to be deleted<sup className="text-[8px]">®</sup>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-hinge-dark">
            <a href="#how-it-works" className="hover:text-hinge-black transition-colors">How It Works</a>
            <a href="#stories" className="hover:text-hinge-black transition-colors">Real Couples</a>
            <a href="#science" className="hover:text-hinge-black transition-colors">Relationship Science</a>
            <a href="#safety" className="hover:text-hinge-black transition-colors">Safety</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSignIn}
              className="text-xs font-semibold text-hinge-dark hover:text-hinge-black px-3.5 py-2 transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={onLaunchApp}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-md transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-98"
            >
              <span>Launch Web App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-5 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Statement */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-hinge-stone text-hinge-black text-xs font-semibold border border-hinge-border">
              <Sparkles className="w-3.5 h-3.5 text-hinge-terracotta" />
              <span>3 out of 4 first dates lead to second dates</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-hinge-black leading-[1.08]">
              The dating app designed to be deleted<sup className="text-2xl font-light">®</sup>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-700 font-normal leading-relaxed max-w-xl">
              Lost & Found is built on the belief that anyone looking for love should be able to find it. We replaced rapid swiping with thoughtful prompts, voice notes, and intentional conversations.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={onLaunchApp}
                className="px-8 py-4 rounded-full text-base font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-xl shadow-neutral-900/15 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-98 transition-all"
              >
                <span>Try the Live Web App</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="px-6 py-4 rounded-full text-sm font-semibold text-hinge-black bg-white hover:bg-neutral-50 border border-hinge-border flex items-center justify-center gap-2.5 transition-colors shadow-subtle"
              >
                <QrCode className="w-4 h-4 text-neutral-600" />
                <span>Get App for Mobile</span>
              </button>
            </div>

            {/* Credibility quotes */}
            <div className="pt-6 border-t border-hinge-border/80 flex flex-wrap items-center gap-6 text-xs text-neutral-600 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-hinge-kohlrabi" />
                <span>Nobel Prize-winning matching algorithm</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-hinge-kohlrabi" />
                <span>Designed for real-world dates, not phone addiction</span>
              </div>
            </div>
          </div>

          {/* Right: Phone Simulator Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] rounded-[48px] p-3.5 bg-neutral-900 shadow-2xl shadow-neutral-900/25 border-4 border-neutral-800">
              {/* Phone Speaker Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-950 rounded-full z-20 flex items-center justify-center">
                <div className="w-10 h-1 bg-neutral-800 rounded-full"></div>
              </div>

              {/* Phone Screen Screen Container */}
              <div className="w-full rounded-[38px] overflow-hidden bg-hinge-cream pt-8 pb-4 px-3 space-y-3 relative text-left">
                {/* Most Compatible Badge */}
                <div className="flex items-center justify-between px-2 pt-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-hinge-kohlrabi text-white flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Most Compatible
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">Today's Pick</span>
                </div>

                {/* Profile Photo Mock */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-md bg-neutral-200">
                  <img
                    src={featuredProfile.photos[0].photoUrl}
                    alt={featuredProfile.firstName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                  <div className="absolute bottom-3 left-3 right-14 text-white">
                    <h3 className="font-serif text-2xl font-bold">{featuredProfile.firstName}, {featuredProfile.age}</h3>
                    <p className="text-xs text-neutral-200">{featuredProfile.city}</p>
                  </div>

                  {/* Like button on photo */}
                  <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-hinge-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                    <Heart className="w-5 h-5 fill-hinge-black" />
                  </div>
                </div>

                {/* Simulated Voice Prompt */}
                <div className="p-3.5 rounded-2xl bg-white border border-hinge-border shadow-subtle space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1 font-semibold text-hinge-dark">
                      <Mic className="w-3.5 h-3.5 text-hinge-terracotta" /> Voice Prompt
                    </span>
                    <span className="text-[10px]">0:34</span>
                  </div>
                  <p className="text-xs font-serif italic text-hinge-black">
                    "Best travel story"
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                      className="w-8 h-8 rounded-full bg-hinge-black text-white flex items-center justify-center shrink-0 hover:bg-neutral-800 transition-colors"
                    >
                      {isPlayingVoice ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                    {/* Simulated Waveform */}
                    <div className="flex-1 flex items-center gap-1 h-5">
                      {[40, 70, 30, 90, 60, 100, 45, 80, 55, 30, 85, 60, 40, 75, 50, 30, 65, 45].map((height, i) => (
                        <div
                          key={i}
                          style={{ height: `${height}%` }}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isPlayingVoice ? 'bg-hinge-terracotta animate-pulse' : 'bg-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulated Lost & Found Prompt Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-hinge-border shadow-subtle relative group">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    Prompt
                  </span>
                  <h4 className="font-serif italic text-xs font-semibold text-neutral-800 mt-0.5">
                    "The best way to win me over is"
                  </h4>
                  <p className="text-xs text-hinge-black mt-1 font-medium leading-relaxed">
                    Suggest an obscure museum, followed by arguing over matcha lattes.
                  </p>

                  <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
                    <span>Comment to like</span>
                    <div className="w-6 h-6 rounded-full bg-hinge-stone flex items-center justify-center text-hinge-black">
                      <Heart className="w-3 h-3 fill-hinge-black" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Philosophy: "Designed to Be Deleted" */}
      <section id="how-it-works" className="py-20 bg-white border-y border-hinge-border px-5">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-hinge-kohlrabi">
              Intentional By Design
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-hinge-black">
              Dating apps shouldn't feel like a slot machine.
            </h2>
            <p className="text-base text-neutral-600 leading-relaxed">
              Most dating apps keep you swiping endlessly for ad revenue. Lost & Found is different: every single feature is designed to get you off your phone and out on an unforgettable date.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-hinge-cream border border-hinge-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-hinge-border flex items-center justify-center text-hinge-black shadow-subtle">
                <MessageCircle className="w-6 h-6 text-hinge-terracotta" />
              </div>
              <h3 className="font-serif text-xl font-bold text-hinge-black">
                1. Prompts & Voice
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Profiles showcase humor, values, quirks, and authentic voices instead of shallow curated selfies.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-hinge-cream border border-hinge-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-hinge-border flex items-center justify-center text-hinge-black shadow-subtle">
                <Heart className="w-6 h-6 text-hinge-rose" />
              </div>
              <h3 className="font-serif text-xl font-bold text-hinge-black">
                2. Comment to Connect
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                No random swiping. You like a specific photo or answer and send an icebreaker to start a real dialogue.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-hinge-cream border border-hinge-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-hinge-border flex items-center justify-center text-hinge-black shadow-subtle">
                <Award className="w-6 h-6 text-hinge-kohlrabi" />
              </div>
              <h3 className="font-serif text-xl font-bold text-hinge-black">
                3. Most Compatible
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Based on the Gale-Shapley Nobel Prize algorithm, our AI learns your type and introduces you to mutual sparks.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-hinge-cream border border-hinge-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-hinge-border flex items-center justify-center text-hinge-black shadow-subtle">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-serif text-xl font-bold text-hinge-black">
                4. We Met<sup className="text-xs">®</sup>
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                We check in after dates to learn who you clicked with in person, constantly improving your future matches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Prompt Generator Sandbox */}
      <section className="py-20 px-5 max-w-4xl mx-auto w-full text-center space-y-8">
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-hinge-terracotta">
            Interactive Prompt Sandbox
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-hinge-black">
            The secret to getting 3x more replies
          </h2>
          <p className="text-sm text-neutral-600 max-w-lg mx-auto">
            Lost & Found prompts are open questions designed to showcase your unique story. Click below to shuffle popular conversation starters:
          </p>
        </div>

        {/* Prompt Showcase Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-hinge-border shadow-hinge max-w-xl mx-auto text-left relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-neutral-400">
              Prompt #{activePromptIndex + 1}
            </span>
            <button
              onClick={handleNextPrompt}
              className="text-xs text-hinge-black hover:text-neutral-600 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-hinge-cream border border-hinge-border transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Shuffle Prompt
            </button>
          </div>

          <h3 className="font-serif italic text-2xl font-bold text-hinge-black">
            "{SAMPLE_PROMPTS[activePromptIndex].question}"
          </h3>

          <p className="text-base text-neutral-700 font-medium leading-relaxed bg-hinge-cream/60 p-4 rounded-2xl border border-hinge-border/60">
            {SAMPLE_PROMPTS[activePromptIndex].answer}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>Ready to answer your own prompts?</span>
            <button
              onClick={onLaunchApp}
              className="font-bold text-hinge-black hover:underline flex items-center gap-1"
            >
              <span>Build your profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Real Couples Who Deleted Lost & Found */}
      <section id="stories" className="py-20 bg-hinge-stone/50 border-t border-hinge-border px-5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-hinge-kohlrabi">
              Success Stories
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-hinge-black">
              They found love. Then deleted us.
            </h2>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Over thousands of couples get married or move in together every month after meeting on Lost & Found.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl overflow-hidden bg-white border border-hinge-border shadow-subtle p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-hinge-terracotta">
                  Together 3 Years
                </span>
                <p className="font-serif italic text-lg text-hinge-black leading-snug">
                  "Liam commented on my prompt about sourdough bread and sent his starter recipe. Two years later, our wedding cake had sourdough elements."
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80"
                    alt="Couple"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-hinge-black">Chloe & Liam</h4>
                  <p className="text-[11px] text-neutral-500">Deleted Lost & Found in London</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden bg-white border border-hinge-border shadow-subtle p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-hinge-kohlrabi">
                  Married 2025
                </span>
                <p className="font-serif italic text-lg text-hinge-black leading-snug">
                  "I was so tired of 'hey' on other apps. Julian responded to my voice note with a 3-minute voice note of his own. We knew immediately."
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                    alt="Couple"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-hinge-black">Maya & Julian</h4>
                  <p className="text-[11px] text-neutral-500">Deleted Lost & Found in Brooklyn</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden bg-white border border-hinge-border shadow-subtle p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-hinge-rose">
                  Engaged
                </span>
                <p className="font-serif italic text-lg text-hinge-black leading-snug">
                  "Lost & Found's 'Most Compatible' recommendation introduced us on a Tuesday. We have been inseparable ever since our first coffee date."
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    alt="Couple"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-hinge-black">Sam & Elena</h4>
                  <p className="text-[11px] text-neutral-500">Deleted Lost & Found in San Francisco</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Relationship Science & Safety Bar */}
      <section id="safety" className="py-16 bg-white px-5 border-t border-hinge-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-hinge-kohlrabi font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Trust & Safe Dating</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-hinge-black">
              Safe, authentic, and photo-verified.
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Every profile can be selfie-verified to prevent catfishing. We provide proactive dating safety guidelines, in-app reporting, and zero tolerance for harassment.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-hinge-cream border border-hinge-border space-y-4">
            <h3 className="font-serif text-xl font-bold text-hinge-black">
              Ready to find the one and delete the app?
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Start meeting genuine singles who are intentional about dating. Launch the web application right now to experience it live.
            </p>
            <button
              onClick={onLaunchApp}
              className="w-full py-3.5 rounded-full font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all"
            >
              <span>Launch Live Dating App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Minimalist Editorial Footer */}
      <footer className="mt-auto bg-hinge-cream border-t border-hinge-border py-12 px-5 text-xs text-neutral-600">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-serif font-black text-2xl text-hinge-black">lost & found</span>
            <span className="text-[11px] text-neutral-500">© 2026 Lost & Found, Inc. The dating app designed to be deleted.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-neutral-700">
            <button onClick={onLaunchApp} className="hover:text-black">Web App</button>
            <a href="#how-it-works" className="hover:text-black">How it Works</a>
            <a href="#stories" className="hover:text-black">Stories</a>
            <a href="#safety" className="hover:text-black">Safety</a>
            <button onClick={onOpenSignIn} className="hover:text-black">Sign In</button>
          </div>
        </div>
      </footer>

      {/* QR Code / Mobile Download Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center space-y-5 border border-hinge-border shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-hinge-cream flex items-center justify-center mx-auto text-hinge-black">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-hinge-black">
              Scan to download Lost & Found
            </h3>
            <p className="text-xs text-neutral-600">
              Point your smartphone camera at the QR code below to install Lost & Found directly onto your device.
            </p>

            <div className="p-6 rounded-2xl bg-hinge-cream border border-hinge-border inline-block mx-auto">
              <QrCode className="w-36 h-36 text-hinge-black mx-auto" />
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-full font-semibold text-xs text-neutral-700 bg-hinge-stone hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
