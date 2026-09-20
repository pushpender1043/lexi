import React from 'react';
import { MoodStatus } from '../types';

interface ParticleBackgroundProps {
  mood: MoodStatus;
}

/**
 * Minimal, modern, clean background with subtle lines and soft atmospheric gradient.
 * Absolutely NO hearts, NO bubbles, NO messy distractions - clean and elegant.
 */
export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ mood }) => {
  const getGlowColor = () => {
    switch (mood) {
      case 'ecstatic':
      case 'loving':
        return 'from-violet-400/10 via-purple-300/10 to-transparent';
      case 'annoyed':
      case 'angry':
        return 'from-amber-400/10 via-orange-300/10 to-transparent';
      default:
        return 'from-purple-400/8 via-indigo-300/8 to-transparent';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      {/* Soft centered radial aura behind content (matching PDF page 1 & 3) */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-gradient-radial ${getGlowColor()} blur-3xl opacity-75`} />

      {/* Subtle fine geometric horizontal and vertical alignment lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #7C3AED 1px, transparent 1px),
            linear-gradient(to bottom, #7C3AED 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Soft corner gradient accents */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-purple-300/10 dark:bg-purple-900/10 blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-indigo-300/10 dark:bg-indigo-900/10 blur-3xl" />
    </div>
  );
};
