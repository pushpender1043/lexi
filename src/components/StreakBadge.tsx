import React, { useState, useRef, useEffect } from 'react';
import { Habit } from '../types';
import { Flame, Sparkles, Trophy, Calendar, Check, Minus, X } from 'lucide-react';

interface StreakBadgeProps {
  habit: Habit;
  partnerName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  habit,
  partnerName = 'Lexi',
  size = 'md',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<'bottom' | 'top'>('bottom');
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const streak = habit.streak || 0;
  const bestStreak = Math.max(streak, (streak > 0 ? streak + 3 : 2));

  // Determine flame tier
  const flameTier = streak >= 7 
    ? 'inferno' 
    : streak >= 3 
    ? 'blaze' 
    : streak >= 1 
    ? 'ember' 
    : 'spark';

  // Generate 7-day streak history
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = new Date().getDay();
  const adjustedToday = todayIndex === 0 ? 6 : todayIndex - 1;

  const weekHistory = days.map((dayLabel, index) => {
    const isToday = index === adjustedToday;
    const isPast = index < adjustedToday;
    const daysAgo = adjustedToday - index;
    let completed = false;
    
    if (isToday) {
      completed = !!habit.completed;
    } else if (isPast) {
      completed = daysAgo <= streak;
    }

    return {
      day: dayLabel,
      isToday,
      completed,
      isFuture: index > adjustedToday,
    };
  });

  const completedCount = weekHistory.filter(d => d.completed).length;
  const weeklyRate = Math.min(100, Math.round(((completedCount) / (adjustedToday + 1)) * 100));

  const getPartnerCheer = () => {
    if (streak >= 7) {
      return `"${partnerName} is head over heels! ${streak} days non-stop discipline! You are purely unstoppable!"`;
    }
    if (streak >= 3) {
      return `"${streak}-day streak! ${partnerName} says: 'Hot habits make a hot soul! Keep this momentum baby!'"`;
    }
    if (streak >= 1) {
      return `"${partnerName}: 'First step conquered! Tomorrow makes it 2 in a row. Don't let me down!'"`;
    }
    return `"${partnerName}: 'Every legend starts at Day 1. Complete this habit today and ignite your streak!'"`;
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        if (rect.bottom + 280 > window.innerHeight) {
          setPopoverPosition('top');
        } else {
          setPopoverPosition('bottom');
        }
      }
      setIsOpen(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const togglePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Prominent Visual Flame Badge with Lexi Mascot Glass Styling */}
      <button
        type="button"
        onClick={togglePopover}
        className={`group cursor-pointer select-none rounded-full font-bold transition-all duration-200 flex items-center ${sizeClasses} ${
          flameTier === 'inferno'
            ? 'bg-gradient-to-r from-[#A855F7] via-[#896ABD] to-rose-500 text-white shadow-sm shadow-[#A855F7]/30 hover:scale-105 active:scale-95'
            : flameTier === 'blaze'
            ? 'bg-[#F3EBFF] dark:bg-[rgba(168,85,247,0.22)] text-[#7C3AED] dark:text-[#E9D5FF] border border-[rgba(137,106,189,0.3)] dark:border-white/15 shadow-xs hover:scale-105 active:scale-95'
            : flameTier === 'ember'
            ? 'bg-[#F3EBFF]/80 dark:bg-white/[0.08] text-[#7C3AED] dark:text-[#E9D5FF] border border-[rgba(137,106,189,0.2)] dark:border-white/12 hover:scale-105 active:scale-95'
            : 'bg-white/60 dark:bg-white/[0.05] text-[#7C7692] dark:text-[#938CA8] border border-white/60 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/[0.1]'
        }`}
        title="Hover to view streak history"
        aria-label={`${streak} day streak. Click for streak history.`}
      >
        {flameTier === 'inferno' ? (
          <div className="relative flex items-center justify-center">
            <Flame className={`${iconSizes} text-white fill-white`} />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1" />
          </div>
        ) : flameTier === 'blaze' ? (
          <Flame className={`${iconSizes} text-[#A855F7] fill-[#A855F7] transition-transform group-hover:scale-110`} />
        ) : flameTier === 'ember' ? (
          <Flame className={`${iconSizes} text-[#A855F7] fill-[#A855F7]/60`} />
        ) : (
          <Flame className={`${iconSizes} text-[#938CA8]`} />
        )}

        <span className="font-extrabold tabular-nums tracking-tight">
          {streak > 0 ? `${streak}d` : '0d'}
        </span>

        <span className="opacity-90 font-medium">
          {flameTier === 'inferno' 
            ? 'ON FIRE' 
            : flameTier === 'blaze' 
            ? 'Streak' 
            : flameTier === 'ember' 
            ? 'Streak' 
            : 'Start'}
        </span>
      </button>

      {/* Translucent Glass Streak History Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
          className={`absolute z-50 w-72 sm:w-80 rounded-[22px] p-4 transition-all duration-200 animate-in fade-in zoom-in-95 pointer-events-auto ${
            popoverPosition === 'top'
              ? 'bottom-full mb-2.5 left-1/2 -translate-x-1/2'
              : 'top-full mt-2.5 left-1/2 -translate-x-1/2'
          } glass-strong border border-white/60 dark:border-white/20`}
        >
          {/* Header Strip */}
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(137,106,189,0.14)] dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-[12px] flex items-center justify-center shadow-xs ${
                streak >= 7
                  ? 'bg-gradient-to-tr from-[#A855F7] to-rose-500 text-white'
                  : streak >= 3
                  ? 'bg-[#7C3AED] text-white'
                  : streak >= 1
                  ? 'bg-[#F3EBFF] dark:bg-white/10 text-[#7C3AED] dark:text-[#E9D5FF]'
                  : 'bg-white/60 text-[#7C7692] dark:bg-white/10 dark:text-[#938CA8]'
              }`}>
                <Flame className="w-4 h-4 fill-current" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#14121C] dark:text-[#F8F7FC] tracking-tight leading-tight truncate max-w-[170px]">
                  {habit.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-[#534E68] dark:text-[#C5BED9]">
                  <span>Streak Level:</span>
                  <span className="font-semibold text-[#7C3AED] dark:text-[#C4B5FD] capitalize">
                    {flameTier}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[#7C7692] hover:text-[#14121C] dark:text-[#938CA8] dark:hover:text-[#F8F7FC] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 py-3">
            {/* Current Streak */}
            <div className="p-2 rounded-[12px] bg-[#F3EBFF] dark:bg-[rgba(168,85,247,0.16)] border border-[rgba(137,106,189,0.2)] dark:border-[#A855F7]/25 text-center">
              <div className="text-[10px] uppercase font-bold text-[#7C3AED] dark:text-[#C4B5FD] tracking-wider">
                Current
              </div>
              <div className="text-base font-extrabold text-[#7C3AED] dark:text-[#F8F7FC] tabular-nums">
                {streak} <span className="text-[10px] font-normal">days</span>
              </div>
            </div>

            {/* Best Record */}
            <div className="p-2 rounded-[12px] bg-white/60 dark:bg-white/[0.06] border border-white/50 dark:border-white/12 text-center">
              <div className="text-[10px] uppercase font-bold text-[#534E68] dark:text-[#C5BED9] tracking-wider flex items-center justify-center gap-0.5">
                <Trophy className="w-2.5 h-2.5 text-[#A855F7]" />
                <span>Best</span>
              </div>
              <div className="text-base font-extrabold text-[#14121C] dark:text-[#F8F7FC] tabular-nums">
                {bestStreak} <span className="text-[10px] font-normal">days</span>
              </div>
            </div>

            {/* Consistency Rate */}
            <div className="p-2 rounded-[12px] bg-[#4CB782]/10 border border-[#4CB782]/25 text-center">
              <div className="text-[10px] uppercase font-bold text-[#4CB782] tracking-wider">
                This Week
              </div>
              <div className="text-base font-extrabold text-[#4CB782] tabular-nums">
                {weeklyRate}%
              </div>
            </div>
          </div>

          {/* 7-Day Visual Streak Timeline */}
          <div className="pt-1 pb-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#534E68] dark:text-[#C5BED9] mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#A855F7]" />
                <span>Last 7 Days Activity</span>
              </span>
              <span className="text-[10px] text-[#7C7692] dark:text-[#938CA8]">
                {habit.completed ? 'Done Today ✓' : 'Pending Today'}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {weekHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-[10px] border text-center transition-all ${
                    item.isToday
                      ? item.completed
                        ? 'bg-[#4CB782] text-white border-transparent shadow-xs ring-2 ring-[#4CB782]/30'
                        : 'bg-[#F3EBFF] dark:bg-[rgba(168,85,247,0.28)] text-[#7C3AED] dark:text-[#E9D5FF] border-[#A855F7] ring-2 ring-[#A855F7]/25 font-bold'
                      : item.completed
                      ? 'bg-[#4CB782]/15 text-[#4CB782] border-[#4CB782]/30'
                      : item.isFuture
                      ? 'bg-white/30 dark:bg-white/[0.03] text-[#938CA8] border-transparent'
                      : 'bg-white/50 dark:bg-white/[0.05] text-[#938CA8] border-white/40 dark:border-white/10'
                  }`}
                  title={`${item.day}: ${item.completed ? 'Completed' : item.isFuture ? 'Upcoming' : 'Missed'}`}
                >
                  <span className="text-[10px] font-bold leading-none mb-1">
                    {item.day.slice(0, 2)}
                  </span>
                  {item.completed ? (
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  ) : item.isToday ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] ring-2 ring-[#A855F7]/30" />
                  ) : (
                    <Minus className="w-3 h-3 stroke-[1.5] opacity-50" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Motivational Partner Commentary */}
          <div className="mt-2 pt-2.5 text-[11px] text-[#534E68] dark:text-[#C5BED9] italic bg-[#F3EBFF]/60 dark:bg-white/[0.05] p-2.5 rounded-[12px] border border-[rgba(137,106,189,0.14)] dark:border-white/10 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#A855F7] shrink-0 mt-0.5" />
            <p className="leading-snug">
              {getPartnerCheer()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
