import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Mood } from '../types';

export interface MoodConfig {
  name: Mood;
  label: string;
  description: string;
  paletteLight: string[];
  paletteDark: string[];
  particleCountMultiplier: number;
  speed: number;
  sizeRange: [number, number];
  shape: 'circle' | 'star' | 'heart' | 'sparkle' | 'bubble';
  motionPattern:
    | 'upward'
    | 'float'
    | 'bounce'
    | 'burst'
    | 'wobble'
    | 'orbit'
    | 'falling'
    | 'jitter'
    | 'pulse';
  glowIntensity: number;
}

export const MOOD_CONFIGS: Record<Mood, MoodConfig> = {
  calm: {
    name: 'calm',
    label: 'Calm',
    description: 'Peaceful lavender & sky blue, slow upward float with soft blurry orbs',
    paletteLight: ['#A78BFA', '#818CF8', '#C4B5FD', '#E0E7FF'],
    paletteDark: ['#4C1D95', '#312E81', '#6D28D9', '#7C3AED'],
    particleCountMultiplier: 0.8,
    speed: 0.5,
    sizeRange: [4, 9],
    shape: 'circle',
    motionPattern: 'upward',
    glowIntensity: 0.35,
  },
  happy: {
    name: 'happy',
    label: 'Happy',
    description: 'Warm lavender, peach & gold with gentle bouncing sparkles',
    paletteLight: ['#A78BFA', '#FDBA74', '#FCD34D', '#F472B6'],
    paletteDark: ['#7C3AED', '#EA580C', '#D97706', '#DB2777'],
    particleCountMultiplier: 1.1,
    speed: 1.0,
    sizeRange: [3, 7],
    shape: 'sparkle',
    motionPattern: 'bounce',
    glowIntensity: 0.55,
  },
  excited: {
    name: 'excited',
    label: 'Excited',
    description: 'Vivid magenta, violet & cyan bursts with twinkling stars',
    paletteLight: ['#F43F5E', '#8B5CF6', '#06B6D4', '#EC4899'],
    paletteDark: ['#BE123C', '#6D28D9', '#0891B2', '#A21CAF'],
    particleCountMultiplier: 1.35,
    speed: 1.8,
    sizeRange: [3, 8],
    shape: 'star',
    motionPattern: 'burst',
    glowIntensity: 0.75,
  },
  playful: {
    name: 'playful',
    label: 'Playful',
    description: 'Pink, mint, pastel yellow & purple with bubbly wobble and pops',
    paletteLight: ['#F472B6', '#34D399', '#FDE047', '#A78BFA'],
    paletteDark: ['#DB2777', '#059669', '#CA8A04', '#7C3AED'],
    particleCountMultiplier: 1.2,
    speed: 1.2,
    sizeRange: [4, 8],
    shape: 'bubble',
    motionPattern: 'wobble',
    glowIntensity: 0.5,
  },
  curious: {
    name: 'curious',
    label: 'Curious',
    description: 'Teal, sky blue & violet with gentle drift and slight cursor attraction',
    paletteLight: ['#14B8A6', '#38BDF8', '#8B5CF6', '#67E8F9'],
    paletteDark: ['#0F766E', '#0284C7', '#6D28D9', '#0891B2'],
    particleCountMultiplier: 1.0,
    speed: 0.8,
    sizeRange: [2.5, 6],
    shape: 'sparkle',
    motionPattern: 'orbit',
    glowIntensity: 0.6,
  },
  nostalgic: {
    name: 'nostalgic',
    label: 'Nostalgic',
    description: 'Dusty rose, amber & sepia-lilac floating gently like dust motes & fireflies',
    paletteLight: ['#FB7185', '#F59E0B', '#C084FC', '#FED7AA'],
    paletteDark: ['#9F1239', '#B45309', '#7E22CE', '#78350F'],
    particleCountMultiplier: 0.9,
    speed: 0.6,
    sizeRange: [2, 5],
    shape: 'circle',
    motionPattern: 'float',
    glowIntensity: 0.45,
  },
  romantic: {
    name: 'romantic',
    label: 'Romantic',
    description: 'Rose, magenta & lilac with floating hearts and gentle petal drift',
    paletteLight: ['#FB7185', '#E879F9', '#C084FC', '#FDA4AF'],
    paletteDark: ['#BE123C', '#A21CAF', '#7E22CE', '#9F1239'],
    particleCountMultiplier: 1.0,
    speed: 0.7,
    sizeRange: [3.5, 8],
    shape: 'heart',
    motionPattern: 'float',
    glowIntensity: 0.55,
  },
  proud: {
    name: 'proud',
    label: 'Proud',
    description: 'Gold & imperial purple with upward rising celebratory sparks',
    paletteLight: ['#F59E0B', '#7C3AED', '#FCD34D', '#A78BFA'],
    paletteDark: ['#B45309', '#5B21B6', '#D97706', '#6D28D9'],
    particleCountMultiplier: 1.15,
    speed: 1.1,
    sizeRange: [3, 7],
    shape: 'star',
    motionPattern: 'upward',
    glowIntensity: 0.7,
  },
  focused: {
    name: 'focused',
    label: 'Focused',
    description: 'Deep indigo & cyan, minimal slow particles for clean concentration',
    paletteLight: ['#6366F1', '#06B6D4', '#818CF8', '#A5B4FC'],
    paletteDark: ['#3730A3', '#0E7490', '#4338CA', '#1E1B4B'],
    particleCountMultiplier: 0.55,
    speed: 0.4,
    sizeRange: [2, 4.5],
    shape: 'circle',
    motionPattern: 'float',
    glowIntensity: 0.25,
  },
  sleepy: {
    name: 'sleepy',
    label: 'Sleepy',
    description: 'Midnight navy & lavender with slow tranquil twinkling stars',
    paletteLight: ['#64748B', '#818CF8', '#A78BFA', '#CBD5E1'],
    paletteDark: ['#1E1B4B', '#2E1065', '#312E81', '#172554'],
    particleCountMultiplier: 0.65,
    speed: 0.35,
    sizeRange: [2, 5],
    shape: 'star',
    motionPattern: 'float',
    glowIntensity: 0.3,
  },
  sad: {
    name: 'sad',
    label: 'Sad',
    description: 'Muted blue-grey & lavender, slow comforting rain-like droplets',
    paletteLight: ['#94A3B8', '#60A5FA', '#A78BFA', '#E2E8F0'],
    paletteDark: ['#334155', '#1D4ED8', '#5B21B6', '#1E293B'],
    particleCountMultiplier: 0.75,
    speed: 0.9,
    sizeRange: [2, 5],
    shape: 'circle',
    motionPattern: 'falling',
    glowIntensity: 0.25,
  },
  anxious: {
    name: 'anxious',
    label: 'Anxious',
    description: 'Grey-violet, subtle jittery gentle particles for grounding comfort',
    paletteLight: ['#A855F7', '#94A3B8', '#C084FC', '#CBD5E1'],
    paletteDark: ['#6B21A8', '#475569', '#581C87', '#334155'],
    particleCountMultiplier: 0.9,
    speed: 1.1,
    sizeRange: [1.8, 3.8],
    shape: 'circle',
    motionPattern: 'jitter',
    glowIntensity: 0.35,
  },
  angry: {
    name: 'angry',
    label: 'Angry',
    description: 'Deep red-violet with tense subdued pulses, softened for emotional safety',
    paletteLight: ['#E11D48', '#881337', '#9333EA', '#FDA4AF'],
    paletteDark: ['#881337', '#4C0519', '#581C87', '#9F1239'],
    particleCountMultiplier: 1.0,
    speed: 1.3,
    sizeRange: [2.5, 6],
    shape: 'circle',
    motionPattern: 'pulse',
    glowIntensity: 0.5,
  },
};

export const ALL_MOODS: Mood[] = [
  'calm',
  'happy',
  'excited',
  'playful',
  'curious',
  'nostalgic',
  'romantic',
  'proud',
  'focused',
  'sleepy',
  'sad',
  'anxious',
  'angry',
];

interface MoodContextValue {
  currentMood: Mood;
  setMood: (mood: Mood) => void;
  triggerTransientMood: (mood: Mood, durationMs?: number) => void;
  config: MoodConfig;
  allMoods: Mood[];
}

const MoodContext = createContext<MoodContextValue | null>(null);

export const MoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMood, setCurrentMoodState] = useState<Mood>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryMood = params.get('mood') as Mood | null;
      if (queryMood && MOOD_CONFIGS[queryMood]) {
        return queryMood;
      }
    }
    return 'calm';
  });

  const decayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const setMood = useCallback((mood: Mood) => {
    if (decayTimerRef.current) {
      clearTimeout(decayTimerRef.current);
      decayTimerRef.current = null;
    }
    setCurrentMoodState(mood);
  }, []);

  /**
   * Sets a mood that naturally eases back to 'calm' after a period of inactivity
   */
  const triggerTransientMood = useCallback((mood: Mood, durationMs: number = 40000) => {
    if (decayTimerRef.current) {
      clearTimeout(decayTimerRef.current);
    }
    setCurrentMoodState(mood);

    decayTimerRef.current = setTimeout(() => {
      setCurrentMoodState('calm');
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (decayTimerRef.current) clearTimeout(decayTimerRef.current);
    };
  }, []);

  const config = MOOD_CONFIGS[currentMood] || MOOD_CONFIGS.calm;
  const allMoods = ALL_MOODS;

  return (
    <MoodContext.Provider
      value={{
        currentMood,
        setMood,
        triggerTransientMood,
        config,
        allMoods,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
};

export function useMood(): MoodContextValue {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}
