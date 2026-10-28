import { UserProfile, Habit, PartnerMood, CalendarEvent, MemoryItem, ChatMessage, CallRecord } from '../types';

/**
 * Clean baseline production defaults for new users.
 * Contains ZERO fake habits, ZERO fake chats, ZERO fake calls, and ZERO synthetic streaks.
 * All actual data is fetched in real-time from Firestore under users/{uid}/...
 */
export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Darling",
  partnerGender: "female",
  partnerName: "Lexi",
  partnerTone: "playful_loving",
  voiceGender: "female",
  wakeUpTime: "07:00",
  sleepTime: "23:00",
  dailyWaterGoal: 8,
  streakDays: 0,
  bestStreak: 0,
  isOnboarded: false,
  isAuthenticated: false,
  loginProvider: "guest",
  notificationsEnabled: true,
  calendarSynced: false,
  alarmsSynced: false,
  dailyCheckInTime: "08:30",
  dailyCheckInEnabled: true,
  checkInType: "voice_and_text",
  relationshipDynamic: "sweet_loving",
  primaryGoal: "fitness_habits",
  languageMix: "hinglish",
};

export const DEFAULT_HABITS: Habit[] = [];

export const DEFAULT_PARTNER_MOOD: PartnerMood = {
  status: "happy",
  score: 75,
  nakhreLevel: 0,
  lastReason: "Welcome! Let's build your daily routine together.",
  lastUpdated: "Just now",
};

export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [];
export const DEFAULT_MEMORIES: MemoryItem[] = [];
export const DEFAULT_CALL_RECORDS: CallRecord[] = [];
export const DEFAULT_MESSAGES: ChatMessage[] = [];
