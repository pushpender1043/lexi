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
  ChevronDown,
} from 'lucide-react';
import { createSpeechRecognizer, playCompanionVoice } from '../utils/speech';
import { motion, AnimatePresence } from 'motion/react';

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
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const partnerName = userProfile.partnerName || 'Lexi';

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto-scroll on new message or loading change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Monitor scroll offset to show floating scroll-to-bottom button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isUp);
  };

  // Focus search input when opened
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto-grow height up to 120px
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
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
    'Need a quick boost of positive energy 🥺',
  ];

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredMessages = trimmedQuery
    ? messages.filter((m) => m.text.toLowerCase().includes(trimmedQuery))
    : messages;

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full select-none relative overflow-hidden glass rounded-[24px] shadow-[0_12px_40px_rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.15)] animate-in fade-in duration-200">
      
      {/* 1. Single Compact Glass Header (NO redundant "Home" button on desktop; mobile back arrow only) */}
      <div className="px-3.5 sm:px-5 py-3 bg-white/80 dark:bg-[#150F28]/85 backdrop-blur-2xl border-b border-[rgba(124,58,237,0.12)] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          {/* Mobile Back Button Only */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 rounded-xl bg-black/5 dark:bg-white/10 text-[#6B6B76] dark:text-[#FAF7FF] hover:bg-black/10 cursor-pointer active:scale-95"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.4]" />
            </button>
          )}

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
                <span className="text-[10px] text-[#4CB782] font-semibold">
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

        {/* Right Header Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isSearchOpen || searchQuery
                ? 'bg-[#F3EBFF] dark:bg-white/10 text-[#7C3AED] dark:text-[#C4B5FD]'
                : 'text-[#6B6B76] hover:text-[#1A1A1F] dark:text-[#9A9AA5] dark:hover:text-[#FAF7FF]'
            }`}
            title="Search messages"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2 rounded-xl text-[#6B6B76] hover:text-rose-600 dark:text-[#9A9AA5] dark:hover:text-rose-400 transition-colors cursor-pointer"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Compact call icon in Chat header */}
          <button
            onClick={onStartCall}
            className="p-2 rounded-xl bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] text-[#7C3AED] dark:text-[#C4B5FD] hover:bg-[#7C3AED] hover:text-white transition-all cursor-pointer active:scale-95 ml-1"
            title={`Live Call with ${partnerName}`}
          >
            <Phone className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Search Input Bar (when opened) */}
      {isSearchOpen && (
        <div className="px-4 py-2 bg-[#FAF7FF]/95 dark:bg-[#150F28]/95 border-b border-[rgba(124,58,237,0.12)] flex items-center gap-2 shrink-0 animate-in slide-in-from-top-1">
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
            className="text-xs font-semibold text-[#6B6B76] dark:text-[#C4B5FD] px-2 py-1 cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* 2. Message List - The ONLY scroll area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3.5 sm:px-6 py-4 space-y-3.5 relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <AexoMascot size="lg" className="mb-3" />
            <h3 className="text-base font-bold text-[#1A1A1F] dark:text-[#FAF7FF] mb-1">
              Chat with {partnerName}
            </h3>
            <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD] mb-5 max-w-xs">
              Check in on your routine, reflect on your habits, or share how you&apos;re feeling.
            </p>

            <div className="w-full max-w-sm space-y-2">
              {companionPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  className="w-full py-2.5 px-3.5 rounded-xl glass hover:border-[#7C3AED] hover:bg-[#F3EBFF] dark:hover:bg-white/10 text-xs font-semibold text-[#1A1A1F] dark:text-[#FAF7FF] hover:text-[#7C3AED] shadow-2xs transition-all text-left block cursor-pointer active:scale-[0.99]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const isCallLog =
              msg.type === 'call_log' ||
              msg.sender === 'system' ||
              msg.text.toLowerCase().includes('voice call with');
            const isPlaying = playingMessageId === msg.id;

            // Distinct Custom Call Card Component
            if (isCallLog) {
              return (
                <div key={msg.id || index} className="w-full my-3 flex justify-center">
                  <div className="max-w-md w-full p-4 rounded-2xl glass-strong border border-[rgba(124,58,237,0.22)] shadow-md shadow-[rgba(124,58,237,0.08)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#7C3AED]/30">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#1A1A1F] dark:text-[#FAF7FF] flex items-center gap-2">
                          <span>Voice Call Summary</span>
                          <span className="text-[10px] text-[#4CB782] font-semibold">Completed</span>
                        </div>
                        <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD] truncate mt-0.5">
                          {msg.text}
                        </p>
                        <span className="text-[10px] text-[#9A9AA5] block mt-0.5">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={onStartCall}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Again</span>
                    </button>
                  </div>
                </div>
              );
            }

            // Normal User / Companion Chat Bubble
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
                    isUser ? 'chat-bubble-out' : 'chat-bubble-in'
                  }`}
                >
                  {/* Voice Note Player */}
                  {msg.type === 'voice_note' && (
                    <div className="mb-2 p-2 rounded-xl bg-black/10 dark:bg-white/10 flex items-center gap-2">
                      <button
                        onClick={() => handlePlayVoice(msg)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isUser ? 'bg-white text-[#7C3AED]' : 'bg-[#7C3AED] text-white'
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
                        isUser ? 'text-white/80' : 'text-[#9A9AA5]'
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

      {/* Floating Scroll-to-Bottom Button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-20 right-6 z-30 p-2.5 rounded-full bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/40 hover:bg-[#5B21B6] transition-transform active:scale-95 cursor-pointer"
            title="Scroll to latest messages"
          >
            <ChevronDown className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 3. Fixed Bottom Glass Composer (Auto-grow textarea + Morphing mic/send button) */}
      <div className="p-3 sm:p-4 bg-white/80 dark:bg-[#150F28]/85 border-t border-[rgba(124,58,237,0.12)] backdrop-blur-2xl shrink-0">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${partnerName}...`}
            className="flex-1 glass-input px-4 py-2.5 text-xs sm:text-sm text-[#1A1A1F] dark:text-[#FAF7FF] placeholder-[#9A9AA5] focus:outline-hidden resize-none max-h-32 leading-relaxed"
          />

          {/* Morphing Send / Mic Button */}
          {inputText.trim() ? (
            <motion.button
              key="send-btn"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleSend}
              className="p-3 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white shadow-md shadow-[#7C3AED]/30 transition-colors cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              key="mic-btn"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.94 }}
              onClick={startVoiceRecording}
              className={`p-3 rounded-xl transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/40'
                  : 'bg-[#F3EBFF] dark:bg-white/10 text-[#7C3AED] dark:text-[#C4B5FD] hover:bg-[#E9D8FD]'
              }`}
              title={isRecording ? 'Stop Recording' : 'Voice Input'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </motion.button>
          )}
        </div>
      </div>

      {/* Clear conversation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-strong max-w-sm w-full p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
              Clear Conversation?
            </h3>
            <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD] leading-relaxed">
              This resets your active chat thread with {partnerName}. Your habits, tags, and progress will remain untouched.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-[#6B6B76] hover:bg-white/60 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onClearConversation) onClearConversation();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer active:scale-95"
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
