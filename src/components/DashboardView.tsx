import React, { useState, useMemo } from 'react';
import { UserProfile, Habit, PartnerMood } from '../types';
import { HabitLogEntry, getTodayDateString, getWeekDaysForDate } from '../utils/streak';
import { GlassCard, GlassButton, ProgressRing } from './ui';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import {
  Flame,
  Phone,
  CheckCircle2,
  Circle,
  Droplets,
  Plus,
  MessageSquare,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Check,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

interface DashboardViewProps {
  userProfile: UserProfile;
  partnerMood?: PartnerMood;
  habits: Habit[];
  habitLogs?: Record<string, HabitLogEntry>;
  waterLogs?: Record<string, number>;
  onToggleHabit?: (id: string) => void;
  onAddWater?: (amountMl: number) => void;
  onSendMessage: (text: string) => void;
  onStartCall: () => void;
  onSelectAction?: (actionTitle: string) => void;
  onNavigateTab?: (tab: 'chat' | 'todos' | 'calls' | 'profile' | 'stats' | 'sync') => void;
  onOpenMoodDetails?: () => void;
}

const DAILY_AFFIRMATIONS = [
  "You don't have to carry everything all at once. Take a deep breath—I'm with you.",
  "Every small habit you complete today shapes your future. Let's make today count!",
  "Hydrate, stretch your shoulders, and smile. Your wellness comes first.",
  "Consistency beats intensity. One win at a time, darling.",
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  partnerMood,
  habits,
  habitLogs = {},
  waterLogs = {},
  onToggleHabit,
  onAddWater,
  onSendMessage,
  onStartCall,
  onNavigateTab,
  onOpenMoodDetails,
}) => {
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [waterLoggedFeedback, setWaterLoggedFeedback] = useState(false);

  const completedCount = habits.filter((h) => h.completed).length;
  const totalHabits = habits.length;
  const habitPercentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  const userName = userProfile.name || 'Friend';
  const companionName = userProfile.partnerName || 'Lexi';
  const streakDays = userProfile.streakDays || 0;
  const bestStreak = userProfile.bestStreak || streakDays;

  const todayStr = useMemo(() => getTodayDateString(userProfile.timeZone), [userProfile.timeZone]);
  const weekDays = useMemo(() => getWeekDaysForDate(todayStr, habitLogs), [todayStr, habitLogs]);

  // Real water intake for today from Firestore waterLogs
  const todayWaterMl = waterLogs[todayStr] ?? 0;
  const waterTargetMl = 2500;
  const waterPercentage = Math.min(100, Math.round((todayWaterMl / waterTargetMl) * 100));

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickAddWater = () => {
    const waterHabit = habits.find(
      (h) =>
        h.category === 'hydration' ||
        h.title.toLowerCase().includes('water') ||
        h.title.toLowerCase().includes('paani')
    );
    if (waterHabit && onToggleHabit && !waterHabit.completed) {
      onToggleHabit(waterHabit.id);
    }

    if (onAddWater) {
      onAddWater(250);
    }

    setWaterLoggedFeedback(true);
    setTimeout(() => setWaterLoggedFeedback(false), 2000);

    try {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.75 },
        colors: ['#38BDF8', '#7C3AED', '#4CB782'],
      });
    } catch {}

    onSendMessage(`Just drank 250ml of water! Staying fresh and hydrated 💧`);
  };

  const handleToggleHabitWithBurst = (id: string) => {
    if (onToggleHabit) {
      onToggleHabit(id);
      const isTargetHabit = habits.find((h) => h.id === id);
      if (isTargetHabit && !isTargetHabit.completed) {
        try {
          confetti({
            particleCount: 30,
            spread: 55,
            origin: { y: 0.7 },
            colors: ['#4CB782', '#7C3AED', '#A78BFA'],
          });
        } catch {}
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-20 md:pb-12 select-none">
      
      {/* 1. Hero Greeting with Time-Aware Subtext */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 sm:pt-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1F] dark:text-[#FAF7FF]">
            {getGreeting()},{' '}
            <span className="text-[#7C3AED] dark:text-[#A78BFA]">{userName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#9A9AA5] mt-0.5">
            {streakDays > 0
              ? `You're on a ${streakDays}-day streak. Keep your momentum going today!`
              : `Start your daily streak today. Let's make every habit count!`}
          </p>
        </div>

        {/* Hero Quick Action */}
        <div className="flex items-center gap-2">
          <GlassButton
            variant="primary"
            size="md"
            onClick={onStartCall}
          >
            <Phone className="w-4 h-4" />
            <span>Call {companionName}</span>
          </GlassButton>
        </div>
      </motion.div>

      {/* 2. Responsive Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card A: Daily Streak with Real Week Days Strip */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white flex items-center justify-center shadow-md shadow-[#7C3AED]/25">
                  <Flame className="w-5 h-5 fill-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                    Daily Streak
                  </h3>
                  <span className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5]">
                    Consistent habit momentum
                  </span>
                </div>
              </div>
              <span className="text-xl font-extrabold text-[#7C3AED] dark:text-[#A78BFA] font-mono tabular-nums">
                {streakDays}d
              </span>
            </div>

            {/* 7-Day Rhythm Circles (Calculated from Firestore habitLogs) */}
            <div className="grid grid-cols-7 gap-1.5 py-2">
              {weekDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center py-2 rounded-xl text-center transition-all ${
                    day.isToday
                      ? 'bg-[#7C3AED] text-white shadow-sm shadow-[#7C3AED]/30 ring-2 ring-[#A78BFA]/40'
                      : day.completed
                      ? 'bg-[#4CB782]/15 text-[#4CB782]'
                      : 'bg-black/5 dark:bg-white/5 text-[#9A9AA5]'
                  }`}
                >
                  <span className="text-[10px] font-bold">{day.label}</span>
                  <div className="my-1">
                    {day.completed ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 block" />
                    )}
                  </div>
                  <span className="text-[9px] opacity-80">
                    {day.isToday ? 'Today' : day.completed ? 'Done' : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[rgba(124,58,237,0.1)] flex items-center justify-between text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
            <span>Best record: {bestStreak} {bestStreak === 1 ? 'day' : 'days'}</span>
            <span className={streakDays > 0 ? "text-[#4CB782] font-semibold" : "text-[#9A9AA5]"}>
              {streakDays > 0 ? 'Active Streak' : 'Pending Today'}
            </span>
          </div>
        </GlassCard>

        {/* Card B: Today's Habits with Circular Progress Ring */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#4CB782]" />
                <h3 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                  Today&apos;s Habits
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab?.('todos')}
                className="text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer"
              >
                {totalHabits > 0 ? 'Manage' : '+ Add'}
              </button>
            </div>

            {totalHabits === 0 ? (
              <div className="py-6 px-2 text-center flex flex-col items-center justify-center space-y-2">
                <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
                  No habits added yet.
                </p>
                <button
                  onClick={() => onNavigateTab?.('todos')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create First Habit</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 py-2">
                  <ProgressRing progress={habitPercentage} size={68} strokeWidth={6}>
                    <span className="text-xs font-bold font-mono text-[#1A1A1F] dark:text-[#FAF7FF] tabular-nums">
                      {completedCount}/{totalHabits}
                    </span>
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                      {habitPercentage}% Completed
                    </div>
                    <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] truncate">
                      {completedCount === totalHabits
                        ? '🎉 All habits completed for today!'
                        : `${totalHabits - completedCount} habits left to check off`}
                    </p>
                  </div>
                </div>

                {/* Quick mini habit toggles */}
                <div className="space-y-1.5 mt-2">
                  {habits.slice(0, 3).map((habit) => (
                    <div
                      key={habit.id}
                      onClick={() => handleToggleHabitWithBurst(habit.id)}
                      className={`px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                        habit.completed
                          ? 'bg-[#4CB782]/10 text-[#4CB782]'
                          : 'bg-black/5 dark:bg-white/5 hover:bg-[#F3EBFF] dark:hover:bg-white/10 text-[#1A1A1F] dark:text-[#FAF7FF]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {habit.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#4CB782] shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#9A9AA5] shrink-0" />
                        )}
                        <span className={`truncate font-medium ${habit.completed ? 'line-through opacity-70' : ''}`}>
                          {habit.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#9A9AA5] font-mono shrink-0">
                        {habit.scheduledTime}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </GlassCard>

        {/* Card C: Water Tracker with Real Firestore Water Log */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky-500" />
                <h3 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                  Hydration Tracker
                </h3>
              </div>
              <button
                onClick={handleQuickAddWater}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  waterLoggedFeedback
                    ? 'bg-[#4CB782] text-white'
                    : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+250ml</span>
              </button>
            </div>

            {/* Visual Glass Water Level */}
            <div className="relative h-24 rounded-2xl bg-sky-500/10 dark:bg-sky-950/20 border border-sky-400/20 overflow-hidden flex items-end p-3">
              <motion.div
                initial={{ height: '0%' }}
                animate={{ height: `${Math.max(10, waterPercentage)}%` }}
                transition={{ type: 'spring', damping: 20 }}
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sky-500/40 via-sky-400/30 to-sky-300/20 backdrop-blur-xs"
              />
              <div className="relative z-10 w-full flex items-center justify-between">
                <div>
                  <span className="text-xl font-extrabold text-[#1A1A1F] dark:text-[#FAF7FF] font-mono tabular-nums">
                    {todayWaterMl.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] ml-1">/ {waterTargetMl.toLocaleString()} ml</span>
                </div>
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-md">
                  {waterPercentage}% Goal
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] pt-3 mt-1 border-t border-[rgba(124,58,237,0.1)]">
            {todayWaterMl >= waterTargetMl
              ? '💧 Goal reached! Hydration fuels focus and physical vitality.'
              : 'Hydration fuels focus and physical vitality. Take another sip!'}
          </p>
        </GlassCard>

        {/* Card D: Companion Mood / Emotional Check-In */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <div
              onClick={onOpenMoodDetails}
              className="flex items-center justify-between mb-3 cursor-pointer group"
              title="Click to view mood details & nakhre meter"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7C3AED] group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF] group-hover:text-[#7C3AED] transition-colors">
                  {companionName}&apos;s Mood
                </h3>
              </div>
              <span className="text-xs font-semibold capitalize text-[#7C3AED] dark:text-[#A78BFA] bg-purple-500/10 px-2 py-0.5 rounded-md">
                {partnerMood?.status || 'Loving'} ({partnerMood?.score || 85}%)
              </span>
            </div>

            <div
              onClick={onOpenMoodDetails}
              className="p-3 rounded-2xl bg-[#F3EBFF]/60 dark:bg-white/5 border border-[rgba(124,58,237,0.15)] mb-3 cursor-pointer hover:border-[rgba(124,58,237,0.3)] transition-colors"
              title="Click to cheer up or view feelings"
            >
              <p className="text-xs text-[#1A1A1F] dark:text-[#FAF7FF] italic leading-relaxed">
                &ldquo;{partnerMood?.lastReason || `${companionName} is keeping you accountable for today's habits!`}&rdquo;
              </p>
            </div>

            {/* Affection bar */}
            <div onClick={onOpenMoodDetails} className="cursor-pointer" title="Affection meter">
              <div className="flex items-center justify-between text-xs text-[#6B6B76] dark:text-[#9A9AA5] mb-1">
                <span>Affection Level</span>
                <span className="font-mono">{partnerMood?.score || 85}/100</span>
              </div>
              <div className="h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                <div
                  style={{ width: `${partnerMood?.score || 85}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[rgba(124,58,237,0.1)] flex items-center justify-between text-xs">
            <button
              onClick={onOpenMoodDetails}
              className="text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#7C3AED] dark:hover:text-[#A78BFA] cursor-pointer"
            >
              Heartbeat & Nakhre
            </button>
            <button
              onClick={() => onNavigateTab?.('chat')}
              className="text-[#7C3AED] dark:text-[#A78BFA] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Talk to {companionName}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </GlassCard>

        {/* Card E: Quick Actions Drawer */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF] mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateTab?.('chat')}
                className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-[#F3EBFF] dark:hover:bg-white/10 border border-white/60 dark:border-white/10 text-left transition-colors cursor-pointer group"
              >
                <MessageSquare className="w-4 h-4 text-[#7C3AED] mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">Open Chat</div>
                <div className="text-[10px] text-[#6B6B76] dark:text-[#9A9AA5]">Message companion</div>
              </button>

              <button
                onClick={onStartCall}
                className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-[#F3EBFF] dark:hover:bg-white/10 border border-white/60 dark:border-white/10 text-left transition-colors cursor-pointer group"
              >
                <Phone className="w-4 h-4 text-[#4CB782] mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">Voice Call</div>
                <div className="text-[10px] text-[#6B6B76] dark:text-[#9A9AA5]">Real-time conversation</div>
              </button>

              <button
                onClick={() => onNavigateTab?.('todos')}
                className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-[#F3EBFF] dark:hover:bg-white/10 border border-white/60 dark:border-white/10 text-left transition-colors cursor-pointer group"
              >
                <CheckCircle2 className="w-4 h-4 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">All Habits</div>
                <div className="text-[10px] text-[#6B6B76] dark:text-[#9A9AA5]">Add & track habits</div>
              </button>

              <button
                onClick={() => onNavigateTab?.('stats')}
                className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 hover:bg-[#F3EBFF] dark:hover:bg-white/10 border border-white/60 dark:border-white/10 text-left transition-colors cursor-pointer group"
              >
                <TrendingUp className="w-4 h-4 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">Trends</div>
                <div className="text-[10px] text-[#6B6B76] dark:text-[#9A9AA5]">Weekly charts</div>
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Card F: Daily Reflection / Mindset Card */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                Daily Reflection
              </span>
              <button
                onClick={() => setAffirmationIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length)}
                className="p-1 rounded-lg text-[#6B6B76] hover:text-[#7C3AED] transition-colors cursor-pointer"
                title="Next reflection"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm font-medium text-[#1A1A1F] dark:text-[#FAF7FF] italic leading-relaxed py-2 pl-3 border-l-2 border-[#7C3AED]">
              &ldquo;{DAILY_AFFIRMATIONS[affirmationIndex]}&rdquo;
            </p>
          </div>

          <div className="pt-3 border-t border-[rgba(124,58,237,0.1)] text-[11px] text-[#6B6B76] dark:text-[#9A9AA5]">
            Curated daily for mental clarity and discipline
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
