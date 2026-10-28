/**
 * Database Seeding Script - ONLY RUNS AGAINST FIREBASE EMULATOR OR IN TEST ENVIRONMENT.
 * Guarded against execution in production.
 */
import { Habit, CallRecord, MemoryItem, ChatMessage, UserProfile, PartnerMood } from '../src/types';

if (!process.env.FIRESTORE_EMULATOR_HOST && process.env.NODE_ENV !== 'test' && !process.env.ALLOW_DEV_SEED) {
  console.error('[CRITICAL] Refusing to seed database outside Firebase Emulator environment.');
  process.exit(1);
}

export const SEED_USER_PROFILE: UserProfile = {
  name: "Deepu",
  location: "Delhi, India",
  partnerGender: "female",
  partnerName: "Lexi",
  partnerTone: "playful_loving",
  voiceGender: "female",
  wakeUpTime: "07:00",
  sleepTime: "23:30",
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

export const SEED_HABITS: Habit[] = [
  {
    id: "seed-habit-1",
    title: "Morning Workout & Stretching",
    category: "fitness",
    tags: ["Health", "Fitness"],
    targetValue: 30,
    currentValue: 0,
    unit: "mins",
    scheduledTime: "07:30 AM",
    streak: 0,
    completed: false,
    importance: "crucial",
  },
  {
    id: "seed-habit-2",
    title: "Drink Water",
    category: "hydration",
    tags: ["Health", "Hydration"],
    targetValue: 8,
    currentValue: 0,
    unit: "glasses",
    scheduledTime: "Throughout day",
    streak: 0,
    completed: false,
    importance: "crucial",
  },
  {
    id: "seed-habit-3",
    title: "Daily Vitamins / Medication",
    category: "health",
    tags: ["Health", "Wellness"],
    targetValue: 1,
    currentValue: 0,
    unit: "dose",
    scheduledTime: "01:30 PM",
    streak: 0,
    completed: false,
    importance: "crucial",
  },
];

export const SEED_PARTNER_MOOD: PartnerMood = {
  status: "happy",
  score: 75,
  nakhreLevel: 0,
  lastReason: "Welcome! Let's get your day started together.",
  lastUpdated: "Just now",
};

export async function runSeed(userId: string) {
  console.log(`Seeding emulator database for user ${userId}...`);
  // Only executed when emulator is running
}
