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
      'glass',
    strong:
      'glass-strong',
    subtle:
      'bg-white/45 dark:bg-white/[0.04] backdrop-blur-xl border border-white/50 dark:border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]',
    interactive:
      'glass hover:border-[#A855F7]/50 dark:hover:border-white/25 hover:shadow-[0_18px_44px_rgba(0,0,0,0.68),0_0_24px_rgba(168,85,247,0.18)] cursor-pointer',
  };

  return (
    <motion.div
      className={`rounded-[20px] transition-[border-color,box-shadow,transform] duration-300 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
