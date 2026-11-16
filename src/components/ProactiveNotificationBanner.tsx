import React, { useState } from 'react';
import { ProactiveNudge, UserProfile } from '../types';
import { AexoMascot } from './AexoMascot';
import { X, ArrowRight, CheckCircle2, Check } from 'lucide-react';

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
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg transition-all duration-300 animate-in fade-in slide-in-from-top-4 select-none"
    >
      <div className="glass-strong rounded-[24px] p-4 shadow-[var(--shadow-glass)] border border-white/60 dark:border-white/20 flex items-start gap-3.5">
        {/* Companion Mascot Avatar */}
        <div className="relative shrink-0">
          <AexoMascot size="sm" isListening={true} />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--success-green)] ring-2 ring-white dark:ring-[#07060C]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {partnerName}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--light-purple-surface)] text-[var(--primary-purple)] dark:text-[#E9D5FF] border border-white/15">
                {isHabitRelated ? 'Habit Reminder' : 'Companion Nudge'}
              </span>
            </div>
            <button
              id="dismiss-nudge-btn"
              onClick={onDismiss}
              className="p-1.5 rounded-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
            "{nudge.message}"
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Direct Mark Complete Action Button */}
            {isHabitRelated && (
              <button
                id="nudge-mark-complete-btn"
                onClick={handleMarkComplete}
                disabled={isCompletedJustNow}
                className={`px-3 py-1.5 rounded-[12px] text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                  isCompletedJustNow
                    ? 'bg-[var(--success-green)] text-white animate-pulse'
                    : 'bg-[var(--success-green)] hover:brightness-105 text-white'
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
              className="btn-primary-purple px-3 py-1.5 rounded-[12px] text-[11px] font-semibold shadow-xs flex items-center gap-1.5"
            >
              <span>Reply</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              id="nudge-dismiss-action-btn"
              onClick={onDismiss}
              className="glass-button px-2.5 py-1.5 rounded-[12px] text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
