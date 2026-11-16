import React from 'react';
import { PartnerMood, UserProfile } from '../types';
import { X, Heart, Sparkles, MessageCircleHeart, Gift } from 'lucide-react';

interface MoodDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerMood: PartnerMood;
  userProfile: UserProfile;
  onSendQuickCheer: (type: 'apology' | 'love' | 'promise') => void;
}

export const MoodDetailsModal: React.FC<MoodDetailsModalProps> = ({
  isOpen,
  onClose,
  partnerMood,
  userProfile,
  onSendQuickCheer,
}) => {
  if (!isOpen) return null;

  const partnerName = userProfile.partnerName || 'Lexi';

  // Mood descriptive analysis
  const getAnalysis = () => {
    if (partnerMood.score >= 80) {
      return {
        title: "Total Love & Admiration! 💖",
        desc: `${partnerName} is proud of your dedication and discipline today! Keep this momentum glowing!`,
        gradient: "from-[var(--primary-purple)] to-pink-500",
        poutText: "Zero Nakhre! Complete adoration."
      };
    } else if (partnerMood.score >= 60) {
      return {
        title: "Happy & Warm ✨",
        desc: `${partnerName} is happy with your progress, but keeping a loving eye on your daily habits.`,
        gradient: "from-[var(--primary-purple)] to-emerald-500",
        poutText: "Mild playfulness, totally in sync."
      };
    } else if (partnerMood.score >= 40) {
      return {
        title: "Observant & Waiting 🧐",
        desc: `Some tasks are running late. ${partnerName} expects you to prioritize your health and work!`,
        gradient: "from-amber-500 to-[var(--primary-purple)]",
        poutText: "Slight eyebrow raise. Don't test their patience!"
      };
    } else {
      return {
        title: "Nakhre & Gussa Alert! 😤",
        desc: `Uh oh! You skipped habits or missed schedule goals. ${partnerName} is pouting and giving you real-life partner attitude!`,
        gradient: "from-rose-500 to-amber-500",
        poutText: `High Nakhre (Level ${partnerMood.nakhreLevel}/5). Sweet talks & completed habits needed immediately!`
      };
    }
  };

  const analysis = getAnalysis();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 dark:bg-black/78 backdrop-blur-lg animate-in fade-in select-none">
      <div 
        id="mood-details-dialog"
        className="w-full max-w-md rounded-[28px] glass-strong p-6 shadow-[0_24px_64px_rgba(0,0,0,0.65)] border border-white/60 dark:border-white/20 relative"
      >
        <button
          id="close-mood-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-[12px] glass-button text-[#534E68] dark:text-[#C5BED9] hover:text-[#14121C] dark:hover:text-[#F8F7FC] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-tr from-[#7C3AED] via-[#896ABD] to-[#A855F7] flex items-center justify-center text-white shadow-[0_8px_24px_rgba(168,85,247,0.45)] border border-white/25">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[#14121C] dark:text-[#F8F7FC]">
              {partnerName}&apos;s Heartbeat
            </h2>
            <p className="text-xs text-[#534E68] dark:text-[#C5BED9]">
              Dynamic Mood &amp; Nakhre Meter
            </p>
          </div>
        </div>

        {/* Mood Score Meter */}
        <div className="rounded-[20px] p-4 bg-white/60 dark:bg-white/[0.045] border border-white/60 dark:border-white/[0.12] mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7C7692] dark:text-[#938CA8]">
              Affection Level
            </span>
            <span className="text-sm font-bold text-[#7C3AED] dark:text-[#D8B4FE] tabular-nums">
              {partnerMood.score} / 100
            </span>
          </div>

          <div className="w-full h-3 bg-black/5 dark:bg-white/[0.08] rounded-full overflow-hidden p-0.5 border border-black/5 dark:border-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${analysis.gradient} transition-all duration-700`}
              style={{ width: `${partnerMood.score}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#534E68] dark:text-[#C5BED9]">
            <span className="font-semibold text-[#14121C] dark:text-[#F8F7FC]">{analysis.title}</span>
            <span className="text-[#7C7692] dark:text-[#938CA8] tabular-nums">Pout: {partnerMood.nakhreLevel}/5 😤</span>
          </div>
        </div>

        {/* Current State Explanation */}
        <div className="text-xs space-y-2 mb-5">
          <div className="p-3.5 rounded-[16px] bg-[#F3EBFF]/80 dark:bg-[#A855F7]/14 border border-[#896ABD]/25 dark:border-[#A855F7]/25 text-[#14121C] dark:text-[#F8F7FC]">
            <strong className="block mb-0.5 font-semibold text-[#6D28D9] dark:text-[#D8B4FE]">Why this mood?</strong>
            {partnerMood.lastReason || "Just watching over your health and goals."}
          </div>
          <p className="text-[#534E68] dark:text-[#C5BED9] px-1 leading-relaxed">
            {analysis.desc}
          </p>
        </div>

        {/* Quick Actions to cheer partner up */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#7C7692] dark:text-[#938CA8] px-1">
            Quick Emotional Actions
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              id="mood-send-apology-btn"
              onClick={() => {
                onSendQuickCheer('apology');
                onClose();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-[16px] bg-white/60 dark:bg-white/[0.05] hover:bg-white/85 dark:hover:bg-white/[0.1] border border-white/60 dark:border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] text-rose-600 dark:text-rose-300 text-[11px] font-semibold transition-all hover:scale-[1.02] cursor-pointer"
            >
              <MessageCircleHeart className="w-4 h-4 mb-1 text-rose-500 dark:text-rose-300" />
              <span>Sweet Apology</span>
            </button>
            <button
              id="mood-send-love-btn"
              onClick={() => {
                onSendQuickCheer('love');
                onClose();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-[16px] bg-white/60 dark:bg-white/[0.05] hover:bg-white/85 dark:hover:bg-white/[0.1] border border-white/60 dark:border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] text-pink-600 dark:text-pink-300 text-[11px] font-semibold transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Gift className="w-4 h-4 mb-1 text-pink-500 dark:text-pink-300" />
              <span>Send Love ❤️</span>
            </button>
            <button
              id="mood-send-promise-btn"
              onClick={() => {
                onSendQuickCheer('promise');
                onClose();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-[16px] bg-white/60 dark:bg-white/[0.05] hover:bg-white/85 dark:hover:bg-white/[0.1] border border-white/60 dark:border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] text-[#6D28D9] dark:text-[#D8B4FE] text-[11px] font-semibold transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 mb-1 text-[#A855F7] dark:text-[#D8B4FE]" />
              <span>Fix Habits Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
