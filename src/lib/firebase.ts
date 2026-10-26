import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProfile,
  Habit,
  ChatMessage,
  PartnerMood,
  MemoryItem,
  CallRecord,
  CalendarEvent
} from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if configured (CRITICAL)
export const db = getFirestore(
  app,
  (firebaseConfig as any).firestoreDatabaseId || undefined
);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Test Connection on startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client appears offline. Retrying or using cached data.');
      return false;
    }
    // Permission denied on dummy path is normal and confirms connection
    return true;
  }
}

// Error Handling Infrastructure conforming strictly to Firebase Skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Authentication Actions
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Error during Google sign in:', error);
    if (error?.code === 'auth/popup-closed-by-user') {
      return null;
    }
    throw error;
  }
}

export async function signInGuestUser(): Promise<User | null> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    console.info('Anonymous authentication not enabled in Firebase Console; continuing with local storage session:', error?.message || error);
    return null;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Check if the current client has a verified Firebase Auth session matching the requested userId
 */
function isClientAuthorizedFor(userId: string): boolean {
  return !!auth.currentUser && auth.currentUser.uid === userId;
}

// Firestore Database Sync Operations

/**
 * Synchronize UserProfile to /users/{userId}
 */
export async function syncUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }

  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        userId,
        email: auth.currentUser?.email || profile.userEmail || '',
        name: profile.name || 'Darling',
        gender: profile.gender || 'male',
        partnerName: profile.partnerName || 'Lexi',
        partnerGender: profile.partnerGender || 'female',
        partnerTone: profile.partnerTone || 'playful_loving',
        voiceGender: profile.voiceGender || 'female',
        wakeUpTime: profile.wakeUpTime || '07:30',
        sleepTime: profile.sleepTime || '23:30',
        dailyWaterGoal: profile.dailyWaterGoal ?? 8,
        streakDays: profile.streakDays ?? 1,
        bestStreak: profile.bestStreak ?? 1,
        isOnboarded: profile.isOnboarded ?? true,
        dailyCheckInTime: profile.dailyCheckInTime || '08:30',
        dailyCheckInEnabled: profile.dailyCheckInEnabled ?? true,
        checkInType: profile.checkInType || 'voice_and_text',
        lastCheckInDate: profile.lastCheckInDate || new Date().toISOString().split('T')[0],
        voiceSpeed: profile.voiceSpeed ?? 1.0,
        voiceToneStyle: profile.voiceToneStyle || 'playful',
        themeMode: profile.themeMode || 'light',
        location: profile.location || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Synchronize Habit to /users/{userId}/habits/{habitId}
 */
export async function syncUserHabit(userId: string, habit: Habit): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }

  const path = `users/${userId}/habits/${habit.id}`;
  try {
    const habitDocRef = doc(db, 'users', userId, 'habits', habit.id);
    await setDoc(habitDocRef, {
      ...habit,
      userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete Habit from /users/{userId}/habits/{habitId}
 */
export async function deleteUserHabit(userId: string, habitId: string): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }

  const path = `users/${userId}/habits/${habitId}`;
  try {
    const habitDocRef = doc(db, 'users', userId, 'habits', habitId);
    await deleteDoc(habitDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save Chat Message to /users/{userId}/messages/{messageId}
 */
export async function saveUserChatMessage(userId: string, message: ChatMessage): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }

  const path = `users/${userId}/messages/${message.id}`;
  try {
    const messageDocRef = doc(db, 'users', userId, 'messages', message.id);
    await setDoc(messageDocRef, {
      ...message,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Synchronize Partner Mood to /users/{userId}/mood/current
 */
export async function syncPartnerMood(userId: string, mood: PartnerMood): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }

  const path = `users/${userId}/mood/current`;
  try {
    const moodDocRef = doc(db, 'users', userId, 'mood', 'current');
    await setDoc(moodDocRef, {
      ...mood,
      userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save User Memory fact to /users/{userId}/memories/{memoryId}
 */
export async function saveUserMemory(userId: string, memory: MemoryItem): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }

  const path = `users/${userId}/memories/${memory.id}`;
  try {
    const memoryDocRef = doc(db, 'users', userId, 'memories', memory.id);
    await setDoc(memoryDocRef, {
      ...memory,
      userId,
      learnedAt: memory.learnedAt || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save Call Record to /users/{userId}/calls/{callId}
 */
export async function saveCallRecord(userId: string, callRecord: CallRecord): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }

  const path = `users/${userId}/calls/${callRecord.id}`;
  try {
    const callDocRef = doc(db, 'users', userId, 'calls', callRecord.id);
    await setDoc(callDocRef, {
      ...callRecord,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Synchronize Calendar Event to /users/{userId}/events/{eventId}
 */
export async function syncCalendarEvent(userId: string, event: CalendarEvent): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }

  const path = `users/${userId}/events/${event.id}`;
  try {
    const eventDocRef = doc(db, 'users', userId, 'events', event.id);
    await setDoc(eventDocRef, {
      ...event,
      userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete Calendar Event from /users/{userId}/events/{eventId}
 */
export async function deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }

  const path = `users/${userId}/events/${eventId}`;
  try {
    const eventDocRef = doc(db, 'users', userId, 'events', eventId);
    await deleteDoc(eventDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Real-Time Subscriptions

/**
 * Subscribe to User Profile updates
 */
export function subscribeUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!isClientAuthorizedFor(userId)) {
    return () => {};
  }

  const path = `users/${userId}`;
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(
    userDocRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Subscribe to User Habits
 */
export function subscribeUserHabits(
  userId: string,
  onUpdate: (habits: Habit[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!isClientAuthorizedFor(userId)) {
    return () => {};
  }

  const path = `users/${userId}/habits`;
  const habitsColRef = collection(db, 'users', userId, 'habits');
  return onSnapshot(
    habitsColRef,
    (snap) => {
      const items: Habit[] = [];
      snap.forEach((docSnap) => items.push(docSnap.data() as Habit));
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Subscribe to Chat Messages
 */
export function subscribeChatMessages(
  userId: string,
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!isClientAuthorizedFor(userId)) {
    return () => {};
  }

  const path = `users/${userId}/messages`;
  const msgColRef = collection(db, 'users', userId, 'messages');
  const q = query(msgColRef, orderBy('timestamp', 'asc'), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      const items: ChatMessage[] = [];
      snap.forEach((docSnap) => items.push(docSnap.data() as ChatMessage));
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Subscribe to Partner Mood
 */
export function subscribePartnerMood(
  userId: string,
  onUpdate: (mood: PartnerMood | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!isClientAuthorizedFor(userId)) {
    return () => {};
  }

  const path = `users/${userId}/mood/current`;
  const moodDocRef = doc(db, 'users', userId, 'mood', 'current');
  return onSnapshot(
    moodDocRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as PartnerMood);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Subscribe to User Memories
 */
export function subscribeUserMemories(
  userId: string,
  onUpdate: (memories: MemoryItem[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!isClientAuthorizedFor(userId)) {
    return () => {};
  }

  const path = `users/${userId}/memories`;
  const memColRef = collection(db, 'users', userId, 'memories');
  return onSnapshot(
    memColRef,
    (snap) => {
      const items: MemoryItem[] = [];
      snap.forEach((docSnap) => items.push(docSnap.data() as MemoryItem));
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Subscribe to Call Records
 */
export function subscribeCallRecords(
  userId: string,
  onUpdate: (calls: CallRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!isClientAuthorizedFor(userId)) {
    return () => {};
  }

  const path = `users/${userId}/calls`;
  const callsColRef = collection(db, 'users', userId, 'calls');
  const q = query(callsColRef, orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snap) => {
      const items: CallRecord[] = [];
      snap.forEach((docSnap) => items.push(docSnap.data() as CallRecord));
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Subscribe to Calendar Events
 */
export function subscribeCalendarEvents(
  userId: string,
  onUpdate: (events: CalendarEvent[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!isClientAuthorizedFor(userId)) {
    return () => {};
  }

  const path = `users/${userId}/events`;
  const eventsColRef = collection(db, 'users', userId, 'events');
  return onSnapshot(
    eventsColRef,
    (snap) => {
      const items: CalendarEvent[] = [];
      snap.forEach((docSnap) => items.push(docSnap.data() as CalendarEvent));
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
