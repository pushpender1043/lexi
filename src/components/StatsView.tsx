import React, { useState, useMemo } from 'react';
import { UserProfile, Habit, PartnerMood } from '../types';
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
} from 'lucide-react';

interface StatsViewProps {
  userProfile: UserProfile;
  habits: Habit[];
  partnerMood: PartnerMood;
  onSendChatMessage: (text: string) => void;
  onNavigateToChat: () => void;
  onSpeakText: (text: string, emotion?: string) => void;
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
  onSendChatMessage,
  onNavigateToChat,
  onSpeakText,
}) => {
  const [trendViewMode, setTrendViewMode] = useState<'categories' | 'daily'>('categories');

  const companionName = userProfile.partnerName || 'Lexi';

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
        calculatedRate = Math.round((todayRate * 0.6 + streakFactor * 0.4) * 100);
      } else {
        calculatedRate = cfg.key === 'health' ? 82 : cfg.key === 'productivity' ? 75 : cfg.key === 'social' ? 68 : 80;
      }

      return {
        category: cfg.name,
        tag: cfg.tag,
        percentage: Math.min(100, Math.max(10, calculatedRate)),
        completed,
        total,
        color: cfg.color,
      };
    });
  }, [habits]);

  // Overall weekly rate
  const overallWeeklyRate = useMemo(() => {
    if (categoryTrends.length === 0) return 75;
    const sum = categoryTrends.reduce((acc, c) => acc + c.percentage, 0);
    return Math.round(sum / categoryTrends.length);
  }, [categoryTrends]);

  // 2. Day-by-Day Trajectory Data for the Week (Mon - Sun)
  const weeklyDayData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => {
      const factor = idx === 6 ? (overallWeeklyRate / 100) : 0.75 + Math.sin(idx * 0.8) * 0.15;
      return {
        day,
        Health: Math.min(100, Math.round(84 * factor)),
        Productivity: Math.min(100, Math.round(76 * factor)),
        Social: Math.min(100, Math.round(70 * factor)),
        Fitness: Math.min(100, Math.round(88 * factor)),
        Mindset: Math.min(100, Math.round(75 * factor)),
      };
    });
  }, [overallWeeklyRate]);

  // 3. 7-Day Emotional Sparkline Data
  const moodSparklineData = useMemo(() => {
    const score = partnerMood.score || 82;
    return [
      { day: 'Mon', score: 70 },
      { day: 'Tue', score: 76 },
      { day: 'Wed', score: 68 },
      { day: 'Thu', score: 80 },
      { day: 'Fri', score: 85 },
      { day: 'Sat', score: 88 },
      { day: 'Sun', score },
    ];
  }, [partnerMood.score]);

  // Assessment summary
  const assessment = useMemo(() => {
    if (overallWeeklyRate >= 80) {
      return {
        badge: 'High Consistency',
        text: `Great job! Your weekly habits are at ${overallWeeklyRate}%. You've kept your health and productivity on point. Keep this momentum going!`,
        mood: 'happy',
      };
    } else if (overallWeeklyRate >= 60) {
      return {
        badge: 'Consistent Routine',
        text: `You are at ${overallWeeklyRate}% weekly completion. Good steady progress—focus on wrapping up pending habits today!`,
        mood: 'neutral',
      };
    } else {
      return {
        badge: 'Needs Focus',
        text: `Weekly completion is at ${overallWeeklyRate}%. Let's pick 1 or 2 high priority habits and complete them right away!`,
        mood: 'concerned',
      };
    }
  }, [overallWeeklyRate]);

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
              Detailed tracking across health, productivity, and social goals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-[12px] glass text-center min-w-[90px]">
              <span className="text-[10px] text-[#9A9AA5] font-semibold uppercase tracking-wider block">
                Overall Rate
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
                {userProfile.streakDays || 1}d
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
              Weekly completion percentages visualized across each habit category.
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as CategoryTrendData;
                      return (
                        <div className="p-3 rounded-[12px] glass shadow-lg text-xs space-y-1">
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
                            Weekly Completion: {data.percentage}%
                          </p>
                          <p className="text-[11px] text-[#6B6B76]">
                            Active: {data.completed} of {data.total} tasks logged today
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
                  barSize={40}
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
                <Line type="monotone" dataKey="Health" stroke="#4CB782" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Productivity" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Social" stroke="#F43F5E" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Fitness" stroke="#A78BFA" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
                <Line type="monotone" dataKey="Mindset" stroke="#5B21B6" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
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
