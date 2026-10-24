import React from 'react';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-[12px] bg-black/5 dark:bg-white/[0.06] ${className}`}
    />
  );
};
