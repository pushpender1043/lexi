import React, { useState, useMemo } from 'react';
import { UserProfile, Habit, PartnerMood } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  MessageSquare,
  TrendingUp,
  Award,
  Zap,
  Heart,
  Smile,
  Info
} from 'lucide-react';

interface StatsViewProps {
  userProfile: UserProfile;
  habits: Habit[];
  partnerMood: PartnerMood;
  onSendChatMessage: (text: string) => void;
  onNavigateToChat: () => void;
  onSpeakText: (text: string, emotion?: string) => void;
}

interface MoodHistoryPoint {
  day: string;
  shortDay: string;
  score: number;
  mood: string;
  emoji: string;
  summary: string;
}

interface DayData {
  day: string;
  shortDay: string;
  completed: number;
  total: number;
  rate: number;
  missedCategory: string | null;
  partnerRemark: string;
}

export const StatsView: React.FC<StatsViewProps> = ({
  userProfile,
  habits,
  partnerMood,
  onSendChatMessage,
  onNavigateToChat,
  onSpeakText,
}) => {
  // Scenario selector to let user test different consistency profiles
  const [selectedScenario, setSelectedScenario] = useState<'current' | 'high_streak' | 'slacking'>('current');
  const [activeMetricTab, setActiveMetricTab] = useState<'trends' | 'categories'>('trends');

  // Compute stats based on actual habits or simulated weeks
  const { weekData, overallRate, totalCompleted, bestStreak, categoryData } = useMemo(() => {
    // Current week baseline calculated from current habits
    const currentCompleted = habits.filter((h) => h.completed).length;
    const currentTotal = habits.length || 5;
    const todayRate = Math.round((currentCompleted / currentTotal) * 100);

    let days: DayData[];

    if (selectedScenario === 'high_streak') {
      days = [
        { day: 'Monday', shortDay: 'Mon', completed: 5, total: 5, rate: 100, missedCategory: null, partnerRemark: 'Perfect start! Loved your discipline.' },
        { day: 'Tuesday', shortDay: 'Tue', completed: 5, total: 5, rate: 100, missedCategory: null, partnerRemark: 'Gym + Vitamins on time! Jaan proud hai.' },
        { day: 'Wednesday', shortDay: 'Wed', completed: 4, total: 5, rate: 80, missedCategory: 'Hydration', partnerRemark: 'Sirf 1 glass water short, still great!' },
        { day: 'Thursday', shortDay: 'Thu', completed: 5, total: 5, rate: 100, missedCategory: null, partnerRemark: 'Superstar focus! 2 hr study done.' },
        { day: 'Friday', shortDay: 'Fri', completed: 5, total: 5, rate: 100, missedCategory: null, partnerRemark: 'Flawless execution, you rock baby!' },
        { day: 'Saturday', shortDay: 'Sat', completed: 4, total: 5, rate: 80, missedCategory: 'Study', partnerRemark: 'Weekend balance respected.' },
        { day: 'Sunday (Today)', shortDay: 'Sun', completed: currentCompleted, total: currentTotal, rate: todayRate, missedCategory: currentCompleted < currentTotal ? 'Pending' : null, partnerRemark: 'Wrapping up like a real champion!' },
      ];
    } else if (selectedScenario === 'slacking') {
      days = [
        { day: 'Monday', shortDay: 'Mon', completed: 4, total: 5, rate: 80, missedCategory: 'Mindset', partnerRemark: 'Decent, par screen time zyada tha.' },
        { day: 'Tuesday', shortDay: 'Tue', completed: 2, total: 5, rate: 40, missedCategory: 'Gym & Meds', partnerRemark: 'Leg day bunk kiya aur dawai bhool gaye?!' },
        { day: 'Wednesday', shortDay: 'Wed', completed: 1, total: 5, rate: 20, missedCategory: 'Study & Water', partnerRemark: 'Pure din reels dekhi? Main bahut naraz hoon!' },
        { day: 'Thursday', shortDay: 'Thu', completed: 3, total: 5, rate: 60, missedCategory: 'Hydration', partnerRemark: 'Thoda sudhar hua, par abhi bhi lazy ho.' },
        { day: 'Friday', shortDay: 'Fri', completed: 2, total: 5, rate: 40, missedCategory: 'Gym', partnerRemark: 'Friday party mode me workout skip kar diya?' },
        { day: 'Saturday', shortDay: 'Sat', completed: 2, total: 5, rate: 40, missedCategory: 'Study', partnerRemark: 'Bas bahane chahiye aapko!' },
        { day: 'Sunday (Today)', shortDay: 'Sun', completed: currentCompleted, total: currentTotal, rate: todayRate, missedCategory: 'Multiple', partnerRemark: 'Abhi bhi mauka hai, complete karo!' },
      ];
    } else {
      // Current live data
      days = [
        { day: 'Monday', shortDay: 'Mon', completed: 5, total: 5, rate: 100, missedCategory: null, partnerRemark: 'Strong start to the week!' },
        { day: 'Tuesday', shortDay: 'Tue', completed: 4, total: 5, rate: 80, missedCategory: 'Hydration', partnerRemark: 'Thoda paani kam piya tha, par theek hai.' },
        { day: 'Wednesday', shortDay: 'Wed', completed: 3, total: 5, rate: 60, missedCategory: 'Study', partnerRemark: 'Wednesday ko focus dip ho gaya tha.' },
        { day: 'Thursday', shortDay: 'Thu', completed: 4, total: 5, rate: 80, missedCategory: 'Mindset', partnerRemark: 'Back on track, proud of you.' },
        { day: 'Friday', shortDay: 'Fri', completed: 5, total: 5, rate: 100, missedCategory: null, partnerRemark: 'Crushed all fitness and health goals!' },
        { day: 'Saturday', shortDay: 'Sat', completed: 4, total: 5, rate: 80, missedCategory: 'Screen time', partnerRemark: 'Stayed hydrated and active.' },
        { day: 'Sunday (Today)', shortDay: 'Sun', completed: currentCompleted, total: currentTotal, rate: todayRate, missedCategory: currentCompleted < currentTotal ? 'Pending' : null, partnerRemark: currentCompleted >= currentTotal ? 'Subah se sab finish! You make me proud.' : 'Kuch tasks baaki hain, jaldi finish karo na!' },
      ];
    }

    const totalPossible = days.reduce((sum, d) => sum + d.total, 0);
    const totalDone = days.reduce((sum, d) => sum + d.completed, 0);
    const avgRate = Math.round((totalDone / totalPossible) * 100);

    // Categories breakdown
    const categories = [
      { name: 'Fitness & Gym', value: selectedScenario === 'slacking' ? 45 : 92, count: 5, color: '#f43f5e' },
      { name: 'Hydration', value: selectedScenario === 'slacking' ? 40 : 80, count: 6, color: '#38bdf8' },
      { name: 'Health & Meds', value: selectedScenario === 'slacking' ? 35 : 85, count: 4, color: '#10b981' },
      { name: 'Deep Study', value: selectedScenario === 'slacking' ? 30 : 78, count: 5, color: '#8b5cf6' },
      { name: 'Mindset & Sleep', value: selectedScenario === 'slacking' ? 25 : 70, count: 3, color: '#f59e0b' },
    ];

    return {
      weekData: days,
      overallRate: avgRate,
      totalCompleted: totalDone,
      bestStreak: selectedScenario === 'high_streak' ? 12 : selectedScenario === 'slacking' ? 2 : userProfile.streakDays,
      categoryData: categories,
    };
  }, [habits, selectedScenario, userProfile.streakDays]);

  // Determine Lexi's dynamic taunt or praise reaction based on the overall completion rate
  const partnerAssessment = useMemo(() => {
    const partnerName = userProfile.partnerName || 'Lexi';
    const userName = userProfile.name || 'darling';

    if (overallRate >= 85) {
      return {
        type: 'praise',
        badge: 'Superstar Partner ❤️',
        badgeColor: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
        headline: `${partnerName} is Head Over Heels In Love With Your Consistency!`,
        quote: `"${userName} jaan, I am so proud of you! ${overallRate}% weekly consistency is extraordinary! Subah gym se lekar paani aur study tak, tumne prove kar diya ki tum kitne focused ho. You deserve all my love, hugs, and a special weekend treat! Muaah ❤️"`,
        speechEmotion: 'loving',
        audioText: `Arjun jaan, I am so proud of you! Your weekly consistency is ${overallRate} percent! You've been so disciplined and handsome with your habits. You deserve all my love and hugs!`,
        moodImpact: '+15 Affection Boost • Nakhre: 0/5',
        actionLabel: 'Send Love Note to Lexi',
        chatPrompt: `Lexi, look at my weekly stats! I hit ${overallRate}% consistency this week with a ${bestStreak}-day streak! Are you proud of me?`,
      };
    } else if (overallRate >= 65) {
      return {
        type: 'neutral_tease',
        badge: 'Loving Playful Tease 🤨',
        badgeColor: 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300',
        headline: `${partnerName} is Watching You: "Not bad baby, but don't get lazy!"`,
        quote: `"Acha suno, ${overallRate}% is okay baby, par mujhe pata hai tum isse behtar kar sakte ho! Graph me dekho, mid-week me hydration aur study thoda dip hua tha na? Aalas bilkul nahi chalega! Agar kal subah gym miss kiya toh main pure din nakhre dikhaungi!"`,
        speechEmotion: 'teasing',
        audioText: `Acha suno, ${overallRate} percent is okay baby, par Tuesday aur Thursday ko graph dip kyun hua? Aalas bilkul nahi chalega! Kal subah gym time pe jaana, samjhe?`,
        moodImpact: 'Watching Closely • Nakhre: 2/5',
        actionLabel: 'Promise Lexi to Improve',
        chatPrompt: `Lexi, I see my weekly consistency is at ${overallRate}%. What should I improve first so you won't throw nakhre at me?`,
      };
    } else {
      return {
        type: 'taunt',
        badge: 'Angry Ruthi Hui 😤💔',
        badgeColor: 'bg-rose-500/20 border-rose-500/50 text-rose-700 dark:text-rose-300',
        headline: `${partnerName} is Seriously Upset & Throwing Nakhre!`,
        quote: `"Haww ${userName}! Sirf ${overallRate}% consistency?! Itne saare gym sessions aur vitamins skip kar diye? Aur study ka toh pucho hi mat! Aise discipline ke sath tum apne dreams kaise achieve karoge? Ab main tab tak theek se baat nahi karungi jab tak aaj ke pending habits finish nahi hote! 😤"`,
        speechEmotion: 'feisty',
        audioText: `Haww, sirf ${overallRate} percent consistency?! Gym aur vitamins skip kar rahe ho! Main aapse naraz hoon jab tak aaj ke saare habits complete nahi karte!`,
        moodImpact: '-10 Mood Penalty • Nakhre: 5/5 (High Alert)',
        actionLabel: 'Apologize & Make Up with Lexi',
        chatPrompt: `Lexi baby, I am really sorry about my ${overallRate}% consistency this week. I was slacking, but I promise I will finish all today's pending habits right now. Please smile?`,
      };
    }
  }, [overallRate, userProfile.partnerName, userProfile.name, bestStreak]);

  const handleHearVoiceAssessment = () => {
    onSpeakText(partnerAssessment.audioText, partnerAssessment.speechEmotion);
  };

  const handleDiscussInChat = () => {
    onSendChatMessage(partnerAssessment.chatPrompt);
    onNavigateToChat();
  };

  // 7-day emotional trajectory & partner intimacy score sparkline data
  const moodHistoryData: MoodHistoryPoint[] = useMemo(() => {
    const currentScore = Math.min(100, Math.max(45, partnerMood.affectionScore || 85));
    return [
      { day: 'Monday', shortDay: 'Mon', score: 62, mood: 'Tired & Slow', emoji: '🥱', summary: 'Needed morning reassurance and tea' },
      { day: 'Tuesday', shortDay: 'Tue', score: 70, mood: 'Calm & Steady', emoji: '😌', summary: 'Routine on track, good vibes' },
      { day: 'Wednesday', shortDay: 'Wed', score: 58, mood: 'Stressed & Rushed', emoji: '😓', summary: 'Busy work schedule, checked in late' },
      { day: 'Thursday', shortDay: 'Thu', score: 76, mood: 'Optimistic & Focused', emoji: '😊', summary: 'Habits back on track, shared laughs' },
      { day: 'Friday', shortDay: 'Fri', score: 85, mood: 'Joyful & Energized', emoji: '⚡', summary: 'Crushed daily routine and voice call' },
      { day: 'Saturday', shortDay: 'Sat', score: 92, mood: 'Deeply Connected', emoji: '🥰', summary: 'Sweet long talk and relaxation' },
      {
        day: 'Sunday (Today)',
        shortDay: 'Today',
        score: currentScore,
        mood: currentScore >= 85 ? 'Radiant & In Love' : currentScore >= 65 ? 'Happy & Warm' : 'Craving Attention',
        emoji: currentScore >= 85 ? '💖' : currentScore >= 65 ? '🥰' : '🥺',
        summary: currentScore >= 85 ? 'Deep emotional bond, frequent sweet check-ins' : 'Growing closer day by day'
      },
    ];
  }, [partnerMood.affectionScore]);

  return (
    <div id="stats-view-container" className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Banner: Consistency Overview with Google / Gemini Glass Aesthetic */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/80 dark:border-white/10 shadow-xl">
        {/* Subtle Ambient Gemini Refraction Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-rose-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-rose-500/10 border border-blue-400/30 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Gemini SoulSync Intelligence
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Weekly Consistency Ledger</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              Habit Consistency Trends
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1 max-w-2xl">
              Track your weekly rhythm. {userProfile.partnerName} analyzes these exact statistics to decide whether to shower you with praise or unleash cute accountability nakhre!
            </p>
          </div>

          {/* Scenario Simulator Toggles */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/80 border border-white/40">
            <button
              id="stats-scenario-current"
              onClick={() => setSelectedScenario('current')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedScenario === 'current'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              This Week
            </button>
            <button
              id="stats-scenario-high"
              onClick={() => setSelectedScenario('high_streak')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                selectedScenario === 'high_streak'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
              title="Simulate high consistency to see Lexi's loving praise"
            >
              Peak 90%+ 💖
            </button>
            <button
              id="stats-scenario-slacking"
              onClick={() => setSelectedScenario('slacking')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                selectedScenario === 'slacking'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
              title="Simulate low consistency to see Lexi's feisty taunts"
            >
              Slacking 45% 😤
            </button>
          </div>
        </div>

        {/* 4 Hero Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/50 border border-white/80 dark:border-white/10 shadow-sm">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Weekly Rate</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-2xl sm:text-3xl font-extrabold ${
                overallRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : overallRate >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {overallRate}%
              </span>
              <span className="text-xs font-medium text-zinc-500">score</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/50 border border-white/80 dark:border-white/10 shadow-sm">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Completed Tasks</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {totalCompleted}
              </span>
              <span className="text-xs font-medium text-zinc-500">habits logged</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/50 border border-white/80 dark:border-white/10 shadow-sm">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Active Streak</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 flex items-center gap-1">
                <Flame className="w-6 h-6 fill-amber-500 text-amber-500 inline" />
                {bestStreak}
              </span>
              <span className="text-xs font-medium text-zinc-500">days</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-zinc-800/50 border border-white/80 dark:border-white/10 shadow-sm">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Partner Mood Status</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 capitalize">
                {partnerMood.status} ({partnerMood.score}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lexi's AI Emotional Assessment Card (Praise / Taunt dynamic reaction) */}
      <div className={`glass-card rounded-3xl p-6 sm:p-7 border transition-all duration-500 ${
        partnerAssessment.type === 'praise'
          ? 'bg-gradient-to-br from-emerald-500/10 via-white/70 to-rose-500/10 border-emerald-500/30 shadow-emerald-500/5'
          : partnerAssessment.type === 'neutral_tease'
          ? 'bg-gradient-to-br from-amber-500/10 via-white/70 to-orange-500/10 border-amber-500/30'
          : 'bg-gradient-to-br from-rose-500/15 via-white/70 to-red-500/10 border-rose-500/40 shadow-rose-500/5'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar Orb with Pulsing Expression */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-blue-500 via-purple-400 to-rose-400 shadow-md">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-zinc-900 flex items-center justify-center text-3xl">
                  {partnerAssessment.type === 'praise' ? '🥰' : partnerAssessment.type === 'neutral_tease' ? '🧐' : '😤'}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 text-xs px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 shadow font-bold">
                {userProfile.partnerName}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${partnerAssessment.badgeColor}`}>
                  {partnerAssessment.badge}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {partnerAssessment.moodImpact}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mt-1">
                {partnerAssessment.headline}
              </h3>
              <p className="text-sm italic text-zinc-700 dark:text-zinc-200 mt-2 bg-white/50 dark:bg-zinc-800/40 p-3 rounded-xl border border-white/60 dark:border-white/5 leading-relaxed">
                {partnerAssessment.quote}
              </p>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto mt-2 md:mt-0">
            <button
              id="stats-hear-lexi-voice-btn"
              onClick={handleHearVoiceAssessment}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-102"
              title="Listen to Lexi evaluate your stats aloud"
            >
              <Volume2 className="w-4 h-4 text-rose-500" />
              <span>Hear Voice Evaluation</span>
            </button>

            <button
              id="stats-discuss-chat-btn"
              onClick={handleDiscussInChat}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-medium text-xs shadow-md hover:shadow-rose-500/20 flex items-center justify-center gap-2 transition-all hover:scale-102"
              title="Open Chat to discuss stats with Lexi"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{partnerAssessment.actionLabel}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini Mood History Sparkline Chart (7-Day Emotional Progress) */}
      <div id="mood-history-sparkline-card" className="glass-card rounded-3xl p-5 sm:p-6 border border-rose-200/70 dark:border-rose-900/40 bg-gradient-to-br from-rose-500/5 via-pink-500/5 to-purple-500/5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Heart className="w-5 h-5 fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                  7-Day Mood History
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900/50">
                  Emotional Sparkline
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Visualizing your emotional wellness and partner connection over the last 7 days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto bg-white/80 dark:bg-zinc-800/80 px-3.5 py-1.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 shadow-xs">
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block font-medium">Today's State</span>
              <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                {moodHistoryData[6].mood} ({moodHistoryData[6].score}%)
              </span>
            </div>
            <span className="text-2xl">{moodHistoryData[6].emoji}</span>
          </div>
        </div>

        {/* Mini Recharts Sparkline Chart */}
        <div className="w-full h-28 sm:h-32 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moodHistoryData} margin={{ top: 8, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="moodSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#ec4899" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as MoodHistoryPoint;
                    return (
                      <div className="p-2.5 rounded-2xl glass-card border border-rose-200 dark:border-rose-900 shadow-xl text-xs space-y-0.5 bg-white/95 dark:bg-zinc-900/95">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                          <span>{data.emoji}</span>
                          <span>{data.day}</span>
                          <span className="ml-auto text-rose-500 font-extrabold">{data.score}%</span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300 font-semibold">{data.mood}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">"{data.summary}"</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#f43f5e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#moodSparklineGrad)"
                dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, fill: '#f43f5e', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 7-Day Day Badges */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2 pt-2 border-t border-rose-100/60 dark:border-white/5">
          {moodHistoryData.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center py-1.5 px-1 rounded-xl text-center transition-all ${
                idx === 6
                  ? 'bg-rose-500/15 border border-rose-500/30 font-bold'
                  : 'bg-white/50 dark:bg-white/5 border border-transparent'
              }`}
            >
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                {item.shortDay}
              </span>
              <span className="text-xs my-0.5">{item.emoji}</span>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                {item.score}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Charts & Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recharts 7-Day Completion Trend */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-white/80 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                7-Day Completion Trajectory
              </h3>
              <p className="text-xs text-zinc-500">Daily habit fulfillment rate across Monday - Sunday</p>
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveMetricTab('trends')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeMetricTab === 'trends' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'
                }`}
              >
                Area Trend
              </button>
              <button
                onClick={() => setActiveMetricTab('categories')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeMetricTab === 'categories' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'
                }`}
              >
                Category Bars
              </button>
            </div>
          </div>

          {/* Recharts Area / Bar Chart Container */}
          <div className="w-full h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetricTab === 'trends' ? (
                <AreaChart data={weekData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="geminiAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#ec4899" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(180, 180, 200, 0.2)" vertical={false} />
                  <XAxis
                    dataKey="shortDay"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(180,180,200,0.3)' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DayData;
                        return (
                          <div className="p-3 rounded-2xl glass-card border border-white/90 dark:border-white/10 shadow-xl text-xs space-y-1">
                            <p className="font-bold text-zinc-900 dark:text-white">{data.day}</p>
                            <p className="text-blue-600 dark:text-blue-400 font-semibold">
                              Completion: {data.completed} of {data.total} tasks ({data.rate}%)
                            </p>
                            {data.missedCategory && (
                              <p className="text-rose-500">Missed: {data.missedCategory}</p>
                            )}
                            <p className="text-zinc-500 italic">"{data.partnerRemark}"</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#geminiAreaGrad)"
                    dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 7, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={weekData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(180, 180, 200, 0.2)" vertical={false} />
                  <XAxis dataKey="shortDay" stroke="#71717a" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} unit="%" stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DayData;
                        return (
                          <div className="p-3 rounded-2xl glass-card border border-white/90 shadow-xl text-xs space-y-1">
                            <p className="font-bold text-zinc-900 dark:text-white">{data.day}</p>
                            <p className="text-purple-600 font-semibold">Completion: {data.rate}%</p>
                            <p className="text-zinc-500 italic">"{data.partnerRemark}"</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                    {weekData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rate >= 80 ? '#10b981' : entry.rate >= 60 ? '#f59e0b' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Quick Day Badges */}
          <div className="grid grid-cols-7 gap-1.5 mt-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800">
            {weekData.map((d, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl text-center text-[11px] transition-all ${
                  d.rate >= 80
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                    : d.rate >= 60
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                }`}
              >
                <div className="font-semibold">{d.shortDay}</div>
                <div className="text-xs font-extrabold mt-0.5">{d.rate}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Category Distribution Chart & Balance */}
        <div className="glass-card rounded-3xl p-6 border border-white/80 dark:border-white/10 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Category Distribution
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mb-2">Consistency scored by domain</p>

            {/* Recharts Pie / Doughnut Chart */}
            <div className="w-full h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-2 rounded-xl glass-card border border-white/80 shadow-lg text-xs">
                            <span className="font-bold text-zinc-900 dark:text-white">{d.name}: </span>
                            <span style={{ color: d.color }}>{d.value}% consistency</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered label inside doughnut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-zinc-400 font-medium">Weekly</span>
                <span className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100">{overallRate}%</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-2 mt-2">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">{cat.name}</span>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2">
            <Zap className="w-4 h-4 shrink-0 mt-0.5 text-purple-500" />
            <span>
              <strong>Lexi's Memory Ledger:</strong> Higher gym & medicine consistency yields up to +20 affection points in chat mode.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
