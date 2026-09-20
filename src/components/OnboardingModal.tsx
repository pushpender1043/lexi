import React, { useState } from 'react';
import { UserProfile, PartnerTone, PartnerGender } from '../types';
import { AexoMascot } from './AexoMascot';
import {
  Sparkles,
  MapPin,
  User,
  Heart,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Smile,
  Zap,
  Target,
  MessageCircle,
  X
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveProfile: (profile: Partial<UserProfile> | UserProfile, sendWelcomeMsg?: boolean) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // User info
  const [userName, setUserName] = useState(currentProfile.name || 'Deepu');
  const [userLocation, setUserLocation] = useState(currentProfile.location || 'Delhi, India');

  // Companion name (Default is Lexi, but customizable)
  const [companionName, setCompanionName] = useState(currentProfile.partnerName || 'Lexi');
  const [partnerGender, setPartnerGender] = useState<PartnerGender>(currentProfile.partnerGender || 'female');

  // AI Training questions (3-4 options each)
  const [relationshipDynamic, setRelationshipDynamic] = useState<string>(
    currentProfile.relationshipDynamic || 'sweet_loving'
  );
  const [primaryGoal, setPrimaryGoal] = useState<string>(
    currentProfile.primaryGoal || 'fitness_habits'
  );
  const [languageMix, setLanguageMix] = useState<string>(
    currentProfile.languageMix || 'hinglish'
  );

  if (!isOpen) return null;

  const nameSuggestions = ['Lexi', 'Maya', 'Kiara', 'Riya', 'Aria', 'Tara', 'Leo'];

  const handleSkip = () => {
    onSaveProfile(
      {
        ...currentProfile,
        name: userName.trim() || 'Deepu',
        location: userLocation.trim() || 'Global',
        partnerName: companionName.trim() || 'Lexi',
        isOnboarded: true,
      },
      true
    );
    onClose();
  };

  const handleComplete = () => {
    // Map dynamic to partner tone
    let tone: PartnerTone = 'sweet_clingy';
    if (relationshipDynamic === 'playful_teasing') tone = 'playful_loving';
    else if (relationshipDynamic === 'disciplined_coach') tone = 'strict_caring';
    else if (relationshipDynamic === 'sassy_feisty') tone = 'sassy_feisty';

    const updated: Partial<UserProfile> = {
      name: userName.trim() || 'Deepu',
      location: userLocation.trim() || 'India',
      partnerName: companionName.trim() || 'Lexi',
      partnerGender,
      voiceGender: partnerGender,
      partnerTone: tone,
      relationshipDynamic,
      primaryGoal,
      languageMix,
      isOnboarded: true,
    };

    onSaveProfile(updated, true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="onboarding-wizard-modal"
        className="relative w-full max-w-lg bg-white dark:bg-[#151124] rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header Bar with Step Indicator & Skip Option */}
        <div className="px-6 py-4 border-b border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {step}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                Step {step} of 3
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {step === 1 && 'Personalize Your Profile'}
                {step === 2 && 'Name Your Companion'}
                {step === 3 && `Train ${companionName}'s Personality`}
              </h3>
            </div>
          </div>

          {/* Option to Skip Onboarding */}
          <button
            id="onboarding-skip-btn"
            onClick={handleSkip}
            className="px-3 py-1 rounded-full text-xs font-semibold text-zinc-500 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-950/50 transition-colors"
          >
            Skip & Start
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-zinc-800 dark:text-zinc-200">
          {/* STEP 1: Name & Location */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-1">
                <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Welcome to Your AI Companion
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-0.5">
                  Let's start with basic details so your companion can address you warmly and know your timezone.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>What should your companion call you? (Your Name)</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Deepu, Arjun, Alex"
                  className="w-full px-4 py-3 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Your Location (City / Country)</span>
                </label>
                <input
                  type="text"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  placeholder="e.g. Delhi, India / Mumbai / London"
                  className="w-full px-4 py-3 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm focus:outline-hidden focus:border-purple-500"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Helps your companion know morning routines, weather and daily schedules.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Companion Name Customization (Default Lexi, customizable) */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-1 flex flex-col items-center">
                <div className="mb-2">
                  <AexoMascot size="md" isListening={true} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Default name is <span className="text-purple-600 dark:text-purple-400">Lexi</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mt-0.5">
                  You can keep Lexi or customize her name to anything you prefer!
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Customize name from Lexi to:</span>
                </label>
                <input
                  type="text"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  placeholder="e.g. Lexi, Maya, Kiara"
                  className="w-full px-4 py-3 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 text-zinc-900 dark:text-zinc-100 text-sm font-bold focus:outline-hidden focus:border-purple-500 text-center"
                />
              </div>

              {/* Quick Pick Suggestions */}
              <div>
                <span className="block text-[11px] text-zinc-500 mb-1.5">Or tap a quick recommendation:</span>
                <div className="flex flex-wrap gap-1.5">
                  {nameSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setCompanionName(sug)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        companionName.toLowerCase() === sug.toLowerCase()
                          ? 'bg-purple-600 text-white shadow-xs scale-105'
                          : 'bg-purple-50 dark:bg-purple-950/30 text-zinc-700 dark:text-zinc-300 border border-purple-100 dark:border-purple-900/30 hover:border-purple-300'
                      }`}
                    >
                      {sug === 'Lexi' ? 'Lexi (Default)' : sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/20 border border-purple-200/60 dark:border-purple-900/40 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
                  <Smile className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    "{userName ? `Hey ${userName}` : 'Hey'}, I'm {companionName || 'Lexi'}!"
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                    I'm ready to accompany you through every step of your day.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Basic Questions to Train AI (3-4 options each) */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-1">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Train {companionName || 'Lexi'}'s Personality
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-0.5">
                  Choose how {companionName || 'Lexi'} should talk, motivate, and check in on you.
                </p>
              </div>

              {/* Question 1: Personality & Vibe (4 options) */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>1. How should {companionName} talk with you?</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'sweet_loving', title: 'Sweet & Loving Partner', desc: 'Warm, caring & affectionate check-ins' },
                    { id: 'playful_teasing', title: 'Playful & Teasing Bestie', desc: 'Witty banter, high energy & cute teasing' },
                    { id: 'disciplined_coach', title: 'Accountability Coach', desc: 'Direct, focused & pushes your daily habits' },
                    { id: 'calm_soulmate', title: 'Calm & Gentle Soulmate', desc: 'Deep listening, comfort & peaceful vibes' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRelationshipDynamic(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        relationshipDynamic === opt.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-purple-50/40 dark:bg-purple-950/20 text-zinc-800 dark:text-zinc-200 border-purple-100 dark:border-purple-900/40 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.title}</div>
                      <div className={`text-[10px] mt-0.5 ${relationshipDynamic === opt.id ? 'text-purple-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Primary Daily Focus (4 options) */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. What is your primary focus together?</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'fitness_habits', title: 'Fitness & Gym Consistency', desc: 'Workout streaks, hydration & discipline' },
                    { id: 'daily_routine', title: 'Daily Routine & Hydration', desc: 'Waking up on time, water goals & vitamins' },
                    { id: 'deep_work', title: 'Deep Work & Study Sprints', desc: 'Goal tracking, productivity & focus sessions' },
                    { id: 'emotional_chat', title: 'Venting & Heart-to-Heart', desc: 'Daily chats, emotional support & hugs' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPrimaryGoal(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        primaryGoal === opt.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-purple-50/40 dark:bg-purple-950/20 text-zinc-800 dark:text-zinc-200 border-purple-100 dark:border-purple-900/40 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.title}</div>
                      <div className={`text-[10px] mt-0.5 ${primaryGoal === opt.id ? 'text-purple-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Language & Tone Mix (3 options) */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3. Preferred language style?</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'hinglish', title: 'Hinglish 🇮🇳', desc: 'Natural Hindi + English banter (Jaan, suno)' },
                    { id: 'english_sweet', title: 'Sweet English ✨', desc: 'Warm, cozy & affectionate English' },
                    { id: 'english_direct', title: 'Direct English 🎯', desc: 'Sharp, goal-oriented & motivational' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLanguageMix(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        languageMix === opt.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-purple-50/40 dark:bg-purple-950/20 text-zinc-800 dark:text-zinc-200 border-purple-100 dark:border-purple-900/40 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.title}</div>
                      <div className={`text-[10px] mt-0.5 ${languageMix === opt.id ? 'text-purple-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 border-t border-purple-100 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-950/20 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              id="onboarding-next-btn"
              type="button"
              onClick={() => setStep((prev) => (prev + 1) as any)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="onboarding-finish-btn"
              type="button"
              onClick={handleComplete}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Start App with {companionName || 'Lexi'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
