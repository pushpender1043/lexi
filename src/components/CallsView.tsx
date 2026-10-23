import React, { useState } from 'react';
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
} from 'lucide-react';

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
}) => {
  const [callFilter, setCallFilter] = useState<'all' | 'missed'>('all');

  const filteredCalls = callRecords.filter(call => {
    if (callFilter === 'missed') return call.type === 'missed';
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-12 select-none animate-in fade-in duration-200">
      {/* Top Hero Call Launcher Card with Lexi Purple Branding */}
      <div className="p-6 sm:p-7 glass shadow-[0_8px_32px_rgba(124,58,237,0.08)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Mascot Avatar with live pulse dot */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-[16px] bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center shadow-xs">
                <AexoMascot size="md" isListening={true} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#4CB782] border-2 border-white dark:border-[#0F0B1A] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1A1A1F] dark:text-[#FAF7FF]">
                  {userProfile.partnerName}
                </h2>
                <span className="pill-pro">Pro</span>
              </div>
              <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#C4B5FD] mt-0.5">
                Ready to talk in Hinglish & English • Real-time emotional accountability
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7C3AED] dark:text-[#C4B5FD] px-2.5 py-0.5 rounded-full bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.2)]">
                  <Smile className="w-3 h-3 text-[#7C3AED]" />
                  Mood: {partnerMood.status} ({partnerMood.score}%)
                </span>
              </div>
            </div>
          </div>

          {/* Call Trigger Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="calls-voice-toggle-btn"
              onClick={onToggleVoice}
              title={voiceEnabled ? 'Speech Output Enabled' : 'Speech Output Muted'}
              className={`p-3 rounded-[12px] border transition-all cursor-pointer ${
                voiceEnabled
                  ? 'bg-[#F3EBFF] text-[#7C3AED] border-[rgba(124,58,237,0.3)] shadow-xs'
                  : 'glass text-[#9A9AA5]'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              id="calls-start-live-call-btn"
              onClick={onStartCall}
              className="flex items-center gap-2 px-6 py-3.5 rounded-[12px] bg-[#7C3AED] hover:bg-[#5B21B6] text-white font-bold text-sm shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all hover:scale-102 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Call {userProfile.partnerName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calls Filter & Title bar */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B76] dark:text-[#A78BFA]">
          Recent Voice Calls
        </h3>

        <div className="flex items-center gap-1 bg-white/50 dark:bg-white/5 p-1 rounded-[12px] border border-[rgba(124,58,237,0.12)] text-xs">
          <button
            id="call-filter-all"
            onClick={() => setCallFilter('all')}
            className={`px-3 py-1 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
              callFilter === 'all'
                ? 'bg-[#F3EBFF] dark:bg-[rgba(124,58,237,0.25)] text-[#7C3AED] dark:text-[#C4B5FD] shadow-2xs font-bold'
                : 'text-[#6B6B76] hover:text-[#1A1A1F] dark:hover:text-[#FAF7FF]'
            }`}
          >
            All Calls
          </button>
          <button
            id="call-filter-missed"
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
      </div>

      {/* Call History List */}
      <div className="space-y-2.5">
        {filteredCalls.length === 0 ? (
          <div className="p-8 text-center rounded-[20px] glass text-[#9A9AA5]">
            <PhoneMissed className="w-8 h-8 text-[#A78BFA] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-[#1A1A1F] dark:text-[#FAF7FF]">No calls logged in this section.</p>
          </div>
        ) : (
          filteredCalls.map((record, index) => {
            const isMissed = record.type === 'missed';
            const isOutgoing = record.type === 'outgoing';

            return (
              <div
                key={record.id ? `${record.id}-${index}` : `call-${index}`}
                id={`call-record-${record.id}`}
                className="p-4 rounded-[20px] glass hover:border-[#7C3AED]/40 shadow-xs transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Call Type Icon indicator */}
                  <div
                    className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${
                      isMissed
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        : isOutgoing
                        ? 'bg-[#F3EBFF] text-[#7C3AED] dark:bg-[rgba(124,58,237,0.2)] dark:text-[#C4B5FD]'
                        : 'bg-[#4CB782]/10 text-[#4CB782]'
                    }`}
                  >
                    {isMissed ? (
                      <PhoneMissed className="w-4 h-4" />
                    ) : isOutgoing ? (
                      <PhoneOutgoing className="w-4 h-4" />
                    ) : (
                      <PhoneIncoming className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1A1A1F] dark:text-[#FAF7FF]">
                        {record.partnerName}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#F3EBFF] dark:bg-white/10 text-[#7C3AED] dark:text-[#C4B5FD] font-semibold border border-[rgba(124,58,237,0.15)]">
                        {getMoodEmoji(record.moodDuringCall)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-0.5 text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
                      <span className={isMissed ? 'text-rose-500 font-semibold' : ''}>
                        {record.timestamp}
                      </span>
                      <span>•</span>
                      <span>{formatDuration(record.durationSec)}</span>
                    </div>

                    {record.summary && (
                      <p className="text-xs text-[#6B6B76] dark:text-[#C4B5FD] mt-1 line-clamp-1 italic">
                        &ldquo;{record.summary}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Instant Redial / Call Button */}
                <button
                  id={`redial-btn-${record.id}`}
                  onClick={onStartCall}
                  title={`Call ${record.partnerName} again`}
                  className="p-2.5 rounded-[12px] bg-[#F3EBFF] hover:bg-[#7C3AED] hover:text-white text-[#7C3AED] dark:bg-white/10 dark:text-[#C4B5FD] transition-all active:scale-95 shadow-xs shrink-0 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
