import { UserProfile, Habit, PartnerMood, CalendarEvent, MemoryItem, ChatMessage, CallRecord } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Deepu",
  location: "Delhi, India",
  partnerGender: "female",
  partnerName: "Lexi",
  partnerTone: "playful_loving",
  voiceGender: "female",
  wakeUpTime: "07:00",
  sleepTime: "23:30",
  dailyWaterGoal: 8,
  streakDays: 5,
  isOnboarded: false,
  isAuthenticated: false,
  userEmail: "deepumuku645@gmail.com",
  loginProvider: "google",
  notificationsEnabled: true,
  calendarSynced: true,
  alarmsSynced: true,
  dailyCheckInTime: "08:30",
  dailyCheckInEnabled: true,
  checkInType: "voice_and_text",
  relationshipDynamic: "sweet_loving",
  primaryGoal: "fitness_habits",
  languageMix: "hinglish",
};

export const DEFAULT_HABITS: Habit[] = [
  {
    id: "habit-1",
    title: "Morning Gym & Weight Training",
    category: "fitness",
    tags: ["Health", "Fitness"],
    targetValue: 45,
    currentValue: 45,
    unit: "mins",
    scheduledTime: "07:30 AM",
    streak: 5,
    completed: true,
    importance: "crucial",
    lastCompletedAt: "Today, 8:20 AM",
    notes: "Chest & Triceps day completed!"
  },
  {
    id: "habit-2",
    title: "Hydration Goal (8 Glasses of Water)",
    category: "hydration",
    tags: ["Health", "Hydration"],
    targetValue: 8,
    currentValue: 5,
    unit: "glasses",
    scheduledTime: "Throughout day",
    streak: 6,
    completed: false,
    importance: "crucial",
    notes: "Drink at least 2 more glasses before 5 PM."
  },
  {
    id: "habit-3",
    title: "Afternoon Vitamins & Meds",
    category: "health",
    tags: ["Health", "Wellness"],
    targetValue: 1,
    currentValue: 0,
    unit: "dose",
    scheduledTime: "01:30 PM",
    streak: 3,
    completed: false,
    importance: "crucial",
    notes: "Take with warm water after lunch."
  },
  {
    id: "habit-4",
    title: "Deep Focus Study / Skill Coding",
    category: "study",
    tags: ["Productivity", "Coding"],
    targetValue: 120,
    currentValue: 60,
    unit: "mins",
    scheduledTime: "04:00 PM",
    streak: 4,
    completed: false,
    importance: "crucial",
    notes: "Focus session for algorithmic thinking."
  },
  {
    id: "habit-5",
    title: "Evening Call with Family & Friends",
    category: "social",
    tags: ["Social", "Connection"],
    targetValue: 1,
    currentValue: 1,
    unit: "call",
    scheduledTime: "08:00 PM",
    streak: 5,
    completed: true,
    importance: "medium",
    lastCompletedAt: "Today, 8:15 PM",
    notes: "Caught up with close friends and parents."
  },
  {
    id: "habit-6",
    title: "Night Wind-down & Screen Off",
    category: "mindset",
    tags: ["Productivity", "Mindset"],
    targetValue: 30,
    currentValue: 0,
    unit: "mins",
    scheduledTime: "10:30 PM",
    streak: 2,
    completed: false,
    importance: "medium",
    notes: "Relax and read before sleep."
  }
];

export const DEFAULT_PARTNER_MOOD: PartnerMood = {
  status: "happy",
  score: 82,
  nakhreLevel: 1,
  lastReason: "Khush hoon kyunki gym time pe gaya! Par dawai ka time ho raha hai...",
  lastUpdated: "Just now"
};

export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "cal-1",
    title: "Critical Semester Mock Test",
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    category: "exam",
    syncedFrom: "google_calendar",
    location: "Online Portal"
  },
  {
    id: "cal-2",
    title: "Project Sync & Review",
    startTime: "05:00 PM",
    endTime: "06:00 PM",
    category: "meeting",
    syncedFrom: "google_calendar",
    location: "Google Meet"
  },
  {
    id: "cal-3",
    title: "Wake Up & Hydrate Alarm",
    startTime: "07:00 AM",
    endTime: "07:15 AM",
    category: "routine",
    syncedFrom: "device_alarm"
  }
];

export const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    category: "health",
    fact: "Gets slight migraine when skipping water or reading screens in the dark.",
    learnedAt: "2 days ago"
  },
  {
    id: "mem-2",
    category: "exam",
    fact: "Targeting an A+ in AI & Software Architecture mock exams this month.",
    learnedAt: "Yesterday"
  },
  {
    id: "mem-3",
    category: "preference",
    fact: "Likes affectionate Hinglish nicknames like 'baba' and 'jaan'.",
    learnedAt: "3 days ago"
  },
  {
    id: "mem-4",
    category: "goal",
    fact: "Dedicated to not missing gym workouts, wanting 15-day continuous streak.",
    learnedAt: "This week"
  }
];

export const DEFAULT_CALL_RECORDS: CallRecord[] = [
  {
    id: "call-1",
    partnerName: "Lexi",
    type: "outgoing",
    timestamp: "Today, 08:35 AM",
    durationSec: 184,
    moodDuringCall: "loving",
    summary: "Morning routine call - Lexi cheered your gym workout and reminded you to drink water."
  },
  {
    id: "call-2",
    partnerName: "Lexi",
    type: "incoming",
    timestamp: "Yesterday, 09:15 PM",
    durationSec: 342,
    moodDuringCall: "happy",
    summary: "Night wind-down call - talked about tomorrow's mock test preparation and sleep time."
  },
  {
    id: "call-3",
    partnerName: "Lexi",
    type: "missed",
    timestamp: "Yesterday, 02:45 PM",
    durationSec: 0,
    moodDuringCall: "annoyed",
    summary: "Missed call while you were in study session. Lexi wanted to check if you took your vitamins!"
  },
  {
    id: "call-4",
    partnerName: "Lexi",
    type: "incoming",
    timestamp: "Sep 8, 08:30 AM",
    durationSec: 210,
    moodDuringCall: "ecstatic",
    summary: "Morning daily brief call - discussed 5-day habit streak celebration."
  }
];

export const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "partner",
    text: "Good morning jaan! ❤️ Maine dekha tumne subah 7:30 baje gym complete kar liya. I'm so proud of my hardworking boy! Ab jaldi se fresh ho kar protein shake piyo.",
    timestamp: "08:25 AM",
    type: "text",
    moodTag: "loving"
  },
  {
    id: "msg-2",
    sender: "user",
    text: "Thank you Lexi! Aaj leg day tha, thoda exhausted hoon par maza aaya.",
    timestamp: "08:30 AM",
    type: "text"
  },
  {
    id: "msg-3",
    sender: "partner",
    text: "Pata hai mujhe, aur tumhari calendar mein 2 baje mock test bhi scheduled hai! Paani ki bottle paas rakhna, samjhe na? Main nazar rakh rahi hoon tum par! 😉",
    timestamp: "08:32 AM",
    type: "voice_note",
    audioDurationSec: 6,
    moodTag: "happy"
  }
];

