import React from 'react';
import { MoodStatus } from '../types';

interface ParticleBackgroundProps {
  mood?: MoodStatus;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ mood = 'loving' }) => {
  const getMoodAura = () => {
    switch (mood) {
      case 'ecstatic':
        return 'from-pink-500/20 via-purple-500/20 to-indigo-500/15';
      case 'angry':
      case 'annoyed':
        return 'from-amber-500/20 via-rose-500/15 to-purple-600/15';
      default:
        return 'from-[#7C3AED]/20 via-[#A78BFA]/15 to-[#F3EBFF]/20';
    }
  };

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none"
    >
      {/* Aurora Blob 1: Top-center primary brand purple */}
      <div
        className={`absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] sm:w-[720px] h-[440px] rounded-full bg-gradient-to-br ${getMoodAura()} blur-[90px] opacity-80 aurora-blob-1`}
      />

      {/* Aurora Blob 2: Top-left soft lavender */}
      <div className="absolute top-1/4 -left-32 w-[380px] sm:w-[500px] h-[400px] rounded-full bg-[#A78BFA]/18 dark:bg-[#7C3AED]/20 blur-[80px] aurora-blob-2" />

      {/* Aurora Blob 3: Bottom-right pinkish purple */}
      <div className="absolute bottom-10 -right-28 w-[420px] sm:w-[560px] h-[460px] rounded-full bg-fuchsia-400/14 dark:bg-purple-900/25 blur-[95px] aurora-blob-3" />

      {/* Subtle Noise / Grid Accent Texture */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #7C3AED 1px, transparent 1px),
            linear-gradient(to bottom, #7C3AED 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};
