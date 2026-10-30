/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserProfile, Habit, PartnerMood, CalendarEvent, MemoryItem, 
  ChatMessage, ProactiveNudge, CallRecord, MoodStatus 
} from './types';
import { 
  DEFAULT_USER_PROFILE, DEFAULT_HABITS, DEFAULT_PARTNER_MOOD, 
  DEFAULT_CALENDAR_EVENTS, DEFAULT_MEMORIES, DEFAULT_MESSAGES,
  DEFAULT_CALL_RECORDS 
} from './data/defaults';
import { Header } from './components/Header';
import { BottomTabBar } from './components/BottomTabBar';
import { ChatView } from './components/ChatView';
import { DashboardView } from './components/DashboardView';
import { TodosView } from './components/TodosView';
import { CallsView } from './components/CallsView';
import { ProfileView } from './components/ProfileView';
import { EcosystemSyncView } from './components/EcosystemSyncView';
import { MemoryVaultView } from './components/MemoryVaultView';
import { LiveCallModal, CallEndPayload } from './components/LiveCallModal';
import { MoodDetailsModal } from './components/MoodDetailsModal';
import { LoginModal } from './components/LoginModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsView } from './components/StatsView';
import { ParticleBackground } from './components/ParticleBackground';
import { ProactiveNotificationBanner } from './components/ProactiveNotificationBanner';
import { playCompanionVoice, stopCompanionVoice } from './utils/speech';
import confetti from 'canvas-confetti';
import { MessageSquare, CheckSquare, Phone, User, Home, TrendingUp, Sparkles, X, WifiOff } from 'lucide-react';
import {
  auth,
  db,
  signOutUser,
  testFirestoreConnection,
  syncUserProfile,
  syncUserHabit,
  saveUserChatMessage,
  syncPartnerMood,
  saveUserMemory,
  deleteUserMemory,
  saveCallRecord,
  authFetch,
  deleteUserAccountAndData,
  syncHabitLog,
  subscribeHabitLogs,
  syncWaterLog,
  subscribeWaterLogs,
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { generateUniqueId, deduplicateArrayIds } from './utils/id';
import { HabitLogEntry, getTodayDateString, calculateStreak } from './utils/streak';
import { MoodProvider, useMood } from './lib/moods';
import { Mood } from './types';

function AppContent() {
  const { currentMood, triggerTransientMood } = useMood();
  const [isScrolled, setIsScrolled] = useState(false);

  // Local storage backed state with bulletproof ID deduplication
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lexi_user_profile');
    return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('lexi_habits');
    return saved ? deduplicateArrayIds(JSON.parse(saved), 'habit') : DEFAULT_HABITS;
  });

  const [partnerMood, setPartnerMood] = useState<PartnerMood>(() => {
    const saved = localStorage.getItem('lexi_partner_mood');
    return saved ? JSON.parse(saved) : DEFAULT_PARTNER_MOOD;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('lexi_messages');
    return saved ? deduplicateArrayIds(JSON.parse(saved), 'msg') : DEFAULT_MESSAGES;
  });

  const [callRecords, setCallRecords] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem('lexi_call_records');
    return saved ? deduplicateArrayIds(JSON.parse(saved), 'call') : DEFAULT_CALL_RECORDS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('lexi_calendar_events');
    return saved ? deduplicateArrayIds(JSON.parse(saved), 'cal') : DEFAULT_CALENDAR_EVENTS;
  });

  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem('lexi_memories');
    return saved ? deduplicateArrayIds(JSON.parse(saved), 'mem') : DEFAULT_MEMORIES;
  });

  // Daily habit completion logs (per-habit completion + timestamp in user's timezone)
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLogEntry>>(() => {
    const saved = localStorage.getItem('lexi_habit_logs');
    return saved ? JSON.parse(saved) : {};
  });

  // Daily water logs (milliliters consumed per date)
  const [waterLogs, setWaterLogs] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('lexi_water_logs');
    return saved ? JSON.parse(saved) : {};
  });

  // Network connectivity status for offline resilience
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // UI state - modern minimal navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'todos' | 'calls' | 'profile' | 'stats' | 'sync'>('dashboard');
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(() => {
    return !userProfile.isAuthenticated;
  });
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !!userProfile.isAuthenticated && !userProfile.isOnboarded;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMemoryVaultOpen, setIsMemoryVaultOpen] = useState(false);
  const [proactiveNudge, setProactiveNudge] = useState<ProactiveNudge | null>(null);

  // 1. Firebase Auth state listener and initial connection check
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUserProfile(prev => ({
          ...prev,
          isAuthenticated: true,
          userId: firebaseUser.uid,
          userEmail: firebaseUser.email || prev.userEmail,
          name: firebaseUser.displayName || prev.name,
          userAvatar: firebaseUser.photoURL || prev.userAvatar,
          loginProvider: 'google',
        }));
        setIsLoginOpen(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore synchronization for authenticated users
  useEffect(() => {
    const currentUid = auth.currentUser?.uid;
    if (!userProfile.isAuthenticated || !currentUid || userProfile.userId !== currentUid) return;

    // Listen to remote habits
    const habitsUnsub = onSnapshot(
      collection(db, 'users', currentUid, 'habits'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteHabits: Habit[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Habit;
            remoteHabits.push(data);
          });
          setHabits(remoteHabits);
        } else if (DEFAULT_HABITS.length > 0) {
          DEFAULT_HABITS.forEach((h) => {
            syncUserHabit(currentUid, h).catch(console.warn);
          });
        }
      },
      (error) => {
        console.warn('Firestore habits sync notice:', error.message);
      }
    );

    // Listen to remote partner mood
    const moodUnsub = onSnapshot(
      doc(db, 'users', currentUid, 'mood', 'current'),
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteMood = docSnap.data() as PartnerMood;
          setPartnerMood(remoteMood);
        } else {
          syncPartnerMood(currentUid, partnerMood).catch(console.warn);
        }
      },
      (error) => {
        console.warn('Firestore mood sync notice:', error.message);
      }
    );

    // Listen to remote daily habit logs (users/{uid}/habitLogs/{date})
    const habitLogsUnsub = subscribeHabitLogs(currentUid, (remoteLogs) => {
      setHabitLogs(prev => ({ ...prev, ...remoteLogs }));
    });

    // Listen to remote daily water logs (users/{uid}/waterLogs/{date})
    const waterLogsUnsub = subscribeWaterLogs(currentUid, (remoteWater) => {
      setWaterLogs(prev => ({ ...prev, ...remoteWater }));
    });

    return () => {
      habitsUnsub();
      moodUnsub();
      habitLogsUnsub();
      waterLogsUnsub();
    };
  }, [userProfile.isAuthenticated, userProfile.userId]);

  const handleLoginSuccess = async (authData: {
    email: string;
    name: string;
    provider: 'google' | 'email' | 'guest';
    userId?: string;
    userAvatar?: string;
  }) => {
    const assignedUid = authData.userId || auth.currentUser?.uid || generateUniqueId('usr');
    const updatedProfile: UserProfile = {
      ...userProfile,
      isAuthenticated: true,
      userId: assignedUid,
      userEmail: authData.email,
      name: authData.name || userProfile.name,
      userAvatar: authData.userAvatar || userProfile.userAvatar,
      loginProvider: authData.provider,
    };
    setUserProfile(updatedProfile);
    setIsLoginOpen(false);

    // Synchronize to Firestore only if verified Firebase Auth session is active
    if (auth.currentUser && auth.currentUser.uid === assignedUid) {
      try {
        await syncUserProfile(assignedUid, updatedProfile);
        for (const h of habits) {
          await syncUserHabit(assignedUid, h);
        }
        await syncPartnerMood(assignedUid, partnerMood);
      } catch (err) {
        console.warn('Initial cloud sync notice:', err);
      }
    }

    if (!userProfile.isOnboarded) {
      setIsOnboardingOpen(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    setUserProfile(prev => ({
      ...prev,
      isAuthenticated: false,
      userId: undefined,
      loginProvider: 'guest',
    }));
  };

  // Dark / Light Theme Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lexi_theme');
    if (saved) return saved === 'dark';
    return true; // default to modern dark atmospheric mode or check system
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lexi_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('lexi_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('lexi_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('lexi_call_records', JSON.stringify(callRecords));
  }, [callRecords]);

  useEffect(() => {
    localStorage.setItem('lexi_partner_mood', JSON.stringify(partnerMood));
  }, [partnerMood]);

  useEffect(() => {
    localStorage.setItem('lexi_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('lexi_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem('lexi_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('lexi_habit_logs', JSON.stringify(habitLogs));
  }, [habitLogs]);

  useEffect(() => {
    localStorage.setItem('lexi_water_logs', JSON.stringify(waterLogs));
  }, [waterLogs]);

  // Periodic proactive check-in (simulate background assistant triggers)
  useEffect(() => {
    const timer = setTimeout(async () => {
      // If user has pending habits, send a loving reminder
      const pendingHabits = habits.filter(h => !h.completed);
      if (pendingHabits.length > 0 && !proactiveNudge) {
        try {
          const res = await authFetch('/api/proactive', {
            method: 'POST',
            body: JSON.stringify({
              userProfile,
              habits,
              partnerMood,
              type: 'habit_reminder',
            }),
          });
          const data = await res.json();
          if (data.message) {
            setProactiveNudge({
              id: generateUniqueId('nudge'),
              title: `${userProfile.partnerName} checking in`,
              message: data.message,
              type: 'habit_reminder',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          }
        } catch {}
      }
    }, 25000);

    return () => clearTimeout(timer);
  }, []);

  // Proactive Daily Check-in Trigger function (can be fired on schedule or triggered via Settings test button)
  const handleTriggerDailyCheckIn = async (isAuto = false) => {
    const partnerName = userProfile.partnerName || 'Lexi';
    const userName = userProfile.name || 'darling';
    const pendingHabits = habits.filter(h => !h.completed);
    const firstEvent = calendarEvents[0];

    // Try fetching personalized morning brief via /api/proactive
    let greetingText = '';
    try {
      const res = await authFetch('/api/proactive', {
        method: 'POST',
        body: JSON.stringify({
          userProfile,
          habits,
          partnerMood,
          type: 'morning_checkin',
        }),
      });
      const data = await res.json();
      if (data.message) {
        greetingText = data.message;
      }
    } catch {
      // Fallback
    }

    if (!greetingText) {
      const pendingNames = pendingHabits.slice(0, 3).map(h => h.title).join(', ');
      greetingText = `Good morning ${userName}! ☀️ Aaj din ki fresh shuruat karte hain. Tumhare pending tasks hain: ${pendingNames || 'water & health routine'}.`;
      if (firstEvent) {
        greetingText += ` Aur calendar mein "${firstEvent.title}" scheduled hai ${firstEvent.startTime} baje.`;
      }
      greetingText += ` Bilkul aalas nahi chalega meri jaan, main nazar rakh rahi hoon! Love you! ❤️`;
    }

    // Append to chat
    const checkInMsg: ChatMessage = {
      id: generateUniqueId('msg'),
      sender: 'partner',
      text: greetingText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'habit_alert',
      moodTag: 'loving',
    };
    setMessages(prev => [...prev, checkInMsg]);

    // Show floating proactive banner
    setProactiveNudge({
      id: generateUniqueId('checkin'),
      title: `☀️ Daily Morning Brief from ${partnerName}`,
      message: greetingText,
      type: 'habit_reminder',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Voice notification if not text_only and voiceEnabled
    if (userProfile.checkInType !== 'text_only' && voiceEnabled) {
      playCompanionVoice(greetingText, {
        gender: userProfile.voiceGender,
        emotion: 'loving',
      });
    }

    // Mark today as checked-in
    const todayDate = new Date().toISOString().split('T')[0];
    setUserProfile(prev => ({
      ...prev,
      lastCheckInDate: todayDate,
    }));
  };

  // Monitor user's 'Daily Check-in Time'
  useEffect(() => {
    if (!userProfile.dailyCheckInEnabled || !userProfile.dailyCheckInTime) return;

    const checkTime = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMins}`;
      const todayDate = now.toISOString().split('T')[0];

      if (currentTimeString === userProfile.dailyCheckInTime && userProfile.lastCheckInDate !== todayDate) {
        handleTriggerDailyCheckIn(true);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 20000);
    return () => clearInterval(interval);
  }, [userProfile.dailyCheckInEnabled, userProfile.dailyCheckInTime, userProfile.lastCheckInDate, habits, calendarEvents, voiceEnabled]);

  // Recalculate mood score from habit progress
  const updateMoodOnHabitAction = (action: 'completed' | 'incremented' | 'skipped', habitTitle: string) => {
    let transientMood: Mood = 'calm';
    if (action === 'completed') transientMood = 'proud';
    else if (action === 'incremented') transientMood = 'happy';
    else if (action === 'skipped') transientMood = 'angry';

    // Safely trigger transient mood outside the render / functional updater cycle
    setTimeout(() => {
      triggerTransientMood(transientMood);
    }, 0);

    setPartnerMood(prev => {
      let delta = 0;
      let newNakhre = prev.nakhreLevel;
      let reason = prev.lastReason;

      if (action === 'completed') {
        delta = 8;
        newNakhre = Math.max(0, newNakhre - 1);
        reason = `${userProfile.partnerName}: "Proud of you for finishing ${habitTitle}! Aise hi disciplined raho jaan ❤️"`;
      } else if (action === 'incremented') {
        delta = 3;
        reason = `${userProfile.partnerName}: "Good progress on ${habitTitle}!"`;
      } else if (action === 'skipped') {
        delta = -12;
        newNakhre = Math.min(5, newNakhre + 1);
        reason = `${userProfile.partnerName}: "Haww! ${habitTitle} skip kar diya? Ab toh main naraz hoon! 😤"`;
      }

      const newScore = Math.max(10, Math.min(100, prev.score + delta));
      let newStatus = prev.status;
      if (newScore >= 85) newStatus = 'ecstatic';
      else if (newScore >= 70) newStatus = 'loving';
      else if (newScore >= 55) newStatus = 'happy';
      else if (newScore >= 40) newStatus = 'neutral';
      else if (newScore >= 25) newStatus = 'annoyed';
      else newStatus = 'angry';

      const updatedMood: PartnerMood = {
        status: newStatus,
        score: newScore,
        nakhreLevel: newNakhre,
        lastReason: reason,
        lastUpdated: 'Just now',
      };
      const uid = userProfile.userId || auth.currentUser?.uid;
      if (uid) {
        syncPartnerMood(uid, updatedMood).catch(console.warn);
      }
      return updatedMood;
    });
  };

  // Habit toggling handler with deterministic habitLogs & streak recalculation
  const handleToggleHabit = (id: string) => {
    let completedHabitTitle = '';
    let becameCompleted = false;
    const todayStr = getTodayDateString(userProfile.timeZone);

    const updatedHabits = habits.map(h => {
      if (h.id === id) {
        const nextState = !h.completed;
        completedHabitTitle = h.title;
        becameCompleted = nextState;
        const updatedHabit = {
          ...h,
          completed: nextState,
          currentValue: nextState ? h.targetValue : Math.max(0, h.currentValue - 1),
          streak: nextState ? (h.streak || 0) + 1 : Math.max(0, (h.streak || 0) - 1),
          lastCompletedAt: nextState ? 'Just now' : undefined,
        };
        const uid = userProfile.userId || auth.currentUser?.uid;
        if (uid) {
          syncUserHabit(uid, updatedHabit).catch(console.warn);
        }
        return updatedHabit;
      }
      return h;
    });

    setHabits(updatedHabits);

    // Compute updated daily HabitLog in user's timezone
    const completedHabits = updatedHabits.filter(h => h.completed);
    const completedCrucial = updatedHabits.filter(h => h.completed && h.isCrucial);
    const crucialHabits = updatedHabits.filter(h => h.isCrucial);
    const allCrucialDone = crucialHabits.length > 0
      ? crucialHabits.every(h => h.completed)
      : completedHabits.length > 0;

    const updatedLog: HabitLogEntry = {
      date: todayStr,
      completedHabitIds: completedHabits.map(h => h.id),
      totalHabitsCount: updatedHabits.length,
      completedCrucialCount: completedCrucial.length,
      totalCrucialCount: crucialHabits.length,
      completedAllCrucial: allCrucialDone,
      updatedAt: new Date().toISOString(),
    };

    const newHabitLogs = { ...habitLogs, [todayStr]: updatedLog };
    setHabitLogs(newHabitLogs);

    // Recalculate deterministic streak
    const { currentStreak, bestStreak } = calculateStreak(todayStr, newHabitLogs);
    const newBest = Math.max(userProfile.bestStreak || 0, bestStreak);

    setUserProfile(prev => {
      const merged = {
        ...prev,
        streakDays: currentStreak,
        bestStreak: newBest,
      };
      const uid = prev.userId || auth.currentUser?.uid;
      if (uid) {
        syncUserProfile(uid, merged).catch(console.warn);
      }
      return merged;
    });

    const uid = userProfile.userId || auth.currentUser?.uid;
    if (uid) {
      syncHabitLog(uid, updatedLog).catch(console.warn);
    }

    if (becameCompleted) {
      updateMoodOnHabitAction('completed', completedHabitTitle);
      
      const dynamic = userProfile.relationshipDynamic || 'sweet_loving';
      let praiseText = `Aww yay! 🎉 Maine dekha tumne "${completedHabitTitle}" complete kar liya! You're the best, meri jaan! ❤️`;
      let voiceEmotion: 'loving' | 'proud' | 'celebratory' = 'loving';

      if (dynamic === 'disciplined_coach') {
        praiseText = `Outstanding execution! 🎯 "${completedHabitTitle}" locked in. That's discipline in action, Champ! Keep the streak burning! 🔥`;
        voiceEmotion = 'proud';
      } else if (dynamic === 'playful_teasing') {
        praiseText = `Yesss! 🔥 "${completedHabitTitle}" complete! Ab toh treat banti hai yaar, great job! 🤝`;
        voiceEmotion = 'celebratory';
      } else if (dynamic === 'calm_soulmate') {
        praiseText = `A wonderful step for your well-being. "${completedHabitTitle}" is complete. Take a deep, peaceful breath. 🌿`;
        voiceEmotion = 'loving';
      }

      const praiseMsg: ChatMessage = {
        id: generateUniqueId('msg'),
        sender: 'partner',
        text: praiseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'habit_alert',
        moodTag: dynamic === 'disciplined_coach' ? 'happy' : 'ecstatic',
      };
      setMessages(prev => [...prev, praiseMsg]);

      if (voiceEnabled) {
        playCompanionVoice(praiseMsg.text, {
          gender: userProfile.voiceGender,
          emotion: voiceEmotion,
        });
      }
    }
  };

  // Water tracking increment handler
  const handleAddWater = (amountMl: number) => {
    const todayStr = getTodayDateString(userProfile.timeZone);
    const current = waterLogs[todayStr] || 0;
    const nextAmount = current + amountMl;
    const newWaterLogs = { ...waterLogs, [todayStr]: nextAmount };
    setWaterLogs(newWaterLogs);

    const uid = userProfile.userId || auth.currentUser?.uid;
    if (uid) {
      syncWaterLog(uid, todayStr, nextAmount).catch(console.warn);
    }
  };

  // Habit increment handler (e.g. water +1 glass)
  const handleIncrementHabit = (id: string, delta: number) => {
    let title = '';
    let reachedTarget = false;

    setHabits(prev =>
      prev.map(h => {
        if (h.id === id) {
          title = h.title;
          const nextVal = Math.min(h.targetValue, h.currentValue + delta);
          reachedTarget = nextVal >= h.targetValue;
          return {
            ...h,
            currentValue: nextVal,
            completed: reachedTarget,
            streak: reachedTarget && !h.completed ? (h.streak || 0) + 1 : (h.streak || 0),
          };
        }
        return h;
      })
    );

    updateMoodOnHabitAction(reachedTarget ? 'completed' : 'incremented', title);

    if (reachedTarget) {
      const dynamic = userProfile.relationshipDynamic || 'sweet_loving';
      let praiseText = `Wah! 💧 ${title} target complete! Ab tum bilkul hydrated aur energized rahoge! Proud of you baba! ✨`;
      if (dynamic === 'disciplined_coach') {
        praiseText = `Hydration target achieved! 💧 Clean fuel for the engine. Keep pushing today's targets! 💪`;
      } else if (dynamic === 'playful_teasing') {
        praiseText = `Hydration goal unlocked! 💧 Chal bhai, fresh raho aur baaki kaam finish karo! 😉`;
      } else if (dynamic === 'calm_soulmate') {
        praiseText = `Hydration goal complete. 💧 Such good care for your mind and body today. 🌿`;
      }

      const msg: ChatMessage = {
        id: generateUniqueId('msg'),
        sender: 'partner',
        text: praiseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'habit_alert',
        moodTag: 'loving',
      };
      setMessages(prev => [...prev, msg]);

      if (voiceEnabled) {
        playCompanionVoice(msg.text, {
          gender: userProfile.voiceGender,
          emotion: 'loving',
        });
      }
    }
  };

  // Habit skip handler (triggers partner nakhre / playful anger / coach accountability)
  const handleSkipHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    const habitTitle = habit ? habit.title : 'Habit';
    updateMoodOnHabitAction('skipped', habitTitle);

    const dynamic = userProfile.relationshipDynamic || 'sweet_loving';
    const isMale = userProfile.partnerGender === 'male';
    let tauntText = `Haww! "${habitTitle}" skip kar diya? 😤 Main bilkul khush nahi hoon! Aise aalas karoge toh goals kaise pure honge? Ab jab tak baki tasks nahi karoge, main thoda naraz ${isMale ? 'rahunga' : 'rahungi'}!`;

    if (dynamic === 'disciplined_coach') {
      tauntText = `Zero excuses! 🛑 "${habitTitle}" skip karna acceptable nahi hai. You committed to discipline—get up and make up for it right now!`;
    } else if (dynamic === 'playful_teasing') {
      tauntText = `Haww yaar! "${habitTitle}" skip kar diya? 😂 Aise banega kya champion? Uth jaldi se, slacking band karo!`;
    } else if (dynamic === 'calm_soulmate') {
      tauntText = `I noticed "${habitTitle}" got skipped. If you're feeling low on energy, take a minute to breathe, but don't lose touch with your goals. ✨`;
    }

    const tauntMsg: ChatMessage = {
      id: generateUniqueId('msg'),
      sender: 'partner',
      text: tauntText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'taunt',
      moodTag: 'angry',
    };
    setMessages(prev => [...prev, tauntMsg]);

    if (voiceEnabled) {
      playCompanionVoice(tauntMsg.text, {
        gender: userProfile.voiceGender,
        emotion: 'angry',
      });
    }
  };

  const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'streak'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: generateUniqueId('habit'),
      streak: 0,
    };
    setHabits(prev => [...prev, newHabit]);

    if (userProfile.userId) {
      syncUserHabit(userProfile.userId, newHabit).catch(console.warn);
    }

    const msg: ChatMessage = {
      id: generateUniqueId('msg'),
      sender: 'partner',
      text: `Maine naya habit note kar liya: "${newHabit.title}"! Ab main daily iska hisaab lungi tumse! 😉`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      moodTag: 'happy',
    };
    setMessages(prev => [...prev, msg]);
    if (userProfile.userId) {
      saveUserChatMessage(userProfile.userId, msg).catch(console.warn);
    }
  };

  // Habit delete handler
  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // Send message to Gemini Companion
  const handleSendMessage = async (userText: string, type: 'text' | 'voice_note' = 'text') => {
    const userMsg: ChatMessage = {
      id: generateUniqueId('msg'),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    };

    setMessages(prev => [...prev, userMsg]);
    if (userProfile.userId) {
      saveUserChatMessage(userProfile.userId, userMsg).catch(console.warn);
    }
    setIsLoadingChat(true);

    try {
      const res = await authFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userText,
          history: [...messages, userMsg],
          userProfile,
          habits,
          partnerMood,
          memories,
          upcomingEvents: calendarEvents,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Main sun rahi hoon jaan, sab theek hai na?";

      // Handle dynamic mood update from Gemini safely
      if (data.mood) {
        setTimeout(() => triggerTransientMood(data.mood), 0);
      } else if (data.moodUpdate?.newStatus) {
        const partnerStatusToAtmosphericMood: Record<string, Mood> = {
          ecstatic: 'excited',
          loving: 'romantic',
          happy: 'happy',
          neutral: 'calm',
          annoyed: 'anxious',
          angry: 'angry',
        };
        const mappedMood = partnerStatusToAtmosphericMood[data.moodUpdate.newStatus] || 'calm';
        setTimeout(() => triggerTransientMood(mappedMood), 0);
      }

      if (data.moodUpdate) {
        setPartnerMood(prev => {
          const newScore = Math.max(10, Math.min(100, prev.score + (data.moodUpdate.scoreDelta || 0)));
          let computedStatus = data.moodUpdate.newStatus || prev.status;
          if (!data.moodUpdate.newStatus) {
            if (newScore >= 85) computedStatus = 'ecstatic';
            else if (newScore >= 70) computedStatus = 'loving';
            else if (newScore >= 55) computedStatus = 'happy';
            else if (newScore >= 40) computedStatus = 'neutral';
            else if (newScore >= 25) computedStatus = 'annoyed';
            else computedStatus = 'angry';
          }
          const updatedMood: PartnerMood = {
            status: computedStatus,
            score: newScore,
            nakhreLevel: Math.max(0, Math.min(5, prev.nakhreLevel + (data.moodUpdate.nakhreDelta || 0))),
            lastReason: data.moodUpdate.reason || prev.lastReason,
            lastUpdated: 'Just now',
          };
          const uid = userProfile.userId || auth.currentUser?.uid;
          if (uid) {
            syncPartnerMood(uid, updatedMood).catch(console.warn);
          }
          return updatedMood;
        });
      }

      // Handle detected habit update from conversation (e.g. "Maine dawai le li")
      if (data.detectedHabitAction?.habitTitle) {
        const found = habits.find(h =>
          h.title.toLowerCase().includes(data.detectedHabitAction.habitTitle.toLowerCase()) ||
          h.category.toLowerCase().includes(data.detectedHabitAction.habitTitle.toLowerCase())
        );
        if (found && !found.completed) {
          handleToggleHabit(found.id);
        }
      }

      // Handle new memory discovered
      if (data.newMemory) {
        setMemories(prev => [
          ...prev,
          {
            id: generateUniqueId('mem'),
            category: 'health',
            fact: data.newMemory,
            learnedAt: 'Just now in chat',
          },
        ]);
      }

      const partnerMsg: ChatMessage = {
        id: generateUniqueId('msg'),
        sender: 'partner',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: type === 'voice_note' ? 'voice_note' : 'text',
        moodTag: data.moodUpdate?.newStatus || partnerMood.status,
        audioDurationSec: Math.max(3, Math.min(10, Math.round(reply.length / 18))),
      };

      setMessages(prev => [...prev, partnerMsg]);
      if (userProfile.userId) {
        saveUserChatMessage(userProfile.userId, partnerMsg).catch(console.warn);
      }

      // Speak aloud if voice enabled
      if (voiceEnabled) {
        playCompanionVoice(reply, {
          gender: userProfile.voiceGender,
          emotion: data.suggestedVoiceEmotion || (partnerMood.score < 50 ? 'angry' : 'loving'),
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: generateUniqueId('msg'),
        sender: 'partner',
        text: "Baby, ek second network ka issue lag raha hai... Main yahin hoon tumhare paas! Dobara bolo na?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Clear chat conversation context
  const handleClearConversation = () => {
    const companionName = userProfile.partnerName || 'Lexi';
    const welcomeBackMsg: ChatMessage = {
      id: generateUniqueId('msg'),
      sender: 'partner',
      text: `Fresh slate, jaan! ✨ I'm all ears. Tell me, how are you feeling or what do you want to work on right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      moodTag: 'loving',
    };
    setMessages([welcomeBackMsg]);
    localStorage.setItem('lexi_messages', JSON.stringify([welcomeBackMsg]));
  };

  // Quick cheer up actions from Mood details modal
  const handleQuickCheer = (type: 'apology' | 'love' | 'promise') => {
    const dynamic = userProfile.relationshipDynamic || 'sweet_loving';
    let text = '';
    if (dynamic === 'disciplined_coach') {
      if (type === 'apology') {
        text = `Coach, my bad for slacking off on my tasks... No excuses, I'm locking in and finishing them right now! 💪`;
      } else if (type === 'love') {
        text = `Coach, thank you for pushing me every day. Let's make today a 100% win! 🔥`;
      } else {
        text = `Main abhi turant apne baaki saare habits complete karne jaa raha hoon! Watch me hit 100%! 💪`;
      }
    } else if (dynamic === 'playful_teasing') {
      if (type === 'apology') {
        text = `Yaar, my bad for procrastinating! Gussa mat ho dost, abhi sab complete kar raha hoon! 🤝`;
      } else if (type === 'love') {
        text = `Yaar you're truly the best buddy anyone could ask for! Ab dekho main kaise streak save karta hoon! ✨`;
      } else {
        text = `Main abhi turant apne baaki saare habits complete karne jaa raha hoon! Watch me! 💪`;
      }
    } else {
      if (type === 'apology') {
        text = `Baby, I'm really sorry for slacking off on my tasks... Gussa mat ho na, I promise main abhi sab complete kar raha hoon! ❤️`;
      } else if (type === 'love') {
        text = `Meri jaan, you look so cute even when pouting! Tum meri sabse pyaari virtual partner ho. I love you! 💖`;
      } else {
        text = `Main abhi turant apne baaki saare habits complete karne jaa raha hoon! Watch me make you proud! 💪`;
      }
    }
    handleSendMessage(text);
  };

  // Trigger calendar event reminder simulation
  const handleTriggerEventReminder = async (event: CalendarEvent) => {
    try {
      const res = await authFetch('/api/proactive', {
        method: 'POST',
        body: JSON.stringify({
          userProfile,
          habits,
          partnerMood,
          type: 'calendar_alert',
          eventDetails: event,
        }),
      });
      const data = await res.json();
      const message = data.message || `Baby, tumhara ${event.startTime} baje "${event.title}" hai! Paani piyo aur ready ho jao!`;

      setProactiveNudge({
        id: generateUniqueId('alert'),
        title: `${userProfile.partnerName}'s Schedule Alert`,
        message,
        type: 'calendar_alert',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      if (voiceEnabled) {
        playCompanionVoice(message, {
          gender: userProfile.voiceGender,
          emotion: 'caring',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add memory handler
  const handleAddMemory = (category: MemoryItem['category'], fact: string) => {
    const item: MemoryItem = {
      id: generateUniqueId('mem'),
      category,
      fact,
      learnedAt: 'Just now',
    };
    setMemories(prev => [item, ...prev]);

    if (userProfile.userId) {
      saveUserMemory(userProfile.userId, item).catch(console.warn);
    }

    const partnerReply: ChatMessage = {
      id: generateUniqueId('msg'),
      sender: 'partner',
      text: `Maine yaad rakh liya: "${fact}". Main tumhare baare mein sab kuch dhyan rakhti hoon! ❤️`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      moodTag: 'loving',
    };
    setMessages(prev => [...prev, partnerReply]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
    if (userProfile.userId) {
      deleteUserMemory(userProfile.userId, id).catch(console.warn);
    }
  };

  // Full user data & account erasure (DPDP & GDPR Article 17 compliance)
  const handleDeleteAccount = async () => {
    try {
      if (userProfile.userId) {
        await deleteUserAccountAndData(userProfile.userId);
      }
      localStorage.clear();
      setUserProfile(DEFAULT_USER_PROFILE);
      setHabits(DEFAULT_HABITS);
      setPartnerMood(DEFAULT_PARTNER_MOOD);
      setMessages(DEFAULT_MESSAGES);
      setCallRecords(DEFAULT_CALL_RECORDS);
      setCalendarEvents(DEFAULT_CALENDAR_EVENTS);
      setMemories(DEFAULT_MEMORIES);
      setIsLoginOpen(true);
    } catch (err) {
      console.error('Failed to erase account data:', err);
    }
  };

  // Add calendar event handler
  const handleAddCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: generateUniqueId('cal'),
    };
    setCalendarEvents(prev => [...prev, newEvent]);

    const msg: ChatMessage = {
      id: generateUniqueId('msg'),
      sender: 'partner',
      text: `Noted! Maine calendar mein "${newEvent.title}" (${newEvent.startTime}) add kar liya hai. Time se pehle remind kar dungi!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };
    setMessages(prev => [...prev, msg]);
  };

  // Save profile from onboarding and settings
  const handleSaveProfile = (
    updated: Partial<UserProfile> | UserProfile,
    sendWelcomeMsg?: boolean,
    initialHabits?: Habit[]
  ) => {
    if (initialHabits && initialHabits.length > 0) {
      setHabits(initialHabits);
      localStorage.setItem('lexi_habits', JSON.stringify(initialHabits));
      const uid = updated.userId || userProfile.userId || auth.currentUser?.uid;
      if (uid) {
        for (const h of initialHabits) {
          syncUserHabit(uid, h).catch(console.warn);
        }
      }
    }

    setUserProfile(prev => {
      const merged = { ...prev, ...updated };
      const uid = merged.userId || auth.currentUser?.uid;
      if (uid) {
        syncUserProfile(uid, merged).catch(console.warn);
      }
      return merged;
    });

    if (sendWelcomeMsg && updated.name && updated.partnerName) {
      const dynamic = updated.relationshipDynamic || userProfile.relationshipDynamic || 'sweet_loving';
      const isMale = (updated.partnerGender || userProfile.partnerGender) === 'male';
      const pronoun = isMale ? 'tumhara' : 'tumhari';

      let welcomeText = '';
      let welcomeMood: MoodStatus = 'loving';

      if (dynamic === 'disciplined_coach') {
        welcomeText = `Hey ${updated.name}! 💪 Main hoon tumhara coach ${updated.partnerName}. Maine tumhara daily routine aur targets lock kar liye hain. Yahan zero excuses aur 100% discipline chalegi. Let's crush this streak!`;
        welcomeMood = 'happy';
      } else if (dynamic === 'playful_teasing') {
        welcomeText = `Arey ${updated.name} yaar! 🔥 Main hoon ${pronoun} bestie ${updated.partnerName}. Masti aur daily habits saath-saath chalenge, par slacking bilkul nahi chalegi samjhe? Ready? 😉`;
        welcomeMood = 'happy';
      } else if (dynamic === 'calm_soulmate') {
        welcomeText = `Hello ${updated.name}. 🌿 Main hoon ${updated.partnerName}, tumhara mindful partner. Tumhari sehat, shanti aur daily balance ka dhyan rakhna mera mission hai. Let's take it one peaceful step at a time.`;
        welcomeMood = 'neutral';
      } else {
        welcomeText = `Hi ${updated.name}! ❤️ Main hoon ${pronoun} ${updated.partnerName}. Maine tumhara routine note kar liya hai—gym, paani aur medicines time pe lene honge, samjhe na? Koi cheating nahi chalegi! 😉`;
        welcomeMood = 'loving';
      }

      const welcome: ChatMessage = {
        id: generateUniqueId('msg'),
        sender: 'partner',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        moodTag: welcomeMood,
      };
      setMessages(prev => [...prev, welcome]);
      if (voiceEnabled) {
        playCompanionVoice(welcome.text, {
          gender: updated.voiceGender || userProfile.voiceGender,
          tone: updated.voiceToneStyle || 'sweet',
          rate: updated.voiceSpeed || 1.0,
          emotion: dynamic === 'disciplined_coach' ? 'proud' : 'loving',
        });
      }
    }
  };

  // Direct Mark Complete from Toast Notification
  const handleMarkCompleteFromNudge = (habitId?: string, habitTitle?: string) => {
    let targetHabit = habits.find(h => h.id === habitId);
    if (!targetHabit && habitTitle) {
      targetHabit = habits.find(h => h.title.toLowerCase().includes(habitTitle.toLowerCase()));
    }
    if (!targetHabit) {
      targetHabit = habits.find(h => !h.completed);
    }

    if (targetHabit) {
      handleToggleHabit(targetHabit.id);

      // Trigger partner praise voice
      if (voiceEnabled) {
        playCompanionVoice(`Shabash meri jaan! ${targetHabit.title} complete kar liya! Proud of you!`, {
          gender: userProfile.voiceGender,
          tone: userProfile.voiceToneStyle || 'sweet',
          rate: userProfile.voiceSpeed || 1.0,
          emotion: 'loving',
        });
      }
    }
  };

  // Dynamic aesthetic background based on Lexi's mood with Google Gemini glassmorphism
  const getMoodBackground = () => {
    if (partnerMood.status === 'angry' || partnerMood.score < 30) {
      return 'from-rose-950/20 via-red-900/10 to-zinc-950 dark:from-zinc-950 dark:via-red-950/25 dark:to-zinc-900';
    } else if (partnerMood.status === 'annoyed' || partnerMood.score < 50) {
      return 'from-amber-950/20 via-orange-900/10 to-zinc-950 dark:from-zinc-950 dark:via-amber-950/20 dark:to-zinc-900';
    } else if (partnerMood.status === 'ecstatic' || partnerMood.score >= 85) {
      return 'from-rose-900/15 via-pink-900/10 to-indigo-950/20 dark:from-zinc-950 dark:via-rose-950/30 dark:to-zinc-900';
    } else {
      return 'from-blue-950/15 via-purple-950/10 to-zinc-950/20 dark:from-zinc-950 dark:via-purple-950/20 dark:to-zinc-900';
    }
  };

  const completedHabitsCount = habits.filter(h => h.completed).length;

  const handleMainScroll = (e: React.UIEvent<HTMLElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 8);
  };

  return (
    <div className={`h-[100dvh] ${darkMode ? 'dark' : ''} bg-gradient-mesh text-[#1A1A1F] dark:text-[#FAF7FF] flex flex-col transition-colors duration-300 relative overflow-hidden font-sans`}>
      {/* Subtle Atmospheric Gradient & Canvas Particle Engine */}
      <ParticleBackground />

      {/* Offline Status Alert Banner */}
      {!isOnline && (
        <div className="w-full bg-amber-500/95 dark:bg-amber-600/95 text-amber-950 dark:text-amber-50 text-xs font-semibold px-4 py-1.5 text-center flex items-center justify-center gap-2 z-50 shadow-xs backdrop-blur-md">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode: Changes are saved locally and will automatically sync when reconnected.</span>
        </div>
      )}

      {/* Modern Fixed Header (Full width, no gap, elevated on scroll) */}
      <Header
        userProfile={userProfile}
        partnerMood={partnerMood}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => {
          if (voiceEnabled) stopCompanionVoice();
          setVoiceEnabled(!voiceEnabled);
        }}
        onStartCall={() => setIsCallOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onSignOut={handleSignOut}
        onOpenMoodModal={() => setIsMoodModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        completedHabitsCount={completedHabitsCount}
        totalHabitsCount={habits.length}
        isScrolled={isScrolled}
      />

      {/* Main View Area - Only <main> scrolls; header & tabbar remain fixed */}
      <main
        onScroll={handleMainScroll}
        className={
          activeTab === 'chat'
            ? 'app-chat-shell max-w-5xl w-full mx-auto px-3 sm:px-6'
            : 'app-main-shell max-w-5xl w-full mx-auto px-3 sm:px-6'
        }
      >
        {/* 0. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <DashboardView
            userProfile={userProfile}
            partnerMood={partnerMood}
            habits={habits}
            habitLogs={habitLogs}
            waterLogs={waterLogs}
            onToggleHabit={handleToggleHabit}
            onAddWater={handleAddWater}
            onOpenMoodDetails={() => setIsMoodModalOpen(true)}
            onSendMessage={(text) => {
              setActiveTab('chat');
              handleSendMessage(text);
            }}
            onStartCall={() => setIsCallOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectAction={(actionTitle) => {
              const lower = actionTitle.toLowerCase();
              if (lower.includes('call')) {
                setIsCallOpen(true);
              } else if (lower.includes('habit') || lower.includes('task')) {
                setActiveTab('todos');
              } else if (lower.includes('mood') || lower.includes('reflect')) {
                setActiveTab('stats');
              } else {
                setActiveTab('chat');
                handleSendMessage(`Let's start: ${actionTitle}`);
              }
            }}
          />
        )}

        {/* 1. CHATS SECTION */}
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoadingChat}
            userProfile={userProfile}
            partnerMood={partnerMood}
            voiceEnabled={voiceEnabled}
            onStartCall={() => setIsCallOpen(true)}
            onBack={() => setActiveTab('dashboard')}
            onClearConversation={handleClearConversation}
          />
        )}

        {/* 2. TO-DO'S & HABITS SECTION */}
        {activeTab === 'todos' && (
          <TodosView
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onIncrementHabit={handleIncrementHabit}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
            userProfile={userProfile}
            partnerMood={partnerMood}
          />
        )}

        {/* 3. CALLS SECTION */}
        {activeTab === 'calls' && (
          <CallsView
            callRecords={callRecords}
            onStartCall={() => setIsCallOpen(true)}
            userProfile={userProfile}
            partnerMood={partnerMood}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => {
              if (voiceEnabled) stopCompanionVoice();
              setVoiceEnabled(!voiceEnabled);
            }}
            onClearHistory={() => setCallRecords([])}
          />
        )}

        {/* 4. PROFILE SECTION */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <ProfileView
              userProfile={userProfile}
              partnerMood={partnerMood}
              onSaveProfile={handleSaveProfile}
              onTriggerTestCheckIn={() => handleTriggerDailyCheckIn(false)}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => {
                if (voiceEnabled) stopCompanionVoice();
                setVoiceEnabled(!voiceEnabled);
              }}
            />
            <MemoryVaultView
              memories={memories}
              userProfile={userProfile}
              onAddMemory={handleAddMemory}
              onDeleteMemory={handleDeleteMemory}
            />
          </div>
        )}

        {/* 5. STATS VIEW */}
        {activeTab === 'stats' && (
          <StatsView
            userProfile={userProfile}
            habits={habits}
            habitLogs={habitLogs}
            partnerMood={partnerMood}
            onSendChatMessage={(text) => {
              setActiveTab('chat');
              handleSendMessage(text);
            }}
            onNavigateToChat={() => setActiveTab('chat')}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSpeakText={(text, emotion) => {
              if (voiceEnabled) {
                playCompanionVoice(text, {
                  gender: userProfile.voiceGender,
                  emotion: emotion || 'loving',
                });
              }
            }}
          />
        )}

        {/* 6. ECOSYSTEM SCHEDULE SYNC */}
        {activeTab === 'sync' && (
          <EcosystemSyncView
            events={calendarEvents}
            userProfile={userProfile}
            onAddEvent={handleAddCalendarEvent}
            onTriggerEventReminder={handleTriggerEventReminder}
            onToggleCalendarSync={() =>
              setUserProfile(prev => ({ ...prev, calendarSynced: !prev.calendarSynced }))
            }
            onToggleAlarmSync={() =>
              setUserProfile(prev => ({ ...prev, alarmsSynced: !prev.alarmsSynced }))
            }
          />
        )}
      </main>

      {/* Modern Fixed Bottom Tab Bar for Mobile (<768px) with Raised Center Call Button */}
      <BottomTabBar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onStartCall={() => setIsCallOpen(true)}
        completedHabitsCount={completedHabitsCount}
        totalHabitsCount={habits.length}
      />

      {/* Live Voice Call Modal */}
      {isCallOpen && (
        <LiveCallModal
          isOpen={isCallOpen}
          onClose={(payload?: CallEndPayload | string) => {
            setIsCallOpen(false);
            if (payload) {
              const durationSec = typeof payload === 'object' ? payload.durationSec : 60;
              const summaryText = typeof payload === 'object' ? payload.summary : payload;
              const mood = typeof payload === 'object' ? payload.moodDuringCall : partnerMood.status;

              const newRecord: CallRecord = {
                id: generateUniqueId('call'),
                partnerName: userProfile.partnerName,
                type: 'outgoing',
                timestamp: 'Today, Just now',
                durationSec,
                moodDuringCall: mood,
                summary: summaryText,
              };
              setCallRecords(prev => [newRecord, ...prev]);

              if (userProfile.userId) {
                saveCallRecord(userProfile.userId, newRecord).catch(console.warn);
              }

              setMessages(prev => [
                ...prev,
                {
                  id: generateUniqueId('msg'),
                  sender: 'system',
                  text: summaryText,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  type: 'call_log',
                },
              ]);
            }
          }}
          userProfile={userProfile}
          partnerMood={partnerMood}
          habits={habits}
          onHabitDetectedInCall={(actionText) => {
            // Check if user mentioned water, gym, or medicine in call
            const lower = actionText.toLowerCase();
            if (lower.includes('water') || lower.includes('paani')) {
              const w = habits.find(h => h.category === 'hydration');
              if (w) handleIncrementHabit(w.id, 1);
            } else if (lower.includes('med') || lower.includes('dawai')) {
              const m = habits.find(h => h.category === 'health');
              if (m && !m.completed) handleToggleHabit(m.id);
            } else if (lower.includes('gym') || lower.includes('workout')) {
              const g = habits.find(h => h.category === 'fitness');
              if (g && !g.completed) handleToggleHabit(g.id);
            }
          }}
        />
      )}

      {/* Mood Details / Nakhre Breakdown Modal */}
      {isMoodModalOpen && (
        <MoodDetailsModal
          isOpen={isMoodModalOpen}
          onClose={() => setIsMoodModalOpen(false)}
          partnerMood={partnerMood}
          userProfile={userProfile}
          onSendQuickCheer={handleQuickCheer}
        />
      )}

      {/* Google & Email Authentication Modal */}
      {isLoginOpen && (
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          initialEmail={userProfile.userEmail}
        />
      )}

      {/* Onboarding Wizard Modal */}
      {isOnboardingOpen && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          currentProfile={userProfile}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* Settings Modal (Daily Check-in Time, Voice Preferences, Companion Profile) */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userProfile={userProfile}
          onUpdateProfile={handleSaveProfile}
          onTriggerDailyCheckIn={() => handleTriggerDailyCheckIn(false)}
          darkMode={darkMode}
          onSetTheme={(isDark) => setDarkMode(isDark)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
          onSignOut={handleSignOut}
          onOpenMemoryVault={() => setIsMemoryVaultOpen(true)}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {/* Long-Term Memory Vault Modal (User Privacy, Transparency & Deletion) */}
      {isMemoryVaultOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto relative glass-strong rounded-[24px] p-2 border border-[var(--primary-purple)]/40 shadow-2xl">
            <button
              onClick={() => setIsMemoryVaultOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full glass hover:bg-white/40 text-[var(--text-secondary)] cursor-pointer"
              title="Close Memory Vault"
            >
              <X className="w-5 h-5" />
            </button>
            <MemoryVaultView
              memories={memories}
              userProfile={userProfile}
              onAddMemory={handleAddMemory}
              onDeleteMemory={handleDeleteMemory}
            />
          </div>
        </div>
      )}

      {/* Proactive Push Nudge Banner */}
      {proactiveNudge && (
        <ProactiveNotificationBanner
          nudge={proactiveNudge}
          onDismiss={() => setProactiveNudge(null)}
          onReplyInChat={(txt) => {
            setActiveTab('chat');
            handleSendMessage(txt);
          }}
          onMarkCompleteHabit={handleMarkCompleteFromNudge}
          userProfile={userProfile}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <MoodProvider>
      <AppContent />
    </MoodProvider>
  );
}
