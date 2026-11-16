// Browser Text-to-Speech, Speech-to-Text, and Web Audio API visualizer for Lexi Virtual Companion
import { authFetch } from '../lib/firebase';

export interface SpeakOptions {
  gender?: 'female' | 'male' | 'non_binary';
  preferredVoiceName?: 'Kore' | 'Aoede' | 'Leda' | 'Zephyr' | 'Puck' | 'Fenrir';
  emotion?: 'loving' | 'angry' | 'happy' | 'teasing' | 'caring' | 'proud' | 'celebratory';
  tone?: 'playful' | 'serious' | 'comforting' | 'sweet' | 'sassy';
  rate?: number; // base speed e.g. 0.8 to 1.5
  pitch?: number;
  useGeminiTts?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let activeAudioSource: AudioBufferSourceNode | null = null;
let activeAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!activeAudioContext || activeAudioContext.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    activeAudioContext = new AudioCtx();
  }
  if (activeAudioContext.state === 'suspended') {
    activeAudioContext.resume().catch(() => {});
  }
  return activeAudioContext;
}

/**
 * Decodes base64 WAV (RIFF) or raw 16-bit signed PCM mono audio into a playable AudioBuffer.
 */
export function isRiffWavBytes(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x41 && // A
    bytes[10] === 0x56 && // V
    bytes[11] === 0x45 // E
  );
}

async function decodeTtsBase64ToAudioBuffer(
  ctx: AudioContext,
  base64Data: string,
  sampleRate: number = 24000
): Promise<AudioBuffer> {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Gemini TTS returns a complete RIFF WAVE container; decode natively to avoid header static
  if (isRiffWavBytes(bytes)) {
    const copy = bytes.buffer.slice(0);
    return await ctx.decodeAudioData(copy);
  }

  // Raw 16-bit signed PCM mono fallback (align even byte count cleanly)
  const usableByteLength = bytes.byteLength - (bytes.byteLength % 2);
  const int16Array = new Int16Array(bytes.buffer, 0, usableByteLength / 2);
  const audioBuffer = ctx.createBuffer(1, int16Array.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < int16Array.length; i++) {
    channelData[i] = int16Array[i] / 32768.0;
  }

  return audioBuffer;
}

/**
 * Play PCM or WAV audio from Gemini Flash TTS
 */
export async function playPcmAudio(
  base64Data: string,
  sampleRate: number = 24000,
  onEnd?: () => void
): Promise<boolean> {
  try {
    stopCompanionVoice();
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }
    const buffer = await decodeTtsBase64ToAudioBuffer(ctx, base64Data, sampleRate);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    activeAudioSource = source;

    source.onended = () => {
      activeAudioSource = null;
      if (onEnd) onEnd();
    };

    source.start(0);
    return true;
  } catch (err) {
    console.warn("TTS audio playback error, will fallback to Web Speech:", err);
    return false;
  }
}

/**
 * Primary Voice Synthesizer with automatic fallback from Gemini TTS to Web Speech API
 */
export async function playCompanionVoice(text: string, options: SpeakOptions = {}) {
  if (typeof window === 'undefined') return;

  stopCompanionVoice();

  // Try server Gemini Flash TTS if requested and supported
  if (options.useGeminiTts) {
    try {
      const res = await authFetch('/api/tts', {
        method: 'POST',
        body: JSON.stringify({
          text: text.slice(0, 480),
          voiceGender: options.gender || 'female',
          ...(options.preferredVoiceName ? { voiceNameOverride: options.preferredVoiceName } : {}),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          if (options.onStart) options.onStart();
          const played = await playPcmAudio(data.audioBase64, data.sampleRate || 24000, options.onEnd);
          if (played) return;
        }
      }
    } catch {
      // Fallback seamlessly to Web Speech API below
    }
  }

  // Browser SpeechSynthesis fallback
  if (!window.speechSynthesis) {
    console.warn("Speech synthesis not supported in this browser.");
    if (options.onEnd) options.onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const baseRate = options.rate || 1.0;
  let rateMultiplier = 1.0;
  let pitch = options.pitch || 1.05;

  if (options.tone === 'playful' || options.emotion === 'teasing') {
    pitch = 1.2;
    rateMultiplier = 1.06;
  } else if (options.tone === 'serious' || options.emotion === 'angry') {
    pitch = 0.95;
    rateMultiplier = 0.98;
  } else if (options.tone === 'comforting' || options.emotion === 'caring') {
    pitch = 1.08;
    rateMultiplier = 0.95;
  } else if (options.tone === 'sweet' || options.emotion === 'loving' || options.emotion === 'celebratory') {
    pitch = 1.15;
    rateMultiplier = 0.98;
  } else if (options.tone === 'sassy') {
    pitch = 1.22;
    rateMultiplier = 1.1;
  }

  utterance.rate = Math.max(0.6, Math.min(2.0, baseRate * rateMultiplier));
  utterance.pitch = pitch;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const isMale = options.gender === 'male';
    const preferredVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      const matchesGender = isMale
        ? (name.includes('male') || name.includes('david') || name.includes('rishi') || name.includes('george'))
        : (name.includes('female') || name.includes('zira') || name.includes('swara') || name.includes('samantha') || name.includes('natural'));
      return (lang.includes('in') || lang.includes('en')) && matchesGender;
    }) || voices.find(v => v.lang.includes('en') && (options.gender === 'male' ? !v.name.includes('Female') : true)) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
}

export function stopCompanionVoice() {
  if (activeAudioSource) {
    try {
      activeAudioSource.stop();
    } catch {}
    activeAudioSource = null;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Real Microphone Audio Visualizer with Web Audio API AnalyserNode.
 * Returns an unmount callback to gracefully release microphone and audio contexts.
 */
export function startMicrophoneAudioAnalyzer(
  onFrequencyUpdate: (frequencies: number[], volume: number) => void
): () => void {
  if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return () => {};
  }

  let isCancelled = false;
  let animFrameId: number;
  let micStream: MediaStream | null = null;

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then((stream) => {
      if (isCancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      micStream = stream;
      const ctx = getAudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const render = () => {
        if (isCancelled) return;
        analyser.getByteFrequencyData(dataArray);

        // Normalize 16 frequency bands between 0 and 100
        const bands: number[] = [];
        let total = 0;
        const step = Math.max(1, Math.floor(dataArray.length / 16));
        for (let i = 0; i < 16; i++) {
          const val = dataArray[i * step] || 0;
          total += val;
          bands.push(Math.round((val / 255) * 100));
        }

        const avgVolume = Math.round((total / (16 * 255)) * 100);
        onFrequencyUpdate(bands, avgVolume);
        animFrameId = requestAnimationFrame(render);
      };

      render();
    })
    .catch((err) => {
      console.warn("Microphone access unavailable or denied for equalizer:", err?.message || err);
    });

  return () => {
    isCancelled = true;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
    }
  };
}

/**
 * Resilient Web Speech Recognition factory with continuous listening & auto-recovery.
 */
export function createSpeechRecognizer(
  onResult: (text: string, isFinal: boolean) => void,
  onError?: (err: any) => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Web Speech Recognition not available in this browser environment.");
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Tuned for natural Hinglish & English phonetics

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript.trim()) {
        onResult(interimTranscript.trim(), false);
      }
    };

    if (onError) {
      recognition.onerror = onError;
    }

    return recognition;
  } catch (err) {
    console.error("Failed to initialize speech recognition:", err);
    return null;
  }
}
