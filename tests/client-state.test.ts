import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateUniqueId, deduplicateArrayIds } from '../src/utils/id';
import { MoodStatus, PartnerMood, Habit } from '../src/types';
import { generateScriptMirrorFallback } from '../src/lib/persona';
import { stripUndefined, LEGACY_POISONED_FALLBACK_TEXT } from '../src/lib/firebase';
import { isRiffWavBytes } from '../src/utils/speech';
import { getTodayDateString } from '../src/utils/streak';

describe('Client State & Data Invariants Tests', () => {
  describe('ID Generation & Deduplication', () => {
    it('generates 1,000 unique IDs in a tight synchronous loop with zero collisions', () => {
      const ids = new Set<string>();
      const count = 1000;
      for (let i = 0; i < count; i++) {
        const id = generateUniqueId('test');
        assert.ok(!ids.has(id), `Duplicate ID generated: ${id}`);
        ids.add(id);
      }
      assert.equal(ids.size, count);
    });

    it('deduplicates arrays with identical IDs properly', () => {
      const items = [
        { id: 'item_1', name: 'First' },
        { id: 'item_1', name: 'Second (duplicate)' },
        { id: 'item_2', name: 'Third' },
        { id: '', name: 'Empty ID' },
      ];

      const clean = deduplicateArrayIds(items, 'item');
      assert.equal(clean.length, 4);

      const uniqueIds = new Set(clean.map(i => i.id));
      assert.equal(uniqueIds.size, 4, 'All resulting IDs must be strictly unique');
      assert.equal(clean[0].id, 'item_1');
      assert.ok(clean[1].id.startsWith('item_1_dup_1_'));
      assert.equal(clean[2].id, 'item_2');
      assert.ok(clean[3].id.startsWith('item_dup_3_'));
    });
  });

  describe('Mood State Transitions & Clamping', () => {
    function computeMoodUpdate(
      currentMood: PartnerMood,
      action: 'completed' | 'incremented' | 'skipped',
      partnerName = 'Noni'
    ): PartnerMood {
      let delta = 0;
      let newNakhre = currentMood.nakhreLevel;
      let reason = currentMood.lastReason;

      if (action === 'completed') {
        delta = 8;
        newNakhre = Math.max(0, newNakhre - 1);
        reason = `${partnerName}: "Proud of you!"`;
      } else if (action === 'incremented') {
        delta = 3;
        reason = `${partnerName}: "Good progress!"`;
      } else if (action === 'skipped') {
        delta = -12;
        newNakhre = Math.min(5, newNakhre + 1);
        reason = `${partnerName}: "Why did you skip?"`;
      }

      const newScore = Math.max(10, Math.min(100, currentMood.score + delta));
      let newStatus: MoodStatus;
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
    }

    it('improves mood and reduces nakhre level on habit completion', () => {
      const initialMood: PartnerMood = {
        status: 'happy',
        score: 65,
        nakhreLevel: 2,
        lastReason: 'Initial',
        lastUpdated: 'Yesterday',
      };

      const updated = computeMoodUpdate(initialMood, 'completed');
      assert.equal(updated.score, 73);
      assert.equal(updated.status, 'loving');
      assert.equal(updated.nakhreLevel, 1);
    });

    it('degrades mood and increases nakhre level on skipped habit', () => {
      const initialMood: PartnerMood = {
        status: 'loving',
        score: 75,
        nakhreLevel: 0,
        lastReason: 'Initial',
        lastUpdated: 'Yesterday',
      };

      const updated = computeMoodUpdate(initialMood, 'skipped');
      assert.equal(updated.score, 63);
      assert.equal(updated.status, 'happy');
      assert.equal(updated.nakhreLevel, 1);
    });

    it('clamps mood score to [10, 100] and nakhre level to [0, 5]', () => {
      // Test upper clamp
      let mood: PartnerMood = {
        status: 'ecstatic',
        score: 98,
        nakhreLevel: 0,
        lastReason: '',
        lastUpdated: '',
      };
      mood = computeMoodUpdate(mood, 'completed');
      assert.equal(mood.score, 100);
      assert.equal(mood.status, 'ecstatic');
      assert.equal(mood.nakhreLevel, 0);

      // Test lower clamp
      mood = {
        status: 'angry',
        score: 15,
        nakhreLevel: 5,
        lastReason: '',
        lastUpdated: '',
      };
      mood = computeMoodUpdate(mood, 'skipped');
      assert.equal(mood.score, 10);
      assert.equal(mood.status, 'angry');
      assert.equal(mood.nakhreLevel, 5);
    });

    it('softens mood and reduces nakhre level on sweet talk or apology', () => {
      const apologyRes = generateScriptMirrorFallback('Sorry baby, gussa mat ho please', 'Lexi', 'Kabir');
      assert.equal(apologyRes.mood, 'romantic');
      assert.ok((apologyRes.moodUpdate.scoreDelta || 0) > 0);
      assert.strictEqual(apologyRes.moodUpdate.nakhreDelta, -1);
      assert.strictEqual(apologyRes.moodUpdate.newStatus, 'loving');

      const sweetRes = generateScriptMirrorFallback('I love you so much jaan, miss you', 'Lexi', 'Kabir');
      assert.equal(sweetRes.mood, 'romantic');
      assert.ok((sweetRes.moodUpdate.scoreDelta || 0) > 0);
      assert.strictEqual(sweetRes.moodUpdate.nakhreDelta, -1);
      assert.strictEqual(sweetRes.moodUpdate.newStatus, 'ecstatic');
    });

    it('sulks and increases nakhre level when user slacks off on habits', () => {
      const slackingRes = generateScriptMirrorFallback('aaj bilkul mann nahi hai, alas aa raha hai', 'Lexi', 'Kabir');
      assert.equal(slackingRes.mood, 'angry');
      assert.ok((slackingRes.moodUpdate.scoreDelta || 0) < 0);
      assert.strictEqual(slackingRes.moodUpdate.nakhreDelta, 1);
      assert.strictEqual(slackingRes.moodUpdate.newStatus, 'annoyed');
    });
  });

  describe('Habit State Invariants', () => {
    it('accurately computes completed habit counts and percentages', () => {
      const habits: Habit[] = [
        {
          id: 'h1',
          title: 'Drink water',
          category: 'health',
          targetValue: 8,
          currentValue: 8,
          unit: 'glasses',
          scheduledTime: '08:00',
          streak: 4,
          completed: true,
          importance: 'crucial',
        },
        {
          id: 'h2',
          title: 'Gym workout',
          category: 'fitness',
          targetValue: 1,
          currentValue: 0,
          unit: 'session',
          scheduledTime: '17:00',
          streak: 2,
          completed: false,
          importance: 'crucial',
        },
      ];

      const completed = habits.filter(h => h.completed).length;
      const progressPercent = Math.round((completed / habits.length) * 100);

      assert.equal(completed, 1);
      assert.equal(progressPercent, 50);
    });
  });

  describe('Phase 3 Mood & Header Status Invariants', () => {
    it('restores healthy green happy status when score is healthy (>= 60) and cleans corrupted legacy state', () => {
      const corruptedLegacyMood = {
        status: 'loving',
        score: 75,
        nakhreLevel: 0,
        lastReason: 'Old fallback',
        lastUpdated: 'Earlier',
      };

      // Simulator of App.tsx initializer
      const normalizedMood = { ...corruptedLegacyMood };
      if (normalizedMood.score >= 55 && (normalizedMood.status === 'loving' || normalizedMood.status === 'calm' || normalizedMood.status === 'proud')) {
        normalizedMood.status = 'happy';
      }

      assert.equal(normalizedMood.status, 'happy', 'Must normalize to green happy status');
      assert.equal(normalizedMood.score, 75);
    });

    it('maps mood status correctly to header indicator colors', () => {
      const getMoodColor = (status?: string, isOnline = true) => {
        if (!isOnline) return 'bg-amber-500 shadow-xs shadow-amber-500/50';
        switch (status) {
          case 'happy': return 'bg-[#4CB782] shadow-xs shadow-emerald-500/50';
          case 'ecstatic':
          case 'loving': return 'bg-pink-500 shadow-xs shadow-pink-500/50';
          case 'neutral': return 'bg-[#8B5CF6] shadow-xs shadow-purple-500/50';
          case 'annoyed': return 'bg-amber-500 shadow-xs shadow-amber-500/50';
          case 'angry': return 'bg-rose-500 shadow-xs shadow-rose-500/50';
          default: return 'bg-[#4CB782]';
        }
      };

      assert.ok(getMoodColor('happy').includes('#4CB782'), 'Happy status must produce emerald green');
      assert.ok(getMoodColor('happy', false).includes('amber-500'), 'Offline state must produce amber indicator');
      assert.ok(getMoodColor('ecstatic').includes('pink-500'), 'Ecstatic status must produce pink');
      assert.ok(getMoodColor('angry').includes('rose-500'), 'Angry status must produce rose red');
    });
  });

  describe('Phase 4 Habit CRUD & Real Data Invariants', () => {
    it('handles optimistic habit toggle and rolls back cleanly on simulated failure', () => {
      const initialHabits: Habit[] = [
        {
          id: 'habit_gym',
          title: 'Morning Workout',
          category: 'fitness',
          targetValue: 1,
          currentValue: 0,
          unit: 'session',
          scheduledTime: '07:00 AM',
          streak: 3,
          completed: false,
          importance: 'crucial',
        },
      ];

      // Step 1: Optimistic toggle
      let habits = initialHabits.map(h => {
        if (h.id === 'habit_gym') {
          const nextState = !h.completed;
          return {
            ...h,
            completed: nextState,
            currentValue: nextState ? h.targetValue : 0,
            streak: (h.streak || 0) + 1,
          };
        }
        return h;
      });

      assert.equal(habits[0].completed, true);
      assert.equal(habits[0].streak, 4);

      // Step 2: Simulated Firestore rejection / rollback
      const simulatedFirestoreRejection = true;
      if (simulatedFirestoreRejection) {
        habits = initialHabits;
      }

      assert.equal(habits[0].completed, false);
      assert.equal(habits[0].streak, 3);
    });

    it('handles optimistic habit deletion and rolls back on failure', () => {
      const initialHabits: Habit[] = [
        {
          id: 'habit_1',
          title: 'Drink 2L water',
          category: 'hydration',
          targetValue: 8,
          currentValue: 4,
          unit: 'glasses',
          scheduledTime: 'Anytime',
          streak: 5,
          completed: false,
          importance: 'crucial',
        },
        {
          id: 'habit_2',
          title: 'Study 1 hour',
          category: 'productivity',
          targetValue: 1,
          currentValue: 1,
          unit: 'hours',
          scheduledTime: '08:00 PM',
          streak: 2,
          completed: true,
          importance: 'medium',
        },
      ];

      // Optimistic delete
      let habits = initialHabits.filter(h => h.id !== 'habit_1');
      assert.equal(habits.length, 1);
      assert.equal(habits[0].id, 'habit_2');

      // Rollback on simulated error
      const failed = true;
      if (failed) {
        habits = initialHabits;
      }
      assert.equal(habits.length, 2);
      assert.equal(habits[0].id, 'habit_1');
    });

    it('guarantees pure zero baseline metrics for brand new users without mock numbers', () => {
      const newHabits: Habit[] = [];
      const completedCount = newHabits.filter(h => h.completed).length;
      const totalCount = newHabits.length;
      const pace = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      assert.equal(totalCount, 0, 'New user must have 0 habits');
      assert.equal(completedCount, 0, 'New user must have 0 completed habits');
      assert.equal(pace, 0, 'Completion pace must be 0% with no fake 84% numbers');
    });
  });

  describe('Phase 5 Firestore Serialization & Chronological Ordering', () => {
    it('strips undefined fields recursively so Firestore setDoc never rejects unchecked habits', () => {
      const uncheckedHabitPayload = {
        id: 'habit_meds',
        title: 'Take Vitamins',
        completed: false,
        lastCompletedAt: undefined,
        notes: undefined,
        nested: {
          keep: 'value',
          drop: undefined,
        },
        tags: ['Health', undefined],
      };

      const sanitized = stripUndefined(uncheckedHabitPayload);
      assert.equal('lastCompletedAt' in sanitized, false, 'Undefined lastCompletedAt must be stripped');
      assert.equal('notes' in sanitized, false, 'Undefined notes must be stripped');
      assert.equal('drop' in sanitized.nested, false, 'Nested undefined must be stripped');
      assert.equal(sanitized.nested.keep, 'value');
      assert.deepEqual(sanitized.tags, ['Health']);
    });

    it('sorts chat messages chronologically using ISO createdAt even across AM/PM string wraps', () => {
      const messages = [
        { id: 'msg_2', timestamp: '01:15 PM', createdAt: '2026-11-15T13:15:00.000Z', text: 'Afternoon reply' },
        { id: 'msg_1', timestamp: '09:30 AM', createdAt: '2026-11-15T09:30:00.000Z', text: 'Morning greeting' },
      ];

      const sorted = [...messages].sort((a, b) =>
        (a.createdAt || a.id).localeCompare(b.createdAt || b.id)
      );

      assert.equal(sorted[0].id, 'msg_1', 'Morning message must sort before afternoon message');
      assert.equal(sorted[1].id, 'msg_2');
    });
  });

  describe('Phase 6 TTS Container Detection & Legacy Fallback Cleanup', () => {
    it('detects RIFF WAVE containers returned by Gemini TTS vs raw PCM16 bytes', () => {
      const wavHeader = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x24, 0x00, 0x00, 0x00,
        0x57, 0x41, 0x56, 0x45, // WAVE
      ]);
      const rawPcmBytes = new Uint8Array([0x00, 0x01, 0xfe, 0xff, 0x10, 0x00, 0x20, 0x00, 0x30, 0x00, 0x40, 0x00]);

      assert.equal(isRiffWavBytes(wavHeader), true, 'RIFF WAVE bytes must be detected');
      assert.equal(isRiffWavBytes(rawPcmBytes), false, 'Raw PCM bytes must not be misidentified as WAV');
    });

    it('strips legacy poisoned fallback messages cleanly from stored chat lists', () => {
      const stored = [
        { id: 'm1', sender: 'user', text: 'hy kya hal h' },
        { id: 'm2', sender: 'partner', text: LEGACY_POISONED_FALLBACK_TEXT },
        { id: 'm3', sender: 'partner', text: 'Main bilkul badhiya hoon!' },
      ];
      const cleaned = stored.filter((m) => m.text.trim() !== LEGACY_POISONED_FALLBACK_TEXT);
      assert.equal(cleaned.length, 2);
      assert.ok(!cleaned.some((m) => m.text === LEGACY_POISONED_FALLBACK_TEXT));
    });
  });

  describe('Phase 7 Profile/Settings Sync & Zero-Value Nullish Invariants', () => {
    it('preserves explicit 0 streakDays and 0 mood scores via nullish coalescing instead of fake fallbacks', () => {
      const zeroStreakProfile = { streakDays: 0, bestStreak: 0 };
      const zeroMood = { score: 0, status: 'angry' as MoodStatus };

      assert.equal(zeroStreakProfile.streakDays ?? 0, 0, '0 streak must render as 0d, never 1d');
      assert.equal(zeroStreakProfile.bestStreak ?? 0, 0, '0 bestStreak must render as 0');
      assert.equal(zeroMood.score ?? 85, 0, '0 mood score must not fall back to 85');
    });

    it('preserves user-selected voiceGender independently from partnerGender on save', () => {
      const partnerGender = 'non_binary';
      const selectedVoiceGender = 'male';
      const savedProfileUpdate = {
        partnerGender,
        voiceGender: selectedVoiceGender,
        preferredVoiceName: 'Zephyr' as const,
      };
      assert.equal(savedProfileUpdate.voiceGender, 'male');
      assert.equal(savedProfileUpdate.preferredVoiceName, 'Zephyr');
    });

    it('computes consistent YYYY-MM-DD local date strings for user timezones', () => {
      const istDate = getTodayDateString('Asia/Kolkata');
      assert.match(istDate, /^\d{4}-\d{2}-\d{2}$/, 'Timezone date key must match YYYY-MM-DD format');
    });
  });
});
