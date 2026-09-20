import React from 'react';

interface AexoMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isListening?: boolean;
  isSpeaking?: boolean;
  className?: string;
  showAura?: boolean;
}

export const AexoMascot: React.FC<AexoMascotProps> = ({
  size = 'md',
  isListening = false,
  isSpeaking = false,
  className = '',
  showAura = false,
}) => {
  const sizeMap = {
    sm: { width: 36, height: 36, aura: 60 },
    md: { width: 64, height: 64, aura: 110 },
    lg: { width: 100, height: 100, aura: 170 },
    xl: { width: 140, height: 140, aura: 240 },
  };

  const { width, height, aura } = sizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Soft circular glowing aura as seen in PDF Page 1 & Page 5 */}
      {showAura && (
        <div
          style={{ width: `${aura}px`, height: `${aura}px` }}
          className="absolute rounded-full bg-gradient-to-tr from-purple-400/25 via-violet-300/20 to-indigo-300/25 blur-2xl pointer-events-none -z-10 animate-pulse"
        />
      )}

      {/* Outer subtle ring */}
      {showAura && (
        <div
          style={{ width: `${aura * 0.85}px`, height: `${aura * 0.85}px` }}
          className="absolute rounded-full border border-purple-200/50 dark:border-purple-800/30 pointer-events-none -z-10"
        />
      )}

      <svg
        width={width}
        height={height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 ${
          isSpeaking
            ? 'animate-bounce'
            : isListening
            ? 'animate-pulse scale-105'
            : 'hover:scale-105'
        }`}
        style={{ animationDuration: isSpeaking ? '1.2s' : '3s' }}
      >
        <defs>
          {/* Metallic purple gradient for head/body */}
          <linearGradient id="aexoHeadGrad" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E9D5FF" />
            <stop offset="35%" stopColor="#C084FC" />
            <stop offset="70%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>

          {/* Eye glow gradient */}
          <radialGradient id="aexoEyeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5D0FE" />
            <stop offset="40%" stopColor="#C084FC" />
            <stop offset="85%" stopColor="#4A044E" />
            <stop offset="100%" stopColor="#2E1065" />
          </radialGradient>

          {/* Ear / side sensor gradient */}
          <linearGradient id="aexoEarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DDD6FE" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          {/* Highlight shine */}
          <linearGradient id="aexoHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shadow under mascot */}
        <ellipse cx="50" cy="94" rx="22" ry="4" fill="rgba(107, 33, 168, 0.15)" />

        {/* Small feet */}
        <ellipse cx="40" cy="85" rx="5" ry="4" fill="#7C3AED" />
        <ellipse cx="60" cy="85" rx="5" ry="4" fill="#7C3AED" />

        {/* Small arms */}
        <ellipse cx="22" cy="58" rx="4" ry="7" transform="rotate(-15 22 58)" fill="#9333EA" />
        <ellipse cx="78" cy="58" rx="4" ry="7" transform="rotate(15 78 58)" fill="#9333EA" />

        {/* Antenna */}
        <path d="M50 25 V14" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="11" r="4.5" fill="#A855F7" stroke="#6B21A8" strokeWidth="1.5" />
        <circle cx="48.5" cy="9.5" r="1.5" fill="#FFFFFF" />

        {/* Side Ear Buds */}
        <ellipse cx="20" cy="50" rx="4.5" ry="8" fill="url(#aexoEarGrad)" stroke="#6B21A8" strokeWidth="1" />
        <ellipse cx="80" cy="50" rx="4.5" ry="8" fill="url(#aexoEarGrad)" stroke="#6B21A8" strokeWidth="1" />

        {/* Main Head / Body (Spherical Robot) */}
        <rect
          x="22"
          y="23"
          width="56"
          height="54"
          rx="27"
          fill="url(#aexoHeadGrad)"
          stroke="#581C87"
          strokeWidth="1.5"
        />

        {/* Top glossy head highlight */}
        <ellipse cx="50" cy="32" rx="20" ry="7" fill="url(#aexoHighlight)" />

        {/* Left Eye */}
        <g className={isSpeaking ? 'animate-pulse' : ''}>
          <ellipse cx="38" cy="51" rx="8" ry="11" fill="url(#aexoEyeGrad)" stroke="#3B0764" strokeWidth="0.75" />
          {/* Eye Star / Sparkle Highlight */}
          <circle cx="36" cy="47" r="3.2" fill="#FFFFFF" />
          <circle cx="41" cy="55" r="1.5" fill="#FFFFFF" />
          {/* Subtle star shine */}
          <path d="M35 44 L37 47 L35 50 L33 47 Z" fill="#FDF4FF" opacity="0.6" />
        </g>

        {/* Right Eye */}
        <g className={isSpeaking ? 'animate-pulse' : ''}>
          <ellipse cx="62" cy="51" rx="8" ry="11" fill="url(#aexoEyeGrad)" stroke="#3B0764" strokeWidth="0.75" />
          {/* Eye Star / Sparkle Highlight */}
          <circle cx="60" cy="47" r="3.2" fill="#FFFFFF" />
          <circle cx="65" cy="55" r="1.5" fill="#FFFFFF" />
          {/* Subtle star shine */}
          <path d="M59 44 L61 47 L59 50 L57 47 Z" fill="#FDF4FF" opacity="0.6" />
        </g>

        {/* Cute rosy blush under eyes */}
        <ellipse cx="28" cy="60" rx="4" ry="2" fill="#F472B6" opacity="0.55" />
        <ellipse cx="72" cy="60" rx="4" ry="2" fill="#F472B6" opacity="0.55" />

        {/* Cute subtle mouth */}
        {isSpeaking ? (
          <ellipse cx="50" cy="63" rx="3.5" ry="3" fill="#3B0764" />
        ) : (
          <path d="M47 62 Q50 65 53 62" stroke="#4C1D95" strokeWidth="1.75" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </div>
  );
};
