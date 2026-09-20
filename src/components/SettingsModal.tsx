import React, { useState } from 'react';
import { UserProfile, PartnerTone, PartnerGender } from '../types';
import {
  Settings,
  X,
  Volume2,
  Sparkles,
  Heart,
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
  User,
  LogOut,
  RefreshCw
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
}) => {
  const [name, setName] = useState(userProfile.name || 'Deepu');
  const [location, setLocation] = useState(userProfile.location || 'Delhi, India');
  const [partnerName, setPartnerName] = useState(userProfile.partnerName || 'Lexi');
  const [partnerTone, setPartnerTone] = useState<PartnerTone>(userProfile.partnerTone || 'playful_loving');
  const [partnerGender, setPartnerGender] = useState<PartnerGender>(userProfile.partnerGender || 'female');
  const [voiceGender, setVoiceGender] = useState<PartnerGender>(userProfile.voiceGender || 'female');

  // Dedicated Voice Settings
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

  if (!isOpen) return null;

  const handleTestVoice = () => {
    setIsPlayingPreview(true);
    const sampleSentences: Record<string, string> = {
      playful: `Hey ${name}! I'm all charged up and ready to tease you today! Have you finished your habits yet?`,
      serious: `${name}, let's focus on our goals today. No excuses, make sure your tasks and hydration are locked in.`,
      comforting: `Hey love, I'm right here with you. Take a deep breath, everything is going to be wonderful.`,
      sweet: `Meri jaan, I'm so happy whenever I hear your voice. Drink some water and take good care of yourself!`,
      sassy: `Acha ji? So you finally remembered to open our app today? Let's see if you can actually keep up your streak!`,
    };

    playCompanionVoice(sampleSentences[voiceToneStyle] || sampleSentences.playful, {
      gender: voiceGender,
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
      voiceGender,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="settings-modal-card"
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-[#151124] rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 dark:border-purple-900/30 bg-purple-50/40 dark:bg-purple-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Settings & Preferences
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Personalize {partnerName}'s voice, theme, routine & notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
          
          {/* 1. THEME MODE (LIGHT & DARK) */}
          <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Appearance / Theme
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Switch between clean daylight or cozy night atmosphere
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="theme-option-light"
                onClick={() => onSetTheme(false)}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  !darkMode
                    ? 'bg-white text-purple-700 border-purple-400 shadow-sm ring-2 ring-purple-400/20'
                    : 'bg-white/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs">Light Mode</div>
                  <div className="text-[10px] text-zinc-400">Crisp & bright</div>
                </div>
              </button>

              <button
                type="button"
                id="theme-option-dark"
                onClick={() => onSetTheme(true)}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                  darkMode
                    ? 'bg-purple-950/60 text-purple-300 border-purple-500 shadow-sm ring-2 ring-purple-500/20'
                    : 'bg-white/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-900/60 text-purple-300">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs">Dark Mode</div>
                  <div className="text-[10px] text-zinc-400">Atmospheric & eye-safe</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. NOTIFICATIONS & PROACTIVE NUDGES */}
          <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Notifications & Proactive Nudges
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Allow {partnerName} to send cute reminders, hydration check-ins & wake-up calls
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* 3. DEDICATED VOICE SETTINGS PANEL */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 to-violet-50/40 dark:from-purple-950/40 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Companion Voice & Tone
                </h3>
              </div>

              {/* Test Voice Sample Button */}
              <button
                id="test-voice-btn"
                onClick={handleTestVoice}
                disabled={isPlayingPreview}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all ${
                  isPlayingPreview
                    ? 'bg-purple-400 text-white animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isPlayingPreview ? 'Speaking...' : 'Test Voice'}</span>
              </button>
            </div>

            {/* Voice Tone Selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Companion Voice Tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'playful', label: 'Playful', desc: 'Witty, upbeat & teasing' },
                  { key: 'serious', label: 'Serious', desc: 'Direct, focused & disciplined' },
                  { key: 'comforting', label: 'Comforting', desc: 'Gentle, soft & empathetic' },
                  { key: 'sweet', label: 'Sweet', desc: 'Loving, tender & caring' },
                  { key: 'sassy', label: 'Sassy', desc: 'Spicy banter & feisty nakhre' },
                ].map((tone) => (
                  <button
                    key={tone.key}
                    type="button"
                    onClick={() => setVoiceToneStyle(tone.key as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      voiceToneStyle === tone.key
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white dark:bg-[#1A1428] text-zinc-700 dark:text-zinc-300 border-purple-100 dark:border-purple-900/40 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{tone.label}</div>
                    <div className={`text-[10px] mt-0.5 ${voiceToneStyle === tone.key ? 'text-purple-100' : 'text-zinc-400'}`}>
                      {tone.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Playback Speed Controller */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-purple-600" />
                  <span>Playback Speed</span>
                </label>
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                  {voiceSpeed.toFixed(1)}x
                </span>
              </div>

              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />

              <div className="flex items-center justify-between mt-2 gap-1.5">
                {[
                  { speed: 0.8, label: '0.8x Slow' },
                  { speed: 1.0, label: '1.0x Normal' },
                  { speed: 1.2, label: '1.2x Lively' },
                  { speed: 1.5, label: '1.5x Fast' },
                ].map((preset) => (
                  <button
                    key={preset.speed}
                    type="button"
                    onClick={() => setVoiceSpeed(preset.speed)}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                      Math.abs(voiceSpeed - preset.speed) < 0.05
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-[#1A1428] text-zinc-600 dark:text-zinc-400 border border-purple-100 dark:border-purple-900/30'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. USER IDENTITY & COMPANION CUSTOMIZATION */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Identity & Customization</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Companion Name (Default Lexi)
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-hidden"
                  placeholder="e.g. Lexi"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Your Nickname
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-hidden"
                  placeholder="e.g. Deepu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Your Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-hidden"
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
                className="w-full py-2.5 rounded-xl bg-purple-100/60 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-train {partnerName}'s Personality (Onboarding Quiz)</span>
              </button>
            )}
          </div>

          {/* 5. ACCOUNT / LOGIN STATUS */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                {(userProfile.name || 'D')[0].toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>{userProfile.name || 'Deepu'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">
                    {userProfile.loginProvider || 'Google'}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
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
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-1"
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
                  className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-purple-400 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-purple-600 transition-colors flex items-center gap-1"
                >
                  <span>{userProfile.isAuthenticated ? 'Switch' : 'Sign In'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-purple-100 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-950/20">
          <span className="text-xs text-zinc-500">
            {savedSuccess ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Preferences Saved!
              </span>
            ) : (
              'Saved securely in your browser'
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              id="settings-save-btn"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
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
