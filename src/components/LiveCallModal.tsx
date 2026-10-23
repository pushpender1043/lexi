import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PartnerMood, Habit } from '../types';
import { PhoneOff, Mic, MicOff, Volume2, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { createSpeechRecognizer, playCompanionVoice, stopCompanionVoice } from '../utils/speech';
import { AexoMascot } from './AexoMascot';

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

  // Call timer counter
  useEffect(() => {
    if (!isOpen) return;

    timerRef.current = setInterval(() => {
      setCallSeconds(prev => prev + 1);
    }, 1000);

    // Initial greeting when call connects
    const connectTimer = setTimeout(() => {
      setCallStatus('speaking');
      const greeting = `Hello ${userProfile.name}! Bolo na baby, main sun rahi hoon. Aaj sab theek chal raha hai?`;
      setPartnerSpeechText(greeting);
      setCallHistory([{ sender: userProfile.partnerName, text: greeting }]);

      playCompanionVoice(greeting, {
        gender: userProfile.voiceGender,
        emotion: partnerMood.score < 50 ? 'angry' : 'loving',
        onEnd: () => {
          setCallStatus('listening');
          startListening();
        },
      });
    }, 900);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearTimeout(connectTimer);
      stopListening();
      stopCompanionVoice();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Speech recognition listener
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
      () => {
        // Recognition ended
      }
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
      } catch {
        // ignore
      }
      recognizerRef.current = null;
    }
  };

  // Process user's spoken sentence
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
      setCallHistory(prev => [...prev, { sender: userProfile.partnerName, text: reply }]);

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
      const fallbackReply = "Baby, signal thoda weak hai par main yahin hoon tumhare sath!";
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
    const summary = `Voice Call with ${userProfile.partnerName} (${duration}) - Last topic: "${partnerSpeechText.slice(0, 45) || 'Checked in'}"`;
    onClose(summary);
  };

  const triggerQuickSpeech = (txt: string) => {
    setUserSpokenText(txt);
    handleUserUtterance(txt);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in select-none">
      {/* Lexi Translucent Glass Modal (Radius: 28px) */}
      <div className="relative w-full max-w-sm sm:max-w-md h-[580px] rounded-[28px] glass-strong p-6 flex flex-col justify-between overflow-hidden shadow-[var(--shadow-glass)] border border-[var(--border)]">
        
        {/* Soft lavender decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-44 bg-[var(--soft-lavender)]/25 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Top Bar */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--success-green)] animate-pulse shadow-[0_0_8px_var(--success-green)]" />
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                Live with {userProfile.partnerName || 'Lexi'}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">
                {formatTimer(callSeconds)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (window.speechSynthesis.speaking) stopCompanionVoice();
              }}
              className="p-2 rounded-[12px] glass-button text-[var(--text-secondary)] hover:text-[var(--primary-purple)]"
              title="Silence audio"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              id="close-call-btn"
              onClick={handleEndCall}
              className="p-2 rounded-[12px] glass-button text-[var(--text-secondary)] hover:text-[var(--primary-purple)]"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Mascot + Soft Glowing Aura */}
        <div className="flex-1 flex flex-col items-center justify-center my-auto z-10">
          <div className="relative flex items-center justify-center mb-5">
            {/* Glowing circular aura */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-[var(--soft-lavender)]/35 via-[var(--primary-purple)]/20 to-[var(--soft-lavender)]/25 blur-2xl absolute -z-10" />
            <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full border border-[var(--border)] flex items-center justify-center bg-white/40 dark:bg-white/5 backdrop-blur-sm shadow-inner">
              <AexoMascot
                size="lg"
                isListening={callStatus === 'listening'}
                isSpeaking={callStatus === 'speaking'}
                showAura={true}
              />
            </div>
          </div>

          {/* Equalizer Frequency Bars */}
          <div className="flex items-center gap-1.5 h-10 mb-3 px-4">
            {[14, 26, 38, 20, 32, 18, 42, 28, 36, 16, 44, 24, 30, 20, 12].map((height, idx) => (
              <div
                key={idx}
                style={{
                  height: callStatus === 'speaking' || callStatus === 'listening' 
                    ? `${Math.max(6, (height * ((idx + callSeconds * 3) % 5 + 1)) / 4)}px`
                    : '6px',
                }}
                className="w-1 rounded-full bg-[var(--primary-purple)] transition-all duration-200"
              />
            ))}
          </div>

          {/* Status Badge */}
          <div className="px-4 py-1.5 rounded-full glass border border-[var(--border)] shadow-xs text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              callStatus === 'speaking' ? 'bg-[var(--primary-purple)] animate-ping' :
              callStatus === 'listening' ? 'bg-[var(--success-green)] animate-pulse' :
              'bg-[var(--soft-lavender)]'
            }`} />
            <span className="capitalize">
              {callStatus === 'speaking' ? 'Speaking...' : callStatus === 'listening' ? 'Listening' : callStatus === 'processing' ? 'Thinking...' : 'Connecting...'}
            </span>
          </div>

          {/* Subtitle / Live Transcript preview */}
          <div className="mt-3 px-4 py-1 text-center max-w-xs min-h-[44px] flex items-center justify-center">
            {callStatus === 'speaking' && partnerSpeechText ? (
              <p className="text-xs text-[var(--primary-purple)] font-medium leading-relaxed animate-fade-in line-clamp-2">
                "{partnerSpeechText}"
              </p>
            ) : userSpokenText ? (
              <p className="text-xs text-[var(--text-secondary)] italic line-clamp-2">
                "{userSpokenText}"
              </p>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[var(--soft-lavender)]" />
                <span>Speak naturally or tap a quick prompt</span>
              </p>
            )}
          </div>
        </div>

        {/* Quick Voice Prompts */}
        <div className="z-10 mb-3 flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {[
            "Maine gym complete kar liya! 💪",
            "Dawai time pe li thi 💊",
            "Next schedule kya hai?",
            "Thoda tired feel kar raha hoon",
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => triggerQuickSpeech(prompt)}
              className="px-3 py-1 rounded-full text-[11px] whitespace-nowrap glass-button text-[var(--text-secondary)] hover:text-[var(--primary-purple)] border border-[var(--border)] shrink-0 transition-transform active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Call Controls Footer */}
        <div className="flex items-center justify-center gap-5 pt-3 border-t border-[var(--border)] z-10">
          {/* Mute Mic toggle */}
          <button
            id="call-mute-mic-btn"
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) stopListening();
              else startListening();
            }}
            className={`p-3 rounded-full border transition-all hover:scale-105 active:scale-95 ${
              isMuted
                ? 'bg-rose-500/10 text-rose-500 border-rose-300'
                : 'glass-button text-[var(--text-primary)] border-[var(--border)]'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Large Hangup Button */}
          <button
            id="call-hangup-btn"
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Voice Output Stop / Speaker */}
          <button
            id="call-speaker-btn"
            onClick={() => {
              if (window.speechSynthesis.speaking) {
                stopCompanionVoice();
              }
            }}
            className="p-3 rounded-full glass-button text-[var(--text-primary)] border border-[var(--border)] transition-transform hover:scale-105 active:scale-95"
            title="Silence Audio"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
