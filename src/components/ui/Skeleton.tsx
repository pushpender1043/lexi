import React from 'react';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-[14px] bg-black/5 dark:bg-white/[0.08] border border-transparent dark:border-white/[0.06] ${className}`}
    />
  );
};
