import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PartnerMood, Habit } from '../types';
import { PhoneOff, Mic, MicOff, Volume2, X, Sparkles } from 'lucide-react';
import { createSpeechRecognizer, playCompanionVoice, stopCompanionVoice } from '../utils/speech';
import { AexoMascot } from './AexoMascot';
import { motion, AnimatePresence } from 'motion/react';

interface LiveCallModalProps {
  isOpen: boolean;
  onClose: (callSummaryText?: string) => void;
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
  const [callStatus, setCallStatus] = useState<'connecting' | 'listening' | 'speaking' | 'processing'>('connecting');
  const [userSpokenText, setUserSpokenText] = useState('');
  const [partnerSpeechText, setPartnerSpeechText] = useState('');
  const [callHistory, setCallHistory] = useState<Array<{ sender: string; text: string }>>([]);

  const recognizerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const companionName = userProfile.partnerName || 'Lexi';

  useEffect(() => {
    if (!isOpen) return;

    timerRef.current = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    const connectTimer = setTimeout(() => {
      setCallStatus('speaking');
      const greeting = `Hello ${userProfile.name}! Bolo na baby, main sun rahi hoon. Aaj din kaisa jaa raha hai?`;
      setPartnerSpeechText(greeting);
      setCallHistory([{ sender: companionName, text: greeting }]);

      playCompanionVoice(greeting, {
        gender: userProfile.voiceGender,
        emotion: partnerMood.score < 50 ? 'angry' : 'loving',
        onEnd: () => {
          setCallStatus('listening');
          startListening();
        },
      });
    }, 800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearTimeout(connectTimer);
      stopListening();
      stopCompanionVoice();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const startListening = () => {
    if (isMuted) return;
    stopListening();

    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        setUserSpokenText(transcript);
        if (isFinal && transcript.trim().length > 2) {
          handleUserUtterance(transcript.trim());
        }
      },
      () => {}
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      recognizer.start();
    }
  };

  const stopListening = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch {}
      recognizerRef.current = null;
    }
  };

  const handleUserUtterance = async (utterance: string) => {
    stopListening();
    setCallStatus('processing');
    setUserSpokenText(utterance);

    const updatedHistory = [...callHistory, { sender: userProfile.name, text: utterance }];
    setCallHistory(updatedHistory);

    try {
      const res = await fetch('/api/call-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spokenText: utterance,
          history: updatedHistory,
          userProfile,
          partnerMood,
          habits,
        }),
      });

      const data = await res.json();
      const reply = data.callReply || "Main sun rahi hoon jaan, bolo!";
      setPartnerSpeechText(reply);
      setCallHistory((prev) => [...prev, { sender: companionName, text: reply }]);

      if (data.detectedHabitAction) {
        onHabitDetectedInCall(data.detectedHabitAction);
      }

      setCallStatus('speaking');
      playCompanionVoice(reply, {
        gender: userProfile.voiceGender,
        emotion: data.emotion || 'caring',
        onEnd: () => {
          setCallStatus('listening');
          setUserSpokenText('');
          startListening();
        },
      });
    } catch {
      const fallbackReply = "Baby, connection thoda slow hai par main yahin hoon tumhare sath!";
      setPartnerSpeechText(fallbackReply);
      setCallStatus('speaking');
      playCompanionVoice(fallbackReply, {
        gender: userProfile.voiceGender,
        emotion: 'caring',
        onEnd: () => {
          setCallStatus('listening');
          startListening();
        },
      });
    }
  };

  const handleEndCall = () => {
    stopListening();
    stopCompanionVoice();
    const duration = `${Math.floor(callSeconds / 60)}m ${callSeconds % 60}s`;
    const summary = `Voice Call with ${companionName} (${duration}) - Topic: "${partnerSpeechText.slice(0, 45) || 'Daily Check-in'}"`;
    onClose(summary);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xl animate-in fade-in select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-md h-[580px] rounded-[32px] glass-strong p-6 flex flex-col justify-between overflow-hidden shadow-[0_24px_64px_rgba(124,58,237,0.22)] border border-[rgba(124,58,237,0.2)]"
      >
        {/* Soft atmospheric gradient glow behind orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-tr from-[#7C3AED]/25 via-[#A78BFA]/20 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4CB782] animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                Live with {companionName}
              </h3>
              <p className="text-[11px] text-[#6B6B76] dark:text-[#A78BFA] font-mono">
                {formatTimer(callSeconds)}
              </p>
            </div>
          </div>

          <button
            onClick={handleEndCall}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[#6B6B76] dark:text-[#FAF7FF] transition-colors cursor-pointer"
            title="End Call"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Reactive Companion Orb + Aura */}
        <div className="flex-1 flex flex-col items-center justify-center my-auto z-10">
          <div className="relative flex items-center justify-center mb-6">
            <motion.div
              animate={{
                scale: callStatus === 'speaking' ? [1, 1.08, 1] : callStatus === 'listening' ? [1, 1.04, 1] : 1,
              }}
              transition={{ repeat: Infinity, duration: callStatus === 'speaking' ? 1.6 : 3, ease: 'easeInOut' }}
              className="w-44 h-44 rounded-full bg-gradient-to-tr from-[#7C3AED]/30 via-[#A78BFA]/25 to-purple-400/20 blur-2xl absolute -z-10"
            />
            <div className="w-36 h-36 rounded-full border border-white/60 dark:border-white/15 flex items-center justify-center bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-inner">
              <AexoMascot
                size="lg"
                isListening={callStatus === 'listening'}
                isSpeaking={callStatus === 'speaking'}
                showAura={true}
              />
            </div>
          </div>

          {/* Equalizer Frequency Bars */}
          <div className="flex items-center gap-1.5 h-8 mb-3 px-4">
            {[12, 24, 34, 18, 28, 16, 38, 26, 32, 14, 40, 22, 28, 18, 10].map((h, i) => (
              <div
                key={i}
                style={{
                  height:
                    callStatus === 'speaking' || callStatus === 'listening'
                      ? `${Math.max(6, (h * ((i + callSeconds * 3) % 4 + 1)) / 3.5)}px`
                      : '5px',
                }}
                className="w-1 rounded-full bg-[#7C3AED] transition-all duration-200"
              />
            ))}
          </div>

          {/* State Pill */}
          <div className="px-4 py-1.5 rounded-full bg-white/70 dark:bg-white/10 border border-white/80 dark:border-white/15 text-xs font-semibold text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-2 shadow-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                callStatus === 'speaking'
                  ? 'bg-[#7C3AED] animate-ping'
                  : callStatus === 'listening'
                  ? 'bg-[#4CB782] animate-pulse'
                  : 'bg-[#A78BFA]'
              }`}
            />
            <span className="capitalize">
              {callStatus === 'speaking'
                ? 'Speaking...'
                : callStatus === 'listening'
                ? 'Listening'
                : callStatus === 'processing'
                ? 'Thinking...'
                : 'Connecting...'}
            </span>
          </div>

          {/* Live Subtitle Transcript */}
          <div className="mt-3 px-4 text-center max-w-xs min-h-[44px] flex items-center justify-center">
            {callStatus === 'speaking' && partnerSpeechText ? (
              <p className="text-xs text-[#7C3AED] dark:text-[#A78BFA] font-medium leading-relaxed line-clamp-2">
                &ldquo;{partnerSpeechText}&rdquo;
              </p>
            ) : userSpokenText ? (
              <p className="text-xs text-[#6B6B76] dark:text-[#FAF7FF] italic line-clamp-2">
                &ldquo;{userSpokenText}&rdquo;
              </p>
            ) : (
              <p className="text-[11px] text-[#9A9AA5] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Speak naturally or tap a quick prompt</span>
              </p>
            )}
          </div>
        </div>

        {/* Quick Voice Prompts */}
        <div className="z-10 mb-3 flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          {[
            'Maine gym complete kar liya! 💪',
            'Dawai time pe le li 💊',
            'Aaj ka schedule kya hai?',
            'Thoda low feel ho raha hai',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUserSpokenText(prompt);
                handleUserUtterance(prompt);
              }}
              className="px-3 py-1 rounded-full text-[11px] whitespace-nowrap bg-white/70 dark:bg-white/10 hover:bg-[#F3EBFF] text-[#6B6B76] dark:text-[#C4B5FD] hover:text-[#7C3AED] border border-[rgba(124,58,237,0.15)] shrink-0 transition-transform active:scale-95 cursor-pointer font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Floating Controls Footer */}
        <div className="flex items-center justify-center gap-6 pt-3 border-t border-[rgba(124,58,237,0.14)] z-10">
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) stopListening();
              else startListening();
            }}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/15 text-rose-500 border border-rose-300'
                : 'glass text-[#1A1A1F] dark:text-[#FAF7FF]'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Hangup Button */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              if (window.speechSynthesis.speaking) stopCompanionVoice();
            }}
            className="p-3 rounded-full glass text-[#1A1A1F] dark:text-[#FAF7FF] transition-all cursor-pointer"
            title="Mute Audio Output"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
