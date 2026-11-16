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
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  collection,
  onSnapshot,
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
    const code = error?.code || '';
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request'
    ) {
      // User dismissed or superseded the popup — treat as a clean cancellation rather than an error
      return null;
    }
    if (code === 'auth/popup-blocked') {
      const blockedErr: any = new Error(
        'Sign-in popup was blocked by your browser. Allow pop-ups for this site or sign in with Email / Guest.'
      );
      blockedErr.code = code;
      throw blockedErr;
    }
    if (code === 'auth/unauthorized-domain') {
      const domainErr: any = new Error(
        'Google sign-in is not authorized on this preview domain. Please use Email or Guest sign-in.'
      );
      domainErr.code = code;
      throw domainErr;
    }
    console.error('Error during Google sign in:', error);
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
 * Retrieve current Firebase ID token for authenticated server requests
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  } catch (err) {
    console.warn('Could not retrieve Firebase auth token:', err);
    return null;
  }
}

/**
 * Authenticated API Fetch Helper
 * Attaches Authorization Bearer token to all backend /api/* calls
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const buildHeaders = (token: string | null) => {
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  };

  const token = await getAuthToken();
  const res = await fetch(url, {
    ...options,
    headers: buildHeaders(token),
  });

  if (res.status === 401 && auth.currentUser) {
    try {
      const refreshedToken = await auth.currentUser.getIdToken(true);
      if (refreshedToken && refreshedToken !== token) {
        return await fetch(url, {
          ...options,
          headers: buildHeaders(refreshedToken),
        });
      }
    } catch (err) {
      console.warn('Could not refresh expired Firebase auth token:', err);
    }
  }

  return res;
}

const USER_SUBCOLLECTIONS = [
  'habits',
  'messages',
  'mood',
  'memories',
  'calls',
  'events',
  'habitLogs',
  'waterLogs',
] as const;

export const LEGACY_POISONED_FALLBACK_TEXT = 'Main sun rahi hoon jaan, sab theek hai na?';

/**
 * GDPR / DPDP Article 17 "Right to Erasure"
 * Deletes all user subcollections, root profile document, local storage, and auth user.
 */
export async function deleteUserAccountAndData(userId: string): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    throw new Error('Unauthorized deletion request');
  }

  try {
    for (const subcol of USER_SUBCOLLECTIONS) {
      const snap = await getDocs(collection(db, 'users', userId, subcol));
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();
      }
    }

    // Delete root user document
    await deleteDoc(doc(db, 'users', userId));

    // Clear all client state
    localStorage.clear();

    // If Firebase Auth user, delete user account or sign out
    if (auth.currentUser) {
      try {
        await auth.currentUser.delete();
      } catch {
        await signOut(auth);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
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
 * Recursively removes keys with `undefined` values before writing to Firestore,
 * preventing FirebaseError: Unsupported field value: undefined.
 */
export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(value as Record<string, any>)) {
      if (val !== undefined) {
        cleaned[key] = stripUndefined(val);
      }
    }
    return cleaned as T;
  }
  return value;
}

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
    const payload = stripUndefined({
      userId,
      email: auth.currentUser?.email || profile.userEmail || '',
      name: (profile.name || 'Darling').slice(0, 64),
      gender: profile.gender || 'male',
      partnerName: (profile.partnerName || 'Lexi').slice(0, 64),
      partnerGender: profile.partnerGender || 'female',
      partnerTone: profile.partnerTone || 'playful_loving',
      voiceGender: profile.voiceGender || 'female',
      preferredVoiceName: profile.preferredVoiceName,
      preferredLanguage: profile.preferredLanguage,
      wakeUpTime: profile.wakeUpTime || '07:00',
      sleepTime: profile.sleepTime || '23:00',
      dailyWaterGoal: profile.dailyWaterGoal ?? 8,
      streakDays: profile.streakDays ?? 0,
      bestStreak: profile.bestStreak ?? 0,
      isOnboarded: profile.isOnboarded ?? false,
      dailyCheckInTime: profile.dailyCheckInTime || '08:30',
      dailyCheckInEnabled: profile.dailyCheckInEnabled ?? true,
      checkInType: profile.checkInType || 'voice_and_text',
      lastCheckInDate: profile.lastCheckInDate,
      voiceSpeed: profile.voiceSpeed ?? 1.0,
      voiceToneStyle: profile.voiceToneStyle || 'playful',
      themeMode: profile.themeMode || 'dark',
      location: profile.location || '',
      calendarSynced: profile.calendarSynced ?? false,
      alarmsSynced: profile.alarmsSynced ?? false,
      relationshipDynamic: profile.relationshipDynamic,
      primaryGoal: profile.primaryGoal,
      languageMix: profile.languageMix,
      timeZone: profile.timeZone,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(userDocRef, payload, { merge: true });
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
    await setDoc(
      habitDocRef,
      stripUndefined({
        ...habit,
        userId,
        updatedAt: new Date().toISOString(),
      })
    );
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
    const { audioBase64: _omitAudio, ...serializableMsg } = message;
    await setDoc(
      messageDocRef,
      stripUndefined({
        ...serializableMsg,
        userId,
        createdAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Clear all chat messages in /users/{userId}/messages
 */
export async function clearUserChatMessages(userId: string): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }
  const path = `users/${userId}/messages`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'messages'));
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Delete specific message IDs (e.g., legacy poisoned fallback cleanup)
 */
export async function deleteUserMessagesByIds(userId: string, messageIds: string[]): Promise<void> {
  if (!isClientAuthorizedFor(userId) || messageIds.length === 0) {
    return;
  }
  const path = `users/${userId}/messages`;
  try {
    const batch = writeBatch(db);
    messageIds.forEach((id) => batch.delete(doc(db, 'users', userId, 'messages', id)));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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
    await setDoc(
      moodDocRef,
      stripUndefined({
        ...mood,
        userId,
        updatedAt: new Date().toISOString(),
      })
    );
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
    await setDoc(
      memoryDocRef,
      stripUndefined({
        ...memory,
        userId,
        learnedAt: memory.learnedAt || new Date().toISOString(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete User Memory fact from /users/{userId}/memories/{memoryId}
 */
export async function deleteUserMemory(userId: string, memoryId: string): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }

  const path = `users/${userId}/memories/${memoryId}`;
  try {
    const memoryDocRef = doc(db, 'users', userId, 'memories', memoryId);
    await deleteDoc(memoryDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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
    await setDoc(
      callDocRef,
      stripUndefined({
        ...callRecord,
        userId,
        createdAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Clear all call records in /users/{userId}/calls
 */
export async function clearUserCallRecords(userId: string): Promise<void> {
  if (!isClientAuthorizedFor(userId)) {
    return;
  }
  const path = `users/${userId}/calls`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'calls'));
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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
    await setDoc(
      eventDocRef,
      stripUndefined({
        ...event,
        userId,
        updatedAt: new Date().toISOString(),
      })
    );
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
  return onSnapshot(
    msgColRef,
    (snap) => {
      const items: Array<ChatMessage & { createdAt?: string }> = [];
      snap.forEach((docSnap) => items.push(docSnap.data() as ChatMessage & { createdAt?: string }));
      items.sort((a, b) => {
        const keyA = a.createdAt || a.id || '';
        const keyB = b.createdAt || b.id || '';
        return keyA.localeCompare(keyB);
      });
      onUpdate(items.slice(-100));
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
  return onSnapshot(
    callsColRef,
    (snap) => {
      const items: Array<CallRecord & { createdAt?: string }> = [];
      snap.forEach((docSnap) => items.push(docSnap.data() as CallRecord & { createdAt?: string }));
      items.sort((a, b) => {
        const keyA = a.createdAt || a.id || '';
        const keyB = b.createdAt || b.id || '';
        return keyB.localeCompare(keyA);
      });
      onUpdate(items.slice(0, 50));
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

/**
 * Synchronize daily habit log to /users/{userId}/habitLogs/{date}
 */
export async function syncHabitLog(
  userId: string,
  dateOrLog: string | any,
  maybeLogData?: any
): Promise<void> {
  if (!isClientAuthorizedFor(userId)) return;
  const date = typeof dateOrLog === 'string' ? dateOrLog : dateOrLog?.date;
  const logData = typeof dateOrLog === 'string' ? maybeLogData : dateOrLog;
  if (!date) return;
  const path = `users/${userId}/habitLogs/${date}`;
  try {
    const docRef = doc(db, 'users', userId, 'habitLogs', date);
    await setDoc(
      docRef,
      stripUndefined({
        ...logData,
        date,
        userId,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to all habit logs under /users/{userId}/habitLogs
 */
export function subscribeHabitLogs(
  userId: string,
  onUpdate: (logs: Record<string, any>) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!isClientAuthorizedFor(userId)) return () => {};
  const path = `users/${userId}/habitLogs`;
  const colRef = collection(db, 'users', userId, 'habitLogs');
  return onSnapshot(
    colRef,
    (snap) => {
      const logs: Record<string, any> = {};
      snap.forEach((docSnap) => {
        logs[docSnap.id] = docSnap.data();
      });
      onUpdate(logs);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Synchronize daily water log to /users/{userId}/waterLogs/{date}
 */
export async function syncWaterLog(userId: string, date: string, glasses: number): Promise<void> {
  if (!isClientAuthorizedFor(userId)) return;
  const path = `users/${userId}/waterLogs/${date}`;
  try {
    const docRef = doc(db, 'users', userId, 'waterLogs', date);
    await setDoc(docRef, {
      date,
      glasses,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to all water logs under /users/{userId}/waterLogs
 */
export function subscribeWaterLogs(
  userId: string,
  onUpdate: (logs: Record<string, number>) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!isClientAuthorizedFor(userId)) return () => {};
  const path = `users/${userId}/waterLogs`;
  const colRef = collection(db, 'users', userId, 'waterLogs');
  return onSnapshot(
    colRef,
    (snap) => {
      const logs: Record<string, number> = {};
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        logs[docSnap.id] = d.glasses || 0;
      });
      onUpdate(logs);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
