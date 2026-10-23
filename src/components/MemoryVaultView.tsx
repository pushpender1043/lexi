import React, { useState } from 'react';
import { MemoryItem, UserProfile } from '../types';
import { Brain, Plus, Sparkles, Trash2 } from 'lucide-react';

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
        return { label: 'Health & Wellness', color: 'bg-[var(--success-green)]/15 text-[var(--success-green)]' };
      case 'exam':
        return { label: 'Exams & Academics', color: 'bg-[var(--primary-purple)]/15 text-[var(--primary-purple)]' };
      case 'preference':
        return { label: 'Personal Taste', color: 'bg-[var(--soft-lavender)]/25 text-[var(--deep-purple)] dark:text-purple-300' };
      case 'relationship':
        return { label: 'Romantic & Bond', color: 'bg-rose-500/15 text-rose-500' };
      case 'goal':
        return { label: 'Life Goals', color: 'bg-amber-500/15 text-amber-500' };
      default:
        return { label: 'General', color: 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]' };
    }
  };

  return (
    <div className="w-full glass rounded-[20px] p-5 sm:p-6 shadow-[var(--shadow-glass)] border border-[var(--border)] space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>Long-Term Memory Vault</span>
            <Brain className="w-5 h-5 text-[var(--soft-lavender)] animate-pulse" />
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            What {userProfile.partnerName} remembers about your health, exams, preferences, and personal goals.
          </p>
        </div>

        <button
          id="add-memory-toggle-btn"
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary-purple px-3.5 py-2 rounded-[12px] text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Teach {userProfile.partnerName}</span>
        </button>
      </div>

      {/* Add Memory Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 rounded-[16px] glass-strong border border-[var(--primary-purple)]/40 shadow-md animate-fade-in space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
            Share a detail with {userProfile.partnerName} to remember forever
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Category</label>
              <select
                id="memory-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs"
              >
                <option value="health">Health & Illness 🩺</option>
                <option value="exam">Exams & Tests 📝</option>
                <option value="preference">Habits & Food Preferences ☕</option>
                <option value="goal">Aspirations & Gym Goals 🏆</option>
                <option value="relationship">Sweet Memories & Nicknames ❤️</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">What should {userProfile.partnerName} remember?</label>
              <input
                id="memory-fact-input"
                type="text"
                value={fact}
                onChange={e => setFact(e.target.value)}
                placeholder="e.g. I have a sore throat today and need warm water reminders"
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs"
                required
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-[12px] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              id="save-memory-submit-btn"
              type="submit"
              className="btn-primary-purple px-4 py-1.5 rounded-[12px] text-xs font-semibold"
            >
              Commit to Memory
            </button>
          </div>
        </form>
      )}

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {memories.map((mem, index) => {
          const badge = getCategoryBadge(mem.category);
          return (
            <div
              key={mem.id ? `${mem.id}-${index}` : `mem-${index}`}
              id={`memory-card-${mem.id}`}
              className="p-4 rounded-[16px] glass border border-[var(--border)] hover:border-[var(--primary-purple)]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border border-transparent ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {mem.learnedAt}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                  "{mem.fact}"
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1 text-[var(--soft-lavender)] font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>Recalled in chat & calls</span>
                </span>

                <button
                  id={`delete-memory-btn-${mem.id}`}
                  onClick={() => onDeleteMemory(mem.id)}
                  className="text-[var(--text-muted)] hover:text-rose-500 p-1 transition-colors"
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
