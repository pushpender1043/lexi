import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateUniqueId, deduplicateArrayIds } from '../src/utils/id';
import { MoodStatus, PartnerMood, Habit } from '../src/types';
import { generateScriptMirrorFallback } from '../src/lib/persona';

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
});
