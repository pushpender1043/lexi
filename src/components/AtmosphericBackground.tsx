import React, { useState } from 'react';
import AeroShards from './AeroShards';
import { ParticleBackground } from './ParticleBackground';

interface AtmosphericBackgroundProps {
  darkMode: boolean;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({ darkMode }) => {
  const [webGpuFailed, setWebGpuFailed] = useState<boolean>(
    typeof navigator === 'undefined' || !('gpu' in navigator)
  );

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 'var(--z-bg, 0)' }}
      aria-hidden="true"
    >
      {/* Obsidian base canvas & radial ambient depth */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          darkMode ? 'bg-[#07060C]' : 'bg-[#F3F0FA]'
        }`}
      />
      <div
        className="absolute inset-0"
        style={{
          background: darkMode
            ? 'radial-gradient(65% 55% at 50% 10%, rgba(137, 106, 189, 0.22) 0%, rgba(168, 85, 247, 0.08) 42%, transparent 78%), radial-gradient(50% 45% at 85% 90%, rgba(88, 28, 135, 0.16) 0%, transparent 72%)'
            : 'radial-gradient(65% 55% at 50% 10%, rgba(168, 85, 247, 0.14) 0%, transparent 70%)',
        }}
      />

      {!webGpuFailed ? (
        <div className="absolute inset-0 w-full h-full">
          <AeroShards
            shardColor="#896ABD"
            accentColor="#A855F7"
            placement="full"
            material="glass"
            markers="plus"
            count={1300}
            depthOfField={0.75}
            vignette={0.3}
            mouseInteraction
            pulseOnClick
            holdToGather
            lightMode={!darkMode}
            onError={() => setWebGpuFailed(true)}
          />
        </div>
      ) : (
        <ParticleBackground />
      )}
    </div>
  );
};
