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
        return { label: 'Health & Wellness', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-400/25' };
      case 'exam':
        return { label: 'Exams & Academics', color: 'bg-[#896ABD]/15 dark:bg-[#A855F7]/18 text-[#6D28D9] dark:text-[#D8B4FE] border-[#A855F7]/25' };
      case 'preference':
        return { label: 'Personal Taste', color: 'bg-purple-500/15 text-[#6D28D9] dark:text-[#E9D5FF] border-purple-400/25' };
      case 'relationship':
        return { label: 'Romantic & Bond', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-400/25' };
      case 'goal':
        return { label: 'Life Goals', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/25' };
      default:
        return { label: 'General', color: 'bg-black/5 dark:bg-white/10 text-[#534E68] dark:text-[#C5BED9] border-white/15' };
    }
  };

  return (
    <div className="w-full glass rounded-[24px] p-5 sm:p-6 shadow-[var(--shadow-glass)] border border-white/60 dark:border-white/15 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-[#14121C] dark:text-[#F8F7FC] flex items-center gap-2">
            <span>Long-Term Memory Vault</span>
            <Brain className="w-5 h-5 text-[#A855F7] animate-pulse" />
          </h2>
          <p className="text-xs text-[#534E68] dark:text-[#C5BED9] mt-0.5">
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
        <form onSubmit={handleAdd} className="p-4 rounded-[18px] glass-strong border border-[#896ABD]/40 dark:border-[#A855F7]/35 shadow-md animate-fade-in space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-[#14121C] dark:text-[#F8F7FC]">
            Share a detail with {userProfile.partnerName} to remember forever
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-semibold text-[#534E68] dark:text-[#C5BED9] mb-1">Category</label>
              <select
                id="memory-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC]"
              >
                <option value="health">Health & Illness 🩺</option>
                <option value="exam">Exams & Tests 📝</option>
                <option value="preference">Habits & Food Preferences ☕</option>
                <option value="goal">Aspirations & Gym Goals 🏆</option>
                <option value="relationship">Sweet Memories & Nicknames ❤️</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#534E68] dark:text-[#C5BED9] mb-1">What should {userProfile.partnerName} remember?</label>
              <input
                id="memory-fact-input"
                type="text"
                value={fact}
                onChange={e => setFact(e.target.value)}
                placeholder="e.g. I have a sore throat today and need warm water reminders"
                className="w-full px-3 py-2 rounded-[12px] glass-input text-xs text-[#14121C] dark:text-[#F8F7FC] placeholder:text-[#7C7692] dark:placeholder:text-[#938CA8]"
                required
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="glass-button px-3 py-1.5 rounded-[12px] text-xs font-semibold text-[#534E68] dark:text-[#C5BED9] hover:text-[#14121C] dark:hover:text-[#F8F7FC] cursor-pointer"
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
              className="p-4 rounded-[18px] bg-white/65 dark:bg-white/[0.045] backdrop-blur-xl border border-white/60 dark:border-white/[0.12] hover:border-[#896ABD]/45 dark:hover:border-[#A855F7]/45 shadow-[0_8px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-[#7C7692] dark:text-[#938CA8] font-mono tabular-nums">
                    {mem.learnedAt}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#14121C] dark:text-[#F8F7FC] leading-relaxed">
                  &ldquo;{mem.fact}&rdquo;
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-[#7C7692] dark:text-[#938CA8]">
                <span className="flex items-center gap-1 text-[#7C3AED] dark:text-[#C4B5FD] font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>Recalled in chat &amp; calls</span>
                </span>

                <button
                  id={`delete-memory-btn-${mem.id}`}
                  onClick={() => onDeleteMemory(mem.id)}
                  className="text-[#7C7692] dark:text-[#938CA8] hover:text-rose-500 dark:hover:text-rose-400 p-1 transition-colors cursor-pointer"
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
