import React, { useState } from 'react';
import { CallRecord, UserProfile, PartnerMood } from '../types';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Heart,
  Volume2,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Smile
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
  onClearHistory,
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
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-12">
      {/* Top Hero Call Launcher Card (WhatsApp / Telegram Calling Header) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1e2520] border border-[#CFD6C4]/60 dark:border-white/10 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background tint */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#99CDD8]/10 rounded-full blur-2xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#DAEBE3]/20 rounded-full blur-2xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Avatar with live pulse dot */}
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#DAEBE3] dark:bg-[#24352b] border border-[#99CDD8]/40 flex items-center justify-center text-3xl shadow-xs">
                {userProfile.partnerGender === 'male' ? '🧑‍💼' : '👩‍💼'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1e2520] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2b382d] dark:text-[#e5ede7]">
                  {userProfile.partnerName}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#DAEBE3] text-[#2b382d] font-semibold dark:bg-[#24352b] dark:text-[#99CDD8]">
                  Live Voice Call
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#657166] dark:text-[#a0aba1] mt-0.5">
                Ready to talk in Hinglish & English • Interactive accountability
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-[#657166]">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2b382d] dark:text-[#e5ede7] px-2 py-0.5 rounded-lg bg-[#F8FAF8] dark:bg-[#151a17] border border-[#CFD6C4]/40">
                  <Smile className="w-3 h-3 text-[#99CDD8]" />
                  Mood: {partnerMood.status} ({partnerMood.score}%)
                </span>
              </div>
            </div>
          </div>

          {/* Call Trigger Buttons */}
          <div className="flex items-center gap-3">
            <button
              id="calls-voice-toggle-btn"
              onClick={onToggleVoice}
              title={voiceEnabled ? 'Speech Output Enabled' : 'Speech Output Muted'}
              className={`p-3 rounded-2xl border transition-all ${
                voiceEnabled
                  ? 'bg-[#DAEBE3] text-[#2b382d] border-[#99CDD8]/50'
                  : 'bg-[#F8FAF8] dark:bg-[#151a17] text-zinc-400 border-[#CFD6C4]/50'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              id="calls-start-live-call-btn"
              onClick={onStartCall}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#99CDD8] hover:bg-[#85c1cc] text-[#2b382d] font-bold text-sm shadow-md transition-all hover:scale-103 active:scale-97"
            >
              <PhoneCall className="w-4 h-4 text-[#2b382d] animate-bounce" />
              <span>Call {userProfile.partnerName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp style Calls Filter & Title bar */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#657166] dark:text-[#a0aba1]">
          Recent Calls
        </h3>

        <div className="flex items-center gap-1 bg-white/80 dark:bg-[#1e2520] p-0.5 rounded-xl border border-[#CFD6C4]/40 text-xs">
          <button
            id="call-filter-all"
            onClick={() => setCallFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              callFilter === 'all'
                ? 'bg-[#657166] text-white shadow-xs'
                : 'text-[#657166] dark:text-[#a0aba1] hover:text-[#2b382d]'
            }`}
          >
            All Calls
          </button>
          <button
            id="call-filter-missed"
            onClick={() => setCallFilter('missed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              callFilter === 'missed'
                ? 'bg-[#F3C3B2] text-[#2b382d] font-semibold shadow-xs'
                : 'text-[#657166] dark:text-[#a0aba1] hover:text-[#2b382d]'
            }`}
          >
            Missed
          </button>
        </div>
      </div>

      {/* Call History List like WhatsApp / Telegram Calls tab */}
      <div className="space-y-2.5">
        {filteredCalls.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#1e2520] border border-[#CFD6C4]/40 text-[#657166]">
            <PhoneMissed className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-medium">No calls logged in this section.</p>
          </div>
        ) : (
          filteredCalls.map(record => {
            const isMissed = record.type === 'missed';
            const isOutgoing = record.type === 'outgoing';

            return (
              <div
                key={record.id}
                id={`call-record-${record.id}`}
                className="p-4 rounded-2xl bg-white dark:bg-[#1e2520] border border-[#CFD6C4]/60 dark:border-white/10 shadow-xs hover:border-[#99CDD8] transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Call Type Icon indicator */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isMissed
                        ? 'bg-[#F3C3B2]/25 text-[#7a483a]'
                        : isOutgoing
                        ? 'bg-[#99CDD8]/25 text-[#2b382d]'
                        : 'bg-[#DAEBE3]/50 text-[#657166]'
                    }`}
                  >
                    {isMissed ? (
                      <PhoneMissed className="w-4 h-4 text-[#F3C3B2]" />
                    ) : isOutgoing ? (
                      <PhoneOutgoing className="w-4 h-4 text-[#657166]" />
                    ) : (
                      <PhoneIncoming className="w-4 h-4 text-[#99CDD8]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#2b382d] dark:text-[#e5ede7]">
                        {record.partnerName}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-md bg-[#F8FAF8] dark:bg-[#151a17] text-[#657166] border border-[#CFD6C4]/40">
                        {getMoodEmoji(record.moodDuringCall)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-0.5 text-xs text-[#657166] dark:text-[#a0aba1]">
                      <span className={isMissed ? 'text-[#F3C3B2] font-semibold' : ''}>
                        {record.timestamp}
                      </span>
                      <span>•</span>
                      <span>{formatDuration(record.durationSec)}</span>
                    </div>

                    {record.summary && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 italic">
                        "{record.summary}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Instant Redial / Call Button */}
                <button
                  id={`redial-btn-${record.id}`}
                  onClick={onStartCall}
                  title={`Call ${record.partnerName} again`}
                  className="p-2.5 rounded-xl bg-[#DAEBE3] hover:bg-[#99CDD8] text-[#2b382d] transition-all active:scale-95 shadow-xs shrink-0"
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
