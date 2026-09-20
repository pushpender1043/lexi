// Browser Text-to-Speech and Speech-to-Text utilities for Lexi Virtual Companion

export interface SpeakOptions {
  gender?: 'female' | 'male';
  emotion?: 'loving' | 'angry' | 'happy' | 'teasing' | 'caring';
  tone?: 'playful' | 'serious' | 'comforting' | 'sweet' | 'sassy';
  rate?: number; // base speed e.g. 0.8 to 1.5
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function playCompanionVoice(text: string, options: SpeakOptions = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn("Speech synthesis not supported in this browser environment.");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Custom emotional and tone modulation
  const baseRate = options.rate || 1.0;
  let rateMultiplier = 1.0;
  let pitch = options.pitch || 1.05;

  if (options.tone === 'playful' || options.emotion === 'teasing') {
    pitch = 1.2;
    rateMultiplier = 1.06;
  } else if (options.tone === 'serious' || options.emotion === 'angry') {
    pitch = 0.96;
    rateMultiplier = 0.98;
  } else if (options.tone === 'comforting' || options.emotion === 'caring') {
    pitch = 1.08;
    rateMultiplier = 0.94;
  } else if (options.tone === 'sweet' || options.emotion === 'loving') {
    pitch = 1.16;
    rateMultiplier = 0.96;
  } else if (options.tone === 'sassy') {
    pitch = 1.22;
    rateMultiplier = 1.1;
  }

  utterance.rate = Math.max(0.6, Math.min(2.0, baseRate * rateMultiplier));
  utterance.pitch = pitch;

  // Try to find a warm, natural matching voice (Hindi / Indian English / English US)
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const isMale = options.gender === 'male';
    
    // Preference: hi-IN, en-IN, or natural sounding voices
    const preferredVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      const matchesGender = isMale 
        ? (name.includes('male') || name.includes('david') || name.includes('rishi') || name.includes('george'))
        : (name.includes('female') || name.includes('zira') || name.includes('swara') || name.includes('samantha') || name.includes('google uk english female'));
      
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
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Check for Web Speech API recognition
export function createSpeechRecognizer(
  onResult: (text: string, isFinal: boolean) => void,
  onError?: (err: any) => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Web Speech Recognition not available in this browser.");
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Optimized for Hinglish / Indian English accent

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

      if (finalTranscript) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
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
