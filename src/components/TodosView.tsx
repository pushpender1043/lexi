import React, { useState, useMemo } from 'react';
import { Habit, HabitCategory, UserProfile, PartnerMood } from '../types';
import { StreakBadge } from './StreakBadge';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Clock,
  Trash2,
  Tag,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface TodosViewProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onIncrementHabit: (id: string, delta: number) => void;
  onAddHabit: (newHabit: Omit<Habit, 'id' | 'streak'>) => void;
  onDeleteHabit: (id: string) => void;
  userProfile: UserProfile;
  partnerMood: PartnerMood;
}

const DEFAULT_TAG_OPTIONS = ['Health', 'Productivity', 'Social', 'Fitness', 'Mindset'];

export const TodosView: React.FC<TodosViewProps> = ({
  habits,
  onToggleHabit,
  onIncrementHabit,
  onAddHabit,
  onDeleteHabit,
  userProfile,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form fields
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HabitCategory>('health');
  const [selectedFormTags, setSelectedFormTags] = useState<string[]>(['Health']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newTarget, setNewTarget] = useState(1);
  const [newUnit, setNewUnit] = useState('times');
  const [newImportance, setNewImportance] = useState<'crucial' | 'medium' | 'flexible'>('medium');

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Streak aggregations
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const totalFlames = habits.reduce((sum, h) => sum + (h.streak || 0), 0);

  // Confetti on completion
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#A78BFA', '#7C3AED', '#4CB782', '#F3EBFF']
      });
    } catch {}
  };

  const handleToggle = (id: string, completed: boolean) => {
    if (!completed) triggerCelebration();
    onToggleHabit(id);
  };

  // Extract all unique tags present across user habits
  const allAvailableTags = useMemo(() => {
    const tagSet = new Set<string>(DEFAULT_TAG_OPTIONS);
    habits.forEach(h => {
      if (h.tags && Array.isArray(h.tags)) {
        h.tags.forEach(t => {
          if (t && t.trim()) tagSet.add(t.trim());
        });
      }
      if (h.category) {
        const catCapitalized = h.category.charAt(0).toUpperCase() + h.category.slice(1);
        tagSet.add(catCapitalized);
      }
    });
    return ['All', ...Array.from(tagSet)];
  }, [habits]);

  // Filtered habits by tag and status
  const filteredHabits = useMemo(() => {
    return habits.filter(h => {
      // 1. Tag filter matching
      const matchesTag =
        selectedTag === 'All' ||
        (h.tags && h.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())) ||
        (h.category && h.category.toLowerCase() === selectedTag.toLowerCase());

      // 2. Status filter matching
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && !h.completed) ||
        (statusFilter === 'completed' && h.completed);

      return matchesTag && matchesStatus;
    });
  }, [habits, selectedTag, statusFilter]);

  // Form tag toggle handler
  const toggleFormTag = (tag: string) => {
    setSelectedFormTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedFormTags.includes(trimmed)) {
      setSelectedFormTags(prev => [...prev, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHabit({
      title: newTitle.trim(),
      category: newCategory,
      tags: selectedFormTags.length > 0 ? selectedFormTags : ['General'],
      scheduledTime: newTime || 'Anytime',
      targetValue: Number(newTarget) || 1,
      currentValue: 0,
      unit: newUnit || 'times',
      completed: false,
      importance: newImportance,
    });

    setNewTitle('');
    setSelectedFormTags(['Health']);
    setIsAddingTask(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-12 select-none animate-in fade-in duration-200">
      
      {/* 1. Glassmorphic Streak & Progress Overview Card */}
      <div className="p-5 sm:p-6 glass relative overflow-visible shadow-[0_8px_32px_rgba(124,58,237,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-2">
                <span>Daily Habits & Streaks</span>
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              </h2>
              <span className="text-xs font-bold text-[#7C3AED] dark:text-[#C4B5FD] bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.2)] px-2.5 py-0.5 rounded-full tabular-nums">
                {completedCount} of {totalCount} Done
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#C4B5FD] mt-1">
              {userProfile.partnerName}: &ldquo;Consistency is our superpower! Hover on any streak flame to inspect 7-day history.&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Top Flame Metric Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[12px] glass text-xs font-bold text-[#7C3AED] dark:text-[#C4B5FD] shadow-xs">
              <Flame className="w-4 h-4 text-[#7C3AED] fill-[#7C3AED] animate-pulse" />
              <span>{maxStreak}d Peak</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span className="text-[11px] opacity-80">{totalFlames} Flames</span>
            </div>

            <button
              id="todos-add-new-btn"
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-[0_4px_16px_rgba(124,58,237,0.3)] transition-all hover:scale-102 active:scale-95 cursor-pointer"
            >
              {isAddingTask ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAddingTask ? 'Cancel' : 'New Habit'}</span>
            </button>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="mt-4 pt-3 border-t border-[rgba(124,58,237,0.12)]">
          <div className="flex items-center justify-between text-xs text-[#6B6B76] dark:text-[#C4B5FD] mb-1.5">
            <span className="font-semibold text-[#1A1A1F] dark:text-[#FAF7FF]">Today&apos;s Completion Pace</span>
            <span className="font-extrabold text-[#7C3AED] dark:text-[#A78BFA] tabular-nums">{completionPercentage}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-white/60 dark:bg-white/10 p-0.5 overflow-hidden border border-white/60 dark:border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-[#5B21B6] transition-all duration-500 shadow-xs"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. New Habit Creation Form */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="p-5 sm:p-6 rounded-[28px] glass-strong shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#7C3AED]" />
              <span>Create New Habit Routine</span>
            </h3>
            <span className="text-[11px] text-[#9A9AA5]">Add tags for organized filtering</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[#1A1A1F] dark:text-[#FAF7FF] font-semibold mb-1">
                Habit Title
              </label>
              <input
                id="habit-title-input"
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. 30m Gym Workout, Read 10 pages, Drink 2L water..."
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] placeholder-[#9A9AA5] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[#1A1A1F] dark:text-[#FAF7FF] font-semibold mb-1">
                Category
              </label>
              <select
                id="habit-category-select"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as HabitCategory)}
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
              >
                <option value="health">Health & Meds 💊</option>
                <option value="productivity">Productivity & Work 💻</option>
                <option value="fitness">Gym & Fitness 💪</option>
                <option value="hydration">Hydration 💧</option>
                <option value="social">Social & Calls ❤️</option>
                <option value="mindset">Mindset & Peace 🧘</option>
                <option value="study">Study & Code 📚</option>
              </select>
            </div>

            <div>
              <label className="block text-[#1A1A1F] dark:text-[#FAF7FF] font-semibold mb-1">
                Scheduled Time
              </label>
              <input
                type="text"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                placeholder="e.g. 08:00 AM, Anytime"
                className="w-full px-3.5 py-2.5 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] focus:outline-hidden"
              />
            </div>

            {/* Tag Selection Chips */}
            <div className="sm:col-span-2">
              <label className="block text-[#1A1A1F] dark:text-[#FAF7FF] font-semibold mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Filter Tags</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_TAG_OPTIONS.map(tag => {
                  const isSelected = selectedFormTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFormTag(tag)}
                      className={`px-3 py-1 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'bg-[#F3EBFF] dark:bg-white/10 text-[#7C3AED] dark:text-[#C4B5FD] hover:bg-[#E9D8FD]'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>

              {/* Add custom tag */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={e => setCustomTagInput(e.target.value)}
                  placeholder="Custom tag (e.g. Coding, Evening)"
                  className="flex-1 px-3 py-2 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF] placeholder-[#9A9AA5] focus:outline-hidden"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-3.5 py-2 rounded-[12px] bg-[#F3EBFF] dark:bg-white/10 text-[#7C3AED] dark:text-[#C4B5FD] text-xs font-semibold hover:bg-[#E9D8FD] cursor-pointer"
                >
                  Add Tag
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#1A1A1F] dark:text-[#FAF7FF] font-semibold mb-1">
                Target & Unit
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={newTarget}
                  onChange={e => setNewTarget(Number(e.target.value))}
                  className="w-20 px-3 py-2 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF]"
                />
                <input
                  type="text"
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value)}
                  placeholder="times, mins, glasses"
                  className="flex-1 px-3 py-2 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#1A1A1F] dark:text-[#FAF7FF] font-semibold mb-1">
                Priority
              </label>
              <select
                value={newImportance}
                onChange={e => setNewImportance(e.target.value as any)}
                className="w-full px-3 py-2 glass-input text-xs text-[#1A1A1F] dark:text-[#FAF7FF]"
              >
                <option value="crucial">Strict (Crucial)</option>
                <option value="medium">Standard Routine</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(124,58,237,0.12)]">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-3.5 py-1.5 rounded-[12px] text-xs text-[#6B6B76] hover:bg-white/60 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-habit-btn"
              type="submit"
              className="px-4 py-1.5 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95"
            >
              Commit Routine
            </button>
          </div>
        </form>
      )}

      {/* 3. Filter Controls: Tags & Status (Clean, Minimal, Translucent Glass) */}
      <div className="space-y-2">
        {/* Interactive Tags Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {allAvailableTags.map(tag => {
            const isSelected = selectedTag === tag;
            const count =
              tag === 'All'
                ? habits.length
                : habits.filter(
                    h =>
                      (h.tags && h.tags.some(t => t.toLowerCase() === tag.toLowerCase())) ||
                      (h.category && h.category.toLowerCase() === tag.toLowerCase())
                  ).length;

            return (
              <button
                key={tag}
                id={`filter-tag-${tag.toLowerCase()}`}
                onClick={() => setSelectedTag(tag)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'glass text-[#6B6B76] dark:text-[#C4B5FD] hover:bg-[#F3EBFF] dark:hover:bg-white/10'
                }`}
              >
                <span>{tag === 'All' ? 'All Habits' : `#${tag}`}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F3EBFF] dark:bg-white/10 text-[#7C3AED] dark:text-[#C4B5FD]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Filter Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-[11px] text-[#9A9AA5] font-medium">
            Showing {filteredHabits.length} habits
          </span>

          <div className="flex items-center gap-1 bg-white/50 dark:bg-white/5 p-1 rounded-[12px] border border-[rgba(124,58,237,0.12)]">
            {(['all', 'pending', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg capitalize text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] text-[#7C3AED] dark:text-[#C4B5FD] shadow-2xs font-bold'
                    : 'text-[#6B6B76] hover:text-[#1A1A1F] dark:hover:text-[#FAF7FF]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Habits List with Prominent Streak Badges & Hover History */}
      <div className="space-y-2.5 relative overflow-visible">
        {filteredHabits.length === 0 ? (
          <div className="p-8 text-center rounded-[20px] glass text-[#9A9AA5]">
            <CheckCircle2 className="w-8 h-8 text-[#7C3AED] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
              No habits found for &ldquo;{selectedTag}&rdquo;
            </p>
            <p className="text-xs text-[#9A9AA5] mt-0.5">
              Switch tag filters or click New Habit to start a routine.
            </p>
          </div>
        ) : (
          filteredHabits.map((habit, index) => {
            const tagsToDisplay = habit.tags && habit.tags.length > 0 ? habit.tags : [habit.category];

            return (
              <div
                key={habit.id ? `${habit.id}-${index}` : `habit-${index}`}
                id={`habit-row-${habit.id}`}
                className={`p-3.5 sm:p-4 rounded-[20px] transition-all flex items-center justify-between gap-3 relative overflow-visible ${
                  habit.completed
                    ? 'bg-[#4CB782]/5 dark:bg-[#4CB782]/10 border border-[#4CB782]/25 text-[#9A9AA5]'
                    : 'glass hover:border-[#7C3AED]/40 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Circular Checkbox */}
                  <button
                    id={`toggle-habit-${habit.id}`}
                    onClick={() => handleToggle(habit.id, habit.completed)}
                    title={habit.completed ? 'Mark pending' : 'Mark completed'}
                    className="shrink-0 transition-transform active:scale-90 cursor-pointer"
                  >
                    {habit.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#4CB782] fill-[#4CB782]/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#9A9AA5] hover:text-[#7C3AED]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold tracking-tight truncate ${
                          habit.completed
                            ? 'line-through text-[#9A9AA5]'
                            : 'text-[#1A1A1F] dark:text-[#FAF7FF]'
                        }`}
                      >
                        {habit.title}
                      </span>

                      {/* Quiet Unboxed Metadata Tags */}
                      <span className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5]">
                        {tagsToDisplay.map((t, i) => (
                          <span key={i}>
                            {i > 0 && <span className="mx-1 opacity-50">/</span>}
                            #{t}
                          </span>
                        ))}
                      </span>

                      {habit.importance === 'crucial' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
                          Strict
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
                      <span className="flex items-center gap-1 text-[11px] text-[#9A9AA5]">
                        <Clock className="w-3 h-3 text-[#9A9AA5]" />
                        <span>{habit.scheduledTime}</span>
                      </span>

                      <span aria-hidden="true" className="opacity-40">·</span>

                      {/* Prominent Visual Streak Badge with Hover History */}
                      <StreakBadge
                        habit={habit}
                        partnerName={userProfile.partnerName}
                        size="sm"
                      />

                      {habit.targetValue > 1 && (
                        <>
                          <span aria-hidden="true" className="opacity-40">·</span>
                          <span className="font-semibold text-[#7C3AED] dark:text-[#A78BFA] tabular-nums">
                            {habit.currentValue}/{habit.targetValue} {habit.unit}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Counter & Delete Action */}
                <div className="flex items-center gap-2 shrink-0">
                  {habit.targetValue > 1 && !habit.completed && (
                    <div className="flex items-center gap-1 glass rounded-[12px] px-2 py-1">
                      <button
                        onClick={() => onIncrementHabit(habit.id, -1)}
                        className="text-xs px-1 text-[#6B6B76] hover:text-[#1A1A1F] dark:hover:text-white font-bold cursor-pointer"
                        title="Decrement"
                      >
                        -
                      </button>
                      <span className="text-xs font-extrabold text-[#7C3AED] dark:text-[#A78BFA] tabular-nums">
                        {habit.currentValue}
                      </span>
                      <button
                        onClick={() => {
                          triggerCelebration();
                          onIncrementHabit(habit.id, 1);
                        }}
                        className="text-xs px-1 text-[#6B6B76] hover:text-[#1A1A1F] dark:hover:text-white font-bold cursor-pointer"
                        title="Increment"
                      >
                        +
                      </button>
                    </div>
                  )}

                  <button
                    id={`delete-habit-${habit.id}`}
                    onClick={() => onDeleteHabit(habit.id)}
                    title="Delete habit"
                    className="p-1.5 rounded-[12px] text-[#9A9AA5] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
