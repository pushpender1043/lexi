import React, { useState } from 'react';
import { Habit, HabitCategory, UserProfile } from '../types';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Circle, Droplets, Dumbbell, Pill, BookOpen, 
  Sparkles, Plus, X, Flame, AlertCircle, TrendingUp, RefreshCw 
} from 'lucide-react';

interface HabitsCardProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onIncrementHabit: (id: string, delta: number) => void;
  onSkipHabit: (id: string) => void;
  onAddHabit: (newHabit: Omit<Habit, 'id' | 'streak'>) => void;
  userProfile: UserProfile;
}

export const HabitsCard: React.FC<HabitsCardProps> = ({
  habits,
  onToggleHabit,
  onIncrementHabit,
  onSkipHabit,
  onAddHabit,
  userProfile,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HabitCategory>('fitness');
  const [newTarget, setNewTarget] = useState(1);
  const [newUnit, setNewUnit] = useState('times');
  const [newTime, setNewTime] = useState('10:00 AM');

  // Trigger joyful confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#f43f5e', '#ec4899', '#38bdf8', '#fbbf24']
      });
    } catch {
      // fallback
    }
  };

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      triggerCelebration();
    }
    onToggleHabit(id);
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddHabit({
      title: newTitle.trim(),
      category: newCategory,
      targetValue: Number(newTarget) || 1,
      currentValue: 0,
      unit: newUnit,
      scheduledTime: newTime,
      completed: false,
      importance: 'medium'
    });
    setNewTitle('');
    setIsAddingHabit(false);
  };

  const filteredHabits = selectedCategory === 'all'
    ? habits
    : habits.filter(h => h.category === selectedCategory);

  const completedCount = habits.filter(h => h.completed).length;
  const progressPercent = Math.round((completedCount / (habits.length || 1)) * 100);

  // Gamified streak calculations
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const totalStreakPoints = habits.reduce((sum, h) => sum + (h.streak || 0), 0);

  // Gamified streak badge renderer
  const renderGamifiedStreakBadge = (streak: number) => {
    if (streak >= 7) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xs shadow-orange-500/30 animate-pulse border border-amber-300/40">
          <Flame className="w-3.5 h-3.5 fill-white text-white" />
          <span>{streak}d Streak • ON FIRE!</span>
        </div>
      );
    }
    if (streak >= 3) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border border-orange-400/50 text-orange-700 dark:text-orange-300 shadow-2xs">
          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-bounce [animation-duration:2s]" />
          <span>{streak}d Streak</span>
        </div>
      );
    }
    if (streak >= 1) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-300/70 text-amber-700 dark:text-amber-300">
          <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
          <span>{streak}d Streak</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
        <Flame className="w-3 h-3 text-zinc-400" />
        <span>Start Today</span>
      </div>
    );
  };

  // Water habit specific quick helper
  const waterHabit = habits.find(h => h.category === 'hydration');

  const getCategoryIcon = (category: HabitCategory) => {
    switch (category) {
      case 'fitness':
        return <Dumbbell className="w-4 h-4 text-orange-500" />;
      case 'hydration':
        return <Droplets className="w-4 h-4 text-sky-500" />;
      case 'health':
        return <Pill className="w-4 h-4 text-emerald-500" />;
      case 'study':
        return <BookOpen className="w-4 h-4 text-violet-500" />;
      case 'mindset':
        return <Sparkles className="w-4 h-4 text-pink-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="w-full glass-card rounded-3xl p-5 sm:p-7 shadow-xl border border-white/70 dark:border-white/10 relative">
      {/* Title & Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Daily Accountability Ledger</span>
              <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {userProfile.partnerName} monitors your daily habits closely. Don't skip!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Pill */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-white/60 dark:bg-zinc-800/60 border border-white/80 shadow-sm flex items-center gap-2.5">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-400">Day Target</div>
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                {completedCount} of {habits.length} Done
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-50 border-2 border-rose-500/30 flex items-center justify-center font-bold text-xs text-rose-600">
              {progressPercent}%
            </div>
          </div>

          <button
            id="add-habit-open-btn"
            onClick={() => setIsAddingHabit(!isAddingHabit)}
            className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Habit</span>
          </button>
        </div>
      </div>

      {/* Gamified Streak Leader Strip */}
      <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-300/40 dark:border-amber-700/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
            <Flame className="w-4 h-4 fill-white animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Streak Power: <strong className="text-orange-600 dark:text-orange-400">{longestStreak} Days Best</strong></span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-extrabold">
                {totalStreakPoints} Total Flames
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {userProfile.partnerName}: "Consistency is hot! Har habit ka flame streak maintain rakhna hai baby!"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-extrabold text-orange-600 dark:text-orange-400">
          <Flame className="w-4 h-4 fill-orange-500 animate-bounce" />
          <span>Keep the Flames Burning!</span>
        </div>
      </div>

      {/* Water Quick Tracker Widget (Paani Tracker) */}
      {waterHabit && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-blue-500/10 border border-sky-200 dark:border-sky-800/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                <Droplets className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  Hydration Sync (Paani Tracker)
                  {waterHabit.completed && (
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                      Goal Met! 💧
                    </span>
                  )}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {userProfile.partnerName}: "Skin glow aur energy ke liye kam se kam {waterHabit.targetValue} glass zaroori hai!"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
                {waterHabit.currentValue} / {waterHabit.targetValue} Glasses
              </span>
              <button
                id="quick-add-water-glass-btn"
                onClick={() => {
                  triggerCelebration();
                  onIncrementHabit(waterHabit.id, 1);
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium shadow-sm transition-all hover:scale-102 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Drink +1 Glass (250ml)</span>
              </button>
            </div>
          </div>

          {/* Water glass indicators */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto py-1">
            {Array.from({ length: waterHabit.targetValue }).map((_, idx) => {
              const isFilled = idx < waterHabit.currentValue;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (!isFilled) {
                      triggerCelebration();
                      onIncrementHabit(waterHabit.id, idx + 1 - waterHabit.currentValue);
                    }
                  }}
                  className={`flex-1 min-w-[28px] h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    isFilled
                      ? 'bg-sky-500 border-sky-400 text-white shadow-sm scale-102'
                      : 'bg-white/40 border-sky-200 text-sky-300 hover:border-sky-400'
                  }`}
                  title={`Glass #${idx + 1}`}
                >
                  <Droplets className={`w-3.5 h-3.5 ${isFilled ? 'fill-white' : ''}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Habit Drawer Form */}
      {isAddingHabit && (
        <form onSubmit={handleCreateHabit} className="mb-6 p-4 rounded-2xl bg-white/70 dark:bg-zinc-800/80 border border-rose-200 shadow-md animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Add New Daily Accountability Habit</h4>
            <button type="button" onClick={() => setIsAddingHabit(false)} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Habit Title</label>
              <input
                id="new-habit-title-input"
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Read 20 pages"
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-900"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Category</label>
              <select
                id="new-habit-category-select"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as HabitCategory)}
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-900"
              >
                <option value="fitness">Gym / Fitness 💪</option>
                <option value="hydration">Water / Hydration 💧</option>
                <option value="health">Medicine / Health 💊</option>
                <option value="study">Study / Deep Work 📚</option>
                <option value="mindset">Mindset / Routine 🧘</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Target & Unit</label>
              <div className="flex gap-1.5">
                <input
                  id="new-habit-target-input"
                  type="number"
                  min="1"
                  value={newTarget}
                  onChange={e => setNewTarget(Number(e.target.value))}
                  className="w-1/2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-900"
                />
                <input
                  id="new-habit-unit-input"
                  type="text"
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value)}
                  placeholder="e.g. mins"
                  className="w-1/2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Time Reminder</label>
              <input
                id="new-habit-time-input"
                type="text"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                placeholder="e.g. 06:00 PM"
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-900"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingHabit(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-zinc-600 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              id="save-new-habit-btn"
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 shadow-sm"
            >
              Commit to Habit
            </button>
          </div>
        </form>
      )}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 text-xs font-medium">
        {[
          { id: 'all', label: 'All Habits', icon: null },
          { id: 'fitness', label: 'Gym & Fitness', icon: <Dumbbell className="w-3.5 h-3.5 text-orange-500" /> },
          { id: 'hydration', label: 'Water Intake', icon: <Droplets className="w-3.5 h-3.5 text-sky-500" /> },
          { id: 'health', label: 'Meds & Health', icon: <Pill className="w-3.5 h-3.5 text-emerald-500" /> },
          { id: 'study', label: 'Study & Coding', icon: <BookOpen className="w-3.5 h-3.5 text-violet-500" /> },
          { id: 'mindset', label: 'Mindset', icon: <Sparkles className="w-3.5 h-3.5 text-pink-500" /> },
        ].map(tab => (
          <button
            key={tab.id}
            id={`filter-habits-${tab.id}-btn`}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === tab.id
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'bg-white/50 text-zinc-600 dark:text-zinc-400 hover:bg-white/80'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Habits List Grid */}
      <div className="space-y-3">
        {filteredHabits.map(habit => {
          return (
            <div
              key={habit.id}
              id={`habit-item-${habit.id}`}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-wrap items-center justify-between gap-3 ${
                habit.completed
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-white/60 dark:bg-zinc-800/40 border-white/80 dark:border-white/10 hover:border-rose-300'
              }`}
            >
              {/* Checkbox and Details */}
              <div className="flex items-center gap-3.5 min-w-[240px]">
                <button
                  id={`habit-checkbox-${habit.id}`}
                  onClick={() => handleToggle(habit.id, habit.completed)}
                  className="transition-transform active:scale-90"
                >
                  {habit.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 text-zinc-300 dark:text-zinc-600 hover:text-rose-400" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-700/50">
                      {getCategoryIcon(habit.category)}
                    </span>
                    <h4 className={`text-sm font-semibold tracking-tight ${
                      habit.completed ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-100'
                    }`}>
                      {habit.title}
                    </h4>
                    {habit.importance === 'crucial' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-semibold">
                        Strict!
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md">
                      ⏰ {habit.scheduledTime}
                    </span>
                    {renderGamifiedStreakBadge(habit.streak)}
                    {habit.notes && (
                      <span className="hidden md:inline italic text-zinc-400">
                        • {habit.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Value Controls */}
              <div className="flex items-center gap-2.5">
                {habit.category !== 'hydration' && habit.targetValue > 1 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>{habit.currentValue} / {habit.targetValue} {habit.unit}</span>
                    {!habit.completed && (
                      <button
                        id={`habit-step-inc-${habit.id}`}
                        onClick={() => {
                          triggerCelebration();
                          onIncrementHabit(habit.id, 15);
                        }}
                        className="px-2 py-0.5 rounded bg-white text-rose-600 font-bold hover:bg-rose-50 shadow-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                )}

                {!habit.completed ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`habit-complete-btn-${habit.id}`}
                      onClick={() => handleToggle(habit.id, false)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium shadow-sm transition-all hover:scale-102 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>
                    <button
                      id={`habit-skip-btn-${habit.id}`}
                      onClick={() => onSkipHabit(habit.id)}
                      title="Skip today (Careful: Partner might get angry!)"
                      className="px-2.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-red-500 hover:border-red-300 text-xs font-medium transition-all"
                    >
                      Skip
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Completed!
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
