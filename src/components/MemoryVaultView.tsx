import React, { useState } from 'react';
import { MemoryItem, UserProfile } from '../types';
import { Brain, Heart, Plus, Sparkles, Trash2, Tag, ShieldCheck } from 'lucide-react';

interface MemoryVaultViewProps {
  memories: MemoryItem[];
  userProfile: UserProfile;
  onAddMemory: (category: MemoryItem['category'], fact: string) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoryVaultView: React.FC<MemoryVaultViewProps> = ({
  memories,
  userProfile,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [fact, setFact] = useState('');
  const [category, setCategory] = useState<MemoryItem['category']>('health');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fact.trim()) return;
    onAddMemory(category, fact.trim());
    setFact('');
    setIsAdding(false);
  };

  const getCategoryBadge = (cat: MemoryItem['category']) => {
    switch (cat) {
      case 'health':
        return { label: 'Health & Wellness', color: 'bg-emerald-100 text-emerald-800' };
      case 'exam':
        return { label: 'Exams & Academics', color: 'bg-blue-100 text-blue-800' };
      case 'preference':
        return { label: 'Personal Taste', color: 'bg-purple-100 text-purple-800' };
      case 'relationship':
        return { label: 'Romantic & Bond', color: 'bg-rose-100 text-rose-800' };
      case 'goal':
        return { label: 'Life Goals', color: 'bg-amber-100 text-amber-800' };
      default:
        return { label: 'General', color: 'bg-zinc-100 text-zinc-800' };
    }
  };

  return (
    <div className="w-full glass-card rounded-3xl p-5 sm:p-7 shadow-xl border border-white/70 dark:border-white/10 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Long-Term Memory Vault</span>
            <Brain className="w-5 h-5 text-purple-500 animate-pulse" />
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            What {userProfile.partnerName} remembers about your health, exams, preferences, and personal goals.
          </p>
        </div>

        <button
          id="add-memory-toggle-btn"
          onClick={() => setIsAdding(!isAdding)}
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Teach {userProfile.partnerName}</span>
        </button>
      </div>

      {/* Add Memory Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-800/90 border border-purple-200 shadow-md animate-fade-in">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            Share a detail with {userProfile.partnerName} to remember forever
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Category</label>
              <select
                id="memory-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white dark:bg-zinc-900"
              >
                <option value="health">Health & Illness 🩺</option>
                <option value="exam">Exams & Tests 📝</option>
                <option value="preference">Habits & Food Preferences ☕</option>
                <option value="goal">Aspirations & Gym Goals 🏆</option>
                <option value="relationship">Sweet Memories & Nicknames ❤️</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">What should {userProfile.partnerName} remember?</label>
              <input
                id="memory-fact-input"
                type="text"
                value={fact}
                onChange={e => setFact(e.target.value)}
                placeholder="e.g. I have a sore throat today and need warm water reminders"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white dark:bg-zinc-900"
                required
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-zinc-600 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              id="save-memory-submit-btn"
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-sm"
            >
              Commit to Long-Term Memory
            </button>
          </div>
        </form>
      )}

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {memories.map(mem => {
          const badge = getCategoryBadge(mem.category);
          return (
            <div
              key={mem.id}
              id={`memory-card-${mem.id}`}
              className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/40 border border-white/80 dark:border-white/10 hover:border-purple-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {mem.learnedAt}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  "{mem.fact}"
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-700/40 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Recalled organically in chat & calls</span>
                </span>

                <button
                  id={`delete-memory-btn-${mem.id}`}
                  onClick={() => onDeleteMemory(mem.id)}
                  className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
                  title="Remove memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
