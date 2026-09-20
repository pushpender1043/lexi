import React, { useState } from 'react';
import { ProactiveNudge, UserProfile } from '../types';
import { AexoMascot } from './AexoMascot';
import { X, ArrowRight, CheckCircle2, Sparkles, Check } from 'lucide-react';

interface ProactiveNotificationBannerProps {
  nudge: ProactiveNudge | null;
  onDismiss: () => void;
  onReplyInChat: (text: string) => void;
  onMarkCompleteHabit?: (habitId?: string, habitTitle?: string) => void;
  userProfile: UserProfile;
}

export const ProactiveNotificationBanner: React.FC<ProactiveNotificationBannerProps> = ({
  nudge,
  onDismiss,
  onReplyInChat,
  onMarkCompleteHabit,
  userProfile,
}) => {
  const [isCompletedJustNow, setIsCompletedJustNow] = useState(false);

  if (!nudge) return null;

  const partnerName = userProfile.partnerName || 'Lexi';
  const isHabitRelated = nudge.type === 'habit_reminder' || !!nudge.habitId || !!nudge.habitTitle || nudge.message.toLowerCase().includes('water') || nudge.message.toLowerCase().includes('gym') || nudge.message.toLowerCase().includes('habit');

  const handleMarkComplete = () => {
    setIsCompletedJustNow(true);
    if (onMarkCompleteHabit) {
      onMarkCompleteHabit(nudge.habitId, nudge.habitTitle);
    }
    setTimeout(() => {
      onDismiss();
      setIsCompletedJustNow(false);
    }, 1200);
  };

  return (
    <div 
      id={`proactive-nudge-${nudge.id}`}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <div className="bg-white/95 dark:bg-[#161224]/95 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 shadow-[0_12px_36px_-4px_rgba(124,58,237,0.2)] border border-purple-200/90 dark:border-purple-800/50 flex items-start gap-3">
        {/* Companion Mascot Avatar */}
        <div className="relative shrink-0">
          <AexoMascot size="sm" isListening={true} />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#161224]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {partnerName}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                {isHabitRelated ? 'Habit Reminder' : 'Companion Nudge'}
              </span>
            </div>
            <button
              id="dismiss-nudge-btn"
              onClick={onDismiss}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
            "{nudge.message}"
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Direct Mark Complete Action Button */}
            {isHabitRelated && (
              <button
                id="nudge-mark-complete-btn"
                onClick={handleMarkComplete}
                disabled={isCompletedJustNow}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                  isCompletedJustNow
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {isCompletedJustNow ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Done! Awesome job! 🎉</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Complete</span>
                  </>
                )}
              </button>
            )}

            <button
              id="nudge-reply-btn"
              onClick={() => {
                onReplyInChat(`Hey ${partnerName}, I saw your reminder: "${nudge.message.slice(0, 32)}..." I'm on it! ❤️`);
                onDismiss();
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <span>Reply</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              id="nudge-dismiss-action-btn"
              onClick={onDismiss}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
