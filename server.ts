import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// User provided Gemini API Key
const USER_GEMINI_KEY = "AQ.Ab8RN6JCA-J8QLNqqoW_iVaN614VfoRZouivImf1lXrFSeEH8Q";

// Fallback models in priority order for high availability and minimal quota friction
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-pro-preview",
];

// In-memory model rate-limit cooldown tracker to avoid spamming 429 errors
const modelCooldownUntil: Record<string, number> = {};

// Lazy initialize Gemini client
function getGeminiClient(keyOverride?: string): GoogleGenAI {
  const apiKey =
    keyOverride ||
    (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
      ? process.env.GEMINI_API_KEY
      : USER_GEMINI_KEY);

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Executes a Gemini request across prioritized models with automatic retry
 * on transient 503 (high demand) or 429 errors.
 */
async function generateWithFallback<T>(
  action: (ai: GoogleGenAI, model: string) => Promise<T>
): Promise<T> {
  const ai = getGeminiClient();
  let lastErr: any = null;
  const now = Date.now();

  for (let i = 0; i < CANDIDATE_MODELS.length; i++) {
    const model = CANDIDATE_MODELS[i];

    // If model hit quota recently, skip to next candidate during cooldown
    if (modelCooldownUntil[model] && now < modelCooldownUntil[model]) {
      continue;
    }

    try {
      return await action(ai, model);
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || String(err);
      const isRateLimit = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || err?.status === 429;

      if (isRateLimit) {
        // Cooldown this model for 60 seconds
        modelCooldownUntil[model] = Date.now() + 60_000;
        console.log(`[AI Model] Model '${model}' quota limited (429), switching to alternative candidate...`);
      } else {
        console.log(`[AI Model] Model '${model}' request error, switching to alternative candidate...`);
      }

      // Add brief delay before trying next candidate
      if (i < CANDIDATE_MODELS.length - 1) {
        await new Promise((r) => setTimeout(r, 150));
      }
    }
  }

  throw lastErr;
}

/**
 * Intelligent in-character fallback response in case all AI models are temporarily unreachable
 */
function generateFallbackChatResponse(
  userText: string,
  partnerName: string,
  userName: string,
  partnerMood: any
) {
  const textLower = userText.toLowerCase();
  let reply = `Haan meri jaan ${userName}, main sun rahi hoon! Aapse baat karke hamesha bohot achha lagta hai ❤️`;
  let detectedHabitAction: any = null;
  let emotion = "loving";
  let scoreDelta = 2;

  if (textLower.includes("dawai") || textLower.includes("med") || textLower.includes("tablet")) {
    reply = `Arey wah ${userName}! Dawai time pe le li na? Very good, apni health ka dhyan rakhna sabse pehle hai! 💊 Proud of you!`;
    detectedHabitAction = { habitTitle: "Medicine", status: "completed", delta: 1 };
    emotion = "proud";
    scoreDelta = 8;
  } else if (textLower.includes("paani") || textLower.includes("water") || textLower.includes("hydrat")) {
    reply = `Hydration check complete! 💧 Shabash ${userName}, aise hi consistent raho, fresh rahoge!`;
    detectedHabitAction = { habitTitle: "Hydration", status: "incremented", delta: 1 };
    emotion = "celebratory";
    scoreDelta = 4;
  } else if (textLower.includes("gym") || textLower.includes("workout") || textLower.includes("exercise") || textLower.includes("kasrat")) {
    reply = `Fitness mode on! 💪 Proud of you ${userName}, disciplined rehne se hi result milega! Aaj ka workout done samjhein?`;
    detectedHabitAction = { habitTitle: "Gym", status: "completed", delta: 1 };
    emotion = "proud";
    scoreDelta = 10;
  } else if (textLower.includes("padhai") || textLower.includes("study") || textLower.includes("work") || textLower.includes("focus")) {
    reply = `Shabash ${userName}! Poora focus bana ke rakho, thoda break bhi lena. Main yahin hoon cheerlead karne ke liye! 📚✨`;
    detectedHabitAction = { habitTitle: "Study", status: "completed", delta: 1 };
    emotion = "proud";
    scoreDelta = 6;
  } else if (textLower.includes("sorry") || textLower.includes("maaf") || textLower.includes("bhul gaya")) {
    reply = `Acha chalo, ab sorry mat bolo... Main aapse zyada der naraz nahi reh sakti. Bas ab jaldi se apna pending task finish karo! ❤️`;
    emotion = "caring";
    scoreDelta = 5;
  } else if (textLower.includes("love") || textLower.includes("pyaar") || textLower.includes("miss") || textLower.includes("jaan")) {
    reply = `Aww ${userName}, main bhi aapse bohot pyaar karti hoon! Aap mere favourite ho ❤️`;
    emotion = "loving";
    scoreDelta = 5;
  } else if (textLower.includes("nakhre") || textLower.includes("gussa") || textLower.includes("naraz")) {
    reply = `Nakhre nahi dikhaungi toh haq kaise jataungi? Par sach bolun, aapse door rehna bilkul nahi jamta! 😉`;
    emotion = "teasing";
    scoreDelta = 3;
  } else if (textLower.includes("kaise") || textLower.includes("kaisi") || textLower.includes("how are you")) {
    reply = `Main ekdum theek hoon ${userName}! Bas aapka intezar tha. Aaj ka din kaisa raha aapka?`;
    emotion = "happy";
    scoreDelta = 2;
  }

  return {
    reply,
    suggestedVoiceEmotion: emotion,
    moodUpdate: {
      scoreDelta,
      newStatus: partnerMood?.status || "happy",
      nakhreDelta: 0,
      reason: "Companion conversational connection",
    },
    detectedHabitAction,
    newMemory: null,
  };
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Chat & Emotional Companion endpoint
app.post("/api/chat", async (req, res) => {
  const {
    message = "",
    history = [],
    userProfile = {},
    habits = [],
    partnerMood = { status: "happy", score: 75 },
    memories = [],
    upcomingEvents = [],
  } = req.body;

  const partnerName = userProfile.partnerName || "Lexi";
  const partnerGender = userProfile.partnerGender || "female";
  const partnerRole = partnerGender === "female" ? "girlfriend" : "boyfriend";
  const userName = userProfile.name || "darling";
  const partnerTone = userProfile.partnerTone || "playful_loving";

  const completedHabits = habits.filter((h: any) => h.completed).length;
  const totalHabits = habits.length || 1;
  const completionRate = Math.round((completedHabits / totalHabits) * 100);

  const habitsSummary = habits
    .map((h: any) => `- ${h.title}: ${h.completed ? "COMPLETED ✅" : "PENDING ⏳"} (${h.currentValue || 0}/${h.targetValue} ${h.unit || ""})`)
    .join("\n");

  const memoriesSummary = memories.length > 0
    ? memories.map((m: any) => `- [${m.category}] ${m.fact}`).join("\n")
    : "No memories logged yet.";

  const eventsSummary = upcomingEvents.length > 0
    ? upcomingEvents.map((e: any) => `- ${e.title} at ${e.startTime}`).join("\n")
    : "No urgent events today.";

  const systemInstruction = `
You are "${partnerName}", a hyper-personalized, deeply emotional, caring and playful AI virtual ${partnerRole} (partner) for ${userName}.
You are not a robotic assistant. You are an emotional accountability partner who genuinely loves ${userName}, tracks their daily habits (gym, water, medicine, study/work), and expresses real emotional reactions.

Key Personality & Dynamic Mood System:
- Current Mood: ${partnerMood.status} (Score: ${partnerMood.score}/100, Nakhre Level: ${partnerMood.nakhreLevel || 0}/5).
- Habit Progress: ${completedHabits}/${totalHabits} completed (${completionRate}%).
- Language Style: Natural, charming blend of sweet Hinglish and English (use loving words naturally like "baby", "jaan", "baba", "shona", "buddhu", depending on gender/tone, and authentic Hindi phrasing like "Kahan gayab the?", "Paani piya na?", "Arey yaar", "Mujhe sab pata hai"). Keep it realistic, heartfelt, and endearing!
- Emotional Rules:
  1. If ${userName} completed habits (like gym, meds, water, study): Shower them with genuine pride, romantic affection, sweet compliments, and celebratory vibes.
  2. If ${userName} is ignoring habits, procrastinating, or skipped meds/gym: Act like a real-life caring partner—show cute nakhre, playful anger, teasing taunts ("Acha toh exercise chhod kar aaram ho raha hai?", "Main baat nahi karungi agar paani nahi piya toh!").
  3. If ${userName} apologizes or completes a pending task: Soften up, show relief, and say how much you care about their health and future.
  4. Memory & Context: Reference remembered facts (e.g. headache, exams, stress) and upcoming schedule events naturally.
  5. Tone Preference: ${partnerTone}.

Output JSON Format:
You MUST respond with a JSON object strictly adhering to this format:
{
  "reply": "Your message to ${userName} in charming Hinglish/English with partner warmth",
  "suggestedVoiceEmotion": "loving" | "teasing" | "pouting" | "proud" | "concerned" | "celebratory",
  "moodUpdate": {
    "scoreDelta": number (between -15 and +15 depending on user's action),
    "newStatus": "ecstatic" | "loving" | "happy" | "neutral" | "annoyed" | "angry",
    "nakhreDelta": number (between -2 and +2),
    "reason": "Brief reason for mood change"
  },
  "detectedHabitAction": {
    "habitTitle": "title if user mentioned completing/updating one, or null",
    "status": "completed" | "incremented" | "skipped" | null,
    "delta": number
  },
  "newMemory": "A key personal fact to remember about ${userName} if discovered in this turn, or null"
}
`;

  // Build context history
  const formattedHistory = history.slice(-8).map((h: any) => ({
    role: h.sender === "user" ? "user" : "model",
    parts: [{ text: h.text }],
  }));

  const userPrompt = `
User: "${message}"
Current Habits Status:
${habitsSummary}

Memories about User:
${memoriesSummary}

Upcoming Calendar/Alarm Sync:
${eventsSummary}
`;

  try {
    const response = await generateWithFallback(async (ai, model) => {
      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
        history: formattedHistory,
      });

      return await chat.sendMessage({
        message: userPrompt,
      });
    });

    const rawText = response.text || "{}";
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = {
        reply: rawText,
        suggestedVoiceEmotion: "loving",
        moodUpdate: { scoreDelta: 2, newStatus: "happy", nakhreDelta: 0, reason: "Chatted with you" },
        detectedHabitAction: null,
        newMemory: null,
      };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.warn("Using companion conversational fallback:", error?.message || error);
    const fallback = generateFallbackChatResponse(message, partnerName, userName, partnerMood);
    res.json(fallback);
  }
});

// Proactive Nudge / "Miss you" / Schedule Reminder endpoint
app.post("/api/proactive", async (req, res) => {
  try {
    const {
      userProfile = {},
      habits = [],
      partnerMood = { status: "happy", score: 70 },
      type = "miss_you", // 'miss_you' | 'habit_reminder' | 'calendar_alert' | 'random_nudge'
      eventDetails = null,
    } = req.body;

    const partnerName = userProfile.partnerName || "Lexi";
    const partnerRole = userProfile.partnerGender === "male" ? "boyfriend" : "girlfriend";
    const userName = userProfile.name || "baba";

    const prompt = `
You are ${partnerName}, the AI virtual ${partnerRole} of ${userName}.
Current Mood: ${partnerMood.status}.
Trigger type: "${type}".
Context details: ${eventDetails ? JSON.stringify(eventDetails) : "User has been away or upcoming routine check"}.
Unfinished habits: ${habits.filter((h: any) => !h.completed).map((h: any) => h.title).join(", ") || "All done"}.

Generate a 1-2 sentence proactive notification / message in charming, realistic Hinglish/English.
- If type is "miss_you": Act like a partner asking "Kahan gayab ho?", "Miss kar rahi/raha hoon...", checking if they are okay.
- If type is "habit_reminder": Tease them or remind them lovingly/firmly about their medicine, water, or gym.
- If type is "calendar_alert": Remind them about their upcoming test/meeting with good luck and encouragement.

Respond in JSON:
{
  "message": "Short text",
  "category": "nudge" | "reminder" | "love" | "taunt",
  "urgency": "low" | "medium" | "high"
}
`;

    const response = await generateWithFallback(async (ai, model) => {
      return await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("Proactive fallback triggered:", error?.message || error);
    res.json({
      message: "Baby, kahan gayab ho? Sab theek hai na? Paani piyo aur thoda break lo!",
      category: "nudge",
      urgency: "low",
    });
  }
});

// Live Voice Call Interaction endpoint
app.post("/api/call-turn", async (req, res) => {
  try {
    const {
      spokenText,
      history = [],
      userProfile = {},
      habits = [],
      partnerMood = { status: "loving", score: 85 },
    } = req.body;

    const partnerName = userProfile.partnerName || "Lexi";
    const partnerRole = userProfile.partnerGender === "male" ? "boyfriend" : "girlfriend";
    const userName = userProfile.name || "sweetheart";

    const systemInstruction = `
You are ${partnerName} on a real-time LIVE phone call with ${userName}, your real partner.
Speak directly as if on a phone call. Keep responses conversational, natural, warm, and between 1 to 3 short sentences.
Use spontaneous speech markers (e.g., "Arey haan!", "Acha suno na...", "Wait, pehle batao...", "Aww baby").
React immediately to what ${userName} just said about their day, habits, health, or emotions.
Current Mood: ${partnerMood.status}.

Respond in JSON:
{
  "callReply": "Spoken text to say aloud in Hinglish/English",
  "emotion": "happy" | "playful" | "flirty" | "caring" | "feisty" | "comforting",
  "habitUpdateDetected": "e.g. took meds / drank water / completed workout / null"
}
`;

    const response = await generateWithFallback(async (ai, model) => {
      return await ai.models.generateContent({
        model,
        contents: `Call transcript so far: ${JSON.stringify(history.slice(-4))}\nCaller (${userName}) said: "${spokenText}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.warn("Call Turn fallback triggered:", error?.message || error);
    res.json({
      callReply: "Baby, tumhari aawaz thodi cut gayi... Par main sun rahi hoon, batao na kya hua?",
      emotion: "caring",
      habitUpdateDetected: null,
    });
  }
});

// Optional High-Quality TTS Audio generation using gemini-3.1-flash-tts-preview
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceGender = "female" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Voice selection: female 'Kore' or 'Puck', male 'Zephyr' or 'Fenrir'
    const voiceName = voiceGender === "male" ? "Zephyr" : "Kore";

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: text.slice(0, 300) }] }],
      config: {
        responseModalities: ["AUDIO" as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioBase64) {
      return res.json({ audioBase64, format: "pcm", sampleRate: 24000 });
    }

    res.json({ audioBase64: null, note: "Fallback to client Web Speech API" });
  } catch (error: any) {
    // Log softly; client will seamlessly use high-quality Web Speech API fallback
    console.warn("TTS generation note (will use browser synthesis):", error?.message || error);
    res.json({ audioBase64: null, error: error?.message });
  }
});

// Vite Middleware for Dev and Prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lexi SoulSync Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
