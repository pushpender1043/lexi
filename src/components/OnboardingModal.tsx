import React, { useState } from 'react';
import { UserProfile, PartnerTone, PartnerGender, Habit } from '../types';
import { AexoMascot } from './AexoMascot';
import {
  Sparkles,
  MapPin,
  User,
  Heart,
  ArrowRight,
  ArrowLeft,
  Check,
  Smile,
  Target,
  MessageCircle
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveProfile: (
    profile: Partial<UserProfile> | UserProfile,
    sendWelcomeMsg?: boolean,
    initialHabits?: Habit[]
  ) => void;
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

  // AI Training questions
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

  const getNameSuggestions = (gender: PartnerGender) => {
    if (gender === 'male') return ['Leo', 'Kabir', 'Aryan', 'Neil', 'Rohan'];
    if (gender === 'non_binary') return ['Noni', 'Alex', 'Sam', 'Jordan', 'River'];
    return ['Lexi', 'Maya', 'Kiara', 'Riya', 'Tara'];
  };

  const handleGenderChange = (newGender: PartnerGender) => {
    setPartnerGender(newGender);
    const prevDefaultNames = ['Lexi', 'Leo', 'Noni'];
    if (!companionName || prevDefaultNames.includes(companionName)) {
      if (newGender === 'male') setCompanionName('Leo');
      else if (newGender === 'non_binary') setCompanionName('Noni');
      else setCompanionName('Lexi');
    }
  };

  const nameSuggestions = getNameSuggestions(partnerGender);

  const generateStarterHabits = (goal: string, partner: string): Habit[] => {
    const timestamp = Date.now();
    if (goal === 'fitness_habits') {
      return [
        {
          id: `h_${timestamp}_1`,
          title: 'Morning Gym / Workout',
          category: 'fitness',
          scheduledTime: '07:30',
          currentValue: 0,
          targetValue: 1,
          unit: 'session',
          streak: 0,
          completed: false,
          importance: 'crucial',
          isCrucial: true,
          tags: ['Fitness', 'Health'],
        },
        {
          id: `h_${timestamp}_2`,
          title: 'Drink 2.5L Water',
          category: 'hydration',
          scheduledTime: '11:00',
          currentValue: 0,
          targetValue: 8,
          unit: 'glasses',
          streak: 0,
          completed: false,
          importance: 'crucial',
          isCrucial: true,
          tags: ['Health', 'Hydration'],
        },
        {
          id: `h_${timestamp}_3`,
          title: 'Evening Protein & Clean Diet',
          category: 'health',
          scheduledTime: '20:30',
          currentValue: 0,
          targetValue: 1,
          unit: 'meal',
          streak: 0,
          completed: false,
          importance: 'medium',
          isCrucial: false,
          tags: ['Health', 'Fitness'],
        },
      ];
    }
    if (goal === 'daily_routine') {
      return [
        {
          id: `h_${timestamp}_1`,
          title: 'Wake Up by 7:00 AM',
          category: 'lifestyle',
          scheduledTime: '07:00',
          currentValue: 0,
          targetValue: 1,
          unit: 'check',
          streak: 0,
          completed: false,
          importance: 'crucial',
          isCrucial: true,
          tags: ['Lifestyle'],
        },
        {
          id: `h_${timestamp}_2`,
          title: 'Drink Morning Water & Stretch',
          category: 'hydration',
          scheduledTime: '07:30',
          currentValue: 0,
          targetValue: 1,
          unit: 'session',
          streak: 0,
          completed: false,
          importance: 'crucial',
          isCrucial: true,
          tags: ['Health', 'Hydration'],
        },
        {
          id: `h_${timestamp}_3`,
          title: 'Take Daily Vitamins / Medicine',
          category: 'health',
          scheduledTime: '09:00',
          currentValue: 0,
          targetValue: 1,
          unit: 'dose',
          streak: 0,
          completed: false,
          importance: 'crucial',
          isCrucial: true,
          tags: ['Health'],
        },
      ];
    }
    if (goal === 'deep_work') {
      return [
        {
          id: `h_${timestamp}_1`,
          title: '2-Hour Focused Deep Work Block',
          category: 'productivity',
          scheduledTime: '10:00',
          currentValue: 0,
          targetValue: 1,
          unit: 'block',
          streak: 0,
          completed: false,
          importance: 'crucial',
          isCrucial: true,
          tags: ['Productivity'],
        },
        {
          id: `h_${timestamp}_2`,
          title: 'Hydrate & 5-Min Posture Stretch',
          category: 'hydration',
          scheduledTime: '15:00',
          currentValue: 0,
          targetValue: 1,
          unit: 'session',
          streak: 0,
          completed: false,
          importance: 'medium',
          isCrucial: false,
          tags: ['Health', 'Productivity'],
        },
        {
          id: `h_${timestamp}_3`,
          title: 'Plan Tomorrow Priorities & Clear Desk',
          category: 'productivity',
          scheduledTime: '18:00',
          currentValue: 0,
          targetValue: 1,
          unit: 'check',
          streak: 0,
          completed: false,
          importance: 'medium',
          isCrucial: false,
          tags: ['Productivity', 'Mindset'],
        },
      ];
    }
    // emotional_chat / default
    return [
      {
        id: `h_${timestamp}_1`,
        title: 'Morning Mindful Breathing & Water',
        category: 'hydration',
        scheduledTime: '08:00',
        currentValue: 0,
        targetValue: 1,
        unit: 'session',
        streak: 0,
        completed: false,
        importance: 'crucial',
        isCrucial: true,
        tags: ['Mindset', 'Health'],
      },
      {
        id: `h_${timestamp}_2`,
        title: 'Healthy Afternoon Walk',
        category: 'health',
        scheduledTime: '17:00',
        currentValue: 0,
        targetValue: 1,
        unit: 'session',
        streak: 0,
        completed: false,
        importance: 'medium',
        isCrucial: false,
        tags: ['Health', 'Fitness'],
      },
      {
        id: `h_${timestamp}_3`,
        title: `Evening Reflection with ${partner || 'Lexi'}`,
        category: 'social',
        scheduledTime: '21:30',
        currentValue: 0,
        targetValue: 1,
        unit: 'chat',
        streak: 0,
        completed: false,
        importance: 'crucial',
        isCrucial: true,
        tags: ['Social', 'Mindset'],
      },
    ];
  };

  const handleSkip = () => {
    const pName = companionName.trim() || 'Lexi';
    const starterHabits = generateStarterHabits('fitness_habits', pName);
    onSaveProfile(
      {
        ...currentProfile,
        name: userName.trim() || 'Deepu',
        location: userLocation.trim() || 'Global',
        partnerName: pName,
        isOnboarded: true,
      },
      true,
      starterHabits
    );
    onClose();
  };

  const handleComplete = () => {
    let tone: PartnerTone = 'sweet_clingy';
    if (relationshipDynamic === 'playful_teasing') tone = 'playful_loving';
    else if (relationshipDynamic === 'disciplined_coach') tone = 'strict_caring';
    else if (relationshipDynamic === 'sassy_feisty') tone = 'sassy_feisty';

    const pName = companionName.trim() || 'Lexi';
    const starterHabits = generateStarterHabits(primaryGoal, pName);

    const updated: Partial<UserProfile> = {
      name: userName.trim() || 'Deepu',
      location: userLocation.trim() || 'India',
      partnerName: pName,
      partnerGender,
      voiceGender: partnerGender,
      partnerTone: tone,
      relationshipDynamic,
      primaryGoal,
      languageMix,
      isOnboarded: true,
    };

    onSaveProfile(updated, true, starterHabits);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in select-none">
      <div
        id="onboarding-wizard-modal"
        className="relative w-full max-w-lg rounded-[28px] glass-strong shadow-[var(--shadow-glass)] border border-[var(--border)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header Bar with Step Indicator & Skip Option */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[var(--primary-purple)] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {step}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--soft-lavender)]">
                Step {step} of 3
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                {step === 1 && 'Personalize Your Profile'}
                {step === 2 && 'Name Your Companion'}
                {step === 3 && `Train ${companionName}'s Personality`}
              </h3>
            </div>
          </div>

          <button
            id="onboarding-skip-btn"
            onClick={handleSkip}
            className="px-3 py-1 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--primary-purple)] hover:bg-[var(--light-purple-surface)] transition-colors cursor-pointer"
          >
            Skip & Start
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-[var(--text-primary)]">
          {/* STEP 1: Name & Location */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-1">
                <div className="w-12 h-12 mx-auto mb-2 rounded-[16px] bg-[var(--light-purple-surface)] text-[var(--primary-purple)] flex items-center justify-center border border-[var(--border)] shadow-xs">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  Welcome to Lexi
                </h2>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto mt-0.5">
                  Let&apos;s personalize your setup so your companion knows how to greet and support you.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--primary-purple)]" />
                  <span>What should your companion call you? (Your Name)</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Deepu, Alex, Sarah"
                  className="w-full px-4 py-3 rounded-[12px] glass-input text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Your Location (City / Country)</span>
                </label>
                <input
                  type="text"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  placeholder="e.g. Delhi, India / London / New York"
                  className="w-full px-4 py-3 rounded-[12px] glass-input text-xs sm:text-sm"
                />
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Helps your companion know timezones, weather and daily schedules.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Companion Name & Identity Customization */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-1 flex flex-col items-center">
                <div className="mb-2">
                  <AexoMascot size="md" isListening={true} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  Choose Companion Identity & Name
                </h2>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs mt-0.5">
                  Customize whether your partner is female, male, or non-binary, and give them a name.
                </p>
              </div>

              {/* Gender / Identity Selection */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5 justify-center">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Companion Identity:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'female', label: 'Girlfriend', sub: 'Female (Lexi)', icon: '🌸' },
                    { id: 'male', label: 'Boyfriend', sub: 'Male (Leo)', icon: '⚡' },
                    { id: 'non_binary', label: 'Partner', sub: 'Neutral (Noni)', icon: '✨' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleGenderChange(g.id as PartnerGender)}
                      className={`p-2.5 rounded-[16px] text-center transition-all cursor-pointer border ${
                        partnerGender === g.id
                          ? 'bg-[var(--primary-purple)] text-white border-[var(--primary-purple)] shadow-sm'
                          : 'glass border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary-purple)]/40'
                      }`}
                    >
                      <div className="text-base mb-0.5">{g.icon}</div>
                      <div className="font-bold text-xs">{g.label}</div>
                      <div className={`text-[10px] ${partnerGender === g.id ? 'text-purple-100' : 'text-[var(--text-secondary)]'}`}>
                        {g.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5 justify-center">
                  <span>Companion Nickname:</span>
                </label>
                <input
                  type="text"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  placeholder="e.g. Lexi, Leo, Maya, Kabir"
                  className="w-full px-4 py-3 rounded-[12px] glass-input text-sm font-bold text-center"
                />
              </div>

              {/* Quick Pick Suggestions tailored to gender */}
              <div>
                <span className="block text-[11px] text-[var(--text-muted)] mb-1.5 text-center">
                  Popular {partnerGender === 'male' ? 'male' : partnerGender === 'non_binary' ? 'neutral' : 'female'} names:
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {nameSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setCompanionName(sug)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        companionName.toLowerCase() === sug.toLowerCase()
                          ? 'bg-[var(--primary-purple)] text-white shadow-xs scale-105'
                          : 'glass-button text-[var(--text-secondary)] border border-[var(--border)]'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3.5 rounded-[16px] glass border border-[var(--border)] flex items-center gap-3">
                <div className="p-2 rounded-[12px] bg-[var(--primary-purple)] text-white shadow-xs shrink-0">
                  <Smile className="w-4 h-4" />
                </div>
                <div className="text-xs min-w-0">
                  <p className="font-bold text-[var(--text-primary)] truncate">
                    &ldquo;{userName ? `Hey ${userName}` : 'Hey'}, I&apos;m {companionName || 'your companion'}!&rdquo;
                  </p>
                  <p className="text-[var(--text-secondary)] text-[11px]">
                    {partnerGender === 'male' ? 'Boyfriend & habit partner' : partnerGender === 'non_binary' ? 'Accountability partner' : 'Girlfriend & habit partner'} ready for your daily journey.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Basic Questions to Train AI */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="text-center pb-1">
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  Train {companionName || 'Lexi'}&apos;s Personality
                </h2>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto mt-0.5">
                  Choose how {companionName || 'Lexi'} should talk, motivate, and check in on you.
                </p>
              </div>

              {/* Question 1: Personality & Vibe */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--primary-purple)]" />
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
                      className={`p-3 rounded-[16px] text-left transition-all cursor-pointer ${
                        relationshipDynamic === opt.id
                          ? 'bg-[var(--primary-purple)] text-white shadow-md'
                          : 'glass border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary-purple)]/50'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.title}</div>
                      <div className={`text-[10px] mt-0.5 ${relationshipDynamic === opt.id ? 'text-purple-100' : 'text-[var(--text-secondary)]'}`}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Primary Daily Focus */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[var(--success-green)]" />
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
                      className={`p-3 rounded-[16px] text-left transition-all cursor-pointer ${
                        primaryGoal === opt.id
                          ? 'bg-[var(--primary-purple)] text-white shadow-md'
                          : 'glass border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary-purple)]/50'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.title}</div>
                      <div className={`text-[10px] mt-0.5 ${primaryGoal === opt.id ? 'text-purple-100' : 'text-[var(--text-secondary)]'}`}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Language & Tone Mix */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[var(--soft-lavender)]" />
                  <span>3. Preferred language style?</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'hinglish', title: 'Hinglish 🇮🇳', desc: 'Natural Hindi + English banter' },
                    { id: 'english_sweet', title: 'Sweet English ✨', desc: 'Warm, cozy & affectionate English' },
                    { id: 'english_direct', title: 'Direct English 🎯', desc: 'Sharp, goal-oriented & motivational' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLanguageMix(opt.id)}
                      className={`p-3 rounded-[16px] text-left transition-all cursor-pointer ${
                        languageMix === opt.id
                          ? 'bg-[var(--primary-purple)] text-white shadow-md'
                          : 'glass border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary-purple)]/50'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.title}</div>
                      <div className={`text-[10px] mt-0.5 ${languageMix === opt.id ? 'text-purple-100' : 'text-[var(--text-secondary)]'}`}>
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
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 rounded-[12px] text-xs font-semibold glass-button text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
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
              className="btn-primary-purple px-5 py-2.5 rounded-[12px] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="onboarding-finish-btn"
              type="button"
              onClick={handleComplete}
              className="btn-primary-purple px-6 py-2.5 rounded-[12px] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
