import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PartnerMood, Habit, MoodStatus } from '../types';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Subtitles,
  CheckCircle2,
} from 'lucide-react';
import {
  createSpeechRecognizer,
  playCompanionVoice,
  stopCompanionVoice,
  startMicrophoneAudioAnalyzer,
} from '../utils/speech';
import { AexoMascot } from './AexoMascot';
import { motion, AnimatePresence } from 'motion/react';
import { authFetch } from '../lib/firebase';

export interface CallEndPayload {
  durationSec: number;
  summary: string;
  topic: string;
  moodDuringCall: MoodStatus;
}

interface LiveCallModalProps {
  isOpen: boolean;
  onClose: (payload?: CallEndPayload) => void;
  userProfile: UserProfile;
  partnerMood: PartnerMood;
  habits: Habit[];
  onHabitDetectedInCall: (action: string) => void;
}

export const LiveCallModal: React.FC<LiveCallModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  partnerMood,
  habits,
  onHabitDetectedInCall,
}) => {
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'listening' | 'speaking' | 'processing'>('connecting');
  const [userSpokenText, setUserSpokenText] = useState('');
  const [partnerSpeechText, setPartnerSpeechText] = useState('');
  const [callHistory, setCallHistory] = useState<Array<{ sender: string; text: string }>>([]);
  const [detectedHabitNotice, setDetectedHabitNotice] = useState<string | null>(null);

  // Equalizer frequency visualizer state
  const [audioFrequencies, setAudioFrequencies] = useState<number[]>(new Array(16).fill(12));
  const [voiceVolume, setVoiceVolume] = useState<number>(0);

  const recognizerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const micAnalyzerCleanupRef = useRef<(() => void) | null>(null);
  const callStatusRef = useRef(callStatus);
  const isMutedRef = useRef(isMuted);
  const isSpeakerMutedRef = useRef(isSpeakerMuted);
  const isProcessingTurnRef = useRef(false);
  const lastSubmittedUtteranceRef = useRef<{ text: string; at: number }>({ text: '', at: 0 });
  const isUnmountedRef = useRef(false);

  callStatusRef.current = callStatus;
  isMutedRef.current = isMuted;
  isSpeakerMutedRef.current = isSpeakerMuted;

  const companionName = userProfile.partnerName || 'Lexi';

  // 1. Initialize Call Timer & Real Microphone Equalizer
  useEffect(() => {
    if (!isOpen) return;
    isUnmountedRef.current = false;

    // Start Call Timer
    timerRef.current = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    // Initialize Web Audio API Microphone Analyzer
    const cleanupAnalyzer = startMicrophoneAudioAnalyzer((frequencies, volume) => {
      if (isUnmountedRef.current) return;
      setAudioFrequencies(frequencies);
      setVoiceVolume(volume);

      // Barge-in detection using live ref (prevents stale closure)
      if (volume > 68 && callStatusRef.current === 'speaking') {
        handleBargeInInterruption();
      }
    });
    micAnalyzerCleanupRef.current = cleanupAnalyzer;

    // Initial greeting from companion
    const connectTimer = setTimeout(() => {
      if (isUnmountedRef.current) return;
      const dynamic = userProfile.relationshipDynamic || 'sweet_loving';
      const isMale = userProfile.partnerGender === 'male';
      let greeting = `Hello ${userProfile.name}! Bolo na baby, main sun rahi hoon. Aaj din kaisa jaa raha hai?`;
      if (dynamic === 'disciplined_coach') {
        greeting = `Hey ${userProfile.name}! Coach here, locked in. Aaj ke routine ka kya status hai, batao!`;
      } else if (dynamic === 'playful_teasing') {
        greeting = `Hello ${userProfile.name}! Haan yaar bolo, kya scene hai? Sun ${isMale ? 'raha' : 'rahi'} hoon!`;
      } else if (dynamic === 'calm_soulmate') {
        greeting = `Hello ${userProfile.name}. Main yahin hoon, aaram se bataiye aaj din kaisa jaa raha hai.`;
      } else if (isMale) {
        greeting = `Hello ${userProfile.name}! Bolo meri jaan, main sun raha hoon. Aaj din kaisa jaa raha hai?`;
      }
      setPartnerSpeechText(greeting);
      setCallHistory([{ sender: companionName, text: greeting }]);
      setCallStatus('speaking');

      if (!isSpeakerMutedRef.current) {
        playCompanionVoice(greeting, {
          gender: userProfile.voiceGender,
          preferredVoiceName: userProfile.preferredVoiceName,
          emotion: dynamic === 'disciplined_coach' ? 'proud' : partnerMood.score < 50 ? 'angry' : 'loving',
          tone: userProfile.voiceToneStyle || 'sweet',
          rate: userProfile.voiceSpeed || 1.0,
          useGeminiTts: true,
          onEnd: () => {
            if (isUnmountedRef.current) return;
            setCallStatus('listening');
            startListening();
          },
        });
      } else {
        setCallStatus('listening');
        startListening();
      }
    }, 900);

    return () => {
      isUnmountedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      clearTimeout(connectTimer);
      if (micAnalyzerCleanupRef.current) {
        micAnalyzerCleanupRef.current();
      }
      stopListening();
      stopCompanionVoice();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // 2. Barge-in / Interruption Handler
  const handleBargeInInterruption = () => {
    stopCompanionVoice();
    setCallStatus('listening');
    startListening();
  };

  // 3. Speech Recognition Engine
  const startListening = () => {
    if (isMutedRef.current || isUnmountedRef.current) return;
    stopListening();

    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        setUserSpokenText(transcript);

        // Reset silence timer on incoming words
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

        if (isFinal && transcript.trim().length > 2) {
          handleUserUtterance(transcript.trim());
        } else if (transcript.trim().length > 3) {
          // Auto-submit after 1.5 seconds of silence
          silenceTimeoutRef.current = setTimeout(() => {
            if (transcript.trim().length > 2 && !isProcessingTurnRef.current) {
              handleUserUtterance(transcript.trim());
            }
          }, 1500);
        }
      },
      (err) => {
        console.warn('Speech recognition status:', err);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
      } catch {}
    }
  };

  const stopListening = () => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch {}
      recognizerRef.current = null;
    }
  };

  // 4. Handle Conversation Turn
  const handleUserUtterance = async (utterance: string) => {
    const trimmed = utterance.trim();
    if (!trimmed || isProcessingTurnRef.current) return;
    const now = Date.now();
    if (
      lastSubmittedUtteranceRef.current.text === trimmed &&
      now - lastSubmittedUtteranceRef.current.at < 2500
    ) {
      return;
    }

    isProcessingTurnRef.current = true;
    lastSubmittedUtteranceRef.current = { text: trimmed, at: now };
    stopListening();
    setCallStatus('processing');
    setUserSpokenText(trimmed);

    const updatedHistory = [...callHistory, { sender: userProfile.name, text: trimmed }];
    setCallHistory(updatedHistory);

    try {
      const res = await authFetch('/api/call-turn', {
        method: 'POST',
        body: JSON.stringify({
          spokenText: trimmed,
          history: updatedHistory.slice(-8),
          userProfile,
          partnerMood,
          habits,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Call turn error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.callReply;
      if (!reply) {
        throw new Error("No call speech response from server");
      }
      if (isUnmountedRef.current) return;
      setPartnerSpeechText(reply);
      setCallHistory((prev) => [...prev, { sender: companionName, text: reply }]);

      // Habit Detection inside Call
      if (data.habitUpdateDetected) {
        setDetectedHabitNotice(`Habit detected: ${data.habitUpdateDetected}`);
        onHabitDetectedInCall(data.habitUpdateDetected);
        setTimeout(() => {
          if (!isUnmountedRef.current) setDetectedHabitNotice(null);
        }, 3500);
      }

      setCallStatus('speaking');

      if (!isSpeakerMutedRef.current) {
        playCompanionVoice(reply, {
          gender: userProfile.voiceGender,
          preferredVoiceName: userProfile.preferredVoiceName,
          emotion: data.emotion || 'caring',
          tone: userProfile.voiceToneStyle || 'sweet',
          rate: userProfile.voiceSpeed || 1.0,
          useGeminiTts: true,
          onEnd: () => {
            if (isUnmountedRef.current) return;
            setCallStatus('listening');
            setUserSpokenText('');
            startListening();
          },
        });
      } else {
        // Speaker is muted, auto resume listening after read delay
        setTimeout(() => {
          if (isUnmountedRef.current) return;
          setCallStatus('listening');
          setUserSpokenText('');
          startListening();
        }, Math.max(2000, reply.length * 50));
      }
    } catch {
      if (isUnmountedRef.current) return;
      const dynamic = userProfile.relationshipDynamic || 'sweet_loving';
      const isMale = userProfile.partnerGender === 'male';
      let fallbackReply = 'Baby, aawaz thodi cut gayi... Par main yahin hoon tumhare sath!';
      if (dynamic === 'disciplined_coach') {
        fallbackReply = `Champ, connection thoda break hua... Main sun ${isMale ? 'raha' : 'rahi'} hoon, continue karo!`;
      } else if (dynamic === 'playful_teasing') {
        fallbackReply = `Arey aawaz kat gayi yaar! Sun ${isMale ? 'raha' : 'rahi'} hoon, dobara bolo!`;
      } else if (dynamic === 'calm_soulmate') {
        fallbackReply = `Aawaz thodi break ho gayi... Main yahin hoon, aaram se boliye.`;
      } else if (isMale) {
        fallbackReply = 'Meri jaan, aawaz thodi cut gayi... Par main yahin hoon tumhare sath!';
      }
      setPartnerSpeechText(fallbackReply);
      setCallStatus('speaking');
      if (!isSpeakerMutedRef.current) {
        playCompanionVoice(fallbackReply, {
          gender: userProfile.voiceGender,
          preferredVoiceName: userProfile.preferredVoiceName,
          emotion: dynamic === 'disciplined_coach' ? 'proud' : 'caring',
          onEnd: () => {
            if (isUnmountedRef.current) return;
            setCallStatus('listening');
            startListening();
          },
        });
      } else {
        setCallStatus('listening');
        startListening();
      }
    } finally {
      isProcessingTurnRef.current = false;
    }
  };

  // 5. Hangup & Produce Structured Call Summary
  const handleEndCall = () => {
    stopListening();
    stopCompanionVoice();

    const mins = Math.floor(callSeconds / 60);
    const secs = callSeconds % 60;
    const formattedDuration = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    const topic = partnerSpeechText.slice(0, 50) || 'Daily Check-in & Habit Tracking';
    const summary = `Voice Call with ${companionName} (${formattedDuration}) • "${topic}"`;

    onClose({
      durationSec: callSeconds,
      summary,
      topic,
      moodDuringCall: partnerMood.status,
    });
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-md h-[610px] rounded-[32px] glass-strong p-6 flex flex-col justify-between overflow-hidden border border-white/60 dark:border-white/22 shadow-[0_28px_72px_rgba(0,0,0,0.75)]"
      >
        {/* Soft atmospheric gradient glow behind orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-[#896ABD]/30 via-[#A855F7]/22 to-sky-400/12 blur-3xl pointer-events-none -z-10" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4CB782] animate-pulse" />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-[#14121C] dark:text-[#F8F7FC]">
                  Live with {companionName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3EBFF] dark:bg-[rgba(168,85,247,0.22)] text-[#7C3AED] dark:text-[#E9D5FF] border border-transparent dark:border-[#A855F7]/30 uppercase tracking-wider">
                  HD Voice
                </span>
              </div>
              <p className="text-[11px] text-[#534E68] dark:text-[#C4B5FD] font-mono tabular-nums">
                {formatTimer(callSeconds)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Captions */}
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                showCaptions
                  ? 'bg-[#F3EBFF] dark:bg-[rgba(168,85,247,0.28)] border-transparent dark:border-[#A855F7]/40 text-[#7C3AED] dark:text-[#F8F7FC]'
                  : 'bg-black/5 dark:bg-white/[0.06] border-transparent dark:border-white/10 text-[#534E68] dark:text-[#938CA8]'
              }`}
              title={showCaptions ? 'Hide Captions' : 'Show Captions'}
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Hangup Quick Close */}
            <button
              onClick={handleEndCall}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/[0.06] border border-transparent dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#534E68] dark:text-[#F8F7FC] transition-colors cursor-pointer"
              title="End Call"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Detected Habit Toast inside Call */}
        <AnimatePresence>
          {detectedHabitNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 left-6 right-6 z-20 px-3.5 py-2 rounded-xl bg-[#4CB782]/90 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg backdrop-blur-md"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{detectedHabitNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Reactive Companion Orb + Real Audio Aura */}
        <div className="flex-1 flex flex-col items-center justify-center my-auto z-10">
          <div
            onClick={callStatus === 'speaking' ? handleBargeInInterruption : undefined}
            className={`relative flex items-center justify-center mb-5 ${
              callStatus === 'speaking' ? 'cursor-pointer' : ''
            }`}
            title={callStatus === 'speaking' ? 'Click to interrupt' : undefined}
          >
            {/* Pulsing Aura reacting to audio volume */}
            <motion.div
              animate={{
                scale:
                  callStatus === 'speaking'
                    ? [1, 1.12, 1]
                    : callStatus === 'listening'
                    ? [1, Math.min(1.25, 1 + voiceVolume / 100), 1]
                    : 1,
              }}
              transition={{
                repeat: Infinity,
                duration: callStatus === 'speaking' ? 1.5 : 2.5,
                ease: 'easeInOut',
              }}
              className="w-44 h-44 rounded-full bg-gradient-to-tr from-[#896ABD]/40 via-[#A855F7]/28 to-sky-400/18 blur-2xl absolute -z-10"
            />
            <div className="w-36 h-36 rounded-full border border-white/60 dark:border-white/20 flex items-center justify-center bg-white/50 dark:bg-white/[0.045] backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.3)]">
              <AexoMascot
                size="lg"
                isListening={callStatus === 'listening'}
                isSpeaking={callStatus === 'speaking'}
                showAura={true}
              />
            </div>
          </div>

          {/* Equalizer Frequency Bars driven by Real Mic & Speech */}
          <div className="flex items-center gap-1.5 h-9 mb-3 px-4">
            {audioFrequencies.map((val, i) => {
              const animatedHeight =
                callStatus === 'speaking'
                  ? Math.max(6, ((i % 5 + 1) * 7 * ((callSeconds % 3) + 1)) / 1.8)
                  : callStatus === 'listening'
                  ? Math.max(5, (val / 100) * 36)
                  : 5;

              return (
                <div
                  key={i}
                  style={{
                    height: `${animatedHeight}px`,
                  }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    callStatus === 'speaking'
                      ? 'bg-gradient-to-t from-[#896ABD] to-[#C4B5FD]'
                      : callStatus === 'listening'
                      ? 'bg-[#4CB782]'
                      : 'bg-white/25'
                  }`}
                />
              );
            })}
          </div>

          {/* State Pill */}
          <div className="px-4 py-1.5 rounded-full bg-white/75 dark:bg-transparent dark:glass-pill border border-white/80 dark:border-white/20 text-xs font-semibold text-[#14121C] dark:text-[#F8F7FC] flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                callStatus === 'speaking'
                  ? 'bg-[#A855F7] animate-ping'
                  : callStatus === 'listening'
                  ? 'bg-[#4CB782] animate-pulse'
                  : 'bg-[#C4B5FD]'
              }`}
            />
            <span className="capitalize">
              {callStatus === 'speaking'
                ? 'Speaking (tap to interrupt)'
                : callStatus === 'listening'
                ? 'Listening to you...'
                : callStatus === 'processing'
                ? 'Thinking...'
                : 'Connecting...'}
            </span>
          </div>

          {/* Live Subtitle Transcript */}
          {showCaptions && (
            <div className="mt-3 px-4 text-center max-w-xs min-h-[46px] flex items-center justify-center">
              {callStatus === 'speaking' && partnerSpeechText ? (
                <p className="text-xs text-[#7C3AED] dark:text-[#E9D5FF] font-medium leading-relaxed line-clamp-2">
                  &ldquo;{partnerSpeechText}&rdquo;
                </p>
              ) : userSpokenText ? (
                <p className="text-xs text-[#14121C] dark:text-[#F8F7FC] italic line-clamp-2 font-medium">
                  &ldquo;{userSpokenText}&rdquo;
                </p>
              ) : (
                <p className="text-[11px] text-[#7C7692] dark:text-[#938CA8] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
                  <span>Speak freely in Hinglish or English</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Voice Prompts for instant interaction */}
        <div className="z-10 mb-3 flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          {[
            'Maine gym complete kar liya! 💪',
            'Dawai time pe le li 💊',
            'Aaj ka schedule kya hai?',
            'Thoda low feel ho raha hai',
            'Miss kar raha tha tumhe ❤️',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUserSpokenText(prompt);
                handleUserUtterance(prompt);
              }}
              className="px-3.5 py-1.5 rounded-full text-[11px] whitespace-nowrap bg-white/70 dark:bg-white/[0.07] hover:bg-[#F3EBFF] dark:hover:bg-white/[0.14] text-[#534E68] dark:text-[#E9D5FF] hover:text-[#7C3AED] dark:hover:text-white border border-[rgba(137,106,189,0.2)] dark:border-white/15 shrink-0 transition-all active:scale-95 cursor-pointer font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Floating Controls Footer */}
        <div className="flex items-center justify-center gap-6 pt-3 border-t border-[rgba(137,106,189,0.16)] dark:border-white/12 z-10">
          {/* Mute Mic */}
          <button
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              if (nextMute) stopListening();
              else startListening();
            }}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/18 text-rose-400 border border-rose-400/35'
                : 'glass text-[#14121C] dark:text-[#F8F7FC]'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-[0_10px_28px_rgba(244,63,94,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] border border-rose-300/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Speaker Mute */}
          <button
            onClick={() => {
              const nextSpeakerMute = !isSpeakerMuted;
              setIsSpeakerMuted(nextSpeakerMute);
              if (nextSpeakerMute) stopCompanionVoice();
            }}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              isSpeakerMuted
                ? 'bg-amber-500/18 text-amber-400 border border-amber-400/35'
                : 'glass text-[#14121C] dark:text-[#F8F7FC]'
            }`}
            title={isSpeakerMuted ? 'Unmute Companion Audio' : 'Mute Companion Audio'}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
