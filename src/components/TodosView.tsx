import React, { useState } from 'react';
import { Habit, HabitCategory, UserProfile, PartnerMood } from '../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Clock,
  Dumbbell,
  Droplet,
  Pill,
  BookOpen,
  Sparkles,
  Trash2,
  Filter,
  Smile,
  Zap,
  Target
} from 'lucide-react';
import { AexoMascot } from './AexoMascot';

interface TodosViewProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onIncrementHabit: (id: string, delta: number) => void;
  onAddHabit: (newHabit: Omit<Habit, 'id' | 'streak' | 'completed'>) => void;
  onDeleteHabit: (id: string) => void;
  userProfile: UserProfile;
  partnerMood: PartnerMood;
}

export const TodosView: React.FC<TodosViewProps> = ({
  habits,
  onToggleHabit,
  onIncrementHabit,
  onAddHabit,
  onDeleteHabit,
  userProfile,
  partnerMood,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<HabitCategory>('fitness');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newTarget, setNewTarget] = useState(1);
  const [newUnit, setNewUnit] = useState('times');
  const [newImportance, setNewImportance] = useState<'crucial' | 'medium' | 'flexible'>('medium');

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered habits
  const filteredHabits = habits.filter(h => {
    const matchesCategory = selectedCategory === 'all' || h.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !h.completed) ||
      (statusFilter === 'completed' && h.completed);
    return matchesCategory && matchesStatus;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHabit({
      title: newTitle.trim(),
      category: newCategory,
      scheduledTime: newTime || 'Anytime',
      targetValue: Number(newTarget) || 1,
      currentValue: 0,
      unit: newUnit || 'times',
      importance: newImportance,
    });

    setNewTitle('');
    setIsAddingTask(false);
  };

  const getCategoryIcon = (category: HabitCategory) => {
    switch (category) {
      case 'fitness':
        return <Dumbbell className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'hydration':
        return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'health':
        return <Pill className="w-4 h-4 text-rose-500" />;
      case 'study':
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-12 select-none animate-in fade-in duration-300">
      
      {/* Minimal Header Summary Card with Clean Lines */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-[#161224]/90 border border-purple-100 dark:border-purple-900/30 shadow-[0_4px_24px_-4px_rgba(124,58,237,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1E1838] dark:text-[#F1EEF9]">
                Daily Accountability & Wins
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">
                {completedCount}/{totalCount} Completed
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {userProfile.partnerName} monitors your daily habits, streaks & goals with real-time feedback.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Streak Pill */}
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/40 text-purple-900 dark:text-purple-200 text-xs font-semibold">
              <Flame className="w-4 h-4 text-purple-600 fill-purple-600" />
              <span>{userProfile.streakDays}d Streak</span>
            </div>

            {/* Quick Add Button */}
            <button
              id="todos-add-task-btn"
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingTask ? 'Cancel' : 'New Habit'}</span>
            </button>
          </div>
        </div>

        {/* Clean Progress Bar */}
        <div className="mt-4 pt-4 border-t border-purple-100/70 dark:border-white/5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
            <span className="font-medium">Today's Discipline Completion</span>
            <span className="font-bold text-purple-700 dark:text-purple-300">{completionPercentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-purple-100/60 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-500 transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Companion Feedback Quote */}
        <div className="mt-3 px-3.5 py-2.5 rounded-2xl bg-purple-50/60 dark:bg-white/3 border border-purple-100/80 dark:border-white/5 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <AexoMascot size="sm" />
            <span><strong>{userProfile.partnerName}:</strong> "{partnerMood.lastReason}"</span>
          </div>
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-300">
            Mood: {partnerMood.score}%
          </span>
        </div>
      </div>

      {/* Add Task Form (collapsible) */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="p-5 rounded-3xl bg-white dark:bg-[#161224] border border-purple-200 dark:border-purple-800/60 shadow-xl animate-in fade-in slide-in-from-top-2 space-y-3"
        >
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Add New Habit or Goal
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1">Habit Title</label>
              <input
                id="new-todo-title-input"
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Read 15 pages, Drink 3L Water, Gym Session"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1">Category</label>
              <select
                id="new-todo-category-select"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as HabitCategory)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              >
                <option value="fitness">Fitness & Workout 💪</option>
                <option value="hydration">Hydration 💧</option>
                <option value="health">Health & Medicine 💊</option>
                <option value="study">Study & Deep Work 📚</option>
                <option value="mindset">Mindset & Routine 🧘</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1">Target Value / Times</label>
              <input
                type="number"
                min="1"
                value={newTarget}
                onChange={e => setNewTarget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1">Importance</label>
              <select
                id="new-todo-importance-select"
                value={newImportance}
                onChange={e => setNewImportance(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              >
                <option value="crucial">Crucial (High Accountability)</option>
                <option value="medium">Medium Priority</option>
                <option value="flexible">Flexible Routine</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-new-todo-btn"
              type="submit"
              className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-transform active:scale-95"
            >
              Save Habit
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Status with Clean Lines */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All Habits' },
            { id: 'fitness', label: 'Fitness' },
            { id: 'hydration', label: 'Water' },
            { id: 'health', label: 'Health' },
            { id: 'study', label: 'Study/Work' },
            { id: 'mindset', label: 'Routine' },
          ].map(cat => (
            <button
              key={cat.id}
              id={`todo-filter-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-purple-100 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-purple-950/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-white/80 dark:bg-white/5 p-1 rounded-2xl border border-purple-100 dark:border-white/10 text-xs">
          {(['all', 'pending', 'completed'] as const).map(status => (
            <button
              key={status}
              id={`todo-status-${status}`}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-xl capitalize text-xs transition-all ${
                statusFilter === status
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-semibold shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-2.5">
        {filteredHabits.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#161224] border border-purple-100 dark:border-purple-900/30 text-zinc-500">
            <CheckCircle2 className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-70" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No habits found in this section.</p>
            <p className="text-xs text-zinc-400 mt-0.5">Add a new habit or adjust your filter.</p>
          </div>
        ) : (
          filteredHabits.map(habit => (
            <div
              key={habit.id}
              id={`todo-item-${habit.id}`}
              className={`p-4 rounded-3xl border transition-all flex items-start sm:items-center justify-between gap-3 ${
                habit.completed
                  ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-100/70 dark:border-purple-900/30 text-zinc-500'
                  : 'bg-white dark:bg-[#161224] border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 shadow-[0_2px_12px_-2px_rgba(124,58,237,0.04)]'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                {/* Circular Checkbox */}
                <button
                  id={`toggle-todo-${habit.id}`}
                  onClick={() => onToggleHabit(habit.id)}
                  title={habit.completed ? 'Mark pending' : 'Mark completed'}
                  className="mt-0.5 sm:mt-0 text-purple-600 hover:text-purple-700 transition-transform active:scale-90"
                >
                  {habit.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-purple-600 fill-purple-100 dark:fill-purple-950" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 hover:text-purple-500" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="p-1 rounded-xl bg-purple-50 dark:bg-purple-950/60">
                      {getCategoryIcon(habit.category)}
                    </span>
                    <span
                      className={`text-sm font-bold tracking-tight truncate ${
                        habit.completed
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'text-[#1E1838] dark:text-[#F1EEF9]'
                      }`}
                    >
                      {habit.title}
                    </span>

                    {habit.importance === 'crucial' && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold">
                        Crucial
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{habit.scheduledTime}</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-purple-500 fill-purple-500" />
                      <span>{habit.streak}d streak</span>
                    </span>

                    {habit.targetValue > 1 && (
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {habit.currentValue}/{habit.targetValue} {habit.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Counter / Progress Increment & Delete */}
              <div className="flex items-center gap-2">
                {habit.targetValue > 1 && !habit.completed && (
                  <div className="flex items-center gap-1 bg-[#F8F6FD] dark:bg-white/5 border border-purple-100 dark:border-white/10 rounded-xl px-2 py-1">
                    <button
                      onClick={() => onIncrementHabit(habit.id, -1)}
                      className="text-xs px-1.5 text-zinc-500 hover:text-zinc-800"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      {habit.currentValue}
                    </span>
                    <button
                      onClick={() => onIncrementHabit(habit.id, 1)}
                      className="text-xs px-1.5 text-zinc-500 hover:text-zinc-800"
                    >
                      +
                    </button>
                  </div>
                )}

                <button
                  id={`delete-todo-${habit.id}`}
                  onClick={() => onDeleteHabit(habit.id)}
                  title="Delete habit"
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
