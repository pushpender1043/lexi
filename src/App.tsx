/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserProfile, Habit, PartnerMood, CalendarEvent, MemoryItem, 
  ChatMessage, ProactiveNudge, CallRecord 
} from './types';
import { 
  DEFAULT_USER_PROFILE, DEFAULT_HABITS, DEFAULT_PARTNER_MOOD, 
  DEFAULT_CALENDAR_EVENTS, DEFAULT_MEMORIES, DEFAULT_MESSAGES,
  DEFAULT_CALL_RECORDS 
} from './data/defaults';
import { Header } from './components/Header';
import { BottomTabBar } from './components/BottomTabBar';
import { HabitsCard } from './components/HabitsCard';
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
import { MessageSquare, CheckSquare, Phone, User, Home, TrendingUp, Sparkles } from 'lucide-react';
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
  saveCallRecord,
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { generateUniqueId, deduplicateArrayIds } from './utils/id';
import { MoodProvider, useMood, ALL_MOODS } from './lib/moods';
import { Mood } from './types';

function AppContent() {
  const { currentMood, setMood, triggerTransientMood } = useMood();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

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
        } else {
          // First time user: seed default habits into Firestore
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

    return () => {
      habitsUnsub();
      moodUnsub();
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

  // Periodic proactive check-in (simulate background assistant triggers)
  useEffect(() => {
    const timer = setTimeout(async () => {
      // If user has pending habits, send a loving reminder
      const pendingHabits = habits.filter(h => !h.completed);
      if (pendingHabits.length > 0 && !proactiveNudge) {
        try {
          const res = await fetch('/api/proactive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch('/api/proactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    setPartnerMood(prev => {
      let delta = 0;
      let newNakhre = prev.nakhreLevel;
      let reason = prev.lastReason;

      if (action === 'completed') {
        delta = 8;
        newNakhre = Math.max(0, newNakhre - 1);
        reason = `${userProfile.partnerName}: "Proud of you for finishing ${habitTitle}! Aise hi disciplined raho jaan ❤️"`;
        triggerTransientMood('proud');
      } else if (action === 'incremented') {
        delta = 3;
        reason = `${userProfile.partnerName}: "Good progress on ${habitTitle}!"`;
        triggerTransientMood('happy');
      } else if (action === 'skipped') {
        delta = -12;
        newNakhre = Math.min(5, newNakhre + 1);
        reason = `${userProfile.partnerName}: "Haww! ${habitTitle} skip kar diya? Ab toh main naraz hoon! 😤"`;
        triggerTransientMood('angry');
      }

      const newScore = Math.max(10, Math.min(100, prev.score + delta));
      let newStatus = prev.status;
      if (newScore >= 85) newStatus = 'ecstatic';
      else if (newScore >= 70) newStatus = 'loving';
      else if (newScore >= 55) newStatus = 'happy';
      else if (newScore >= 40) newStatus = 'neutral';
      else if (newScore >= 25) newStatus = 'annoyed';
      else newStatus = 'angry';

      return {
        status: newStatus,
        score: newScore,
        nakhreLevel: newNakhre,
        lastReason: reason,
        lastUpdated: 'Just now',
      };
    });
  };

  // Habit toggling handler
  const handleToggleHabit = (id: string) => {
    let completedHabitTitle = '';
    let becameCompleted = false;

    setHabits(prev =>
      prev.map(h => {
        if (h.id === id) {
          const nextState = !h.completed;
          completedHabitTitle = h.title;
          becameCompleted = nextState;
          const updatedHabit = {
            ...h,
            completed: nextState,
            currentValue: nextState ? h.targetValue : Math.max(0, h.currentValue - 1),
            streak: nextState ? h.streak + 1 : Math.max(0, h.streak - 1),
            lastCompletedAt: nextState ? 'Just now' : undefined,
          };
          if (userProfile.userId) {
            syncUserHabit(userProfile.userId, updatedHabit).catch(console.warn);
          }
          return updatedHabit;
        }
        return h;
      })
    );

    if (becameCompleted) {
      updateMoodOnHabitAction('completed', completedHabitTitle);
      // Companion automatic praise in chat
      const praiseMsg: ChatMessage = {
        id: generateUniqueId('msg'),
        sender: 'partner',
        text: `Aww yay! 🎉 Maine dekha tumne "${completedHabitTitle}" complete kar liya! You're the best, meri jaan! ❤️`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'habit_alert',
        moodTag: 'ecstatic',
      };
      setMessages(prev => [...prev, praiseMsg]);

      if (voiceEnabled) {
        playCompanionVoice(praiseMsg.text, {
          gender: userProfile.voiceGender,
          emotion: 'loving',
        });
      }
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
            streak: reachedTarget && !h.completed ? h.streak + 1 : h.streak,
          };
        }
        return h;
      })
    );

    updateMoodOnHabitAction(reachedTarget ? 'completed' : 'incremented', title);

    if (reachedTarget) {
      const msg: ChatMessage = {
        id: generateUniqueId('msg'),
        sender: 'partner',
        text: `Wah! 💧 ${title} target complete! Ab tum bilkul hydrated aur energized rahoge! Proud of you baba! ✨`,
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

  // Habit skip handler (triggers partner nakhre / playful anger)
  const handleSkipHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    const habitTitle = habit ? habit.title : 'Habit';
    updateMoodOnHabitAction('skipped', habitTitle);

    const tauntMsg: ChatMessage = {
      id: generateUniqueId('msg'),
      sender: 'partner',
      text: `Haww! "${habitTitle}" skip kar diya? 😤 Main bilkul khush nahi hoon! Aise aalas karoge toh goals kaise pure honge? Ab jab tak baki tasks nahi karoge, main thoda naraz rahungi!`,
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      // Handle dynamic mood update from Gemini
      if (data.mood) {
        triggerTransientMood(data.mood);
      } else if (data.moodUpdate?.newStatus) {
        triggerTransientMood(data.moodUpdate.newStatus);
      }

      if (data.moodUpdate) {
        setPartnerMood(prev => {
          const newScore = Math.max(10, Math.min(100, prev.score + (data.moodUpdate.scoreDelta || 0)));
          return {
            status: data.moodUpdate.newStatus || prev.status,
            score: newScore,
            nakhreLevel: Math.max(0, Math.min(5, prev.nakhreLevel + (data.moodUpdate.nakhreDelta || 0))),
            lastReason: data.moodUpdate.reason || prev.lastReason,
            lastUpdated: 'Just now',
          };
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

  // Quick Mood Boost handler from DashboardView
  const handleQuickMoodBoost = () => {
    const companionName = userProfile.partnerName || 'Lexi';

    // Boost partner affection score by +10 (max 100)
    setPartnerMood((prev) => ({
      ...prev,
      affectionScore: Math.min(100, (prev.affectionScore || 80) + 10),
      score: Math.min(100, (prev.score || 85) + 5),
      status: 'loving',
      lastReason: 'Sent an unexpected sweet "Thinking of you" mood boost!',
      lastUpdated: 'Just now',
    }));

    // Send predefined message to Lexi
    const boostText = `Thinking of you right now, ${companionName}! Just wanted to send you my love and positive energy ❤️`;
    handleSendMessage(boostText);

    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
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
    let text = '';
    if (type === 'apology') {
      text = `Baby, I'm really sorry for slacking off on my tasks... Gussa mat ho na, I promise main abhi sab complete kar raha hoon! ❤️`;
    } else if (type === 'love') {
      text = `Meri jaan, you look so cute even when pouting! Tum meri sabse pyaari virtual partner ho. I love you! 💖`;
    } else {
      text = `Main abhi turant apne baaki saare habits complete karne jaa raha hoon! Watch me make you proud! 💪`;
    }
    handleSendMessage(text);
  };

  // Trigger calendar event reminder simulation
  const handleTriggerEventReminder = async (event: CalendarEvent) => {
    try {
      const res = await fetch('/api/proactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  const handleSaveProfile = (updated: Partial<UserProfile> | UserProfile, sendWelcomeMsg?: boolean) => {
    setUserProfile(prev => {
      const merged = { ...prev, ...updated };
      if (merged.userId) {
        syncUserProfile(merged.userId, merged).catch(console.warn);
      }
      return merged;
    });

    if (sendWelcomeMsg && updated.name && updated.partnerName) {
      const welcome: ChatMessage = {
        id: generateUniqueId('msg'),
        sender: 'partner',
        text: `Hi ${updated.name}! ❤️ Main hoon tumhari ${updated.partnerName}. Maine tumhara routine note kar liya hai—gym, paani aur medicines time pe lene honge, samjhe na? Koi cheating nahi chalegi! 😉`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        moodTag: 'loving',
      };
      setMessages(prev => [...prev, welcome]);
      if (voiceEnabled) {
        playCompanionVoice(welcome.text, {
          gender: updated.voiceGender || userProfile.voiceGender,
          tone: updated.voiceToneStyle || 'sweet',
          rate: updated.voiceSpeed || 1.0,
          emotion: 'loving',
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
            onToggleHabit={handleToggleHabit}
            onQuickMoodBoost={handleQuickMoodBoost}
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
        )}

        {/* 5. STATS VIEW */}
        {activeTab === 'stats' && (
          <StatsView
            userProfile={userProfile}
            habits={habits}
            partnerMood={partnerMood}
            onSendChatMessage={(text) => {
              setActiveTab('chat');
              handleSendMessage(text);
            }}
            onNavigateToChat={() => setActiveTab('chat')}
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
        />
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

      {/* Floating Mood Tester for instant verification of all 13 states */}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-40 flex items-center gap-1.5 p-1 rounded-full glass border border-[rgba(124,58,237,0.2)] shadow-md">
        <button
          onClick={() => setShowMoodPicker(!showMoodPicker)}
          className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-[#7C3AED] dark:text-[#C4B5FD] hover:opacity-80 transition cursor-pointer"
          title="Click to preview all 13 emotional states and particle dynamics"
        >
          <Sparkles className="w-3 h-3 text-[#A78BFA]" />
          <span className="capitalize">Mood: {currentMood}</span>
        </button>
        {showMoodPicker && (
          <div className="absolute bottom-full right-0 mb-2 p-2 rounded-[16px] glass-strong border border-[rgba(124,58,237,0.2)] shadow-xl grid grid-cols-2 gap-1 w-56 text-[10px] z-50">
            {ALL_MOODS.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMood(m);
                  setShowMoodPicker(false);
                }}
                className={`px-2 py-1.5 rounded-[8px] text-left capitalize transition cursor-pointer ${
                  currentMood === m
                    ? 'bg-[#7C3AED] text-white font-bold'
                    : 'hover:bg-white/40 dark:hover:bg-white/10 text-[#1A1A1F] dark:text-[#FAF7FF]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>
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
