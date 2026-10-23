import React, { useState } from 'react';
import { UserProfile, Habit, PartnerMood } from '../types';
import { StreakBadge } from './StreakBadge';
import confetti from 'canvas-confetti';
import {
  Flame,
  Phone,
  CheckCircle2,
  Circle,
  Heart,
  Sparkles,
  RefreshCw,
  MessageCircle,
  ArrowRight,
  Droplets,
  TrendingUp,
  Check,
} from 'lucide-react';

interface DashboardViewProps {
  userProfile: UserProfile;
  partnerMood?: PartnerMood;
  habits: Habit[];
  onToggleHabit?: (id: string) => void;
  onSendMessage: (text: string) => void;
  onStartCall: () => void;
  onSelectAction?: (actionTitle: string) => void;
  onNavigateTab?: (tab: 'chat' | 'todos' | 'calls' | 'profile' | 'stats' | 'sync') => void;
  onQuickMoodBoost?: () => void;
}

const DAILY_AFFIRMATIONS = [
  {
    quote: "You don't have to carry everything all at once. Take one deep breath—I believe in you completely.",
    category: "Mindset",
  },
  {
    quote: "Remember to be gentle with yourself today. You are doing so much better than you realize.",
    category: "Self-Care",
  },
  {
    quote: "Every small step you take today brings you closer to your dreams. Let's make today count!",
    category: "Motivation",
  },
  {
    quote: "Hydrate, stretch your shoulders, and smile. Your energy and health come first today.",
    category: "Wellness",
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  partnerMood,
  habits,
  onToggleHabit,
  onSendMessage,
  onStartCall,
  onNavigateTab,
  onQuickMoodBoost,
}) => {
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [boostFeedback, setBoostFeedback] = useState(false);
  const [waterLoggedFeedback, setWaterLoggedFeedback] = useState(false);

  const completedCount = habits.filter((h) => h.completed).length;
  const totalHabits = habits.length;
  const userName = userProfile.name || 'Friend';
  const companionName = userProfile.partnerName || 'Lexi';
  const streakDays = userProfile.streakDays || 1;

  const currentAffirmation = DAILY_AFFIRMATIONS[affirmationIndex];

  const handleTriggerMoodBoost = () => {
    setBoostFeedback(true);
    setTimeout(() => setBoostFeedback(false), 3000);

    if (onQuickMoodBoost) {
      onQuickMoodBoost();
    } else {
      onSendMessage(`Thinking of you right now, ${companionName}! Sending you my positive energy ❤️`);
    }
  };

  const handleLogWater = () => {
    const waterHabit = habits.find(
      (h) =>
        h.category === 'hydration' ||
        h.title.toLowerCase().includes('water') ||
        h.title.toLowerCase().includes('paani')
    );
    if (waterHabit && onToggleHabit && !waterHabit.completed) {
      onToggleHabit(waterHabit.id);
    }

    setWaterLoggedFeedback(true);
    setTimeout(() => setWaterLoggedFeedback(false), 2500);

    try {
      confetti({
        particleCount: 30,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#A78BFA', '#7C3AED', '#4CB782'],
      });
    } catch {}

    onSendMessage(`I just drank a fresh glass of water! Staying hydrated 💧`);
  };

  const handleNextAffirmation = () => {
    setAffirmationIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length);
  };

  const daysOfWeek = [
    { label: 'Mon', completed: true, isToday: false },
    { label: 'Tue', completed: true, isToday: false },
    { label: 'Wed', completed: streakDays >= 3, isToday: false },
    { label: 'Thu', completed: streakDays >= 4, isToday: true },
    { label: 'Fri', completed: completedCount > 0, isToday: false },
    { label: 'Sat', completed: false, isToday: false },
    { label: 'Sun', completed: false, isToday: false },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-12 select-none animate-in fade-in duration-200">
      
      {/* 1. Header Greeting with Lexi Purple Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#4CB782]/10 text-[#4CB782] border border-[#4CB782]/25 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#4CB782] animate-ping" />
              {companionName} is online & ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1A1F] dark:text-[#FAF7FF]">
            Hey <span className="text-[#7C3AED] dark:text-[#A78BFA]">{userName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#C4B5FD] mt-0.5">
            Ready to win today together? Let&apos;s check your habits and keep your streak going.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="quick-mood-boost-btn"
            onClick={handleTriggerMoodBoost}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold transition-all cursor-pointer shadow-xs ${
              boostFeedback
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'glass text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/40'
            }`}
            title="Send quick affection"
          >
            <Heart className={`w-3.5 h-3.5 ${boostFeedback ? 'fill-white' : 'fill-rose-500 text-rose-500'}`} />
            <span>{boostFeedback ? 'Love Sent! ❤️' : 'Send Affection'}</span>
          </button>

          <button
            id="dashboard-call-btn"
            onClick={onStartCall}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-[0_4px_16px_rgba(124,58,237,0.3)] transition-all hover:scale-102 active:scale-95 cursor-pointer"
            title={`Voice call with ${companionName}`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call {companionName}</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Action Pills (Glassmorphic) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {/* Log Water */}
        <button
          onClick={handleLogWater}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold whitespace-nowrap transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer ${
            waterLoggedFeedback
              ? 'bg-[#7C3AED] text-white border-transparent'
              : 'glass text-[#7C3AED] dark:text-[#A78BFA] hover:bg-[#F3EBFF] dark:hover:bg-white/10'
          }`}
          title="Log 1 glass of water"
        >
          <Droplets className="w-3.5 h-3.5 text-sky-500" />
          <span>{waterLoggedFeedback ? 'Water Logged! 💧' : 'Log Water'}</span>
        </button>

        {/* Talk with Companion */}
        <button
          onClick={() => onNavigateTab?.('chat')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold whitespace-nowrap transition-all glass text-[#1A1A1F] dark:text-[#FAF7FF] hover:bg-[#F3EBFF] dark:hover:bg-white/10 shadow-xs active:scale-95 shrink-0 cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Chat with {companionName}</span>
        </button>

        {/* Habits Checklist */}
        <button
          onClick={() => onNavigateTab?.('todos')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold whitespace-nowrap transition-all glass text-[#1A1A1F] dark:text-[#FAF7FF] hover:bg-[#F3EBFF] dark:hover:bg-white/10 shadow-xs active:scale-95 shrink-0 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4CB782]" />
          <span>Habits ({completedCount}/{totalHabits})</span>
        </button>

        {/* Habit Trends & Stats */}
        <button
          onClick={() => onNavigateTab?.('stats')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold whitespace-nowrap transition-all glass text-[#1A1A1F] dark:text-[#FAF7FF] hover:bg-[#F3EBFF] dark:hover:bg-white/10 shadow-xs active:scale-95 shrink-0 cursor-pointer"
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Habit Trends</span>
        </button>
      </div>

      {/* 3. Consistency Streak & 7-Day Rhythm Card */}
      <div className="p-5 sm:p-6 glass shadow-[0_8px_32px_rgba(124,58,237,0.08)] relative overflow-visible">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(124,58,237,0.3)]">
              <Flame className="w-5 h-5 fill-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-2">
                <span>Daily Discipline Streak</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] text-[#7C3AED] dark:text-[#C4B5FD] font-extrabold border border-[rgba(124,58,237,0.2)]">
                  Active
                </span>
              </h3>
              <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD]">
                <strong className="text-[#7C3AED] dark:text-[#A78BFA] font-bold tabular-nums">{streakDays} Days</strong> continuous streak
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab?.('todos')}
            className="text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA] hover:text-[#5B21B6] flex items-center gap-1 group cursor-pointer"
          >
            <span>View All Habits</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 7-Day Consistency Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {daysOfWeek.map((d, index) => (
            <div
              key={`day-${index}-${d.label}`}
              className={`flex flex-col items-center py-2.5 px-1 rounded-2xl border transition-all ${
                d.isToday
                  ? 'bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white border-transparent shadow-[0_4px_16px_rgba(124,58,237,0.3)] scale-102'
                  : d.completed
                  ? 'bg-[#4CB782]/10 border-[#4CB782]/30 text-[#4CB782]'
                  : 'bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/5 text-[#9A9AA5]'
              }`}
            >
              <span className={`text-[10px] font-extrabold ${d.isToday ? 'text-white' : 'opacity-80'}`}>
                {d.label}
              </span>
              <div className="my-1.5">
                {d.completed ? (
                  <Check className={`w-3.5 h-3.5 ${d.isToday ? 'text-white stroke-[3]' : 'text-[#4CB782] stroke-[2.5]'}`} />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${d.isToday ? 'bg-white/80' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                )}
              </div>
              <span className={`text-[9px] font-bold ${d.isToday ? 'text-white' : 'text-[#6B6B76] dark:text-[#9A9AA5]'}`}>
                {d.isToday ? 'Today' : d.completed ? 'Done' : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Habits Spotlight Preview with Interactive Streaks */}
      <div className="p-5 sm:p-6 glass shadow-[0_8px_32px_rgba(124,58,237,0.08)] relative overflow-visible">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4CB782]" />
            <h3 className="text-sm font-extrabold text-[#1A1A1F] dark:text-[#FAF7FF]">
              Today&apos;s Habit Checklist
            </h3>
            <span className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] tabular-nums">
              ({completedCount}/{totalHabits})
            </span>
          </div>

          <button
            onClick={() => onNavigateTab?.('todos')}
            className="text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer"
          >
            Manage
          </button>
        </div>

        <div className="space-y-2 relative overflow-visible">
          {habits.slice(0, 4).map((habit, idx) => (
            <div
              key={habit.id ? `${habit.id}-${idx}` : `habit-dash-${idx}`}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all relative overflow-visible ${
                habit.completed
                  ? 'bg-[#4CB782]/5 dark:bg-[#4CB782]/10 border border-[#4CB782]/25'
                  : 'bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 hover:border-[#7C3AED]/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => onToggleHabit && onToggleHabit(habit.id)}
                  className="transition-transform active:scale-90 shrink-0 cursor-pointer"
                  title={habit.completed ? 'Mark incomplete' : 'Mark done'}
                >
                  {habit.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4CB782] fill-[#4CB782]/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#9A9AA5] hover:text-[#7C3AED]" />
                  )}
                </button>

                <div className="min-w-0">
                  <h4 className={`text-xs font-bold truncate ${
                    habit.completed ? 'line-through text-[#9A9AA5]' : 'text-[#1A1A1F] dark:text-[#FAF7FF]'
                  }`}>
                    {habit.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6B6B76] dark:text-[#9A9AA5]">
                    <span>{habit.scheduledTime}</span>
                    <span aria-hidden="true">·</span>
                    <StreakBadge habit={habit} partnerName={companionName} size="sm" />
                  </div>
                </div>
              </div>

              {habit.completed && (
                <span className="text-[11px] font-bold text-[#4CB782] shrink-0 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Done</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Daily Reflection & Affirmation Card */}
      <div className="p-5 sm:p-6 glass shadow-[0_8px_32px_rgba(124,58,237,0.08)]">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
              Daily Reflection
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] text-[#7C3AED] dark:text-[#C4B5FD] font-semibold border border-[rgba(124,58,237,0.2)]">
              {currentAffirmation.category}
            </span>
          </div>

          <button
            onClick={handleNextAffirmation}
            className="flex items-center gap-1 px-2.5 py-1 rounded-[12px] bg-white/60 dark:bg-white/10 text-[#6B6B76] dark:text-[#C4B5FD] hover:text-[#7C3AED] text-xs font-semibold transition-all cursor-pointer"
            title="Next reflection"
          >
            <RefreshCw className="w-3 h-3 text-[#7C3AED]" />
            <span>Next</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm font-medium text-[#1A1A1F] dark:text-[#FAF7FF] italic leading-relaxed pl-3 border-l-2 border-[#7C3AED]">
          &ldquo;{currentAffirmation.quote}&rdquo;
        </p>
      </div>

    </div>
  );
};
