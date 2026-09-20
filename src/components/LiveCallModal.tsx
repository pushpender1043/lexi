import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, PartnerMood, Habit } from '../types';
import { PhoneOff, Mic, MicOff, Volume2, X, SlidersHorizontal } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 dark:bg-black/70 backdrop-blur-md animate-in fade-in select-none">
      {/* Container Matching PDF Page 5: Clean, Minimal, Purple-Lavender Aesthetic */}
      <div className="relative w-full max-w-sm sm:max-w-md h-[560px] sm:h-[600px] rounded-3xl bg-gradient-to-b from-[#FAF8FF] via-[#FFFFFF] to-[#F5F2FC] dark:from-[#130F20] dark:via-[#161224] dark:to-[#0F0C1B] border border-purple-200/80 dark:border-purple-800/40 shadow-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
        
        {/* Top Bar (Page 5 in PDF) */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Live with {userProfile.partnerName || 'Aexo'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.speechSynthesis.speaking) stopCompanionVoice();
              }}
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-purple-100/50 dark:hover:bg-white/5 transition-colors"
              title="Sound Equalizer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              id="close-call-btn"
              onClick={handleEndCall}
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-purple-100/50 dark:hover:bg-white/5 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Mascot + Soft Glowing Aura (Page 5 in PDF) */}
        <div className="flex-1 flex flex-col items-center justify-center my-auto z-10">
          <div className="relative flex items-center justify-center mb-6">
            {/* Glowing circular aura */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-purple-300/30 via-violet-200/20 to-purple-400/20 blur-2xl absolute -z-10" />
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-center bg-white/40 dark:bg-white/2 backdrop-blur-xs">
              <AexoMascot
                size="lg"
                isListening={callStatus === 'listening'}
                isSpeaking={callStatus === 'speaking'}
                showAura={true}
              />
            </div>
          </div>

          {/* Equalizer Frequency Bars (Page 5 in PDF) */}
          <div className="flex items-center gap-1.5 h-10 mb-4 px-4">
            {[14, 26, 38, 20, 32, 18, 42, 28, 36, 16, 44, 24, 30, 20, 12].map((height, idx) => (
              <div
                key={idx}
                style={{
                  height: callStatus === 'speaking' || callStatus === 'listening' 
                    ? `${Math.max(6, (height * ((idx + callSeconds * 3) % 5 + 1)) / 4)}px`
                    : '6px',
                }}
                className="w-1 rounded-full bg-purple-500/80 dark:bg-purple-400 transition-all duration-200"
              />
            ))}
          </div>

          {/* Status Badge */}
          <div className="px-5 py-1.5 rounded-full bg-white dark:bg-white/5 border border-purple-100 dark:border-white/10 shadow-xs text-xs font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
            {callStatus === 'speaking' ? 'Speaking...' : callStatus === 'listening' ? 'Listening' : callStatus === 'processing' ? 'Thinking...' : 'Connecting...'}
          </div>

          {/* Subtitle / Live Transcript preview */}
          <div className="mt-4 px-4 py-2 text-center max-w-xs min-h-[44px] flex items-center justify-center">
            {callStatus === 'speaking' && partnerSpeechText ? (
              <p className="text-xs text-purple-900 dark:text-purple-200 font-medium leading-relaxed animate-fade-in">
                "{partnerSpeechText}"
              </p>
            ) : userSpokenText ? (
              <p className="text-xs text-zinc-600 dark:text-zinc-300 italic">
                "{userSpokenText}"
              </p>
            ) : (
              <p className="text-[11px] text-zinc-400">
                Speak naturally or tap a quick phrase below
              </p>
            )}
          </div>
        </div>

        {/* Quick Voice Prompts for Accessibility */}
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
              className="px-3 py-1 rounded-full text-[11px] whitespace-nowrap bg-white/80 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-100 dark:border-white/10 text-zinc-700 dark:text-zinc-300 transition-all shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Call Controls Footer (Page 5 in PDF) */}
        <div className="flex items-center justify-center gap-5 pt-3 border-t border-purple-100 dark:border-white/5 z-10">
          {/* Mute Mic toggle */}
          <button
            id="call-mute-mic-btn"
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) stopListening();
              else startListening();
            }}
            className={`p-3 rounded-full border transition-all ${
              isMuted
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-purple-100 dark:border-white/10 hover:bg-purple-50'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Red/Coral Large Hangup Button (Page 5 in PDF) */}
          <button
            id="call-hangup-btn"
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-[#EA4335] hover:bg-red-600 text-white shadow-lg shadow-red-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
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
            className="p-3 rounded-full bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-purple-100 dark:border-white/10 hover:bg-purple-50 transition-all"
            title="Silence Audio"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
