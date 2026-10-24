import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'strong' | 'subtle' | 'interactive';
  className?: string;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    default:
      'bg-white/65 dark:bg-white/[0.06] backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_8px_32px_rgba(124,58,237,0.08)]',
    strong:
      'bg-white/85 dark:bg-[#150F28]/90 backdrop-blur-3xl border border-[rgba(124,58,237,0.16)] dark:border-white/15 shadow-[0_16px_40px_rgba(124,58,237,0.14)]',
    subtle:
      'bg-white/40 dark:bg-white/[0.03] backdrop-blur-lg border border-white/40 dark:border-white/5',
    interactive:
      'bg-white/65 dark:bg-white/[0.06] backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_8px_32px_rgba(124,58,237,0.08)] hover:border-[#7C3AED]/40 hover:shadow-[0_12px_36px_rgba(124,58,237,0.16)] cursor-pointer transition-colors',
  };

  return (
    <motion.div
      className={`rounded-[22px] transition-shadow duration-300 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
