import React, { useState } from 'react';
import { UserProfile, PartnerMood, PartnerTone, PartnerGender } from '../types';
import {
  User,
  Heart,
  Smile,
  Flame,
  Clock,
  Droplet,
  Volume2,
  Bell,
  Sparkles,
  Save,
  Check,
  ShieldCheck,
  Zap,
  Play,
  Settings,
  Edit3
} from 'lucide-react';
import { AexoMascot } from './AexoMascot';

interface ProfileViewProps {
  userProfile: UserProfile;
  partnerMood: PartnerMood;
  onSaveProfile: (updated: Partial<UserProfile>) => void;
  onTriggerTestCheckIn: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  partnerMood,
  onSaveProfile,
  onTriggerTestCheckIn,
  voiceEnabled,
  onToggleVoice,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [partnerName, setPartnerName] = useState(userProfile.partnerName);
  const [partnerTone, setPartnerTone] = useState<PartnerTone>(userProfile.partnerTone);
  const [wakeUpTime, setWakeUpTime] = useState(userProfile.wakeUpTime || '07:00');
  const [sleepTime, setSleepTime] = useState(userProfile.sleepTime || '23:30');
  const [dailyWaterGoal, setDailyWaterGoal] = useState(userProfile.dailyWaterGoal || 8);
  const [dailyCheckInTime, setDailyCheckInTime] = useState(userProfile.dailyCheckInTime || '08:30');
  const [dailyCheckInEnabled, setDailyCheckInEnabled] = useState(userProfile.dailyCheckInEnabled ?? true);
  const [checkInType, setCheckInType] = useState(userProfile.checkInType || 'voice_and_text');
  const [voiceGender, setVoiceGender] = useState<PartnerGender>(userProfile.voiceGender || 'female');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      partnerName,
      partnerTone,
      wakeUpTime,
      sleepTime,
      dailyWaterGoal: Number(dailyWaterGoal),
      dailyCheckInTime,
      dailyCheckInEnabled,
      checkInType,
      voiceGender,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-14 select-none animate-in fade-in duration-300">
      
      {/* Profile Header Bar */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-[#161224]/90 border border-purple-100 dark:border-purple-900/30 shadow-[0_4px_24px_-4px_rgba(124,58,237,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <AexoMascot size="md" showAura={true} />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#161224]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1E1838] dark:text-[#F1EEF9]">
                {partnerName} & {name}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold">
                Synced
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Personalized AI Virtual Sidekick • Emotional & Routine Accountability
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
              "Keeping you consistent with habits, deep work, and discipline."
            </p>
          </div>
        </div>

        {/* Quick Streak & Mood Badges */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/40 text-purple-900 dark:text-purple-200 text-xs font-semibold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-purple-600 fill-purple-600" />
            <span>{userProfile.streakDays}d Streak</span>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-purple-50/80 dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span className="capitalize">{partnerMood.status} ({partnerMood.score}%)</span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Companion Persona & Emotional Tone */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-[#161224]/90 border border-purple-100 dark:border-purple-900/30 shadow-[0_4px_24px_-4px_rgba(124,58,237,0.06)] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Companion Persona & Dynamics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1">Companion's Display Name</label>
              <input
                id="profile-partner-name-input"
                type="text"
                value={partnerName}
                onChange={e => setPartnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1">Your Name</label>
              <input
                id="profile-user-name-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1">Companion Personality Tone</label>
              <select
                id="profile-tone-select"
                value={partnerTone}
                onChange={e => setPartnerTone(e.target.value as PartnerTone)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              >
                <option value="playful_loving">Playful & Loving (Warm, caring, supportive Hinglish)</option>
                <option value="sweet_clingy">Sweet & Clingy (Affectionate + Needs your time)</option>
                <option value="strict_caring">Strict & Caring (High accountability on results)</option>
                <option value="sassy_feisty">Sassy & Feisty (Witty banter + Playful taunts)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1">Voice Audio Gender</label>
              <select
                id="profile-voice-gender-select"
                value={voiceGender}
                onChange={e => setVoiceGender(e.target.value as PartnerGender)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              >
                <option value="female">Female Companion Voice</option>
                <option value="male">Male Companion Voice</option>
              </select>
            </div>
          </div>
        </div>

        {/* Daily Schedule & Goals */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-[#161224]/90 border border-purple-100 dark:border-purple-900/30 shadow-[0_4px_24px_-4px_rgba(124,58,237,0.06)] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Schedule & Routine Targets</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1">Morning Wake Up</label>
              <input
                type="time"
                value={wakeUpTime}
                onChange={e => setWakeUpTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1">Night Sleep Target</label>
              <input
                type="time"
                value={sleepTime}
                onChange={e => setSleepTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1">Daily Water Goal (Glasses)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={dailyWaterGoal}
                onChange={e => setDailyWaterGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onTriggerTestCheckIn}
            className="px-4 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200/80 dark:border-purple-800/40 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <Bell className="w-4 h-4" />
            <span>Test Proactive Notification</span>
          </button>

          <button
            id="save-profile-btn"
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 flex items-center gap-2 transition-transform active:scale-95"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
