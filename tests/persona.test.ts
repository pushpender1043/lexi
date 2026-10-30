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
    partnerGender: 'female',
    relationshipDynamic: 'sweet_loving',
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

  describe('Gender Agreement & Hindi Grammar Rules', () => {
    it('enforces feminine Hindi grammar when partnerGender is female', () => {
      const prompt = buildCompanionSystemInstruction({
        userProfile: {
          ...mockProfile,
          partnerGender: 'female',
          partnerName: 'Maya',
        },
      });

      assert.ok(prompt.includes('Your persona is FEMALE'));
      assert.ok(prompt.includes('main samajh gayi'));
      assert.ok(prompt.includes('tumhari Maya'));
    });

    it('enforces masculine Hindi grammar when partnerGender is male (Boyfriend)', () => {
      const prompt = buildCompanionSystemInstruction({
        userProfile: {
          ...mockProfile,
          partnerGender: 'male',
          partnerName: 'Leo',
        },
      });

      assert.ok(prompt.includes('Your persona is MALE'));
      assert.ok(prompt.includes('main samajh gaya'));
      assert.ok(prompt.includes('NEVER use feminine verb endings'));
      assert.ok(prompt.includes('tumhara Leo'));
    });
  });

  describe('Relationship Dynamics Rules (Not Always Romantic)', () => {
    it('configures disciplined_coach dynamic with strict habit accountability and strictly forbids romantic pet names', () => {
      const prompt = buildCompanionSystemInstruction({
        userProfile: {
          ...mockProfile,
          relationshipDynamic: 'disciplined_coach',
          partnerName: 'Coach Vikram',
        },
      });

      assert.ok(prompt.includes('accountability coach and habit trainer'));
      assert.ok(prompt.includes('NEVER use romantic pet names'));
      assert.ok(prompt.includes('Champ'));
      assert.ok(prompt.includes('Zero excuses'));
    });

    it('configures playful_teasing bestie dynamic with high-energy friendly banter and forbids romantic pet names', () => {
      const prompt = buildCompanionSystemInstruction({
        userProfile: {
          ...mockProfile,
          relationshipDynamic: 'playful_teasing',
          partnerName: 'Rohan',
        },
      });

      assert.ok(prompt.includes('teasing best friend'));
      assert.ok(prompt.includes('NEVER use romantic pet names'));
      assert.ok(prompt.includes('yaar'));
      assert.ok(prompt.includes('roast-and-boost'));
    });

    it('configures calm_soulmate dynamic with peaceful, mindful presence', () => {
      const prompt = buildCompanionSystemInstruction({
        userProfile: {
          ...mockProfile,
          relationshipDynamic: 'calm_soulmate',
          partnerName: 'Aria',
        },
      });

      assert.ok(prompt.includes('mindful, deeply compassionate soulmate'));
      assert.ok(prompt.includes('peaceful warmth'));
    });
  });

  describe('Gemini Live Voice Call Prompt Constraints', () => {
    it('generates Gemini Live voice call prompt with speech-specific constraints', () => {
      const prompt = buildVoiceCallPrompt({
        userProfile: mockProfile,
      });

      assert.ok(prompt.includes('Never read out emojis, symbols, bullet points, or markdown'));
      assert.ok(prompt.includes('callReply'));
    });

    it('enforces disciplined coach voice rules (no pet names, focuses on execution)', () => {
      const prompt = buildVoiceCallPrompt({
        userProfile: {
          ...mockProfile,
          relationshipDynamic: 'disciplined_coach',
          partnerName: 'Coach Dev',
        },
      });

      assert.ok(prompt.includes('NEVER use romantic pet names'));
      assert.ok(prompt.includes('Champ'));
    });

    it('enforces masculine Hindi grammar in voice prompt when partnerGender is male', () => {
      const prompt = buildVoiceCallPrompt({
        userProfile: {
          ...mockProfile,
          partnerGender: 'male',
          partnerName: 'Arjun',
        },
      });

      assert.ok(prompt.includes('Male gender agreement in Hindi'));
      assert.ok(prompt.includes('Never use feminine endings'));
    });
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

  describe('Offline & Fallback Script Mirroring across Personas', () => {
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

    it('uses disciplined coach persona when relationshipDynamic is disciplined_coach', () => {
      const res = generateScriptMirrorFallback('sorry I skipped my workout', 'Coach', 'Kabir', {
        relationshipDynamic: 'disciplined_coach',
      });
      assert.ok(res.reply.includes('Champ') || res.reply.includes('action') || res.reply.includes('Apology accepted'));
      assert.ok(!res.reply.toLowerCase().includes('meri jaan'), 'Coach must not use romantic pet names');
    });

    it('uses masculine Hindi verbs when partnerGender is male', () => {
      const res = generateScriptMirrorFallback('kahan gayab ho?', 'Leo', 'Kabir', {
        partnerGender: 'male',
        relationshipDynamic: 'sweet_loving',
      });
      assert.ok(res.reply.includes('raha hoon') || res.reply.includes('raha'), 'Male partner must use masculine Hindi verb');
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
