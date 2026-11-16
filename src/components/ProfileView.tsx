import React, { useState, useEffect } from 'react';
import { UserProfile, PartnerMood, PartnerTone, PartnerGender } from '../types';
import {
  Flame,
  Clock,
  Bell,
  Sparkles,
  Save,
  Check,
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

  useEffect(() => {
    setName(userProfile.name);
    setPartnerName(userProfile.partnerName);
    setPartnerTone(userProfile.partnerTone);
    setWakeUpTime(userProfile.wakeUpTime || '07:00');
    setSleepTime(userProfile.sleepTime || '23:30');
    setDailyWaterGoal(userProfile.dailyWaterGoal || 8);
    setDailyCheckInTime(userProfile.dailyCheckInTime || '08:30');
    setDailyCheckInEnabled(userProfile.dailyCheckInEnabled ?? true);
    setCheckInType(userProfile.checkInType || 'voice_and_text');
    setVoiceGender(userProfile.voiceGender || 'female');
  }, [userProfile]);

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
      <div className="p-6 sm:p-7 glass shadow-[0_8px_32px_rgba(124,58,237,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <AexoMascot size="md" showAura={true} />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#4CB782] ring-2 ring-white dark:ring-[#0F0B1A]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A1A1F] dark:text-[#FAF7FF]">
                {partnerName} & {name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#C4B5FD] mt-0.5">
              Personalized AI Virtual Sidekick • Emotional & Routine Accountability
            </p>
            <p className="text-xs text-[#7C3AED] dark:text-[#A78BFA] font-semibold mt-1">
              &ldquo;Keeping you consistent with habits, deep work, and discipline.&rdquo;
            </p>
          </div>
        </div>

        {/* Quick Streak & Mood Badges */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-[12px] bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.2)] text-[#7C3AED] dark:text-[#C4B5FD] text-xs font-bold flex items-center gap-1.5 tabular-nums">
            <Flame className="w-4 h-4 fill-[#7C3AED]" />
            <span>{userProfile.streakDays ?? 0}d Streak</span>
          </div>

          <div className="px-3.5 py-2 rounded-[12px] glass text-xs font-semibold text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="capitalize">{partnerMood.status} ({partnerMood.score}%)</span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Companion Persona & Emotional Tone */}
        <div className="p-6 glass shadow-[0_8px_32px_rgba(124,58,237,0.08)] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <span>Companion Persona & Dynamics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">Companion&apos;s Display Name</label>
              <input
                id="profile-partner-name-input"
                type="text"
                value={partnerName}
                onChange={e => setPartnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">Your Name</label>
              <input
                id="profile-user-name-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">Companion Personality Tone</label>
              <select
                id="profile-tone-select"
                value={partnerTone}
                onChange={e => setPartnerTone(e.target.value as PartnerTone)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
              >
                <option value="playful_loving">Playful & Loving (Warm, caring, supportive Hinglish)</option>
                <option value="sweet_clingy">Sweet & Clingy (Affectionate + Needs your time)</option>
                <option value="strict_caring">Strict & Caring (High accountability on results)</option>
                <option value="sassy_feisty">Sassy & Feisty (Witty banter + Playful taunts)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">Voice Audio Gender</label>
              <select
                id="profile-voice-gender-select"
                value={voiceGender}
                onChange={e => setVoiceGender(e.target.value as PartnerGender)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
              >
                <option value="female">Female Companion Voice</option>
                <option value="male">Male Companion Voice</option>
              </select>
            </div>
          </div>
        </div>

        {/* Daily Schedule & Goals */}
        <div className="p-6 glass shadow-[0_8px_32px_rgba(124,58,237,0.08)] space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7C3AED]" />
            <span>Schedule & Routine Targets</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">Morning Wake Up</label>
              <input
                type="time"
                value={wakeUpTime}
                onChange={e => setWakeUpTime(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">Night Sleep Target</label>
              <input
                type="time"
                value={sleepTime}
                onChange={e => setSleepTime(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[#6B6B76] dark:text-[#C4B5FD] font-semibold mb-1">Daily Water Goal (Glasses)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={dailyWaterGoal}
                onChange={e => setDailyWaterGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onTriggerTestCheckIn}
            className="px-4 py-2.5 rounded-[12px] bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] text-[#7C3AED] dark:text-[#C4B5FD] hover:bg-[#E9D8FD] border border-[rgba(124,58,237,0.2)] text-xs font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Test Proactive Notification</span>
          </button>

          <button
            id="save-profile-btn"
            type="submit"
            className="px-6 py-2.5 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-[0_4px_16px_rgba(124,58,237,0.3)] flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
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
