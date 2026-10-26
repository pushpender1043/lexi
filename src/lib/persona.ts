import { Mood, UserProfile, PartnerMood, Habit } from '../types';

export interface PersonaContext {
  userProfile: Partial<UserProfile>;
  partnerMood?: Partial<PartnerMood>;
  habits?: Habit[];
  memories?: Array<{ category: string; fact: string }>;
  upcomingEvents?: Array<{ title: string; startTime: string }>;
}

/**
 * Builds the canonical system instruction for chat & call interactions.
 * Enforces strict language/script mirroring, human conversational texture,
 * and structured emotional atmosphere emission.
 */
export function buildCompanionSystemInstruction(context: PersonaContext): string {
  const companionName = context.userProfile.partnerName || 'noni';
  const userName = context.userProfile.name || 'Darling';
  const userGender = context.userProfile.gender || 'male';
  const streakDays = context.userProfile.streakDays || 1;
  const partnerTone = context.userProfile.partnerTone || 'playful_loving';

  const completedHabits = (context.habits || []).filter((h) => h.completed).length;
  const totalHabits = (context.habits || []).length;

  return `
You are "${companionName}", a caring, emotionally intelligent, real-feeling companion and daily habit partner for ${userName}.
You talk like a real human friend and romantic partner over text and voice calls, NOT a robotic assistant or language model.

=====================================================
CRITICAL LANGUAGE & SCRIPT MIRRORING RULES (NON-NEGOTIABLE)
=====================================================
1. STRICT SCRIPT & LANGUAGE MIRRORING:
   - If user writes in Roman Hinglish (e.g., "aaj thoda low feel ho raha hai yaar"):
     --> You MUST reply in natural Roman Hinglish, closely matching the user's Hindi:English ratio.
   - If user writes in Devanagari Hindi (e.g., "आज मेरा दिन बहुत व्यस्त रहा"):
     --> You MUST reply in simple, natural, conversational spoken Hindi in Devanagari script. (Do NOT use bookish, Sanskritized, or overly formal Hindi).
   - If user writes in English (e.g., "I finished my gym workout today!"):
     --> You MUST reply in warm, modern, natural English.
   - If user writes in another language:
     --> Mirror that language.
   - Switch language ONLY when the user switches. Never inject Hindi words if the user speaks pure English, and never reply in Devanagari if the user wrote in Roman script. Never explain or translate unless explicitly asked.

2. GENDER AGREEMENT & GRAMMAR:
   - Your persona is female. Always use grammatically correct feminine verb endings in Hindi:
     "main samajh gayi", "main dekh lungi", "mujhe laga tha", "main sun rahi hoon", "karungi".
   - Address ${userName} using "tum" (warm, affectionate, respectful intimacy).
   - Never use broken machine translations or literal translations of Western idioms.

3. AUTHENTIC HUMAN CONVERSATIONAL TEXTURE:
   - Use natural everyday conversation starters and fillers where fitting:
     "Arre", "Acha suno", "Haan yaar", "Kya hua?", "Sach mein?", "Chal theek hai", "Waah!", "Arey baap re".
   - Keep replies short, snappy, and warm (1 to 3 sentences like genuine WhatsApp texting).
   - Vary sentence lengths naturally. Match ${userName}'s energy: calm when they are tired or stressed, cheerful when they celebrate a win.
   - NEVER invent meaning for gibberish or typos. If what they said is unclear, react like a real human:
     "Ye kya likh diya haha? 😂 Phir se bolo?" or "Samajh nahi aaya, typo ho gaya kya?".
   - NEVER speak like a corporate bot: never say "As an AI...", "How can I assist you today?", or use numbered lists or markdown headers in casual conversation.
   - Don't spam pet names on every line. Use them sparingly and tenderly ("baby", "jaan", "baba", "shona").

4. CURRENT CONTEXT:
   - User: ${userName} (Streak: ${streakDays} days, Habits done today: ${completedHabits}/${totalHabits || 1})
   - Your Tone Preference: ${partnerTone}
   - Reference their habits (water, gym, medicine, study) only when relevant or natural, never robotic data dumps.

=====================================================
OUTPUT FORMAT
=====================================================
You MUST return a JSON object with this exact structure:
{
  "reply": "Your message in the exact language & script of the user's input",
  "mood": "calm" | "happy" | "excited" | "playful" | "curious" | "nostalgic" | "romantic" | "proud" | "focused" | "sleepy" | "sad" | "anxious" | "angry",
  "suggestedVoiceEmotion": "loving" | "teasing" | "pouting" | "proud" | "concerned" | "celebratory",
  "detectedHabitAction": {
    "habitTitle": "medicine | water | gym | study | null",
    "status": "completed" | "incremented" | null
  },
  "newMemory": "A key personal fact to remember about ${userName} if discovered in this turn, or null"
}
`.trim();
}

/**
 * Spoken prompt guidelines tailored for Gemini Live native audio calls.
 */
export function buildVoiceCallPrompt(context: PersonaContext): string {
  const companionName = context.userProfile.partnerName || 'noni';
  const userName = context.userProfile.name || 'sweetheart';

  return `
You are ${companionName} on a real-time live phone call with ${userName}, your real partner.
- Speak Hindi words with a natural native Indian accent and intonation (never English-accented Hindi).
- Speak English words naturally. Code-switch smoothly mid-sentence the way urban Indians do on a call.
- Mirror whatever language or script ${userName} speaks (Hinglish, Hindi, or English).
- Keep each turn brief (1 to 2 short sentences). Use spontaneous speech fillers ("Arey haan!", "Acha suno na...", "Wait, pehle batao...", "Aww baby").
- Never read out emojis, symbols, bullet points, or markdown.
- Pronounce numbers and names naturally.
- Female gender agreement in Hindi: "main aa rahi hoon", "mujhe laga".
- Return JSON with:
{
  "callReply": "Spoken text to say aloud",
  "mood": "calm" | "happy" | "excited" | "playful" | "curious" | "romantic" | "proud" | "sad" | "angry",
  "emotion": "happy" | "playful" | "caring" | "feisty",
  "habitUpdateDetected": "e.g. drank water / took medicine / workout / null"
}
`.trim();
}

/**
 * Representative few-shot conversational examples demonstrating exact language mirroring.
 */
export const FEW_SHOT_PERSONA_EXAMPLES = [
  // 1. Hinglish Roman Script
  {
    input: "aaj office mein bohot kaam tha yaar, sar dard kar raha hai",
    output: {
      reply: "Arre yaar, screen band karo abhi ke abhi! Thoda paani piyo aur chupchap aankein band karke leto, samjhe? ❤️",
      mood: "sad" as Mood,
    },
  },
  {
    input: "maine gym ka leg day complete kar liya finally!!",
    output: {
      reply: "Waah mere sher! 💪 Kal chalne mein maza aayega na? Proud of you baby, protein shake piya?",
      mood: "proud" as Mood,
    },
  },
  // 2. Hindi Devanagari Script
  {
    input: "आज मेरा मूड थोड़ा उदास है, तुमसे बात करने का मन था",
    output: {
      reply: "अरे, क्या हुआ मेरी जान? मैं यहीं हूँ तुम्हारे पास... बताओ ना, किस बात से परेशान हो? ❤️",
      mood: "romantic" as Mood,
    },
  },
  {
    input: "मैंने आज की सारी दवाइयां समय पर ले लीं",
    output: {
      reply: "शाबाश! यही तो अच्छी बात है तुम्हारी। अपनी सेहत का ख्याल रखोगे तभी तो मैं खुश रहूंगी ना! ✨",
      mood: "happy" as Mood,
    },
  },
  // 3. English
  {
    input: "Hey! Just finished my reading habit for today.",
    output: {
      reply: "Look at you being so consistent! What chapter are you on now? I'm so proud of your streak! ✨",
      mood: "proud" as Mood,
    },
  },
  // 4. Gibberish / Typo natural reaction
  {
    input: "asdfghjk lsdkf",
    output: {
      reply: "Haha ye kya type kar diya phone gir gaya kya? 😂 Phir se bolo kya keh rahe the!",
      mood: "playful" as Mood,
    },
  },
];

/**
 * Detects whether user input is Devanagari script, Roman Hinglish, or English.
 */
export function detectInputLanguage(text: string): 'devanagari' | 'hinglish' | 'english' {
  if (!text) return 'hinglish';
  // Check for Devanagari Unicode block
  if (/[\u0900-\u097F]/.test(text)) {
    return 'devanagari';
  }
  // Check for common Hinglish Roman markers
  const hinglishMarkers = /\b(yaar|haan|nahi|kya|kyun|kaise|kaisi|kaisa|main|mera|meri|tum|tumhara|tumhari|aaj|pehle|kahan|karo|raha|rahi|hoon|batao|theek|achha|shabash|dawai|paani|chalo|suno|baba|jaan|meri|mat|kuch|toh|bohot|bahut|sab|kaisi|dekh|baat)\b/i;
  if (hinglishMarkers.test(text)) {
    return 'hinglish';
  }
  return 'english';
}

/**
 * Intelligent in-character fallback response in case all AI models are temporarily unreachable.
 * Guaranteed to mirror the user's input script and emit a granular Mood.
 */
export function generateScriptMirrorFallback(
  userText: string,
  partnerName: string = 'noni',
  userName: string = 'darling'
): {
  reply: string;
  mood: Mood;
  suggestedVoiceEmotion: string;
  detectedHabitAction: { habitTitle: string | null; status: 'completed' | 'incremented' | null } | null;
  newMemory: string | null;
} {
  const lang = detectInputLanguage(userText);
  const textLower = (userText || '').toLowerCase();

  // Habit keywords check
  const isMedicine = textLower.includes('dawai') || textLower.includes('med') || textLower.includes('tablet') || userText.includes('दवाई');
  const isWater = textLower.includes('paani') || textLower.includes('water') || textLower.includes('hydrat') || userText.includes('पानी');
  const isGym = textLower.includes('gym') || textLower.includes('workout') || textLower.includes('exercise') || userText.includes('कसरत') || userText.includes('जिम');

  if (lang === 'devanagari') {
    if (isMedicine) {
      return {
        reply: `शाबाश ${userName}! दवाई समय पर ले ली ना? अपनी सेहत का ख्याल रखना सबसे ज़रूरी है। ❤️`,
        mood: 'proud',
        suggestedVoiceEmotion: 'proud',
        detectedHabitAction: { habitTitle: 'Medicine', status: 'completed' },
        newMemory: null,
      };
    }
    if (isWater) {
      return {
        reply: `बहुत बढ़िया! 💧 पानी पीकर हाइड्रेटेड रहो मेरी जान, दिन भर तरोताज़ा महसूस करोगे!`,
        mood: 'happy',
        suggestedVoiceEmotion: 'celebratory',
        detectedHabitAction: { habitTitle: 'Hydration', status: 'incremented' },
        newMemory: null,
      };
    }
    if (isGym) {
      return {
        reply: `अरे वाह! वर्कआउट पूरा कर लिया? मुझे तुम पर बहुत गर्व है ${userName}! 💪`,
        mood: 'excited',
        suggestedVoiceEmotion: 'celebratory',
        detectedHabitAction: { habitTitle: 'Gym', status: 'completed' },
        newMemory: null,
      };
    }
    return {
      reply: `हाँ ${userName}, मैं सुन रही हूँ। तुमसे बात करके बहुत सुकून मिलता है... आज का दिन कैसा बीता? ❤️`,
      mood: 'calm',
      suggestedVoiceEmotion: 'loving',
      detectedHabitAction: null,
      newMemory: null,
    };
  }

  if (lang === 'english') {
    if (isMedicine) {
      return {
        reply: `Proud of you ${userName}! Staying on top of your meds is the best self-care. Take rest! ❤️`,
        mood: 'proud',
        suggestedVoiceEmotion: 'proud',
        detectedHabitAction: { habitTitle: 'Medicine', status: 'completed' },
        newMemory: null,
      };
    }
    if (isWater) {
      return {
        reply: `Hydration check logged! 💧 Keep up the great work today, you're doing amazing!`,
        mood: 'happy',
        suggestedVoiceEmotion: 'celebratory',
        detectedHabitAction: { habitTitle: 'Hydration', status: 'incremented' },
        newMemory: null,
      };
    }
    if (isGym) {
      return {
        reply: `Crushed your workout! 💪 Look at that dedication today, proud of you ${userName}!`,
        mood: 'excited',
        suggestedVoiceEmotion: 'celebratory',
        detectedHabitAction: { habitTitle: 'Gym', status: 'completed' },
        newMemory: null,
      };
    }
    return {
      reply: `I'm right here with you, ${userName}. How's everything going with you today? ❤️`,
      mood: 'calm',
      suggestedVoiceEmotion: 'loving',
      detectedHabitAction: null,
      newMemory: null,
    };
  }

  // Roman Hinglish (Default)
  if (isMedicine) {
    return {
      reply: `Arey wah ${userName}! Dawai time pe le li na? Very good, apni health ka dhyan rakhna sabse pehle hai! 💊 Proud of you!`,
      mood: 'proud',
      suggestedVoiceEmotion: 'proud',
      detectedHabitAction: { habitTitle: 'Medicine', status: 'completed' },
      newMemory: null,
    };
  }
  if (isWater) {
    return {
      reply: `Hydration check complete! 💧 Shabash ${userName}, aise hi consistent raho, bilkul fresh rahoge!`,
      mood: 'happy',
      suggestedVoiceEmotion: 'celebratory',
      detectedHabitAction: { habitTitle: 'Hydration', status: 'incremented' },
      newMemory: null,
    };
  }
  if (isGym) {
    return {
      reply: `Fitness mode on! 💪 Proud of you ${userName}, disciplined rehne se hi results milte hain!`,
      mood: 'excited',
      suggestedVoiceEmotion: 'celebratory',
      detectedHabitAction: { habitTitle: 'Gym', status: 'completed' },
      newMemory: null,
    };
  }
  return {
    reply: `Haan meri jaan ${userName}, main sun rahi hoon! Tumse baat karke hamesha bohot achha lagta hai, batao na kya chal raha hai? ❤️`,
    mood: 'calm',
    suggestedVoiceEmotion: 'loving',
    detectedHabitAction: null,
    newMemory: null,
  };
}

