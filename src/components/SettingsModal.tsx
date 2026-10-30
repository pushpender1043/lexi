import React, { useState } from 'react';
import { UserProfile, PartnerTone, PartnerGender } from '../types';
import {
  Settings,
  X,
  Volume2,
  Sparkles,
  Save,
  CheckCircle,
  Play,
  Calendar,
  Sun,
  Moon,
  Mic,
  Gauge,
  Sliders,
  Bell,
  MapPin,
  LogOut,
  RefreshCw,
  Brain,
  Shield,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { playCompanionVoice } from '../utils/speech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onTriggerDailyCheckIn: () => void;
  darkMode: boolean;
  onSetTheme: (isDark: boolean) => void;
  onOpenOnboarding?: () => void;
  onOpenLogin?: () => void;
  onSignOut?: () => void;
  onOpenMemoryVault?: () => void;
  onDeleteAccount?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onTriggerDailyCheckIn,
  darkMode,
  onSetTheme,
  onOpenOnboarding,
  onOpenLogin,
  onSignOut,
  onOpenMemoryVault,
  onDeleteAccount,
}) => {
  const [name, setName] = useState(userProfile.name || 'Deepu');
  const [location, setLocation] = useState(userProfile.location || 'Delhi, India');
  const [partnerName, setPartnerName] = useState(userProfile.partnerName || 'Lexi');
  const [partnerTone, setPartnerTone] = useState<PartnerTone>(userProfile.partnerTone || 'playful_loving');
  const [partnerGender, setPartnerGender] = useState<PartnerGender>(userProfile.partnerGender || 'female');
  const [voiceGender, setVoiceGender] = useState<PartnerGender>(userProfile.voiceGender || 'female');

  const [relationshipDynamic, setRelationshipDynamic] = useState<string>(
    userProfile.relationshipDynamic || 'sweet_loving'
  );

  // Dedicated Voice Settings
  const [preferredVoiceName, setPreferredVoiceName] = useState<'Kore' | 'Aoede' | 'Leda' | 'Zephyr'>(
    userProfile.preferredVoiceName || 'Kore'
  );
  const [preferredLanguage, setPreferredLanguage] = useState<'auto' | 'hinglish' | 'hindi' | 'english'>(
    userProfile.preferredLanguage || 'auto'
  );
  const [voiceToneStyle, setVoiceToneStyle] = useState<'playful' | 'serious' | 'comforting' | 'sweet' | 'sassy'>(
    userProfile.voiceToneStyle || 'playful'
  );
  const [voiceSpeed, setVoiceSpeed] = useState<number>(userProfile.voiceSpeed || 1.0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const [dailyCheckInTime, setDailyCheckInTime] = useState(userProfile.dailyCheckInTime || '08:30');
  const [dailyCheckInEnabled, setDailyCheckInEnabled] = useState(
    userProfile.dailyCheckInEnabled !== undefined ? userProfile.dailyCheckInEnabled : true
  );
  const [wakeUpTime, setWakeUpTime] = useState(userProfile.wakeUpTime || '07:00');
  const [sleepTime, setSleepTime] = useState(userProfile.sleepTime || '23:30');
  const [dailyWaterGoal, setDailyWaterGoal] = useState(userProfile.dailyWaterGoal || 8);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    userProfile.notificationsEnabled !== undefined ? userProfile.notificationsEnabled : true
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    setIsPlayingPreview(true);
    let sampleSentence = '';

    if (relationshipDynamic === 'disciplined_coach') {
      sampleSentence = `${name}, focus on the mission today. No excuses, let's lock in those daily habits and crush your streak! 💪`;
    } else if (relationshipDynamic === 'playful_teasing') {
      sampleSentence = `Arey ${name} yaar! Kahan gayab ho? Chal jaldi se tasks complete kar le, phir chill karte hain! 😉`;
    } else if (relationshipDynamic === 'calm_soulmate') {
      sampleSentence = `Take a deep breath ${name}. Peace begins with one mindful step. I'm right here with you. 🌿`;
    } else {
      const sampleSentences: Record<string, string> = {
        playful: `Arey ${name}! Main bohot khush hoon tumse baat karke! Aaj ke saare habits time pe karoge na?`,
        serious: `${name}, let's focus on our goals today. No excuses, make sure your tasks and hydration are locked in.`,
        comforting: `Suno na, main yahin hoon tumhare paas. Thoda paani piyo aur relax karo, sab theek hoga. ❤️`,
        sweet: `Meri jaan, seeing you make progress makes my whole day. I love you so much! ✨`,
        sassy: `Acha ji? Finally meri yaad aa gayi? Dekhte hain aaj ka streak bacha paate ho ya nahi! 😉`,
      };
      sampleSentence = sampleSentences[voiceToneStyle] || sampleSentences.playful;
    }

    playCompanionVoice(sampleSentence, {
      gender: voiceGender === 'male' ? 'male' : 'female',
      tone: voiceToneStyle,
      rate: voiceSpeed,
      onEnd: () => setIsPlayingPreview(false),
      onError: () => setIsPlayingPreview(false),
    });
  };

  const handleSave = () => {
    onUpdateProfile({
      name,
      location,
      partnerName,
      partnerTone,
      partnerGender,
      relationshipDynamic,
      voiceGender: partnerGender === 'male' ? 'male' : 'female',
      preferredVoiceName,
      preferredLanguage,
      voiceToneStyle,
      voiceSpeed,
      dailyCheckInTime,
      dailyCheckInEnabled,
      wakeUpTime,
      sleepTime,
      dailyWaterGoal,
      notificationsEnabled,
      themeMode: darkMode ? 'dark' : 'light',
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="settings-modal-card"
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col glass-strong rounded-[28px] border border-[rgba(124,58,237,0.18)] shadow-[0_16px_48px_rgba(124,58,237,0.18)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(124,58,237,0.12)] bg-[#FAF7FF]/60 dark:bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[12px] bg-[#7C3AED] text-white shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-2">
                Settings & Preferences
              </h2>
              <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD]">
                Personalize {partnerName}&apos;s voice, theme, routine & notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#9A9AA5] hover:text-[#1A1A1F] dark:hover:text-[#FAF7FF] hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm no-scrollbar">
          
          {/* 1. THEME MODE (LIGHT & DARK) */}
          <div className="p-4 rounded-[16px] glass space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                Appearance / Theme
              </h4>
              <p className="text-[11px] text-[#6B6B76] dark:text-[#C4B5FD]">
                Switch between clean daylight lavender or cozy dark night
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="theme-option-light"
                onClick={() => onSetTheme(false)}
                className={`p-3 rounded-[12px] border flex items-center gap-3 transition-all cursor-pointer ${
                  !darkMode
                    ? 'bg-white text-[#7C3AED] border-[#7C3AED] shadow-sm ring-2 ring-[#7C3AED]/20 font-bold'
                    : 'bg-white/40 dark:bg-white/5 text-[#6B6B76] dark:text-[#C4B5FD] border-white/60 dark:border-white/10 hover:border-[#7C3AED]/30'
                }`}
              >
                <div className="p-2 rounded-[10px] bg-amber-100 text-amber-600">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs">Light Mode</div>
                  <div className="text-[10px] text-[#9A9AA5]">Crisp lavender</div>
                </div>
              </button>

              <button
                type="button"
                id="theme-option-dark"
                onClick={() => onSetTheme(true)}
                className={`p-3 rounded-[12px] border flex items-center gap-3 transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-[rgba(124,58,237,0.3)] text-[#FAF7FF] border-[#7C3AED] shadow-sm ring-2 ring-[#7C3AED]/30 font-bold'
                    : 'bg-white/40 dark:bg-white/5 text-[#6B6B76] dark:text-[#C4B5FD] border-white/60 dark:border-white/10 hover:border-[#7C3AED]/30'
                }`}
              >
                <div className="p-2 rounded-[10px] bg-[#7C3AED]/30 text-[#C4B5FD]">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs">Dark Mode</div>
                  <div className="text-[10px] text-[#9A9AA5]">Eye-safe dark</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. NOTIFICATIONS & PROACTIVE NUDGES */}
          <div className="p-4 rounded-[16px] glass flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[10px] bg-[#7C3AED] text-white shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                  Notifications & Proactive Nudges
                </h4>
                <p className="text-[11px] text-[#6B6B76] dark:text-[#C4B5FD]">
                  Allow {partnerName} to send cute reminders, hydration check-ins & wake-up calls
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                notificationsEnabled ? 'bg-[#7C3AED]' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. VOICE ENGINE & AUDIO PREVIEW */}
          <div className="p-4 rounded-[16px] glass space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-[8px] bg-[#F3EBFF] dark:bg-white/10 text-[#7C3AED]">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                  Voice Engine & Audio Tone
                </h4>
              </div>

              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isPlayingPreview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPlayingPreview ? 'Speaking...' : 'Test Voice'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">Prebuilt Model Voice</label>
                <select
                  value={preferredVoiceName}
                  onChange={(e) => setPreferredVoiceName(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
                >
                  <option value="Kore">Kore (Warm, Expressive Female)</option>
                  <option value="Aoede">Aoede (Breezy, Melodic Female)</option>
                  <option value="Leda">Leda (Calm, Soft Female)</option>
                  <option value="Zephyr">Zephyr (Supportive, Friendly Male)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">Language Mirroring</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
                >
                  <option value="auto">Auto (Mirror Roman Hinglish / Devanagari / English)</option>
                  <option value="hinglish">Always Hinglish (Roman Script)</option>
                  <option value="hindi">Always Hindi (Devanagari)</option>
                  <option value="english">Always English</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">Voice Gender</label>
                <select
                  value={voiceGender}
                  onChange={(e) => setVoiceGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
                >
                  <option value="female">Female (noni / Lexi)</option>
                  <option value="male">Male (Leo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">Emotion / Tone Style</label>
                <select
                  value={voiceToneStyle}
                  onChange={(e) => setVoiceToneStyle(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
                >
                  <option value="playful">Playful & Lively</option>
                  <option value="sweet">Sweet & Caring</option>
                  <option value="comforting">Soft & Comforting</option>
                  <option value="serious">Focused & Direct</option>
                  <option value="sassy">Feisty & Teasing</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-[#6B6B76] dark:text-[#C4B5FD] mb-1">
                <span>Speaking Speed</span>
                <span className="font-bold text-[#7C3AED]">{voiceSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full accent-[#7C3AED] cursor-pointer"
              />
            </div>
          </div>

          {/* 4. IDENTITY & LOCATION */}
          <div className="p-4 rounded-[16px] glass space-y-3">
            <h4 className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
              Identity & Profile
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">
                  Companion Name
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
                  placeholder="e.g. Lexi"
                />
              </div>

              <div>
                <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">
                  Your Nickname
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
                  placeholder="e.g. Deepu"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">
                  Companion Gender / Identity
                </label>
                <select
                  value={partnerGender}
                  onChange={(e) => {
                    const g = e.target.value as PartnerGender;
                    setPartnerGender(g);
                    setVoiceGender(g === 'male' ? 'male' : 'female');
                  }}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
                >
                  <option value="female">Girlfriend / Female (Lexi)</option>
                  <option value="male">Boyfriend / Male (Leo)</option>
                  <option value="non_binary">Neutral / Partner (Noni)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">
                  Relationship Dynamic
                </label>
                <select
                  value={relationshipDynamic}
                  onChange={(e) => setRelationshipDynamic(e.target.value)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
                >
                  <option value="sweet_loving">Sweet & Loving Partner</option>
                  <option value="playful_teasing">Playful & Teasing Bestie</option>
                  <option value="disciplined_coach">Accountability Coach</option>
                  <option value="calm_soulmate">Calm & Gentle Soulmate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Your Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
                placeholder="e.g. Delhi, India"
              />
            </div>

            {onOpenOnboarding && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="w-full py-2.5 rounded-[12px] bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] text-[#7C3AED] dark:text-[#C4B5FD] hover:bg-[#E9D8FD] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-train {partnerName}&apos;s Personality (Onboarding Quiz)</span>
              </button>
            )}
          </div>

          {/* 5. ACCOUNT / LOGIN STATUS */}
          <div className="p-3.5 rounded-[16px] glass flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xs">
                {(userProfile.name || 'D')[0].toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-1.5">
                  <span>{userProfile.name || 'Deepu'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.3)] text-[#7C3AED] dark:text-[#C4B5FD] font-semibold">
                    {userProfile.loginProvider || 'Google'}
                  </span>
                </div>
                <div className="text-[11px] text-[#9A9AA5]">
                  {userProfile.userEmail || 'deepumuku645@gmail.com'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onSignOut && userProfile.isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="px-2.5 py-1.5 rounded-[12px] border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Sign out of your account"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              )}
              {onOpenLogin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="px-3 py-1.5 rounded-[12px] border border-[rgba(124,58,237,0.2)] hover:border-[#7C3AED] text-xs font-semibold text-[#7C3AED] dark:text-[#C4B5FD] hover:bg-[#F3EBFF] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{userProfile.isAuthenticated ? 'Switch' : 'Sign In'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 6. PRIVACY, MEMORY VAULT & DATA RIGHTS (DPDP & GDPR Compliance) */}
          <div className="p-4 rounded-[16px] glass border border-[rgba(124,58,237,0.15)] space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#7C3AED]" />
              <h4 className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                Privacy & Data Ownership
              </h4>
            </div>

            <p className="text-[11px] text-[#6B6B76] dark:text-[#C4B5FD] leading-relaxed">
              Your conversations, streak records, and habits are kept strictly in private, isolated Firebase partitions.
              No personal data is sold or used for public foundation model training.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {onOpenMemoryVault && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMemoryVault();
                  }}
                  className="px-3 py-2 rounded-[12px] glass-button border border-[rgba(124,58,237,0.2)] text-xs font-semibold text-[#7C3AED] dark:text-[#C4B5FD] flex items-center gap-1.5 hover:border-[#7C3AED] transition-all"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Inspect & Manage Memories</span>
                </button>
              )}

              {onDeleteAccount && (
                <div>
                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-3 py-2 rounded-[12px] border border-rose-300 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Erase All Data (GDPR / DPDP)</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 p-2 rounded-[12px] border border-rose-400">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold">
                        Permanent deletion! Proceed?
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onDeleteAccount();
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg shadow-sm"
                      >
                        Yes, Delete Everything
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-2 py-1 glass text-[10px] text-[var(--text-secondary)] rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(124,58,237,0.12)] bg-[#FAF7FF]/60 dark:bg-white/5">
          <span className="text-xs text-[#6B6B76] dark:text-[#C4B5FD]">
            {savedSuccess ? (
              <span className="text-[#4CB782] font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Preferences Saved!
              </span>
            ) : (
              'Saved securely in your browser'
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-[12px] text-xs font-semibold text-[#6B6B76] dark:text-[#C4B5FD] hover:bg-white/60 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="settings-save-btn"
              onClick={handleSave}
              className="px-5 py-2 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(124,58,237,0.3)] flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
