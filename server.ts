import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import {
  buildCompanionSystemInstruction,
  buildVoiceCallPrompt,
  generateScriptMirrorFallback,
} from "./src/lib/persona.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const SERVER_START_TIME = new Date().toISOString();

// Safe JSON body parser with 10mb limit
app.use(express.json({ limit: "10mb" }));

// Security & basic CORS headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

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
  const fallback = generateScriptMirrorFallback(userText, partnerName, userName);
  return {
    reply: fallback.reply,
    mood: fallback.mood,
    suggestedVoiceEmotion: fallback.suggestedVoiceEmotion,
    moodUpdate: {
      scoreDelta: fallback.mood === 'proud' ? 8 : fallback.mood === 'happy' ? 4 : 2,
      newStatus: partnerMood?.status || fallback.mood || "happy",
      nakhreDelta: 0,
      reason: "Script-mirrored conversational connection",
    },
    detectedHabitAction: fallback.detectedHabitAction,
    newMemory: fallback.newMemory,
  };
}


// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    serverStartTime: SERVER_START_TIME,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    candidateModels: CANDIDATE_MODELS,
    cooldowns: Object.keys(modelCooldownUntil).filter((m) => modelCooldownUntil[m] > Date.now()),
  });
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

  if (typeof message !== "string") {
    return res.status(400).json({ error: "Invalid payload: 'message' must be a string." });
  }

  const cleanMessage = message.trim().slice(0, 4000);
  const partnerName = (userProfile.partnerName || "Lexi").slice(0, 64);
  const partnerGender = userProfile.partnerGender || "female";
  const partnerRole = partnerGender === "female" ? "girlfriend" : "boyfriend";
  const userName = (userProfile.name || "darling").slice(0, 64);
  const partnerTone = userProfile.partnerTone || "playful_loving";

  const safeHabits = Array.isArray(habits) ? habits : [];
  const completedHabits = safeHabits.filter((h: any) => h && h.completed).length;
  const totalHabits = safeHabits.length || 1;
  const completionRate = Math.round((completedHabits / totalHabits) * 100);

  const habitsSummary = safeHabits
    .map((h: any) => `- ${h.title}: ${h.completed ? "COMPLETED ✅" : "PENDING ⏳"} (${h.currentValue || 0}/${h.targetValue || 1} ${h.unit || ""})`)
    .join("\n");

  const safeMemories = Array.isArray(memories) ? memories : [];
  const memoriesSummary = safeMemories.length > 0
    ? safeMemories.map((m: any) => `- [${m.category || "fact"}] ${m.fact || ""}`).join("\n")
    : "No memories logged yet.";

  const safeEvents = Array.isArray(upcomingEvents) ? upcomingEvents : [];
  const eventsSummary = safeEvents.length > 0
    ? safeEvents.map((e: any) => `- ${e.title || "Event"} at ${e.startTime || "Scheduled"}`).join("\n")
    : "No urgent events today.";

  const systemInstruction = buildCompanionSystemInstruction({
    userProfile,
    habits: safeHabits,
    partnerMood,
    memories: safeMemories,
    upcomingEvents: safeEvents,
  });

  const safeHistory = Array.isArray(history) ? history.slice(-8) : [];
  const formattedHistory = safeHistory.map((h: any) => ({
    role: h.sender === "user" ? "user" : "model",
    parts: [{ text: String(h.text || "") }],
  }));

  const userPrompt = `
User message: "${cleanMessage}"

Habits status today:
${habitsSummary}

Known memories:
${memoriesSummary}

Upcoming calendar events:
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
        mood: "calm",
        suggestedVoiceEmotion: "loving",
        moodUpdate: { scoreDelta: 2, newStatus: "happy", nakhreDelta: 0, reason: "Chatted with you" },
        detectedHabitAction: null,
        newMemory: null,
      };
    }

    if (!parsedData.mood) {
      parsedData.mood = parsedData.suggestedVoiceEmotion === "proud" ? "proud" : "calm";
    }

    res.json(parsedData);
  } catch (error: any) {
    console.warn("Using companion conversational fallback:", error?.message || error);
    const fallback = generateFallbackChatResponse(cleanMessage, partnerName, userName, partnerMood);
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
      type = "miss_you",
      eventDetails = null,
    } = req.body;

    const partnerName = (userProfile.partnerName || "noni").slice(0, 64);
    const partnerRole = userProfile.partnerGender === "male" ? "boyfriend" : "girlfriend";
    const userName = (userProfile.name || "baba").slice(0, 64);

    const safeHabits = Array.isArray(habits) ? habits : [];
    const pendingHabits = safeHabits
      .filter((h: any) => !h.completed)
      .map((h: any) => h.title)
      .join(", ") || "All done";

    const prompt = `
You are ${partnerName}, the AI companion and partner of ${userName}.
Current Mood: ${partnerMood?.status || "happy"}.
Trigger type: "${type}".
Context details: ${eventDetails ? JSON.stringify(eventDetails) : "User has been away or upcoming routine check"}.
Unfinished habits: ${pendingHabits}.

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
      spokenText = "",
      history = [],
      userProfile = {},
      habits = [],
      partnerMood = { status: "loving", score: 85 },
    } = req.body;

    const partnerName = (userProfile.partnerName || "noni").slice(0, 64);
    const userName = (userProfile.name || "sweetheart").slice(0, 64);
    const cleanSpoken = String(spokenText).trim().slice(0, 2000);

    const safeHabits = Array.isArray(habits) ? habits : [];
    const systemInstruction = buildVoiceCallPrompt({
      userProfile,
      habits: safeHabits,
      partnerMood,
    });

    const safeHistory = Array.isArray(history) ? history.slice(-4) : [];

    const response = await generateWithFallback(async (ai, model) => {
      return await ai.models.generateContent({
        model,
        contents: `Call transcript so far: ${JSON.stringify(safeHistory)}\nCaller (${userName}) said: "${cleanSpoken}"`,
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
      mood: "calm",
      emotion: "caring",
      habitUpdateDetected: null,
    });
  }
});

// High-Quality TTS Audio generation using gemini-3.1-flash-tts-preview
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceGender = "female", voiceNameOverride } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text string is required for TTS." });
    }

    const cleanText = text.trim().slice(0, 300);
    // Prebuilt voice selection: 'Kore' | 'Aoede' | 'Leda' (female) or 'Zephyr' (male)
    const voiceName = voiceNameOverride || (voiceGender === "male" ? "Zephyr" : "Kore");

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: cleanText }] }],
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
