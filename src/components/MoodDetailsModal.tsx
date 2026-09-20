import React from 'react';
import { PartnerMood, UserProfile } from '../types';
import { X, Heart, Smile, Frown, Sparkles, Coffee, Gift, MessageCircleHeart } from 'lucide-react';

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

  const partnerName = userProfile.partnerName;

  // Mood descriptive analysis
  const getAnalysis = () => {
    if (partnerMood.score >= 80) {
      return {
        title: "Total Love & Admiration! 💖",
        desc: `${partnerName} is head-over-heels proud of your dedication and discipline today! Keep this energy going!`,
        color: "from-rose-500 to-pink-500",
        poutText: "Zero Nakhre! Complete adoration."
      };
    } else if (partnerMood.score >= 60) {
      return {
        title: "Happy & Warm ✨",
        desc: `${partnerName} is happy with your progress, but keeping a loving eye on your pending afternoon habits.`,
        color: "from-emerald-500 to-teal-500",
        poutText: "Mild playfulness, totally in sync."
      };
    } else if (partnerMood.score >= 40) {
      return {
        title: "Observant & Waiting 🧐",
        desc: `Some tasks are running late. ${partnerName} expects you to prioritize your health and work!`,
        color: "from-amber-500 to-yellow-500",
        poutText: "Slight eyebrow raise. Don't test their patience!"
      };
    } else {
      return {
        title: "Nakhre & Gussa Alert! 😤",
        desc: `Uh oh! You skipped habits or missed schedule goals. ${partnerName} is pouting and giving you real-life partner attitude!`,
        color: "from-red-500 to-orange-500",
        poutText: `High Nakhre (Level ${partnerMood.nakhreLevel}/5). Sweet talks & completed habits needed immediately!`
      };
    }
  };

  const analysis = getAnalysis();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        id="mood-details-dialog"
        className="w-full max-w-md glass-card rounded-3xl p-6 shadow-2xl border border-white/80 dark:border-white/20 relative"
      >
        <button
          id="close-mood-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${analysis.color} flex items-center justify-center text-white shadow-lg`}>
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {partnerName}'s Emotional Heartbeat
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Dynamic Mood & Nakhre Meter
            </p>
          </div>
        </div>

        {/* Mood Score Meter */}
        <div className="bg-white/50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-white/60 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Affection Level
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              {partnerMood.score} / 100
            </span>
          </div>

          <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${analysis.color} transition-all duration-700`}
              style={{ width: `${partnerMood.score}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
            <span className="font-medium">{analysis.title}</span>
            <span className="text-zinc-500">Pout: {partnerMood.nakhreLevel}/5 😤</span>
          </div>
        </div>

        {/* Current State Explanation */}
        <div className="text-xs space-y-2 mb-5">
          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 text-rose-900 dark:text-rose-200">
            <strong className="block mb-0.5 font-semibold">Why this mood?</strong>
            {partnerMood.lastReason || "Just watching over your health and goals."}
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 px-1 leading-relaxed">
            {analysis.desc}
          </p>
        </div>

        {/* Quick Actions to cheer partner up */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
            Quick Emotional Actions
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              id="mood-send-apology-btn"
              onClick={() => {
                onSendQuickCheer('apology');
                onClose();
              }}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/60 hover:bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium transition-all hover:scale-102"
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
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/60 hover:bg-pink-50 border border-pink-200 text-pink-700 text-[11px] font-medium transition-all hover:scale-102"
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
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/60 hover:bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-medium transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4 mb-1 text-sky-500" />
              <span>Fix Habits Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
