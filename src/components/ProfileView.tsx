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
    <div className="w-full max-w-[900px] mx-auto space-y-5 pb-14 select-none animate-in fade-in duration-300">
      
      {/* Profile Header Bar */}
      <div className="p-5 glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="shrink-0">
            <AexoMascot size="md" showAura={true} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.025em] text-[#14121C] dark:text-[#F8F7FC]">
                {partnerName} &amp; {name}
              </h2>
            </div>
            <p className="text-[12.5px] text-[#534E68] dark:text-[#C5BED9] mt-0.5">
              Personalized AI Companion · Routine &amp; Habit Accountability
            </p>
            <p className="text-xs italic text-[#7C3AED] dark:text-[#C4B5FD] mt-1">
              &ldquo;Keeping you consistent with habits, deep work, and discipline.&rdquo;
            </p>
          </div>
        </div>

        {/* Quick Streak & Mood Metrics */}
        <div className="flex items-center gap-2 font-mono">
          <div className="px-3 py-1.5 rounded-full glass text-[#7C3AED] dark:text-[#E9D5FF] text-xs font-bold flex items-center gap-1.5 tabular-nums">
            <Flame className="w-3.5 h-3.5 text-[#A855F7] fill-[#A855F7]" />
            <span>{userProfile.streakDays ?? 0}d</span>
          </div>

          <div className="px-3 py-1.5 rounded-full glass text-xs font-semibold text-[#14121C] dark:text-[#F8F7FC] flex items-center gap-1.5 tabular-nums">
            <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
            <span className="capitalize">{partnerMood.status} · {partnerMood.score}%</span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Companion Persona & Emotional Tone */}
        <div className="p-5 glass space-y-3.5">
          <h3 className="font-display text-[15px] font-bold tracking-[-0.015em] text-[#14121C] dark:text-[#F8F7FC] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A855F7]" />
            <span>Companion Persona &amp; Dynamics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">Companion&apos;s Display Name</label>
              <input
                id="profile-partner-name-input"
                type="text"
                value={partnerName}
                onChange={e => setPartnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">Your Name</label>
              <input
                id="profile-user-name-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">Companion Personality Tone</label>
              <select
                id="profile-tone-select"
                value={partnerTone}
                onChange={e => setPartnerTone(e.target.value as PartnerTone)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
              >
                <option value="playful_loving">Playful & Loving (Warm, caring, supportive Hinglish)</option>
                <option value="sweet_clingy">Sweet & Clingy (Affectionate + Needs your time)</option>
                <option value="strict_caring">Strict & Caring (High accountability on results)</option>
                <option value="sassy_feisty">Sassy & Feisty (Witty banter + Playful taunts)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">Voice Audio Gender</label>
              <select
                id="profile-voice-gender-select"
                value={voiceGender}
                onChange={e => setVoiceGender(e.target.value as PartnerGender)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
              >
                <option value="female">Female Companion Voice</option>
                <option value="male">Male Companion Voice</option>
              </select>
            </div>
          </div>
        </div>

        {/* Daily Schedule & Goals */}
        <div className="p-5 glass space-y-3.5">
          <h3 className="font-display text-[15px] font-bold tracking-[-0.015em] text-[#14121C] dark:text-[#F8F7FC] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#A855F7]" />
            <span>Schedule &amp; Routine Targets</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">Morning Wake Up</label>
              <input
                type="time"
                value={wakeUpTime}
                onChange={e => setWakeUpTime(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">Night Sleep Target</label>
              <input
                type="time"
                value={sleepTime}
                onChange={e => setSleepTime(e.target.value)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[#534E68] dark:text-[#C5BED9] font-semibold mb-1">Daily Water Goal (Glasses)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={dailyWaterGoal}
                onChange={e => setDailyWaterGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onTriggerTestCheckIn}
            className="glass-button px-4 py-2.5 rounded-[12px] text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Test Proactive Notification</span>
          </button>

          <button
            id="save-profile-btn"
            type="submit"
            className="btn-primary-purple px-6 py-2.5 rounded-[12px] text-xs font-bold flex items-center gap-2"
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
