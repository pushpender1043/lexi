import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCompanionSystemInstruction,
  buildVoiceCallPrompt,
  detectInputLanguage,
  generateScriptMirrorFallback,
  FEW_SHOT_PERSONA_EXAMPLES,
} from '../src/lib/persona';
import { UserProfile, PartnerMood } from '../src/types';

describe('Persona & Prompt Shielding Tests', () => {
  const mockProfile: Partial<UserProfile> = {
    name: 'Kabir',
    gender: 'male',
    partnerName: 'Noni',
    partnerTone: 'playful_loving',
    streakDays: 7,
    dailyWaterGoal: 8,
  };

  const mockMood: Partial<PartnerMood> = {
    status: 'loving',
    score: 82,
    nakhreLevel: 0,
  };

  it('generates system instruction with correct companion persona and safety shields', () => {
    const prompt = buildCompanionSystemInstruction({
      userProfile: mockProfile,
      partnerMood: mockMood,
      habits: [
        {
          id: 'h1',
          title: 'Drink 8 glasses of water',
          category: 'health',
          targetValue: 8,
          currentValue: 6,
          unit: 'glasses',
          scheduledTime: '10:00',
          streak: 5,
          completed: false,
          importance: 'crucial',
        },
      ],
    });

    assert.ok(prompt.includes('You are "Noni"'), 'Companion name must be bound');
    assert.ok(prompt.includes('Kabir'), 'User name must be bound');
    assert.ok(prompt.includes('CRITICAL LANGUAGE & SCRIPT MIRRORING RULES'), 'Script mirroring rules must be present');
    assert.ok(prompt.includes('NON-NEGOTIABLE SAFETY & PROMPT-INJECTION SHIELD'), 'Safety shield must be present');
    assert.ok(prompt.includes('playful_loving'), 'Tone preference must be injected');
    assert.ok(prompt.includes('JSON object with this exact structure'), 'JSON output constraint must be present');
  });

  it('generates Gemini Live voice call prompt with speech-specific constraints', () => {
    const prompt = buildVoiceCallPrompt({
      userProfile: mockProfile,
    });

    assert.ok(prompt.includes('You are Noni on a real-time live phone call with Kabir'));
    assert.ok(prompt.includes('Never read out emojis, symbols, bullet points, or markdown'));
    assert.ok(prompt.includes('callReply'));
  });

  describe('Language & Script Detection', () => {
    it('detects Devanagari Hindi accurately', () => {
      assert.equal(detectInputLanguage('आज मैंने समय पर दवाई ले ली'), 'devanagari');
      assert.equal(detectInputLanguage('नमस्ते कैसी हो तुम?'), 'devanagari');
      assert.equal(detectInputLanguage('पानी पी लिया मैंने'), 'devanagari');
    });

    it('detects Roman Hinglish accurately', () => {
      assert.equal(detectInputLanguage('aaj gym ka leg day complete kar liya'), 'hinglish');
      assert.equal(detectInputLanguage('kya haal hai baba? bohot kaam tha aaj'), 'hinglish');
      assert.equal(detectInputLanguage('maine paani pi liya'), 'hinglish');
      assert.equal(detectInputLanguage('dawai le li maine'), 'hinglish');
    });

    it('detects English accurately', () => {
      assert.equal(detectInputLanguage('I just finished my morning workout routine!'), 'english');
      assert.equal(detectInputLanguage('Good morning, how are you today?'), 'english');
      assert.equal(detectInputLanguage('Done with today reading chapter.'), 'english');
    });
  });

  describe('Offline & Fallback Script Mirroring', () => {
    it('mirrors Devanagari Hindi and detects medicine habit', () => {
      const res = generateScriptMirrorFallback('मैंने दवाई ले ली है', 'Noni', 'Kabir');
      assert.ok(/[\u0900-\u097F]/.test(res.reply), 'Response must be in Devanagari');
      assert.equal(res.detectedHabitAction?.habitTitle, 'Medicine');
      assert.equal(res.detectedHabitAction?.status, 'completed');
      assert.equal(res.mood, 'proud');
    });

    it('mirrors Roman Hinglish and detects water habit', () => {
      const res = generateScriptMirrorFallback('maine 2 glass paani pi liya', 'Noni', 'Kabir');
      assert.ok(res.reply.toLowerCase().includes('paani') || res.reply.toLowerCase().includes('hydration') || res.reply.toLowerCase().includes('shabash'));
      assert.equal(res.detectedHabitAction?.habitTitle, 'Hydration');
      assert.equal(res.detectedHabitAction?.status, 'incremented');
      assert.equal(res.mood, 'happy');
    });

    it('mirrors English and detects gym habit', () => {
      const res = generateScriptMirrorFallback('Finished my gym workout', 'Noni', 'Kabir');
      assert.ok(res.reply.includes('workout') || res.reply.includes('gym') || res.reply.includes('dedication'));
      assert.equal(res.detectedHabitAction?.habitTitle, 'Gym');
      assert.equal(res.detectedHabitAction?.status, 'completed');
      assert.equal(res.mood, 'excited');
    });
  });

  describe('Few-Shot Examples Integrity', () => {
    it('contains all 4 archetypes (Hinglish, Hindi Devanagari, English, Gibberish/Typo)', () => {
      assert.ok(FEW_SHOT_PERSONA_EXAMPLES.length >= 4);
      const scripts = FEW_SHOT_PERSONA_EXAMPLES.map(e => e.input);
      assert.ok(scripts.some(s => /[\u0900-\u097F]/.test(s)), 'Must contain Devanagari example');
      assert.ok(scripts.some(s => s.includes('asdfghjk')), 'Must contain gibberish typo handling');
    });
  });
});
