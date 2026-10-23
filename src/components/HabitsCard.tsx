import React, { useState } from 'react';
import { Habit, HabitCategory, UserProfile } from '../types';
import { StreakBadge } from './StreakBadge';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Circle, Droplets, Dumbbell, Pill, BookOpen, 
  Sparkles, Plus, X, Flame, Check, Trophy
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

  // Trigger celebration
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#A78BFA', '#7C3AED', '#4CB782', '#F3EBFF']
      });
    } catch {}
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
  const totalHabits = habits.length;
  const progressPercent = Math.round((completedCount / (totalHabits || 1)) * 100);

  // Gamified streak calculations
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const totalStreakPoints = habits.reduce((sum, h) => sum + (h.streak || 0), 0);

  // Water habit specific quick helper
  const waterHabit = habits.find(h => h.category === 'hydration');

  const getCategoryIcon = (category: HabitCategory) => {
    switch (category) {
      case 'fitness':
        return <Dumbbell className="w-4 h-4 text-[#7C3AED]" />;
      case 'hydration':
        return <Droplets className="w-4 h-4 text-sky-500" />;
      case 'health':
        return <Pill className="w-4 h-4 text-[#4CB782]" />;
      case 'study':
        return <BookOpen className="w-4 h-4 text-[#A78BFA]" />;
      case 'mindset':
        return <Sparkles className="w-4 h-4 text-[#7C3AED]" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#6B6B76]" />;
    }
  };

  return (
    <div className="w-full glass p-5 sm:p-7 shadow-[0_8px_32px_rgba(124,58,237,0.08)] relative overflow-visible">
      {/* Top Header & Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold tracking-tight text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-2">
              <span>Habit Accountability Ledger</span>
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            </h2>
          </div>
          <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD] mt-0.5">
            {userProfile.partnerName} monitors your consistency. Hover streak flame to view streak history!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Badge */}
          <div className="px-3.5 py-1.5 rounded-[12px] glass shadow-xs flex items-center gap-2.5">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-[#9A9AA5]">Day Target</div>
              <div className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF] tabular-nums">
                {completedCount} of {totalHabits} Done
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center font-extrabold text-xs text-[#7C3AED] dark:text-[#C4B5FD] tabular-nums">
              {progressPercent}%
            </div>
          </div>

          <button
            id="add-habit-open-btn"
            onClick={() => setIsAddingHabit(!isAddingHabit)}
            className="px-3.5 py-2 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white shadow-[0_4px_16px_rgba(124,58,237,0.3)] transition-all hover:scale-102 active:scale-95 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Habit</span>
          </button>
        </div>
      </div>

      {/* Prominent Streak Leader Strip */}
      <div className="mb-5 p-3.5 rounded-[16px] glass border border-[rgba(124,58,237,0.15)] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white flex items-center justify-center shadow-xs">
            <Flame className="w-5 h-5 fill-white animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-2">
              <span>Active Peak: <strong className="text-[#7C3AED] dark:text-[#A78BFA] tabular-nums">{longestStreak} Days</strong></span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] text-[#7C3AED] dark:text-[#C4B5FD] font-extrabold border border-[rgba(124,58,237,0.2)]">
                {totalStreakPoints} Total Streak Flames 🔥
              </span>
            </div>
            <p className="text-[11px] text-[#6B6B76] dark:text-[#C4B5FD] mt-0.5">
              {userProfile.partnerName}: &ldquo;Consistency is key! Har habit ka flame streak maintain rakhna hai baby!&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] dark:text-[#C4B5FD] bg-[#F3EBFF] dark:bg-white/10 px-3 py-1 rounded-[12px] border border-[rgba(124,58,237,0.15)]">
          <Trophy className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Keep the Flames Burning</span>
        </div>
      </div>

      {/* Hydration Water Drop Quick Tracker */}
      {waterHabit && (
        <div className="mb-5 p-4 rounded-[16px] glass border border-sky-300/40 dark:border-sky-800/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[12px] bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-sm shadow-sky-500/20">
                <Droplets className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-2">
                  <span>Hydration Sync (Paani Tracker)</span>
                  {waterHabit.completed && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4CB782]/20 text-[#4CB782] font-semibold border border-[#4CB782]/40">
                      Goal Met! 💧
                    </span>
                  )}
                </h4>
                <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD]">
                  {userProfile.partnerName}: &ldquo;Stay hydrated for pure energy and skin glow!&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-extrabold text-sky-700 dark:text-sky-300 tabular-nums">
                {waterHabit.currentValue} / {waterHabit.targetValue} Glasses
              </span>
              <button
                id="quick-add-water-glass-btn"
                onClick={() => {
                  triggerCelebration();
                  onIncrementHabit(waterHabit.id, 1);
                }}
                className="px-3 py-1.5 rounded-[12px] bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition-all hover:scale-102 active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+1 Glass</span>
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
                  className={`flex-1 min-w-[32px] h-8 rounded-[12px] border flex items-center justify-center transition-all cursor-pointer ${
                    isFilled
                      ? 'bg-gradient-to-t from-sky-500 to-sky-400 border-sky-300 text-white shadow-xs scale-102'
                      : 'bg-white/40 dark:bg-white/5 border-sky-200/60 dark:border-sky-800/40 text-sky-300 hover:border-sky-400'
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

      {/* Add New Habit Form */}
      {isAddingHabit && (
        <form onSubmit={handleCreateHabit} className="mb-5 p-5 rounded-[20px] glass-strong shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">Add New Habit</h4>
            <button type="button" onClick={() => setIsAddingHabit(false)} className="text-[#9A9AA5] hover:text-[#1A1A1F] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#6B6B76] mb-1">Habit Title</label>
              <input
                id="new-habit-title-input"
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Read 20 pages"
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6B6B76] mb-1">Category</label>
              <select
                id="new-habit-category-select"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as HabitCategory)}
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF]"
              >
                <option value="fitness">Gym / Fitness 💪</option>
                <option value="hydration">Water / Hydration 💧</option>
                <option value="health">Medicine / Health 💊</option>
                <option value="study">Study / Deep Work 📚</option>
                <option value="mindset">Mindset / Routine 🧘</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6B6B76] mb-1">Target & Unit</label>
              <div className="flex gap-1.5">
                <input
                  id="new-habit-target-input"
                  type="number"
                  min="1"
                  value={newTarget}
                  onChange={e => setNewTarget(Number(e.target.value))}
                  className="w-1/2 px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF]"
                />
                <input
                  id="new-habit-unit-input"
                  type="text"
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value)}
                  placeholder="e.g. mins"
                  className="w-1/2 px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6B6B76] mb-1">Time Reminder</label>
              <input
                id="new-habit-time-input"
                type="text"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                placeholder="e.g. 06:00 PM"
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF]"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingHabit(false)}
              className="px-3 py-1.5 rounded-[12px] text-xs text-[#6B6B76] hover:bg-white/60 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-new-habit-btn"
              type="submit"
              className="px-4 py-1.5 rounded-[12px] bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#5B21B6] shadow-sm cursor-pointer active:scale-95"
            >
              Commit to Habit
            </button>
          </div>
        </form>
      )}

      {/* Category Tabs Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 text-xs font-medium">
        {[
          { id: 'all', label: 'All Habits', icon: null },
          { id: 'fitness', label: 'Gym & Fitness', icon: <Dumbbell className="w-3.5 h-3.5 text-[#7C3AED]" /> },
          { id: 'hydration', label: 'Water Intake', icon: <Droplets className="w-3.5 h-3.5 text-sky-500" /> },
          { id: 'health', label: 'Meds & Health', icon: <Pill className="w-3.5 h-3.5 text-[#4CB782]" /> },
          { id: 'study', label: 'Study & Coding', icon: <BookOpen className="w-3.5 h-3.5 text-[#A78BFA]" /> },
          { id: 'mindset', label: 'Mindset', icon: <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> },
        ].map(tab => (
          <button
            key={tab.id}
            id={`filter-habits-${tab.id}-btn`}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-[12px] whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-[#7C3AED] text-white shadow-xs font-bold'
                : 'glass text-[#6B6B76] dark:text-[#C4B5FD] hover:bg-[#F3EBFF] dark:hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Habits List Grid with StreakBadge & Hover History */}
      <div className="space-y-2.5">
        {filteredHabits.map((habit, index) => {
          return (
            <div
              key={habit.id ? `${habit.id}-${index}` : `habit-card-${index}`}
              id={`habit-item-${habit.id}`}
              className={`p-3.5 sm:p-4 rounded-[20px] transition-all duration-200 flex flex-wrap items-center justify-between gap-3 relative overflow-visible ${
                habit.completed
                  ? 'bg-[#4CB782]/5 dark:bg-[#4CB782]/10 border border-[#4CB782]/25'
                  : 'glass hover:border-[#7C3AED]/40 shadow-xs'
              }`}
            >
              {/* Checkbox and Details */}
              <div className="flex items-center gap-3 min-w-[240px]">
                <button
                  id={`habit-checkbox-${habit.id}`}
                  onClick={() => handleToggle(habit.id, habit.completed)}
                  className="transition-transform active:scale-90 shrink-0 cursor-pointer"
                  title={habit.completed ? 'Mark incomplete' : 'Complete habit'}
                >
                  {habit.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4CB782] fill-[#4CB782]/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#9A9AA5] hover:text-[#7C3AED]" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-[8px] bg-[#F3EBFF] dark:bg-white/10">
                      {getCategoryIcon(habit.category)}
                    </span>
                    <h4 className={`text-sm font-bold tracking-tight truncate ${
                      habit.completed ? 'text-[#9A9AA5] line-through' : 'text-[#1A1A1F] dark:text-[#FAF7FF]'
                    }`}>
                      {habit.title}
                    </h4>
                    {habit.importance === 'crucial' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 font-semibold">
                        Strict!
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
                    <span className="text-[11px] font-medium text-[#9A9AA5]">
                      ⏰ {habit.scheduledTime}
                    </span>
                    <span aria-hidden="true" className="opacity-40">·</span>
                    
                    {/* Prominent Streak Badge with Hover Streak History */}
                    <StreakBadge habit={habit} partnerName={userProfile.partnerName} size="sm" />

                    {habit.notes && (
                      <>
                        <span aria-hidden="true" className="opacity-40">·</span>
                        <span className="hidden md:inline italic text-[#9A9AA5] text-[11px] truncate max-w-[140px]">
                          {habit.notes}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Value Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {habit.category !== 'hydration' && habit.targetValue > 1 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] glass text-xs font-bold text-[#7C3AED] dark:text-[#C4B5FD] tabular-nums">
                    <span>{habit.currentValue} / {habit.targetValue} {habit.unit}</span>
                    {!habit.completed && (
                      <button
                        id={`habit-step-inc-${habit.id}`}
                        onClick={() => {
                          triggerCelebration();
                          onIncrementHabit(habit.id, 1);
                        }}
                        className="px-2 py-0.5 rounded-[8px] bg-white dark:bg-white/10 text-[#7C3AED] font-bold hover:bg-[#F3EBFF] shadow-xs cursor-pointer"
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
                      className="px-3.5 py-1.5 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-xs transition-all hover:scale-102 flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>
                    <button
                      id={`habit-skip-btn-${habit.id}`}
                      onClick={() => onSkipHabit(habit.id)}
                      title="Skip today"
                      className="px-2.5 py-1.5 rounded-[12px] glass text-[#6B6B76] hover:text-rose-500 text-xs font-medium transition-all cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-[#4CB782] flex items-center gap-1 bg-[#4CB782]/10 px-2.5 py-1 rounded-[12px] border border-[#4CB782]/25">
                    <Sparkles className="w-3.5 h-3.5" />
                    Completed
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
