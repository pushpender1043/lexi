import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile, PartnerMood } from '../types';
import { AexoMascot } from './AexoMascot';
import {
  Send,
  Mic,
  MicOff,
  Phone,
  ArrowLeft,
  Volume2,
  CheckCheck,
  Search,
  X,
  Trash2,
  Play,
  Pause,
  Sparkles,
} from 'lucide-react';
import { createSpeechRecognizer, playCompanionVoice } from '../utils/speech';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, type?: 'text' | 'voice_note') => void;
  isLoading: boolean;
  userProfile: UserProfile;
  partnerMood: PartnerMood;
  voiceEnabled: boolean;
  onStartCall: () => void;
  onBack?: () => void;
  onClearConversation?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  userProfile,
  partnerMood,
  voiceEnabled,
  onStartCall,
  onBack,
  onClearConversation,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const partnerName = userProfile.partnerName || 'Lexi';

  // Auto-scroll on new message or loading state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus search input when toggled open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Voice recording using speech recognition
  const startVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    const recognizer = createSpeechRecognizer(
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      (err) => {
        console.warn('Speech recognition notice:', err);
        setIsRecording(false);
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        recognitionRef.current = recognizer;
        setIsRecording(true);
      } catch (err) {
        console.error('Recognizer error:', err);
        setIsRecording(false);
      }
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), isRecording ? 'voice_note' : 'text');
    setInputText('');
    stopVoiceRecording();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePlayVoice = (msg: ChatMessage) => {
    if (playingMessageId === msg.id) {
      window.speechSynthesis.cancel();
      setPlayingMessageId(null);
      return;
    }

    setPlayingMessageId(msg.id);
    playCompanionVoice(msg.text, {
      gender: userProfile.voiceGender,
      tone: userProfile.voiceToneStyle || 'playful',
      rate: userProfile.voiceSpeed || 1.0,
      emotion: partnerMood.score < 50 ? 'angry' : 'loving',
      onEnd: () => setPlayingMessageId(null),
    });
  };

  const companionPrompts = [
    'Hey Lexi, how was your day? ❤️',
    'Hold me accountable for my habits today 💪',
    'I just finished my focus session! ✨',
    'Need a quick mood boost, talk to me? 🥺',
  ];

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredMessages = trimmedQuery
    ? messages.filter((m) => m.text.toLowerCase().includes(trimmedQuery))
    : messages;

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full select-none relative overflow-hidden glass rounded-[24px] shadow-[0_12px_40px_rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.15)] animate-in fade-in duration-200">
      
      {/* Top Bar: Clean Header with Prominent, Always-Visible Back to Home Button */}
      <div className="px-3 sm:px-5 py-3 bg-white/80 dark:bg-[#150F28]/85 backdrop-blur-2xl border-b border-[rgba(124,58,237,0.12)] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* ALWAYS VISIBLE Back to Home Button */}
          <button
            id="chat-back-button"
            onClick={() => {
              if (onBack) onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] hover:bg-[#7C3AED] hover:text-white text-[#7C3AED] dark:text-[#C4B5FD] text-xs font-bold transition-all border border-[rgba(124,58,237,0.2)] shadow-xs shrink-0 cursor-pointer active:scale-95"
            title="Return to Home Dashboard"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Home</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <AexoMascot size="sm" isSpeaking={isLoading} />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4CB782] ring-2 ring-white dark:ring-[#150F28]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF] leading-tight">
                  {partnerName}
                </span>
                <span className="text-[10px] text-[#4CB782] font-bold px-1.5 py-0.2 rounded-full bg-[#4CB782]/10 border border-[#4CB782]/30">
                  Online
                </span>
              </div>
              {isLoading ? (
                <span className="text-[10px] font-semibold text-[#7C3AED] animate-pulse block">
                  typing...
                </span>
              ) : (
                <span className="text-[10px] text-[#6B6B76] dark:text-[#A78BFA] block">
                  Always here for you
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Header Actions: Search, Clear Conversation, Call */}
        <div className="flex items-center gap-1.5">
          <button
            id="chat-top-search-btn"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`p-2 rounded-[12px] transition-all cursor-pointer active:scale-95 ${
              isSearchOpen || searchQuery
                ? 'bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.3)] text-[#7C3AED] dark:text-[#C4B5FD]'
                : 'text-[#6B6B76] hover:text-[#1A1A1F] dark:text-[#9A9AA5] dark:hover:text-[#FAF7FF] hover:bg-white/60 dark:hover:bg-white/10'
            }`}
            title="Search messages"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            id="chat-top-clear-btn"
            onClick={() => setShowClearConfirm(true)}
            className="p-2 rounded-[12px] text-[#6B6B76] hover:text-rose-600 dark:text-[#9A9AA5] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer active:scale-95"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            id="chat-top-call-btn"
            onClick={onStartCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 ml-1 cursor-pointer"
            title={`Voice call ${partnerName}`}
          >
            <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline">Call</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar (when opened) */}
      {isSearchOpen && (
        <div
          id="chat-search-bar"
          className="px-4 py-2 bg-[#FAF7FF]/90 dark:bg-[#150F28]/90 border-b border-[rgba(124,58,237,0.12)] flex items-center gap-2 animate-in slide-in-from-top-1 duration-150 shrink-0"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="w-3.5 h-3.5 text-[#9A9AA5] absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search messages with ${partnerName}...`}
              className="w-full glass-input pl-9 pr-8 py-1.5 text-xs text-[#1A1A1F] dark:text-[#FAF7FF] placeholder-[#9A9AA5] focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 rounded-full text-[#9A9AA5] hover:text-[#1A1A1F]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-[#6B6B76] hover:text-[#1A1A1F] dark:text-[#C4B5FD] px-2 py-1 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* Message Feed Area - Independent Scrolling */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3.5 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <AexoMascot size="lg" className="mb-3" />
            <h3 className="text-base font-bold text-[#1A1A1F] dark:text-[#FAF7FF] mb-1">
              Chat with {partnerName}
            </h3>
            <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD] mb-5 max-w-xs">
              Talk about your habits, your day, or just check in.
            </p>

            <div className="w-full max-w-sm space-y-2">
              {companionPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  className="w-full py-2.5 px-3.5 rounded-[12px] glass hover:border-[#7C3AED] hover:bg-[#F3EBFF] dark:hover:bg-white/10 text-xs font-semibold text-[#1A1A1F] dark:text-[#FAF7FF] hover:text-[#7C3AED] shadow-2xs transition-all text-left block cursor-pointer active:scale-[0.99]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const isPlaying = playingMessageId === msg.id;

            return (
              <div
                key={msg.id ? `${msg.id}-${index}` : `msg-${index}`}
                className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="shrink-0 mb-1">
                    <AexoMascot size="sm" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 leading-relaxed text-xs sm:text-sm ${
                    isUser
                      ? 'chat-bubble-out'
                      : 'chat-bubble-in'
                  }`}
                >
                  {/* Voice Note Player */}
                  {msg.type === 'voice_note' && (
                    <div className="mb-2 p-2 rounded-xl bg-black/10 dark:bg-white/10 flex items-center gap-2">
                      <button
                        onClick={() => handlePlayVoice(msg)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isUser ? 'bg-white text-[#7C3AED] shadow-xs' : 'bg-[#7C3AED] text-white shadow-xs'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                      </button>
                      <div className="flex items-center gap-1 h-3 flex-1">
                        {[10, 20, 14, 24, 12, 16, 8, 14].map((h, i) => (
                          <span
                            key={i}
                            style={{ height: `${isPlaying ? ((h * 1.3) % 20) + 4 : h}px` }}
                            className="w-0.5 bg-current rounded-full opacity-80"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] opacity-80 font-mono">
                        {msg.audioDurationSec ? `0:0${msg.audioDurationSec}` : '0:04'}
                      </span>
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="break-words">
                    <span className="whitespace-pre-wrap">{msg.text}</span>

                    <div
                      className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] select-none ${
                        isUser ? 'text-[#FAF7FF]/80' : 'text-[#9A9AA5]'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isUser ? (
                        <CheckCheck className="w-3.5 h-3.5 stroke-[2.4]" title="Delivered & Read" />
                      ) : (
                        voiceEnabled && (
                          <button
                            onClick={() => handlePlayVoice(msg)}
                            title="Listen aloud"
                            className="hover:text-[#7C3AED] transition-colors ml-0.5 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-[#9A9AA5] hover:text-[#7C3AED]" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer (Pinned to bottom of Chat container) */}
      <div className="p-3 sm:p-4 bg-white/80 dark:bg-[#150F28]/85 border-t border-[rgba(124,58,237,0.12)] backdrop-blur-2xl shrink-0">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            id="chat-message-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${partnerName}...`}
            className="flex-1 glass-input px-4 py-2.5 text-xs sm:text-sm text-[#1A1A1F] dark:text-[#FAF7FF] placeholder-[#9A9AA5] focus:outline-hidden"
          />

          <button
            id="chat-send-btn"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-[12px] transition-all cursor-pointer ${
              inputText.trim()
                ? 'bg-[#7C3AED] hover:bg-[#5B21B6] text-white shadow-[0_4px_16px_rgba(124,58,237,0.3)] active:scale-95'
                : 'bg-[#F3EBFF] dark:bg-white/10 text-[#9A9AA5]'
            }`}
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>

          <button
            id="chat-mic-record-btn"
            onClick={startVoiceRecording}
            className={`p-2.5 rounded-[12px] transition-all cursor-pointer ${
              isRecording
                ? 'bg-[#7C3AED] text-white animate-pulse shadow-[0_0_16px_rgba(124,58,237,0.5)]'
                : 'bg-[#F3EBFF] dark:bg-white/10 text-[#7C3AED] dark:text-[#C4B5FD] hover:bg-[#E9D8FD]'
            }`}
            title={isRecording ? 'Stop Recording' : 'Voice Input'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Clear conversation confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-strong max-w-sm w-full p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
              Clear Conversation?
            </h3>
            <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD] leading-relaxed">
              This resets your current chat history with {partnerName}. Your habits, tags, and progress will remain untouched.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 rounded-[12px] text-xs text-[#6B6B76] hover:bg-white/60 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onClearConversation) onClearConversation();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-1.5 rounded-[12px] text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer active:scale-95"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
