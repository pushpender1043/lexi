import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, Habit, ChatMessage, PartnerMood, MemoryItem } from '../types';

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

// Error Handling Infrastructure conforming to Firebase Skill specification
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
    // Don't throw if user simply closed the popup
    if (error?.code === 'auth/popup-closed-by-user') {
      return null;
    }
    throw error;
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

// Firestore Database Sync Operations
export async function syncUserProfile(userId: string, profile: UserProfile): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        userId,
        email: auth.currentUser?.email || '',
        name: profile.name || 'Darling',
        gender: profile.gender || 'male',
        partnerName: profile.partnerName || 'Lexi',
        partnerGender: profile.partnerGender || 'female',
        partnerTone: profile.partnerTone || 'playful_loving',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncUserHabit(userId: string, habit: Habit): Promise<void> {
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

export async function saveUserChatMessage(userId: string, message: ChatMessage): Promise<void> {
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

export async function syncPartnerMood(userId: string, mood: PartnerMood): Promise<void> {
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

export async function saveUserMemory(userId: string, memory: MemoryItem): Promise<void> {
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
