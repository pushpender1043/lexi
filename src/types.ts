export type PartnerGender = 'female' | 'male';
export type PartnerTone = 'playful_loving' | 'strict_caring' | 'sweet_clingy' | 'sassy_feisty';
export type MoodStatus = 'ecstatic' | 'loving' | 'happy' | 'neutral' | 'annoyed' | 'angry';

export interface UserProfile {
  userId?: string;
  name: string;
  gender?: 'male' | 'female' | 'non_binary' | 'other';
  partnerGender: PartnerGender;
  partnerName: string;
  partnerTone: PartnerTone;
  voiceGender: PartnerGender;
  wakeUpTime: string;
  sleepTime: string;
  dailyWaterGoal: number; // in ml or glasses
  streakDays: number;
  bestStreak?: number;
  isOnboarded: boolean;
  partnerAvatar?: string;
  userAvatar?: string;
  notificationsEnabled: boolean;
  calendarSynced: boolean;
  alarmsSynced: boolean;
  dailyCheckInTime: string; // e.g. "08:30"
  dailyCheckInEnabled: boolean;
  checkInType: 'voice_and_text' | 'voice_only' | 'text_only';
  lastCheckInDate?: string;
  voiceSpeed?: number; // e.g. 0.8, 1.0, 1.2, 1.5
  voiceToneStyle?: 'playful' | 'serious' | 'comforting' | 'sweet' | 'sassy';
  themeMode?: 'dark' | 'light';
  location?: string;
  isAuthenticated?: boolean;
  userEmail?: string;
  loginProvider?: 'google' | 'email' | 'guest';
  relationshipDynamic?: string;
  primaryGoal?: string;
  languageMix?: string;
}

export type HabitCategory = 'fitness' | 'hydration' | 'health' | 'study' | 'mindset';

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  scheduledTime: string;
  streak: number;
  completed: boolean;
  importance: 'crucial' | 'medium' | 'flexible';
  lastCompletedAt?: string;
  notes?: string;
}

export interface PartnerMood {
  status: MoodStatus;
  score: number; // 0 to 100
  nakhreLevel: number; // 0 to 5
  lastReason: string;
  lastUpdated: string;
}

export type MessageType = 'text' | 'voice_note' | 'habit_alert' | 'taunt' | 'call_log';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'partner' | 'system';
  text: string;
  timestamp: string;
  type: MessageType;
  audioBase64?: string;
  audioDurationSec?: number;
  moodTag?: MoodStatus;
  habitTag?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: 'exam' | 'meeting' | 'gym' | 'personal' | 'routine';
  syncedFrom: 'google_calendar' | 'device_alarm' | 'manual';
  location?: string;
}

export interface MemoryItem {
  id: string;
  category: 'health' | 'exam' | 'preference' | 'relationship' | 'goal';
  fact: string;
  learnedAt: string;
}

export interface ProactiveNudge {
  id: string;
  title: string;
  message: string;
  type: 'miss_you' | 'habit_reminder' | 'calendar_alert' | 'affection';
  timestamp: string;
  habitId?: string;
  habitCategory?: HabitCategory;
  habitTitle?: string;
  isCompleted?: boolean;
}

export interface CallRecord {
  id: string;
  partnerName: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  durationSec: number;
  moodDuringCall?: MoodStatus;
  summary?: string;
}

export type MainSection = 'chats' | 'todos' | 'calls' | 'profile';
