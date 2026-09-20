import React, { useState } from 'react';
import { X, Search, Plus, MessageSquare, Trash2, Clock } from 'lucide-react';
import { AexoMascot } from './AexoMascot';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const DEFAULT_HISTORY = [
  'beta Mera kam Kyon nahin karta',
  'Write a poem about AI',
  'Explain quantum computing simply',
  'Generate a startup idea for 2026',
  'Today gym and hydration routine accountability',
  'Weekly mood and discipline check-in',
];

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onSelectPrompt,
}) => {
  const [search, setSearch] = useState('');
  const [historyItems, setHistoryItems] = useState<string[]>(DEFAULT_HISTORY);

  if (!isOpen) return null;

  const filtered = historyItems.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/30 dark:bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer panel (Page 6 in PDF) */}
      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-[#130F20] shadow-2xl border-l border-purple-100 dark:border-purple-900/30 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AexoMascot size="sm" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">History</h2>
          </div>
          <button
            id="close-history-drawer-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#F5F2FC] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* New Chat Button */}
          <button
            id="new-chat-btn"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full mt-3 py-2.5 px-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/70 border border-purple-200/70 dark:border-purple-800/40 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 no-scrollbar">
          <div className="text-[11px] font-semibold text-zinc-400 px-2 py-1 uppercase tracking-wider">
            Recent Conversations
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-400">
              No conversations match your search.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectPrompt(item);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-2xl bg-zinc-50/60 dark:bg-white/3 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-transparent hover:border-purple-200 dark:hover:border-purple-900/40 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate font-medium">
                    {item}
                  </span>
                </div>
                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0 opacity-40 group-hover:opacity-100" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-white/5 text-center">
          <p className="text-[11px] text-zinc-400">
            Aexo Smart Assistant • Instant Synced History
          </p>
        </div>
      </div>
    </div>
  );
};
