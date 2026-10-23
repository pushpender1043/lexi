import React, { useState } from 'react';
import { X, Search, Plus, MessageSquare, Clock } from 'lucide-react';
import { AexoMascot } from './AexoMascot';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const DEFAULT_HISTORY = [
  'Today gym and hydration routine accountability',
  'Weekly mood and discipline check-in',
  'Morning workout streak and breakfast reminder',
  'Deep work sprint planning with Lexi',
  'Evening reflection and peaceful wind-down',
];

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onSelectPrompt,
}) => {
  const [search, setSearch] = useState('');
  const [historyItems] = useState<string[]>(DEFAULT_HISTORY);

  if (!isOpen) return null;

  const filtered = historyItems.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Drawer panel */}
      <div className="absolute inset-y-0 right-0 max-w-sm w-full glass-strong shadow-[var(--shadow-glass)] border-l border-[var(--border)] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AexoMascot size="sm" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">Chat History</h2>
          </div>
          <button
            id="close-history-drawer-btn"
            onClick={onClose}
            className="p-2 rounded-[12px] glass-button text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-[12px] glass-input text-xs"
            />
          </div>

          {/* New Chat Button */}
          <button
            id="new-chat-btn"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="btn-primary-purple w-full py-2.5 px-4 rounded-[12px] font-semibold text-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 no-scrollbar">
          <div className="text-[10px] font-bold text-[var(--text-muted)] px-2 py-1 uppercase tracking-wider">
            Recent Conversations
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--text-muted)]">
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
                className="w-full text-left p-3 rounded-[16px] glass border border-transparent hover:border-[var(--border)] transition-all cursor-pointer flex items-center justify-between group hover:scale-101"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <MessageSquare className="w-4 h-4 text-[var(--primary-purple)] shrink-0" />
                  <span className="text-xs text-[var(--text-primary)] truncate font-medium">
                    {item}
                  </span>
                </div>
                <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 opacity-40 group-hover:opacity-100" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] text-center">
          <p className="text-[11px] text-[var(--text-muted)]">
            Lexi AI Companion • Synced History
          </p>
        </div>
      </div>
    </div>
  );
};
