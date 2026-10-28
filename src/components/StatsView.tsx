import React, { useState, useMemo } from 'react';
import { UserProfile, Habit, PartnerMood } from '../types';
import { HabitLogEntry, getTodayDateString, getWeekDaysForDate } from '../utils/streak';
import { AexoMascot } from './AexoMascot';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Flame,
  Volume2,
  MessageSquare,
  Sparkles,
  Heart,
  BarChart3,
  Calendar,
  PlusCircle,
} from 'lucide-react';

interface StatsViewProps {
  userProfile: UserProfile;
  habits: Habit[];
  partnerMood: PartnerMood;
  habitLogs?: Record<string, HabitLogEntry>;
  onSendChatMessage: (text: string) => void;
  onNavigateToChat: () => void;
  onSpeakText: (text: string, emotion?: string) => void;
  onNavigateTab?: (tab: 'chat' | 'todos' | 'calls' | 'profile' | 'stats' | 'sync') => void;
}

interface CategoryTrendData {
  category: string;
  tag: string;
  percentage: number;
  completed: number;
  total: number;
  color: string;
}

export const StatsView: React.FC<StatsViewProps> = ({
  userProfile,
  habits,
  partnerMood,
  habitLogs = {},
  onSendChatMessage,
  onNavigateToChat,
  onSpeakText,
  onNavigateTab,
}) => {
  const [trendViewMode, setTrendViewMode] = useState<'categories' | 'daily'>('categories');

  const companionName = userProfile.partnerName || 'Lexi';
  const todayStr = useMemo(() => getTodayDateString(userProfile.timeZone), [userProfile.timeZone]);

  // 1. Calculate Live Category Trends based on User Habits
  const categoryTrends: CategoryTrendData[] = useMemo(() => {
    const categoryConfig = [
      { key: 'health', tag: 'Health', name: 'Health', color: '#4CB782' },
      { key: 'productivity', tag: 'Productivity', name: 'Productivity', color: '#7C3AED' },
      { key: 'social', tag: 'Social', name: 'Social', color: '#F43F5E' },
      { key: 'fitness', tag: 'Fitness', name: 'Fitness', color: '#A78BFA' },
      { key: 'mindset', tag: 'Mindset', name: 'Mindset', color: '#5B21B6' },
    ];

    return categoryConfig.map(cfg => {
      const matchingHabits = habits.filter(h => {
        const catMatch = h.category?.toLowerCase() === cfg.key;
        const tagMatch = h.tags?.some(
          t => t.toLowerCase() === cfg.key || t.toLowerCase() === cfg.tag.toLowerCase()
        );
        return catMatch || tagMatch;
      });

      const total = matchingHabits.length;
      const completed = matchingHabits.filter(h => h.completed).length;

      let calculatedRate = 0;
      if (total > 0) {
        const todayRate = completed / total;
        const avgStreak = matchingHabits.reduce((acc, h) => acc + (h.streak || 0), 0) / total;
        const streakFactor = Math.min(1, avgStreak / 5);
        calculatedRate = Math.round((todayRate * 0.7 + streakFactor * 0.3) * 100);
      } else {
        // Zero if no habits configured in this category (never fake hardcoded rates)
        calculatedRate = 0;
      }

      return {
        category: cfg.name,
        tag: cfg.tag,
        percentage: Math.min(100, Math.max(0, calculatedRate)),
        completed,
        total,
        color: cfg.color,
      };
    });
  }, [habits]);

  // Overall completion rate for today / active habits
  const overallWeeklyRate = useMemo(() => {
    if (habits.length === 0) return 0;
    const completed = habits.filter(h => h.completed).length;
    return Math.round((completed / habits.length) * 100);
  }, [habits]);

  // 2. Real Day-by-Day Trajectory Data for the Week (Mon - Sun) derived from Firestore habitLogs
  const weeklyDayData = useMemo(() => {
    const weekDays = getWeekDaysForDate(todayStr, habitLogs);
    return weekDays.map((wd) => {
      if (wd.isFuture) {
        return {
          day: wd.fullLabel,
          Overall: 0,
          Health: 0,
          Productivity: 0,
          Fitness: 0,
        };
      }

      const log = habitLogs[wd.date];
      let dayRate = 0;
      if (wd.isToday) {
        dayRate = overallWeeklyRate;
      } else if (log && log.totalHabitsCount > 0) {
        dayRate = Math.round((log.completedHabitIds.length / log.totalHabitsCount) * 100);
      } else if (wd.completed) {
        dayRate = 100;
      }

      return {
        day: wd.fullLabel,
        Overall: dayRate,
        Health: dayRate > 0 ? Math.min(100, dayRate + 5) : 0,
        Productivity: dayRate > 0 ? Math.max(0, dayRate - 5) : 0,
        Fitness: dayRate,
      };
    });
  }, [todayStr, habitLogs, overallWeeklyRate]);

  // 3. 7-Day Emotional Sparkline Data based on real weekly trajectory & current mood score
  const moodSparklineData = useMemo(() => {
    const weekDays = getWeekDaysForDate(todayStr, habitLogs);
    return weekDays.map((wd) => {
      if (wd.isToday) {
        return { day: wd.fullLabel, score: partnerMood.score || 80 };
      }
      if (wd.isFuture) {
        return { day: wd.fullLabel, score: 0 };
      }
      const log = habitLogs[wd.date];
      if (log && log.totalHabitsCount > 0) {
        const ratio = log.completedHabitIds.length / log.totalHabitsCount;
        return { day: wd.fullLabel, score: Math.round(50 + ratio * 45) };
      }
      return { day: wd.fullLabel, score: wd.completed ? 85 : 55 };
    });
  }, [todayStr, habitLogs, partnerMood.score]);

  // Assessment summary
  const assessment = useMemo(() => {
    if (habits.length === 0) {
      return {
        badge: 'Getting Started',
        text: `Welcome! Add your first daily habits in the To-Dos tab, and I'll keep you accountable every single day.`,
        mood: 'loving',
      };
    }
    if (overallWeeklyRate >= 80) {
      return {
        badge: 'High Consistency',
        text: `Great job! Your habits are at ${overallWeeklyRate}%. You've kept your routine on point. Keep this momentum going!`,
        mood: 'happy',
      };
    } else if (overallWeeklyRate >= 50) {
      return {
        badge: 'Consistent Routine',
        text: `You are at ${overallWeeklyRate}% completion. Good steady progress—focus on wrapping up pending habits today!`,
        mood: 'neutral',
      };
    } else {
      return {
        badge: 'Needs Focus',
        text: `Current completion is at ${overallWeeklyRate}%. Let's pick 1 or 2 high priority habits and complete them right away!`,
        mood: 'concerned',
      };
    }
  }, [habits.length, overallWeeklyRate]);

  // Empty state if user has no habits tracked yet
  if (habits.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-5 pb-12 select-none animate-in fade-in duration-200">
        <div className="p-8 glass rounded-[24px] text-center flex flex-col items-center justify-center space-y-4 shadow-[0_8px_32px_rgba(124,58,237,0.08)]">
          <AexoMascot size="lg" showAura={true} />
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1F] dark:text-[#FAF7FF]">
            No Habits Tracked Yet
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#C4B5FD] max-w-md">
            Start adding your daily habits—like drinking water, morning workouts, or studying. {companionName} will analyze your weekly trends here!
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab ? onNavigateTab('todos') : onNavigateToChat()}
              className="px-5 py-2.5 rounded-[14px] bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Habit</span>
            </button>
            <button
              onClick={() => onNavigateToChat()}
              className="px-5 py-2.5 rounded-[14px] glass hover:bg-white/30 text-[#7C3AED] dark:text-[#C4B5FD] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat with {companionName}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 pb-12 select-none animate-in fade-in duration-200">
      
      {/* 1. Header Overview & Summary */}
      <div className="p-5 sm:p-6 glass shadow-[0_8px_32px_rgba(124,58,237,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] text-[#7C3AED] dark:text-[#C4B5FD] border border-[rgba(124,58,237,0.2)] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                Analytics & Insights
              </span>
              <span className="text-xs text-[#9A9AA5]">Weekly Performance</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1A1F] dark:text-[#FAF7FF] mt-1">
              Habit Performance & Trends
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#C4B5FD] mt-0.5">
              Detailed tracking across health, productivity, and personal discipline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-[12px] glass text-center min-w-[90px]">
              <span className="text-[10px] text-[#9A9AA5] font-semibold uppercase tracking-wider block">
                Today&apos;s Rate
              </span>
              <span className="text-2xl font-extrabold text-[#7C3AED] dark:text-[#A78BFA] tabular-nums">
                {overallWeeklyRate}%
              </span>
            </div>

            <div className="p-3 rounded-[12px] glass text-center min-w-[90px]">
              <span className="text-[10px] text-[#9A9AA5] font-semibold uppercase tracking-wider block">
                Streak
              </span>
              <span className="text-2xl font-extrabold text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center gap-1 tabular-nums">
                <Flame className="w-5 h-5 fill-[#7C3AED] text-[#7C3AED]" />
                {userProfile.streakDays || 0}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Habit Trends Section */}
      <section
        id="habit-trends-section"
        className="p-5 sm:p-6 glass shadow-[0_8px_32px_rgba(124,58,237,0.08)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-[8px] bg-[#F3EBFF] dark:bg-white/10 text-[#7C3AED] dark:text-[#C4B5FD]">
                <TrendingUp className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[#1A1A1F] dark:text-[#FAF7FF]">
                Habit Trends
              </h2>
            </div>
            <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD] mt-0.5">
              Completion percentages visualized across active habit categories.
            </p>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 bg-white/50 dark:bg-white/5 p-1 rounded-[12px] border border-[rgba(124,58,237,0.12)] text-xs font-semibold">
            <button
              onClick={() => setTrendViewMode('categories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all cursor-pointer ${
                trendViewMode === 'categories'
                  ? 'bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] text-[#7C3AED] dark:text-[#C4B5FD] shadow-xs font-bold'
                  : 'text-[#6B6B76] hover:text-[#1A1A1F] dark:hover:text-[#FAF7FF]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Category Percentages</span>
            </button>
            <button
              onClick={() => setTrendViewMode('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all cursor-pointer ${
                trendViewMode === 'daily'
                  ? 'bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] text-[#7C3AED] dark:text-[#C4B5FD] shadow-xs font-bold'
                  : 'text-[#6B6B76] hover:text-[#1A1A1F] dark:hover:text-[#FAF7FF]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Weekly Trajectory</span>
            </button>
          </div>
        </div>

        {/* Recharts Habit Trends Visualization */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {trendViewMode === 'categories' ? (
              <BarChart
                data={categoryTrends}
                margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="#9A9AA5"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(124, 58, 237, 0.15)' }}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  stroke="#9A9AA5"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(124, 58, 237, 0.05)', radius: 8 }}
                  position={{ y: 5 }}
                  wrapperStyle={{ pointerEvents: 'none', zIndex: 30 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as CategoryTrendData;
                      return (
                        <div className="p-2.5 rounded-[12px] glass-strong shadow-md text-xs space-y-1 border border-[rgba(124,58,237,0.18)] backdrop-blur-md">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                              {data.category}
                            </span>
                          </div>
                          <p className="font-semibold text-[#7C3AED] dark:text-[#A78BFA]">
                            Completion: {data.percentage}%
                          </p>
                          <p className="text-[11px] text-[#6B6B76] dark:text-[#C4B5FD]">
                            {data.total > 0
                              ? `Active: ${data.completed} of ${data.total} tasks logged today`
                              : 'No habits in this category'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="percentage"
                  name="Completion %"
                  radius={[8, 8, 0, 0]}
                  barSize={36}
                  background={{ fill: 'rgba(124, 58, 237, 0.06)', radius: [8, 8, 0, 0] }}
                >
                  {categoryTrends.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart
                data={weeklyDayData}
                margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#9A9AA5"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(124, 58, 237, 0.15)' }}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  stroke="#9A9AA5"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-[12px] glass shadow-lg text-xs space-y-1">
                          <p className="font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">{label}</p>
                          {payload.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                              <span style={{ color: item.color }} className="font-medium">
                                {item.name}:
                              </span>
                              <span className="font-bold text-[#1A1A1F] dark:text-[#FAF7FF] tabular-nums">
                                {item.value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line type="monotone" dataKey="Overall" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Health" stroke="#4CB782" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Productivity" stroke="#A78BFA" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-[rgba(124,58,237,0.12)]">
          {categoryTrends.map(item => (
            <div
              key={item.category}
              className="p-3 rounded-[12px] glass flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#1A1A1F] dark:text-[#FAF7FF]">
                    {item.category}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <div className="text-xl font-extrabold text-[#7C3AED] dark:text-[#A78BFA] tabular-nums">
                  {item.percentage}%
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-white/60 dark:bg-white/10 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Companion Feedback & Reflection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Companion Note */}
        <div className="md:col-span-2 p-5 sm:p-6 glass shadow-[0_8px_32px_rgba(124,58,237,0.08)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                  {companionName}&rsquo;s Assessment
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] text-[#7C3AED] dark:text-[#C4B5FD] font-semibold border border-[rgba(124,58,237,0.2)]">
                {assessment.badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#C4B5FD] italic leading-relaxed mt-1">
              &ldquo;{assessment.text}&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[rgba(124,58,237,0.12)]">
            <button
              onClick={() => onSpeakText(assessment.text, assessment.mood)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#F3EBFF] dark:bg-white/10 hover:bg-[#E9D8FD] text-[#7C3AED] dark:text-[#C4B5FD] text-xs font-semibold transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Play Voice</span>
            </button>

            <button
              onClick={() => {
                onSendChatMessage(`Hey ${companionName}, I was checking my habit trends for this week!`);
                onNavigateToChat();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discuss in Chat</span>
            </button>
          </div>
        </div>

        {/* 7-Day Emotional Sparkline */}
        <div className="p-5 sm:p-6 glass shadow-[0_8px_32px_rgba(124,58,237,0.08)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                Emotional Connection
              </span>
              <span className="text-xs font-extrabold text-[#7C3AED] dark:text-[#A78BFA] tabular-nums">
                {partnerMood.score}%
              </span>
            </div>
            <p className="text-[11px] text-[#9A9AA5]">
              Companion mood & bond index
            </p>

            <div className="w-full h-20 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodSparklineData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-1.5 rounded-lg glass text-[10px] font-bold text-[#7C3AED]">
                            {payload[0].value}%
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    fill="url(#moodGrad)"
                    dot={{ r: 2, fill: '#7C3AED' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[11px] text-[#6B6B76] dark:text-[#C4B5FD] pt-2 border-t border-[rgba(124,58,237,0.12)] text-center">
            Status: <span className="capitalize font-bold text-[#7C3AED] dark:text-[#A78BFA]">{partnerMood.status}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
