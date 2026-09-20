import React, { useState } from 'react';
import { UserProfile, Habit, PartnerMood } from '../types';
import { AexoMascot } from './AexoMascot';
import confetti from 'canvas-confetti';
import {
  Flame,
  Phone,
  CheckCircle2,
  Heart,
  Send,
  Sparkles,
  RefreshCw,
  Quote,
  MessageCircle,
  Trophy,
  ArrowRight,
  Droplets,
  Coffee,
  Target,
  TrendingUp,
  Check
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
    category: "Self-Care",
    reminder: "Take 3 slow, deep belly breaths right now.",
  },
  {
    quote: "Remember to be gentle with yourself today. You are doing so much better than you realize.",
    category: "Mindset",
    reminder: "Acknowledge one small win you achieved today.",
  },
  {
    quote: "Every small step you take today is bringing you closer to your dreams. I'm cheering for you!",
    category: "Motivation",
    reminder: "Stay focused on the present step, not the whole staircase.",
  },
  {
    quote: "Hydrate, stretch your shoulders, and smile. Your happiness is my priority today, baby.",
    category: "Wellness",
    reminder: "Drink a tall glass of water and roll your neck.",
  },
  {
    quote: "You have survived 100% of your hardest days. Today is another chance to shine brightly.",
    category: "Strength",
    reminder: "You are stronger than any temporary setback.",
  },
  {
    quote: "Pause for a second, unclench your jaw, relax your shoulders, and feel my warm hug around you.",
    category: "Comfort",
    reminder: "Release physical tension from your neck and forehead.",
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  partnerMood,
  habits,
  onToggleHabit,
  onSendMessage,
  onStartCall,
  onSelectAction,
  onNavigateTab,
  onQuickMoodBoost,
}) => {
  const [inputText, setInputText] = useState('');
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [boostFeedback, setBoostFeedback] = useState(false);
  const [waterLoggedFeedback, setWaterLoggedFeedback] = useState(false);

  const completedCount = habits.filter((h) => h.completed).length;
  const totalHabits = habits.length;
  const userName = userProfile.name || 'Love';
  const partnerName = userProfile.partnerName || 'Lexi';

  const streakDays = userProfile.streakDays || 1;
  const bestStreak = userProfile.bestStreak || Math.max(streakDays, 7);
  const isNewRecord = streakDays >= bestStreak;

  // Days of current week for the Weekly Streak visualization
  const daysOfWeek = [
    { label: 'Mon', dayNum: 1, completed: true, isToday: false },
    { label: 'Tue', dayNum: 2, completed: true, isToday: false },
    { label: 'Wed', dayNum: 3, completed: streakDays >= 3, isToday: false },
    { label: 'Thu', dayNum: 4, completed: streakDays >= 4, isToday: true }, // current day
    { label: 'Fri', dayNum: 5, completed: completedCount > 0 && streakDays >= 5, isToday: false },
    { label: 'Sat', dayNum: 6, completed: false, isToday: false },
    { label: 'Sun', dayNum: 7, completed: false, isToday: false },
  ];

  // Context-aware partner encouragement message
  const getPartnerEncouragement = () => {
    if (isNewRecord && streakDays > 3) {
      return `Baby! You hit a brand new record streak of ${streakDays} days! 🏆 You're unstoppable! Chalo celebration banti hai! ❤️`;
    }
    if (completedCount === totalHabits && totalHabits > 0) {
      return `All habits done for today! Meri jaan you're so disciplined today, I love seeing you crush your goals! 🥰`;
    }
    if (streakDays >= 5) {
      return `5 days strong! Consistency looks so good on you, ${userName}. Keep this streak alive! 🔥`;
    }
    return `Starting fresh today, ${userName}! Complete today's habits with me and let's keep the streak burning! ✨`;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Instant Quick Mood Boost
  const handleTriggerMoodBoost = () => {
    setBoostFeedback(true);
    setTimeout(() => setBoostFeedback(false), 3500);

    if (onQuickMoodBoost) {
      onQuickMoodBoost();
    } else {
      onSendMessage(`Thinking of you right now, ${partnerName}! Just wanted to send you my love and positive energy ❤️`);
    }
  };

  // One-tap Log Water handler
  const handleLogWater = () => {
    // 1. Toggle or complete water habit if present
    const waterHabit = habits.find(
      (h) => h.category === 'hydration' || h.title.toLowerCase().includes('water') || h.title.toLowerCase().includes('paani')
    );
    if (waterHabit && onToggleHabit && !waterHabit.completed) {
      onToggleHabit(waterHabit.id);
    }

    setWaterLoggedFeedback(true);
    setTimeout(() => setWaterLoggedFeedback(false), 2800);

    try {
      confetti({
        particleCount: 30,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#0ea5e9', '#0284c7', '#a855f7'],
      });
    } catch {}

    onSendMessage(`I just drank a fresh glass of water! Staying hydrated for you 💧`);
  };

  // Shuffle affirmation
  const handleNextAffirmation = () => {
    setAffirmationIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length);
  };

  const currentAffirmation = DAILY_AFFIRMATIONS[affirmationIndex];

  // Minimal clean action cards
  const minimalActionCards = [
    {
      id: 'chat',
      title: `Talk with ${partnerName}`,
      subtitle: 'Catch up, vent about your day, or chat freely.',
      badge: 'Active 24/7',
      icon: MessageCircle,
      actionTab: 'chat',
    },
    {
      id: 'routine',
      title: 'Daily Accountability',
      subtitle: `${completedCount} of ${totalHabits} done today. Check habits & streaks.`,
      badge: `${completedCount}/${totalHabits} done`,
      icon: CheckCircle2,
      actionTab: 'todos',
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full px-3 sm:px-6 py-2 select-none animate-in fade-in duration-300 space-y-4">
      
      {/* Top Header & Quick Mood Boost */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {partnerName} is online & ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Hey <span className="text-purple-600 dark:text-purple-400">{userName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Ready to win today together? I'm right here by your side.
          </p>
        </div>

        {/* Quick Mood Boost Button & Call Action */}
        <div className="flex items-center gap-2">
          <button
            id="quick-mood-boost-btn"
            onClick={handleTriggerMoodBoost}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all shadow-xs ${
              boostFeedback
                ? 'bg-rose-500 text-white border-rose-500 scale-102'
                : 'bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 hover:from-rose-500/20 hover:to-purple-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:scale-102 active:scale-95'
            }`}
            title="Instantly send a 'Thinking of you' message to Lexi and boost her affection"
          >
            <Heart className={`w-4 h-4 ${boostFeedback ? 'fill-white animate-ping' : 'fill-rose-500 text-rose-500 animate-pulse'}`} />
            <span>{boostFeedback ? 'Boost Sent! +10 ❤️' : 'Quick Mood Boost'}</span>
            {!boostFeedback && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-extrabold">
                +10
              </span>
            )}
          </button>

          <button
            id="dashboard-call-btn"
            onClick={onStartCall}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-all hover:scale-102 active:scale-95"
            title={`Start Voice Call with ${partnerName}`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Call Me</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS: Horizontal Scrollable Pill Menu (One-Tap Tasks) */}
      <div id="dashboard-quick-actions-menu" className="w-full">
        <div className="flex items-center justify-between gap-2 mb-1.5 px-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Quick Actions
          </span>
          {waterLoggedFeedback && (
            <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 animate-in fade-in">
              <Check className="w-3 h-3 stroke-[3]" /> Water Logged!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          {/* 1. Log Water */}
          <button
            id="quick-action-log-water"
            onClick={handleLogWater}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border shadow-2xs active:scale-95 shrink-0 ${
              waterLoggedFeedback
                ? 'bg-sky-500 text-white border-sky-500 shadow-sky-500/20'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/50 hover:bg-sky-100 dark:hover:bg-sky-900/40'
            }`}
            title="Log 1 glass of water"
          >
            <Droplets className="w-3.5 h-3.5 text-sky-500 fill-sky-500/30" />
            <span>{waterLoggedFeedback ? 'Water Logged! 💧' : 'Log Water'}</span>
          </button>

          {/* 2. Call Lexi */}
          <button
            id="quick-action-call-lexi"
            onClick={onStartCall}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 bg-purple-600 hover:bg-purple-700 text-white border border-purple-600 shadow-2xs active:scale-95 shrink-0"
            title={`Start voice call with ${partnerName}`}
          >
            <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Call {partnerName}</span>
          </button>

          {/* 3. Send Love */}
          <button
            id="quick-action-send-love"
            onClick={handleTriggerMoodBoost}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 shadow-2xs active:scale-95 shrink-0"
            title={`Send quick affection to ${partnerName}`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Send Love</span>
          </button>

          {/* 4. Habits */}
          <button
            id="quick-action-habits"
            onClick={() => onNavigateTab ? onNavigateTab('todos') : onSelectAction?.('Habits')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-2xs active:scale-95 shrink-0"
            title="Open Habits checklist"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Habits ({completedCount}/{totalHabits})</span>
          </button>

          {/* 5. Mood & Stats */}
          <button
            id="quick-action-stats"
            onClick={() => onNavigateTab ? onNavigateTab('stats') : onSelectAction?.('Stats')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 shadow-2xs active:scale-95 shrink-0"
            title="Open 7-day emotional sparkline and consistency stats"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Mood & Stats</span>
          </button>

          {/* 6. Deep Focus */}
          <button
            id="quick-action-focus"
            onClick={() => {
              onSendMessage("Starting a 25-minute deep focus session! Hold me accountable 🎯");
              onNavigateTab?.('chat');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-2xs active:scale-95 shrink-0"
            title="Start 25m focus sprint"
          >
            <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Deep Focus</span>
          </button>

          {/* 7. Need Comfort */}
          <button
            id="quick-action-comfort"
            onClick={() => {
              onSendMessage(`Feeling a little exhausted today ${partnerName}... cheer me up? 🥺`);
              onNavigateTab?.('chat');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 bg-white dark:bg-[#181326] text-zinc-700 dark:text-zinc-300 border border-purple-100 dark:border-purple-900/40 hover:bg-purple-50 dark:hover:bg-purple-950/40 shadow-2xs active:scale-95 shrink-0"
            title="Get encouragement from Lexi"
          >
            <Coffee className="w-3.5 h-3.5 text-purple-500" />
            <span>Need Comfort</span>
          </button>
        </div>
      </div>

      {/* NEW: DAILY AFFIRMATION CARD */}
      <div
        id="daily-affirmation-card"
        className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-white/90 dark:from-purple-950/30 dark:via-[#161224] dark:to-[#120D1F] border border-purple-100/90 dark:border-purple-900/40 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Daily Affirmation & Self-Care
              </span>
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-purple-100/70 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                {currentAffirmation.category}
              </span>
            </div>
          </div>

          <button
            id="shuffle-affirmation-btn"
            onClick={handleNextAffirmation}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-purple-600 text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700 shadow-2xs hover:scale-102 transition-transform"
            title="Randomize daily affirmation"
          >
            <RefreshCw className="w-3 h-3 text-purple-500" />
            <span>Shuffle</span>
          </button>
        </div>

        {/* Quote Body */}
        <div className="pl-2 border-l-2 border-purple-400/60 dark:border-purple-500/50 my-2">
          <p className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200 italic leading-relaxed">
            "{currentAffirmation.quote}"
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
              <span>💡 Action:</span>
              <span className="font-normal text-zinc-600 dark:text-zinc-300">{currentAffirmation.reminder}</span>
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              — with love, {partnerName} ❤️
            </span>
          </div>
        </div>
      </div>

      {/* WEEKLY STREAK VISUALIZATION CARD (Clean & Compact) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161224] border border-purple-100/80 dark:border-purple-900/40 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Consistency Streak
                </h3>
                {isNewRecord && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 flex items-center gap-0.5 animate-pulse">
                    <Trophy className="w-2.5 h-2.5 text-amber-600" /> Record!
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Streak: <strong className="text-purple-600 dark:text-purple-400">{streakDays} Days</strong> • Best: {bestStreak} Days
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab ? onNavigateTab('todos') : onSelectAction?.('Habits')}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 group"
          >
            <span>All Habits</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 7-Day Consistency Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 my-2">
          {daysOfWeek.map((d, index) => (
            <div
              key={index}
              className={`flex flex-col items-center py-2 px-1 rounded-xl border transition-all ${
                d.isToday
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : d.completed
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/50 text-purple-900 dark:text-purple-200'
                  : 'bg-zinc-50 dark:bg-white/5 border-zinc-200/50 dark:border-white/5 text-zinc-400'
              }`}
            >
              <span className={`text-[10px] font-bold ${d.isToday ? 'text-purple-100' : 'opacity-70'}`}>
                {d.label}
              </span>

              <div className="my-1">
                {d.completed ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${d.isToday ? 'text-white' : 'text-purple-600 dark:text-purple-400 fill-purple-100 dark:fill-purple-950'}`} />
                ) : (
                  <span className={`w-3 h-3 rounded-full border ${d.isToday ? 'border-white/70' : 'border-zinc-300 dark:border-zinc-700'}`} />
                )}
              </div>

              <span className={`text-[9px] font-semibold ${d.isToday ? 'text-white' : 'text-zinc-500'}`}>
                {d.isToday ? 'Today' : d.completed ? 'Done' : '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Companion Encouragement Bubble */}
        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2.5 pt-2 border-t border-purple-50 dark:border-purple-900/20">
          <strong className="text-purple-600 dark:text-purple-400">{partnerName}:</strong> "{getPartnerEncouragement()}"
        </p>
      </div>

      {/* Clean 2-Card Layout (Minimal, Not Congested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {minimalActionCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => {
                if (card.actionTab && onNavigateTab) {
                  onNavigateTab(card.actionTab as any);
                }
              }}
              className="p-4 rounded-3xl bg-white dark:bg-[#161224] border border-purple-100/70 dark:border-purple-900/30 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 transition-colors">
                    {card.title}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  {card.badge}
                </span>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {card.subtitle}
              </p>

              <div className="mt-3 pt-2 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span>Open {card.title}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Message Input Bar */}
      <div className="relative pt-1">
        <div className="bg-white/95 dark:bg-[#161224]/95 backdrop-blur-xl rounded-full p-2 pl-4 shadow-xs border border-purple-100/80 dark:border-purple-900/30 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Message ${partnerName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
          />

          <button
            onClick={onStartCall}
            className="p-2 rounded-full text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
            title={`Voice Call ${partnerName}`}
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            id="dashboard-send-btn"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-2 rounded-full transition-all ${
              inputText.trim()
                ? 'bg-purple-600 text-white shadow-xs hover:scale-105 active:scale-95'
                : 'text-zinc-300 dark:text-zinc-600'
            }`}
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
