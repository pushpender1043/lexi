import React, { useState, useEffect } from 'react';
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
import { playCompanionVoice, stopCompanionVoice } from '../utils/speech';

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

  useEffect(() => {
    if (!isOpen) {
      stopCompanionVoice();
      setIsPlayingPreview(false);
      setConfirmDelete(false);
      return;
    }
    setName(userProfile.name || 'Deepu');
    setLocation(userProfile.location || 'Delhi, India');
    setPartnerName(userProfile.partnerName || 'Lexi');
    setPartnerTone(userProfile.partnerTone || 'playful_loving');
    setPartnerGender(userProfile.partnerGender || 'female');
    setVoiceGender(userProfile.voiceGender || 'female');
    setRelationshipDynamic(userProfile.relationshipDynamic || 'sweet_loving');
    setPreferredVoiceName(userProfile.preferredVoiceName || 'Kore');
    setPreferredLanguage(userProfile.preferredLanguage || 'auto');
    setVoiceToneStyle(userProfile.voiceToneStyle || 'playful');
    setVoiceSpeed(userProfile.voiceSpeed || 1.0);
    setDailyCheckInTime(userProfile.dailyCheckInTime || '08:30');
    setDailyCheckInEnabled(userProfile.dailyCheckInEnabled !== undefined ? userProfile.dailyCheckInEnabled : true);
    setWakeUpTime(userProfile.wakeUpTime || '07:00');
    setSleepTime(userProfile.sleepTime || '23:30');
    setDailyWaterGoal(userProfile.dailyWaterGoal || 8);
    setNotificationsEnabled(userProfile.notificationsEnabled !== undefined ? userProfile.notificationsEnabled : true);
    setConfirmDelete(false);
  }, [isOpen, userProfile]);

  useEffect(() => {
    return () => {
      stopCompanionVoice();
    };
  }, []);

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
      gender: voiceGender,
      preferredVoiceName,
      tone: voiceToneStyle,
      rate: voiceSpeed,
      useGeminiTts: true,
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
      voiceGender,
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 dark:bg-black/78 backdrop-blur-lg animate-in fade-in duration-200">
      <div
        id="settings-modal-card"
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col glass-strong rounded-[28px] border border-white/60 dark:border-white/20 shadow-[0_24px_64px_rgba(0,0,0,0.65)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/[0.12] bg-white/40 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[12px] bg-gradient-to-br from-[#A855F7] to-[#7C3AED] text-white shadow-[0_6px_18px_rgba(168,85,247,0.4)] border border-white/25">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#14121C] dark:text-[#F8F7FC] flex items-center gap-2">
                Settings &amp; Preferences
              </h2>
              <p className="text-xs text-[#534E68] dark:text-[#C5BED9]">
                Personalize {partnerName}&apos;s voice, theme, routine &amp; notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7C7692] dark:text-[#938CA8] hover:text-[#14121C] dark:hover:text-[#F8F7FC] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm no-scrollbar">
          
          {/* 1. THEME MODE (LIGHT & DARK) */}
          <div className="p-4 rounded-[20px] bg-white/60 dark:bg-white/[0.045] border border-white/60 dark:border-white/[0.12] space-y-3">
            <div>
              <h4 className="text-xs font-bold text-[#14121C] dark:text-[#F8F7FC]">
                Appearance / Theme
              </h4>
              <p className="text-[11px] text-[#534E68] dark:text-[#C5BED9]">
                Switch between clean daylight lavender or smoked obsidian glass
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="theme-option-light"
                onClick={() => onSetTheme(false)}
                className={`p-3 rounded-[14px] border flex items-center gap-3 transition-all cursor-pointer ${
                  !darkMode
                    ? 'bg-white text-[#6D28D9] border-[#896ABD] shadow-sm ring-2 ring-[#A855F7]/25 font-bold'
                    : 'bg-white/40 dark:bg-white/[0.04] text-[#534E68] dark:text-[#C5BED9] border-white/60 dark:border-white/[0.12] hover:border-[#A855F7]/40'
                }`}
              >
                <div className="p-2 rounded-[10px] bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-400/20">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs">Light Mode</div>
                  <div className="text-[10px] text-[#7C7692] dark:text-[#938CA8]">Crisp lavender</div>
                </div>
              </button>

              <button
                type="button"
                id="theme-option-dark"
                onClick={() => onSetTheme(true)}
                className={`p-3 rounded-[14px] border flex items-center gap-3 transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-[#A855F7]/20 text-[#F8F7FC] border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.25)] ring-2 ring-[#A855F7]/30 font-bold'
                    : 'bg-white/40 dark:bg-white/[0.04] text-[#534E68] dark:text-[#C5BED9] border-white/60 dark:border-white/[0.12] hover:border-[#A855F7]/40'
                }`}
              >
                <div className="p-2 rounded-[10px] bg-[#A855F7]/25 text-[#D8B4FE] border border-[#A855F7]/30">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs">Dark Mode</div>
                  <div className="text-[10px] text-[#7C7692] dark:text-[#938CA8]">Smoked obsidian</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. NOTIFICATIONS & PROACTIVE NUDGES */}
          <div className="p-4 rounded-[20px] bg-white/60 dark:bg-white/[0.045] border border-white/60 dark:border-white/[0.12] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[10px] bg-gradient-to-br from-[#A855F7] to-[#7C3AED] text-white shadow-xs border border-white/25">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#14121C] dark:text-[#F8F7FC]">
                  Notifications &amp; Proactive Nudges
                </h4>
                <p className="text-[11px] text-[#534E68] dark:text-[#C5BED9]">
                  Allow {partnerName} to send cute reminders, hydration check-ins &amp; wake-up calls
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 border border-white/15 ${
                notificationsEnabled ? 'bg-[#A855F7] shadow-[0_0_12px_rgba(168,85,247,0.45)]' : 'bg-zinc-300 dark:bg-white/15'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. VOICE ENGINE & AUDIO PREVIEW */}
          <div className="p-4 rounded-[20px] bg-white/60 dark:bg-white/[0.045] border border-white/60 dark:border-white/[0.12] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-[8px] bg-[#F3EBFF] dark:bg-white/[0.08] text-[#7C3AED] dark:text-[#C4B5FD] border border-white/60 dark:border-white/[0.12]">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#14121C] dark:text-[#F8F7FC]">
                  Voice Engine &amp; Audio Tone
                </h4>
              </div>

              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isPlayingPreview}
                className="btn-primary-purple flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-semibold disabled:opacity-60"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPlayingPreview ? 'Speaking...' : 'Test Voice'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">Prebuilt Model Voice</label>
                <select
                  value={preferredVoiceName}
                  onChange={(e) => setPreferredVoiceName(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                >
                  <option value="Kore">Kore (Warm, Expressive Female)</option>
                  <option value="Aoede">Aoede (Breezy, Melodic Female)</option>
                  <option value="Leda">Leda (Calm, Soft Female)</option>
                  <option value="Zephyr">Zephyr (Supportive, Friendly Male)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">Language Mirroring</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
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
                <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">Voice Gender</label>
                <select
                  value={voiceGender}
                  onChange={(e) => setVoiceGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                >
                  <option value="female">Female (noni / Lexi)</option>
                  <option value="male">Male (Leo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">Emotion / Tone Style</label>
                <select
                  value={voiceToneStyle}
                  onChange={(e) => setVoiceToneStyle(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                >
                  <option value="playful">Playful &amp; Lively</option>
                  <option value="sweet">Sweet &amp; Caring</option>
                  <option value="comforting">Soft &amp; Comforting</option>
                  <option value="serious">Focused &amp; Direct</option>
                  <option value="sassy">Feisty &amp; Teasing</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-[#534E68] dark:text-[#C5BED9] mb-1">
                <span>Speaking Speed</span>
                <span className="font-bold text-[#7C3AED] dark:text-[#C4B5FD] tabular-nums">{voiceSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full accent-[#A855F7] cursor-pointer"
              />
            </div>
          </div>

          {/* 4. IDENTITY & LOCATION */}
          <div className="p-4 rounded-[20px] bg-white/60 dark:bg-white/[0.045] border border-white/60 dark:border-white/[0.12] space-y-3">
            <h4 className="text-xs font-bold text-[#14121C] dark:text-[#F8F7FC]">
              Identity &amp; Profile
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">
                  Companion Name
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                  placeholder="e.g. Lexi"
                />
              </div>

              <div>
                <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">
                  Your Nickname
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                  placeholder="e.g. Deepu"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">
                  Companion Gender / Identity
                </label>
                <select
                  value={partnerGender}
                  onChange={(e) => {
                    const g = e.target.value as PartnerGender;
                    setPartnerGender(g);
                    setVoiceGender(g === 'male' ? 'male' : 'female');
                  }}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                >
                  <option value="female">Girlfriend / Female (Lexi)</option>
                  <option value="male">Boyfriend / Male (Leo)</option>
                  <option value="non_binary">Neutral / Partner (Noni)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">
                  Relationship Dynamic
                </label>
                <select
                  value={relationshipDynamic}
                  onChange={(e) => setRelationshipDynamic(e.target.value)}
                  className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                >
                  <option value="sweet_loving">Sweet &amp; Loving Partner</option>
                  <option value="playful_teasing">Playful &amp; Teasing Bestie</option>
                  <option value="disciplined_coach">Accountability Coach</option>
                  <option value="calm_soulmate">Calm &amp; Gentle Soulmate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#A855F7]" />
                <span>Your Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
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
                className="w-full py-2.5 rounded-[12px] glass-button font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-train {partnerName}&apos;s Personality (Onboarding Quiz)</span>
              </button>
            )}
          </div>

          {/* 5. ACCOUNT / LOGIN STATUS */}
          <div className="p-3.5 rounded-[20px] bg-white/60 dark:bg-white/[0.045] border border-white/60 dark:border-white/[0.12] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A855F7] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {(userProfile.name || 'D')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#14121C] dark:text-[#F8F7FC] flex items-center gap-1.5">
                  <span className="truncate">{userProfile.name || 'Deepu'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F3EBFF] dark:bg-[#A855F7]/20 text-[#6D28D9] dark:text-[#D8B4FE] font-semibold border border-[#A855F7]/20">
                    {userProfile.loginProvider || 'Google'}
                  </span>
                </div>
                <div className="text-[11px] text-[#7C7692] dark:text-[#938CA8] truncate">
                  {userProfile.userEmail || 'deepumuku645@gmail.com'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {onSignOut && userProfile.isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="px-2.5 py-1.5 rounded-[12px] border border-rose-300/60 dark:border-rose-400/25 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
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
                  className="glass-button px-3 py-1.5 rounded-[12px] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>{userProfile.isAuthenticated ? 'Switch' : 'Sign In'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 6. PRIVACY, MEMORY VAULT & DATA RIGHTS (DPDP & GDPR Compliance) */}
          <div className="p-4 rounded-[20px] bg-white/60 dark:bg-white/[0.045] border border-white/60 dark:border-white/[0.12] space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#A855F7]" />
              <h4 className="text-xs font-bold text-[#14121C] dark:text-[#F8F7FC]">
                Privacy &amp; Data Ownership
              </h4>
            </div>

            <p className="text-[11px] text-[#534E68] dark:text-[#C5BED9] leading-relaxed">
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
                  className="px-3 py-2 rounded-[12px] glass-button text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Inspect &amp; Manage Memories</span>
                </button>
              )}

              {onDeleteAccount && (
                <div>
                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-3 py-2 rounded-[12px] border border-rose-300/60 dark:border-rose-400/25 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-300 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Erase All Data (GDPR / DPDP)</span>
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 bg-rose-500/15 p-2 rounded-[12px] border border-rose-400/40">
                      <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-300 shrink-0" />
                      <span className="text-[11px] text-rose-700 dark:text-rose-200 font-semibold">
                        Permanent deletion! Proceed?
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onDeleteAccount();
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg shadow-sm cursor-pointer"
                      >
                        Yes, Delete Everything
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-2 py-1 glass-button text-[10px] rounded-lg cursor-pointer"
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/5 dark:border-white/[0.12] bg-white/40 dark:bg-white/[0.03]">
          <span className="text-xs text-[#534E68] dark:text-[#C5BED9]">
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
              className="glass-button px-4 py-2 rounded-[12px] text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="settings-save-btn"
              onClick={handleSave}
              className="btn-primary-purple px-5 py-2 rounded-[12px] font-semibold text-xs flex items-center gap-1.5"
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
