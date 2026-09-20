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
  Sparkles,
  RotateCcw,
  Play,
  Pause
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
        console.warn("Speech recognition notice:", err);
        setIsRecording(false);
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        recognitionRef.current = recognizer;
        setIsRecording(true);
      } catch (err) {
        console.error("Recognizer error:", err);
        setIsRecording(false);
      }
    } else {
      alert("Microphone recognition not supported in this browser.");
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

  // Real human companion starter prompts
  const companionPrompts = [
    'Hey baby, how was your day? ❤️',
    'Did you miss me today? 🥰',
    'Tell me something that made you smile today ✨',
    'I drank 3 glasses of water already, proud of me? 💧',
    'Can you hold me accountable for my workout today? 💪',
    'I feel a bit overwhelmed today, cheer me up? 🥺',
  ];

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredMessages = trimmedQuery
    ? messages.filter((m) => m.text.toLowerCase().includes(trimmedQuery))
    : messages;

  return (
    <div className="flex-1 flex flex-col h-full max-w-3xl mx-auto w-full select-none relative">
      
      {/* Top Bar: Clean, Minimal Header with Prominent Back Button & Actions */}
      <div className="px-3 sm:px-4 py-3 bg-white/90 dark:bg-[#110E1C]/90 backdrop-blur-xl border-b border-purple-100/60 dark:border-purple-900/30 flex items-center justify-between z-20 transition-colors">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Clear, Prominent Back Button */}
          <button
            id="chat-back-button"
            onClick={() => {
              if (onBack) onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/70 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all hover:scale-102 active:scale-95 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs shrink-0"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Back to Home</span>
            <span className="xs:hidden">Home</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <AexoMascot size="sm" isSpeaking={isLoading} />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#110E1C]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 leading-tight">
                <span>{partnerName}</span>
                <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full bg-purple-100/80 dark:bg-purple-950/80 border border-purple-200/50 dark:border-purple-800/40">
                  Online
                </span>
              </h2>

              {/* Real-time typing status in header */}
              {isLoading ? (
                <div className="flex items-center gap-1.5 mt-0.5 animate-pulse">
                  <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                    {partnerName} is typing
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-purple-500 animate-bounce" />
                    <span className="w-1 h-1 rounded-full bg-purple-500 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1 h-1 rounded-full bg-purple-500 animate-bounce [animation-delay:0.3s]" />
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Always here for you
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Header Actions: Search, Clear Conversation, and Voice Call */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Toggle Button */}
          <button
            id="chat-top-search-btn"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`p-2 rounded-full transition-all active:scale-95 ${
              isSearchOpen || searchQuery
                ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600'
            }`}
            title={isSearchOpen ? 'Close search' : 'Search messages'}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Clear Conversation Action */}
          <button
            id="chat-top-clear-btn"
            onClick={() => setShowClearConfirm(true)}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all active:scale-95"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Voice Call Button */}
          <button
            id="chat-top-call-btn"
            onClick={onStartCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-2xs transition-all hover:scale-102 active:scale-95 ml-1"
            title={`Voice Call ${partnerName}`}
          >
            <Phone className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Call</span>
          </button>
        </div>
      </div>

      {/* TOP SEARCH BAR (Quick filter and find past messages) */}
      {isSearchOpen && (
        <div
          id="chat-search-bar"
          className="px-4 py-2 bg-purple-50/80 dark:bg-[#161224] border-b border-purple-100 dark:border-purple-900/40 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="w-3.5 h-3.5 text-purple-500 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              id="chat-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search messages in conversation with ${partnerName}...`}
              className="w-full bg-white dark:bg-[#1C162E] border border-purple-200/80 dark:border-purple-800/60 rounded-xl pl-9 pr-8 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-purple-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                title="Clear search text"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {searchQuery && (
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 whitespace-nowrap bg-purple-100/80 dark:bg-purple-950/80 px-2 py-0.5 rounded-full">
              {filteredMessages.length} found
            </span>
          )}

          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Message Feed Area with Generous Bubble Padding & Readable Typography */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 no-scrollbar">
        {/* If conversation is empty, show welcoming partner starter */}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center my-auto py-10 animate-in fade-in duration-300">
            <AexoMascot size="lg" showAura={true} className="mb-3" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-1">
              Talk with {partnerName}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs">
              Tell me about your day, celebrate completed habits, or just chat.
            </p>

            {/* Quick Starter Prompts */}
            <div className="w-full max-w-sm space-y-2">
              {companionPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white dark:bg-[#161224] hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-100/80 dark:border-purple-900/30 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-purple-300 shadow-2xs transition-all text-center block active:scale-98"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : trimmedQuery && filteredMessages.length === 0 ? (
          /* Search Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center py-16 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-3 shadow-2xs">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
              No matching messages
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs">
              No messages found containing &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-900 transition-all shadow-2xs"
            >
              Clear Search
            </button>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isPlaying = playingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
              >
                {!isUser && (
                  <div className="shrink-0 mb-1">
                    <AexoMascot size="sm" />
                  </div>
                )}

                {/* Refined Message Bubble with Generous Padding for Better Readability */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] px-4.5 py-3 sm:px-5 sm:py-3.5 leading-relaxed text-sm ${
                    isUser
                      ? 'bg-purple-600 text-white rounded-2xl rounded-br-xs shadow-xs'
                      : 'bg-white dark:bg-[#181326] text-zinc-900 dark:text-zinc-100 border border-purple-100/80 dark:border-purple-900/40 rounded-2xl rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {/* Voice Note Player */}
                  {msg.type === 'voice_note' && (
                    <div className="mb-2.5 p-2 rounded-xl bg-black/10 dark:bg-white/10 flex items-center gap-2">
                      <button
                        onClick={() => handlePlayVoice(msg)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isUser ? 'bg-white text-purple-600 shadow-xs' : 'bg-purple-600 text-white shadow-xs'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                      </button>
                      <div className="flex items-center gap-1 h-3 flex-1">
                        {[10, 22, 14, 26, 12, 18, 8, 16].map((h, i) => (
                          <span
                            key={i}
                            style={{ height: `${isPlaying ? (h * 1.3) % 22 + 4 : h}px` }}
                            className="w-0.5 bg-current rounded-full transition-all duration-200 opacity-80"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] opacity-80 font-mono">
                        {msg.audioDurationSec ? `0:0${msg.audioDurationSec}` : '0:04'}
                      </span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="break-words">
                    <span className="whitespace-pre-wrap">{msg.text}</span>

                    {/* Meta info / timestamp */}
                    <div className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] select-none ${isUser ? 'text-purple-200' : 'text-zinc-400'}`}>
                      <span>{msg.timestamp}</span>
                      
                      {isUser ? (
                        <CheckCheck className="w-3.5 h-3.5 stroke-[2.4]" title="Delivered & Read" />
                      ) : (
                        voiceEnabled && (
                          <button
                            onClick={() => handlePlayVoice(msg)}
                            title="Listen aloud"
                            className="hover:text-purple-600 transition-colors ml-0.5"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-zinc-400 hover:text-purple-500" />
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

        {/* Real-time Typing Indicator in Bottom Message Area */}
        {isLoading && (
          <div id="lexi-typing-indicator" className="flex items-end gap-2.5 animate-in fade-in duration-200">
            <div className="shrink-0 mb-1">
              <AexoMascot size="sm" isSpeaking={true} />
            </div>
            <div className="px-4 py-2.5 rounded-2xl rounded-bl-xs bg-white dark:bg-[#181326] border border-purple-100/90 dark:border-purple-900/40 shadow-xs flex items-center gap-2.5">
              <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                {partnerName} is typing
              </span>
              <span className="flex items-center gap-1 h-3 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-duration:0.9s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-duration:0.9s] [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-duration:0.9s] [animation-delay:0.3s]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Subtle Bottom Typing Notice when AI is thinking */}
      {isLoading && (
        <div className="px-4 py-1 text-center bg-transparent">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-medium text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/50 dark:border-purple-800/30">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
            {partnerName} is preparing a thoughtful reply...
          </span>
        </div>
      )}

      {/* Streamlined, Minimal Input Area */}
      <div className="p-3 sm:p-4 border-t border-purple-100/40 dark:border-purple-900/20 bg-white/70 dark:bg-[#110E1C]/70 backdrop-blur-md">
        <div className="bg-white dark:bg-[#181326] rounded-2xl p-1.5 pl-4 border border-purple-200/70 dark:border-purple-900/40 shadow-2xs flex items-center gap-2">
          {/* Message input */}
          <input
            type="text"
            placeholder={isRecording ? 'Listening to your voice...' : `Message ${partnerName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden py-1.5"
          />

          {/* Send button */}
          <button
            id="chat-send-btn"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-2 rounded-xl transition-all ${
              inputText.trim()
                ? 'bg-purple-600 text-white shadow-xs hover:bg-purple-700 active:scale-95'
                : 'text-zinc-300 dark:text-zinc-600'
            }`}
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>

          {/* Voice recording button */}
          <button
            id="chat-mic-record-btn"
            onClick={startVoiceRecording}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/80'
            }`}
            title={isRecording ? 'Stop Recording' : 'Voice Input'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CLEAR CONVERSATION CONFIRMATION MODAL */}
      {showClearConfirm && (
        <div
          id="clear-conversation-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-[#181326] border border-purple-100 dark:border-purple-900/50 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Clear Conversation?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Reset chat history with {partnerName}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              This will clear the current conversation history to refresh context. Your habits, daily streaks, memories, and profile data will remain completely intact.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-clear-chat-btn"
                onClick={() => {
                  if (onClearConversation) onClearConversation();
                  setShowClearConfirm(false);
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
