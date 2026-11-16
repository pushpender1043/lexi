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
  const streakDays = userProfile.streakDays ?? 0;
  const bestStreak = userProfile.bestStreak ?? streakDays;

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
    <div className="w-full max-w-[960px] mx-auto space-y-6 pb-20 md:pb-12 select-none">
      
      {/* 1. Hero Greeting with Editorial Display Typography */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-3 sm:pt-5 px-0.5"
      >
        <div>
          <h1 className="font-display text-[26px] sm:text-[34px] font-bold tracking-[-0.03em] leading-[1.08] text-[#14121C] dark:text-[#F8F7FC]">
            {getGreeting()},{' '}
            <span className="text-[#7C3AED] dark:text-[#C4B5FD]">{userName}</span>
          </h1>
          <p className="text-[12.5px] sm:text-[13.5px] text-[#534E68] dark:text-[#C5BED9] mt-1.5 font-normal">
            {streakDays > 0
              ? `On a ${streakDays}-day streak — keep the rhythm steady today.`
              : `Start your daily streak today. Make every small habit count.`}
          </p>
        </div>

        {/* Hero Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <GlassButton
            variant="primary"
            size="sm"
            onClick={onStartCall}
            className="rounded-full px-4 py-2 text-xs font-semibold"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call {companionName}</span>
          </GlassButton>
        </div>
      </motion.div>

      {/* 2. Minimal Airy Bento Grid (Generous outer gutters so AeroShards breathes between cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        
        {/* Card A: Daily Streak with Minimal Week Strip */}
        <GlassCard className="p-4 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#896ABD] to-[#A855F7] text-white flex items-center justify-center shadow-[0_6px_16px_rgba(168,85,247,0.32),inset_0_1px_0_rgba(255,255,255,0.4)]">
                  <Flame className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h3 className="font-display text-[15px] font-bold tracking-[-0.015em] text-[#14121C] dark:text-[#F8F7FC]">
                    Daily Streak
                  </h3>
                  <span className="text-[11px] text-[#6C6584] dark:text-[#938CA8] block leading-tight">
                    Weekly rhythm
                  </span>
                </div>
              </div>
              <span className="font-mono text-2xl font-bold tracking-tight text-[#7C3AED] dark:text-[#C4B5FD] tabular-nums">
                {streakDays}d
              </span>
            </div>

            {/* 7-Day Rhythm Tiles (Compact & Crisp) */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {weekDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center py-2 rounded-xl text-center transition-all border ${
                    day.isToday
                      ? 'bg-gradient-to-b from-[#A855F7] to-[#7C3AED] text-white border-white/40 shadow-[0_6px_14px_rgba(168,85,247,0.34),inset_0_1px_0_rgba(255,255,255,0.45)]'
                      : day.completed
                      ? 'bg-[#4CB782]/14 text-[#2E8B57] dark:text-[#4CB782] border-[#4CB782]/28'
                      : 'bg-white/25 dark:bg-[#1E2544]/45 border-white/45 dark:border-white/[0.1] text-[#6C6584] dark:text-[#938CA8]'
                  }`}
                >
                  <span className="font-mono text-[10px] font-semibold">{day.label}</span>
                  <div className="mt-1">
                    {day.completed ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 block my-[3px]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2.5 border-t border-[rgba(137,106,189,0.12)] dark:border-white/10 flex items-center justify-between text-[11px] text-[#534E68] dark:text-[#C5BED9]">
            <span className="font-mono tabular-nums">Best {bestStreak}{bestStreak === 1 ? 'd' : 'd'}</span>
            <span className={streakDays > 0 ? 'text-[#4CB782] font-semibold' : 'text-[#7C7692] dark:text-[#938CA8]'}>
              {streakDays > 0 ? 'Active Streak' : 'Pending Today'}
            </span>
          </div>
        </GlassCard>

        {/* Card B: Today's Habits with Sleek Ring */}
        <GlassCard className="p-4 flex flex-col justify-between gap-2.5">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4CB782]" />
                <h3 className="font-display text-[15px] font-bold tracking-[-0.015em] text-[#14121C] dark:text-[#F8F7FC]">
                  Today&apos;s Habits
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab?.('todos')}
                className="text-[11px] font-semibold text-[#7C3AED] dark:text-[#C4B5FD] hover:underline cursor-pointer"
              >
                {totalHabits > 0 ? 'Manage' : '+ Add'}
              </button>
            </div>

            {totalHabits === 0 ? (
              <div className="py-5 px-2 text-center flex flex-col items-center justify-center space-y-2.5">
                <p className="text-xs text-[#534E68] dark:text-[#938CA8]">
                  No habits added yet.
                </p>
                <button
                  onClick={() => onNavigateTab?.('todos')}
                  className="btn-primary-purple px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create First Habit</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3.5 py-1">
                  <ProgressRing progress={habitPercentage} size={54} strokeWidth={5}>
                    <span className="text-[11px] font-bold font-mono text-[#14121C] dark:text-[#F8F7FC] tabular-nums">
                      {completedCount}/{totalHabits}
                    </span>
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-bold text-[#14121C] dark:text-[#F8F7FC] tabular-nums leading-tight">
                      {habitPercentage}% Complete
                    </div>
                    <p className="text-[11px] text-[#534E68] dark:text-[#C5BED9] truncate mt-0.5">
                      {completedCount === totalHabits
                        ? 'All habits wrapped up today'
                        : `${totalHabits - completedCount} left to check off`}
                    </p>
                  </div>
                </div>

                {/* Minimal habit list rows */}
                <div className="space-y-1 mt-2">
                  {habits.slice(0, 3).map((habit) => (
                    <div
                      key={habit.id}
                      onClick={() => handleToggleHabitWithBurst(habit.id)}
                      className={`px-2.5 py-1.5 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer border ${
                        habit.completed
                          ? 'bg-[#4CB782]/12 border-[#4CB782]/28 text-[#2E8B57] dark:text-[#4CB782]'
                          : 'bg-white/22 dark:bg-[#1D2340]/45 hover:bg-white/40 dark:hover:bg-[#252D52]/60 border-white/45 dark:border-white/[0.1] text-[#14121C] dark:text-[#F8F7FC]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {habit.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4CB782] shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-[#7C7692] dark:text-[#938CA8] shrink-0" />
                        )}
                        <span className={`truncate text-[12px] font-medium ${habit.completed ? 'line-through opacity-75' : ''}`}>
                          {habit.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#7C7692] dark:text-[#938CA8] font-mono tabular-nums shrink-0">
                        {habit.scheduledTime}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </GlassCard>

        {/* Card C: Hydration Tracker */}
        <GlassCard className="p-4 flex flex-col justify-between gap-2.5">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-400" />
                <h3 className="font-display text-[15px] font-bold tracking-[-0.015em] text-[#14121C] dark:text-[#F8F7FC]">
                  Hydration
                </h3>
              </div>
              <button
                onClick={handleQuickAddWater}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold transition-all cursor-pointer border ${
                  waterLoggedFeedback
                    ? 'bg-[#4CB782] border-[#4CB782] text-white shadow-xs'
                    : 'bg-sky-500/12 text-sky-600 dark:text-sky-300 border-sky-400/25 hover:bg-sky-500/22'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>250ml</span>
              </button>
            </div>

            {/* Sleeker Glass Water Level */}
            <div className="relative h-[76px] rounded-2xl bg-sky-400/10 dark:bg-[#19203C]/50 border border-white/55 dark:border-white/[0.14] overflow-hidden flex items-end p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <motion.div
                initial={{ height: '0%' }}
                animate={{ height: `${Math.max(10, waterPercentage)}%` }}
                transition={{ type: 'spring', damping: 20 }}
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sky-500/42 via-sky-400/24 to-[#A855F7]/12 border-t border-sky-300/45"
              />
              <div className="relative z-10 w-full flex items-baseline justify-between">
                <div>
                  <span className="font-mono text-2xl font-bold text-[#14121C] dark:text-[#F8F7FC] tabular-nums">
                    {todayWaterMl.toLocaleString()}
                  </span>
                  <span className="font-mono text-[11px] text-[#534E68] dark:text-[#C5BED9] ml-1">/ {waterTargetMl.toLocaleString()} ml</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-300 tabular-nums">
                  {waterPercentage}%
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#534E68] dark:text-[#C5BED9] pt-2.5 border-t border-[rgba(137,106,189,0.12)] dark:border-white/10">
            {todayWaterMl >= waterTargetMl
              ? 'Daily hydration goal reached.'
              : 'Stay sharp and refreshed — log your next sip.'}
          </p>
        </GlassCard>

        {/* Card D: Companion Mood (Unboxed Clean Quote, Zero Nested Card Clutter) */}
        <GlassCard className="p-4 flex flex-col justify-between gap-2.5">
          <div>
            <div
              onClick={onOpenMoodDetails}
              className="flex items-center justify-between mb-2 cursor-pointer group"
              title="Click to view mood details & nakhre meter"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#896ABD] dark:text-[#C4B5FD] group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-[15px] font-bold tracking-[-0.015em] text-[#14121C] dark:text-[#F8F7FC] group-hover:text-[#A855F7] transition-colors">
                  {companionName}&apos;s Mood
                </h3>
              </div>
              <span className="font-mono text-[11px] font-semibold capitalize text-[#7C3AED] dark:text-[#E9D5FF] tabular-nums">
                {partnerMood?.status || 'Loving'} · {partnerMood?.score ?? 85}%
              </span>
            </div>

            <div
              onClick={onOpenMoodDetails}
              className="py-2 cursor-pointer"
              title="Click to cheer up or view feelings"
            >
              <p className="text-[13px] text-[#14121C] dark:text-[#F8F7FC] italic font-normal leading-relaxed">
                &ldquo;{partnerMood?.lastReason || `${companionName} is keeping you accountable for today's habits!`}&rdquo;
              </p>
            </div>

            {/* Slim Affection Bar */}
            <div onClick={onOpenMoodDetails} className="cursor-pointer mt-1" title="Affection meter">
              <div className="flex items-center justify-between text-[11px] text-[#534E68] dark:text-[#C5BED9] mb-1">
                <span>Affection</span>
                <span className="font-mono tabular-nums">{partnerMood?.score ?? 85}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/8 dark:bg-white/[0.08] overflow-hidden">
                <div
                  style={{ width: `${partnerMood?.score ?? 85}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[#896ABD] via-[#A855F7] to-[#C4B5FD] transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-[rgba(137,106,189,0.12)] dark:border-white/10 flex items-center justify-between text-[11px]">
            <button
              onClick={onOpenMoodDetails}
              className="text-[#534E68] dark:text-[#938CA8] hover:text-[#7C3AED] dark:hover:text-[#C4B5FD] cursor-pointer"
            >
              Heartbeat &amp; Nakhre
            </button>
            <button
              onClick={() => onNavigateTab?.('chat')}
              className="text-[#7C3AED] dark:text-[#C4B5FD] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Talk to {companionName}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </GlassCard>

        {/* Card E: Minimal Quick Actions Grid */}
        <GlassCard className="p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-[15px] font-bold tracking-[-0.015em] text-[#14121C] dark:text-[#F8F7FC] mb-2.5">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateTab?.('chat')}
                className="px-3 py-2.5 rounded-xl bg-white/24 dark:bg-[#1E2444]/48 hover:bg-white/44 dark:hover:bg-[#272F58]/64 border border-white/50 dark:border-white/[0.12] hover:border-[#A855F7]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center gap-2 text-left transition-all cursor-pointer group"
              >
                <MessageSquare className="w-4 h-4 text-[#A855F7] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-display text-xs font-semibold text-[#14121C] dark:text-[#F8F7FC] truncate">Open Chat</span>
              </button>

              <button
                onClick={onStartCall}
                className="px-3 py-2.5 rounded-xl bg-white/24 dark:bg-[#1E2444]/48 hover:bg-white/44 dark:hover:bg-[#272F58]/64 border border-white/50 dark:border-white/[0.12] hover:border-[#4CB782]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center gap-2 text-left transition-all cursor-pointer group"
              >
                <Phone className="w-4 h-4 text-[#4CB782] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-display text-xs font-semibold text-[#14121C] dark:text-[#F8F7FC] truncate">Voice Call</span>
              </button>

              <button
                onClick={() => onNavigateTab?.('todos')}
                className="px-3 py-2.5 rounded-xl bg-white/24 dark:bg-[#1E2444]/48 hover:bg-white/44 dark:hover:bg-[#272F58]/64 border border-white/50 dark:border-white/[0.12] hover:border-[#A855F7]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center gap-2 text-left transition-all cursor-pointer group"
              >
                <CheckCircle2 className="w-4 h-4 text-[#896ABD] dark:text-[#C4B5FD] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-display text-xs font-semibold text-[#14121C] dark:text-[#F8F7FC] truncate">All Habits</span>
              </button>

              <button
                onClick={() => onNavigateTab?.('stats')}
                className="px-3 py-2.5 rounded-xl bg-white/24 dark:bg-[#1E2444]/48 hover:bg-white/44 dark:hover:bg-[#272F58]/64 border border-white/50 dark:border-white/[0.12] hover:border-amber-400/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center gap-2 text-left transition-all cursor-pointer group"
              >
                <TrendingUp className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-display text-xs font-semibold text-[#14121C] dark:text-[#F8F7FC] truncate">Trends</span>
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Card F: Daily Reflection */}
        <GlassCard className="p-4 flex flex-col justify-between gap-2.5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-[15px] font-bold tracking-[-0.015em] text-[#14121C] dark:text-[#F8F7FC]">
                Daily Reflection
              </h3>
              <button
                onClick={() => setAffirmationIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length)}
                className="p-1.5 rounded-full text-[#534E68] dark:text-[#C5BED9] hover:text-[#A855F7] hover:bg-white/30 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                title="Next reflection"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[13px] font-normal text-[#14121C] dark:text-[#F8F7FC] italic leading-relaxed py-1">
              &ldquo;{DAILY_AFFIRMATIONS[affirmationIndex]}&rdquo;
            </p>
          </div>

          <div className="pt-2.5 border-t border-[rgba(137,106,189,0.12)] dark:border-white/10 text-[11px] text-[#6C6584] dark:text-[#938CA8]">
            Curated daily for mental clarity
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
