import React, { useState, useEffect, useRef } from 'react';
import { CallRecord, UserProfile, PartnerMood } from '../types';
import { AexoMascot } from './AexoMascot';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Volume2,
  Smile,
  Sparkles,
  Play,
  RotateCcw,
  Trash2,
  Clock,
  Heart,
} from 'lucide-react';
import { playCompanionVoice, stopCompanionVoice } from '../utils/speech';

interface CallsViewProps {
  callRecords: CallRecord[];
  onStartCall: () => void;
  userProfile: UserProfile;
  partnerMood: PartnerMood;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onClearHistory?: () => void;
}

export const CallsView: React.FC<CallsViewProps> = ({
  callRecords,
  onStartCall,
  userProfile,
  partnerMood,
  voiceEnabled,
  onToggleVoice,
  onClearHistory,
}) => {
  const [callFilter, setCallFilter] = useState<'all' | 'missed' | 'completed'>('all');
  const [isPlayingSummaryId, setIsPlayingSummaryId] = useState<string | null>(null);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const localPlaybackActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      if (localPlaybackActiveRef.current) {
        stopCompanionVoice();
        localPlaybackActiveRef.current = false;
      }
    };
  }, []);

  const companionName = userProfile.partnerName || 'Lexi';

  const filteredCalls = callRecords.filter((call) => {
    if (callFilter === 'missed') return call.type === 'missed';
    if (callFilter === 'completed') return call.type !== 'missed';
    return true;
  });

  const formatDuration = (sec: number) => {
    if (sec === 0) return 'Missed';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'loving':
        return '🥰 Loving';
      case 'ecstatic':
        return '✨ Ecstatic';
      case 'happy':
        return '😊 Happy';
      case 'annoyed':
        return '😤 Nakhre';
      case 'angry':
        return '😠 Angry';
      default:
        return '💭 Caring';
    }
  };

  const handleTestVoice = () => {
    if (isTestingVoice) {
      stopCompanionVoice();
      localPlaybackActiveRef.current = false;
      setIsTestingVoice(false);
      return;
    }

    setIsTestingVoice(true);
    setIsPlayingSummaryId(null);
    localPlaybackActiveRef.current = true;
    const dynamic = userProfile.relationshipDynamic || 'sweet_loving';
    let sampleText = `Haan meri jaan ${userProfile.name}! Main hamesha tumhare sath hoon. Apne habits aur routine pe dhyan do na! ❤️`;
    if (dynamic === 'disciplined_coach') {
      sampleText = `${userProfile.name}, stay focused on the mission today. Let's lock in those daily habits and protect your streak!`;
    } else if (dynamic === 'playful_teasing') {
      sampleText = `Arey ${userProfile.name} yaar! Jaldi se aaj ke habits complete karo, phir chill karte hain!`;
    } else if (dynamic === 'calm_soulmate') {
      sampleText = `Take a gentle breath ${userProfile.name}. I'm right here with you as you move through today's routine.`;
    }

    playCompanionVoice(sampleText, {
      gender: userProfile.voiceGender,
      preferredVoiceName: userProfile.preferredVoiceName,
      tone: userProfile.voiceToneStyle || 'sweet',
      rate: userProfile.voiceSpeed || 1.0,
      emotion: dynamic === 'disciplined_coach' ? 'proud' : 'loving',
      useGeminiTts: true,
      onEnd: () => {
        localPlaybackActiveRef.current = false;
        setIsTestingVoice(false);
      },
      onError: () => {
        localPlaybackActiveRef.current = false;
        setIsTestingVoice(false);
      },
    });
  };

  const handlePlaySummary = (record: CallRecord) => {
    if (isPlayingSummaryId === record.id) {
      stopCompanionVoice();
      localPlaybackActiveRef.current = false;
      setIsPlayingSummaryId(null);
      return;
    }

    setIsTestingVoice(false);
    setIsPlayingSummaryId(record.id);
    localPlaybackActiveRef.current = true;
    const textToRead = record.summary || `Call with ${companionName} for ${formatDuration(record.durationSec)}`;

    playCompanionVoice(textToRead, {
      gender: userProfile.voiceGender,
      preferredVoiceName: userProfile.preferredVoiceName,
      tone: userProfile.voiceToneStyle || 'sweet',
      rate: userProfile.voiceSpeed || 1.0,
      emotion: 'caring',
      useGeminiTts: true,
      onEnd: () => {
        localPlaybackActiveRef.current = false;
        setIsPlayingSummaryId(null);
      },
      onError: () => {
        localPlaybackActiveRef.current = false;
        setIsPlayingSummaryId(null);
      },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-16 select-none animate-in fade-in duration-200">
      {/* Top Hero Call Launcher Card with Lexi Purple Branding */}
      <div className="p-6 sm:p-7 glass-strong rounded-[24px] shadow-[0_8px_32px_rgba(124,58,237,0.12)] relative overflow-hidden border border-[rgba(124,58,237,0.18)]">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Mascot Avatar with live pulse dot */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-[18px] bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center shadow-xs">
                <AexoMascot size="md" isListening={true} showAura={true} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#4CB782] border-2 border-white dark:border-[#0F0B1A] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1A1A1F] dark:text-[#FAF7FF]">
                  {companionName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] text-[#7C3AED] dark:text-[#C4B5FD] uppercase tracking-wider">
                  Live Voice
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#C4B5FD] mt-0.5 font-medium">
                Real-time voice calls • Hinglish & English • Habit accountability
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7C3AED] dark:text-[#C4B5FD] px-2.5 py-0.5 rounded-full bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.2)]">
                  <Smile className="w-3 h-3 text-[#7C3AED]" />
                  Mood: {partnerMood.status} ({partnerMood.score}%)
                </span>
                <span className="text-[11px] text-[#6B6B76] dark:text-[#A78BFA]">
                  • Voice: {userProfile.voiceGender === 'male' ? 'Male (Zephyr)' : 'Female (Kore)'}
                </span>
              </div>
            </div>
          </div>

          {/* Call Trigger & Voice Studio Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Test Voice Sample */}
            <button
              onClick={handleTestVoice}
              title="Test companion voice tone"
              className={`flex items-center gap-1.5 px-3.5 py-3 rounded-[14px] text-xs font-semibold border transition-all cursor-pointer ${
                isTestingVoice
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm'
                  : 'glass text-[#6B6B76] dark:text-[#FAF7FF] hover:text-[#7C3AED]'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isTestingVoice ? 'animate-pulse' : ''}`} />
              <span>{isTestingVoice ? 'Playing...' : 'Test Voice'}</span>
            </button>

            {/* Start Live Call */}
            <button
              id="calls-start-live-call-btn"
              onClick={onStartCall}
              className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-bold text-sm shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Call {companionName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calls Filter & Title bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#7C3AED]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76] dark:text-[#A78BFA]">
            Call Logs & Summaries
          </h3>
          <span className="text-xs font-bold text-[#7C3AED] bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] px-2 py-0.5 rounded-full">
            {callRecords.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-white/60 dark:bg-white/5 p-1 rounded-[12px] border border-[rgba(124,58,237,0.12)] text-xs">
            <button
              onClick={() => setCallFilter('all')}
              className={`px-3 py-1 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
                callFilter === 'all'
                  ? 'bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] text-[#7C3AED] dark:text-[#C4B5FD] font-bold shadow-2xs'
                  : 'text-[#6B6B76] hover:text-[#1A1A1F] dark:hover:text-[#FAF7FF]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCallFilter('completed')}
              className={`px-3 py-1 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
                callFilter === 'completed'
                  ? 'bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] text-[#7C3AED] dark:text-[#C4B5FD] font-bold shadow-2xs'
                  : 'text-[#6B6B76] hover:text-[#1A1A1F] dark:hover:text-[#FAF7FF]'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setCallFilter('missed')}
              className={`px-3 py-1 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
                callFilter === 'missed'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold shadow-2xs'
                  : 'text-[#6B6B76] hover:text-[#1A1A1F] dark:hover:text-[#FAF7FF]'
              }`}
            >
              Missed
            </button>
          </div>

          {/* Clear History */}
          {onClearHistory && callRecords.length > 0 && (
            <button
              onClick={() => {
                if (typeof window.confirm !== 'function' || window.confirm('Clear all voice call history?')) {
                  onClearHistory();
                }
              }}
              className="p-1.5 rounded-lg text-[#9A9AA5] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Clear Call History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Call History List */}
      <div className="space-y-3">
        {filteredCalls.length === 0 ? (
          <div className="p-10 text-center rounded-[24px] glass text-[#9A9AA5] border border-[rgba(124,58,237,0.12)]">
            <PhoneMissed className="w-10 h-10 text-[#A78BFA] mx-auto mb-3 opacity-60" />
            <p className="text-base font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
              No voice calls in this filter
            </p>
            <p className="text-xs text-[#6B6B76] dark:text-[#A78BFA] mt-1 max-w-sm mx-auto">
              Tap the Call button above to have a live conversation with {companionName} anytime!
            </p>
            <button
              onClick={onStartCall}
              className="mt-4 px-5 py-2.5 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Start First Call</span>
            </button>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div
              key={call.id}
              className="p-4 sm:p-5 rounded-[20px] glass hover:bg-white/70 dark:hover:bg-white/10 transition-all border border-[rgba(124,58,237,0.12)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                {/* Call Type Icon */}
                <div
                  className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${
                    call.type === 'missed'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : call.type === 'incoming'
                      ? 'bg-[#4CB782]/10 text-[#4CB782] border border-[#4CB782]/20'
                      : 'bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20'
                  }`}
                >
                  {call.type === 'missed' ? (
                    <PhoneMissed className="w-5 h-5" />
                  ) : call.type === 'incoming' ? (
                    <PhoneIncoming className="w-5 h-5" />
                  ) : (
                    <PhoneOutgoing className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-[#1A1A1F] dark:text-[#FAF7FF]">
                      Voice Call with {call.partnerName || companionName}
                    </h4>
                    <span className="text-[11px] font-semibold text-[#6B6B76] dark:text-[#A78BFA]">
                      • {formatDuration(call.durationSec)}
                    </span>
                    {call.moodDuringCall && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] text-[#7C3AED] dark:text-[#C4B5FD] border border-[rgba(124,58,237,0.15)]">
                        {getMoodEmoji(call.moodDuringCall)}
                      </span>
                    )}
                  </div>

                  {/* Summary / Topic note */}
                  <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD] mt-1 leading-relaxed">
                    {call.summary || 'Habit tracking and friendly emotional check-in'}
                  </p>

                  <span className="text-[10px] text-[#9A9AA5] mt-1 inline-block font-mono">
                    {call.timestamp}
                  </span>
                </div>
              </div>

              {/* Call Card Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {/* Listen to Summary */}
                <button
                  onClick={() => handlePlaySummary(call)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isPlayingSummaryId === call.id
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs'
                      : 'glass text-[#6B6B76] dark:text-[#FAF7FF] hover:text-[#7C3AED]'
                  }`}
                  title="Listen to call summary"
                >
                  <Play className={`w-4 h-4 ${isPlayingSummaryId === call.id ? 'animate-pulse' : ''}`} />
                </button>

                {/* Call Back Button */}
                <button
                  onClick={onStartCall}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] hover:bg-[#7C3AED] hover:text-white text-[#7C3AED] dark:text-[#C4B5FD] text-xs font-bold transition-all border border-[rgba(124,58,237,0.2)] cursor-pointer"
                  title="Call Back"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Back</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
