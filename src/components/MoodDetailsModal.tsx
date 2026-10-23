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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in select-none">
      <div 
        id="mood-details-dialog"
        className="w-full max-w-md rounded-[28px] glass-strong p-6 shadow-[var(--shadow-glass)] border border-[var(--border)] relative"
      >
        <button
          id="close-mood-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-[12px] glass-button text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-tr from-[var(--primary-purple)] to-[var(--soft-lavender)] flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {partnerName}'s Heartbeat
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Dynamic Mood & Nakhre Meter
            </p>
          </div>
        </div>

        {/* Mood Score Meter */}
        <div className="glass rounded-[20px] p-4 border border-[var(--border)] mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Affection Level
            </span>
            <span className="text-sm font-bold text-[var(--primary-purple)]">
              {partnerMood.score} / 100
            </span>
          </div>

          <div className="w-full h-3 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${analysis.gradient} transition-all duration-700`}
              style={{ width: `${partnerMood.score}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">{analysis.title}</span>
            <span className="text-[var(--text-muted)]">Pout: {partnerMood.nakhreLevel}/5 😤</span>
          </div>
        </div>

        {/* Current State Explanation */}
        <div className="text-xs space-y-2 mb-5">
          <div className="p-3.5 rounded-[16px] bg-[var(--light-purple-surface)] border border-[var(--border)] text-[var(--text-primary)]">
            <strong className="block mb-0.5 font-semibold text-[var(--primary-purple)]">Why this mood?</strong>
            {partnerMood.lastReason || "Just watching over your health and goals."}
          </div>
          <p className="text-[var(--text-secondary)] px-1 leading-relaxed">
            {analysis.desc}
          </p>
        </div>

        {/* Quick Actions to cheer partner up */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
            Quick Emotional Actions
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              id="mood-send-apology-btn"
              onClick={() => {
                onSendQuickCheer('apology');
                onClose();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-[16px] glass-button border border-[var(--border)] text-rose-500 text-[11px] font-medium transition-all hover:scale-102"
            >
              <MessageCircleHeart className="w-4 h-4 mb-1 text-rose-500" />
              <span>Sweet Apology</span>
            </button>
            <button
              id="mood-send-love-btn"
              onClick={() => {
                onSendQuickCheer('love');
                onClose();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-[16px] glass-button border border-[var(--border)] text-pink-500 text-[11px] font-medium transition-all hover:scale-102"
            >
              <Gift className="w-4 h-4 mb-1 text-pink-500" />
              <span>Send Love ❤️</span>
            </button>
            <button
              id="mood-send-promise-btn"
              onClick={() => {
                onSendQuickCheer('promise');
                onClose();
              }}
              className="flex flex-col items-center justify-center p-3 rounded-[16px] glass-button border border-[var(--border)] text-[var(--primary-purple)] text-[11px] font-medium transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4 mb-1 text-[var(--primary-purple)]" />
              <span>Fix Habits Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
