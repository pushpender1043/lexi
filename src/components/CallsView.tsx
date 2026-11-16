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
    <div className="w-full max-w-[900px] mx-auto space-y-5 pb-16 select-none animate-in fade-in duration-200">
      {/* Top Hero Call Launcher Card with Dark Specular Glass */}
      <div className="p-5 glass-strong rounded-[22px] relative overflow-hidden border border-white/60 dark:border-white/20">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Mascot Avatar */}
            <div className="shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-[#F3EBFF]/60 dark:bg-white/[0.06] border border-[rgba(137,106,189,0.2)] dark:border-white/[0.16] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
                <AexoMascot size="md" isListening={true} showAura={true} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.025em] text-[#14121C] dark:text-[#F8F7FC]">
                  {companionName}
                </h2>
                <span className="font-mono text-[10px] font-semibold text-[#7C3AED] dark:text-[#C4B5FD]">
                  · Live Voice
                </span>
              </div>
              <p className="text-[12.5px] text-[#534E68] dark:text-[#C5BED9] mt-0.5">
                Real-time Hinglish &amp; English voice calls · Habit accountability
              </p>
              <div className="flex items-center gap-2.5 mt-1.5 text-[11px] flex-wrap font-mono">
                <span className="inline-flex items-center gap-1 font-semibold text-[#7C3AED] dark:text-[#C4B5FD]">
                  <Smile className="w-3.5 h-3.5 text-[#A855F7]" />
                  {partnerMood.status} ({partnerMood.score}%)
                </span>
                <span aria-hidden="true" className="opacity-40 text-[#938CA8]">·</span>
                <span className="text-[#534E68] dark:text-[#938CA8]">
                  {userProfile.voiceGender === 'male' ? 'Male (Zephyr)' : 'Female (Kore)'}
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
                  ? 'btn-primary-purple text-white'
                  : 'glass-button text-[#534E68] dark:text-[#F8F7FC]'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isTestingVoice ? 'animate-pulse' : ''}`} />
              <span>{isTestingVoice ? 'Playing...' : 'Test Voice'}</span>
            </button>

            {/* Start Live Call */}
            <button
              id="calls-start-live-call-btn"
              onClick={onStartCall}
              className="btn-primary-purple flex items-center gap-2 px-6 py-3 rounded-[14px] font-bold text-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call {companionName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calls Filter & Title bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#A855F7]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#534E68] dark:text-[#C4B5FD]">
            Call Logs & Summaries
          </h3>
          <span className="text-xs font-bold text-[#7C3AED] dark:text-[#E9D5FF] tabular-nums">
            ({callRecords.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-white/60 dark:bg-transparent dark:glass-pill p-1 rounded-[14px] border border-[rgba(137,106,189,0.16)] dark:border-white/18 text-xs">
            <button
              onClick={() => setCallFilter('all')}
              className={`px-3 py-1 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
                callFilter === 'all'
                  ? 'bg-[#7C3AED] dark:bg-gradient-to-r dark:from-[#A855F7] dark:to-[#7C3AED] text-white font-bold shadow-xs'
                  : 'text-[#534E68] dark:text-[#C5BED9] hover:text-[#14121C] dark:hover:text-[#F8F7FC]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCallFilter('completed')}
              className={`px-3 py-1 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
                callFilter === 'completed'
                  ? 'bg-[#7C3AED] dark:bg-gradient-to-r dark:from-[#A855F7] dark:to-[#7C3AED] text-white font-bold shadow-xs'
                  : 'text-[#534E68] dark:text-[#C5BED9] hover:text-[#14121C] dark:hover:text-[#F8F7FC]'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setCallFilter('missed')}
              className={`px-3 py-1 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
                callFilter === 'missed'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold shadow-xs'
                  : 'text-[#534E68] dark:text-[#C5BED9] hover:text-[#14121C] dark:hover:text-[#F8F7FC]'
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
              className="p-1.5 rounded-lg text-[#7C7692] dark:text-[#938CA8] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
          <div className="p-10 text-center rounded-[24px] glass text-[#7C7692] dark:text-[#938CA8]">
            <PhoneMissed className="w-10 h-10 text-[#A855F7] mx-auto mb-3 opacity-70" />
            <p className="text-base font-bold text-[#14121C] dark:text-[#F8F7FC]">
              No voice calls in this filter
            </p>
            <p className="text-xs text-[#534E68] dark:text-[#C5BED9] mt-1 max-w-sm mx-auto">
              Tap the Call button above to have a live conversation with {companionName} anytime!
            </p>
            <button
              onClick={onStartCall}
              className="btn-primary-purple mt-4 px-5 py-2.5 rounded-[12px] text-xs font-bold inline-flex items-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Start First Call</span>
            </button>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div
              key={call.id}
              className="p-3.5 sm:p-4 rounded-[18px] glass hover:border-white/25 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3">
                {/* Call Type Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    call.type === 'missed'
                      ? 'bg-rose-500/12 text-rose-400 border-rose-400/25'
                      : call.type === 'incoming'
                      ? 'bg-[#4CB782]/12 text-[#4CB782] border-[#4CB782]/25'
                      : 'bg-[#A855F7]/15 text-[#C4B5FD] border-[#A855F7]/25'
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
                    <h4 className="font-display text-[14px] font-semibold text-[#14121C] dark:text-[#F8F7FC]">
                      Voice Call with {call.partnerName || companionName}
                    </h4>
                    <span className="font-mono text-[11px] font-semibold text-[#534E68] dark:text-[#C4B5FD] tabular-nums">
                      · {formatDuration(call.durationSec)}
                    </span>
                    {call.moodDuringCall && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F3EBFF] dark:bg-white/[0.08] text-[#7C3AED] dark:text-[#E9D5FF] border border-white/12">
                        {getMoodEmoji(call.moodDuringCall)}
                      </span>
                    )}
                  </div>

                  {/* Summary / Topic note */}
                  <p className="text-xs text-[#534E68] dark:text-[#C5BED9] mt-1 leading-relaxed">
                    {call.summary || 'Habit tracking and friendly emotional check-in'}
                  </p>

                  <span className="text-[10px] text-[#7C7692] dark:text-[#938CA8] mt-1 inline-block font-mono">
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
                      ? 'btn-primary-purple text-white'
                      : 'glass-button text-[#534E68] dark:text-[#F8F7FC]'
                  }`}
                  title="Listen to call summary"
                >
                  <Play className={`w-4 h-4 ${isPlayingSummaryId === call.id ? 'animate-pulse' : ''}`} />
                </button>

                {/* Call Back Button */}
                <button
                  onClick={onStartCall}
                  className="glass-button flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
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
